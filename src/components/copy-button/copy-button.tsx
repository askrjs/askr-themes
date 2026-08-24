import { getSignal, state } from "@askrjs/askr";
import type { JSX } from "@askrjs/askr/jsx-runtime";
import { Button } from "@askrjs/ui";
import { classes } from "../_internal/classes";
import type { CopyButtonProps } from "./copy-button.types";

type CopyState = "idle" | "success" | "error";

/** Copies text with visual and assistive success/failure feedback. */
export function CopyButton(props: CopyButtonProps): JSX.Element {
  const {
    class: className,
    failureMessage = "Could not copy to clipboard.",
    label,
    resetAfter = 2000,
    size,
    successMessage = "Copied to clipboard.",
    text,
    variant,
    ...rest
  } = props;
  const copyState = state<CopyState>("idle");
  const lifecycle = state<{
    resetTimer: ReturnType<typeof setTimeout> | undefined;
    cleanupSignal: AbortSignal | null;
  }>({ resetTimer: undefined, cleanupSignal: null })();
  const signal = getSignal();
  if (lifecycle.cleanupSignal !== signal) {
    lifecycle.cleanupSignal = signal;
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(lifecycle.resetTimer);
        lifecycle.resetTimer = undefined;
      },
      { once: true },
    );
  }

  const resetLater = () => {
    clearTimeout(lifecycle.resetTimer);
    lifecycle.resetTimer = setTimeout(() => {
      lifecycle.resetTimer = undefined;
      copyState.set("idle");
    }, resetAfter);
  };
  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API is unavailable");
      await navigator.clipboard.writeText(text);
      copyState.set("success");
    } catch {
      copyState.set("error");
    }
    resetLater();
  };
  const announcement =
    copyState() === "success" ? successMessage : copyState() === "error" ? failureMessage : "";

  return (
    <span class="copy-button-wrap" data-slot="copy-button-wrap">
      <Button
        {...rest}
        class={classes("copy-button", className)}
        aria-label={label}
        data-state={copyState()}
        data-slot="copy-button"
        onPress={() => void copy()}
        size={size ?? "icon"}
        variant={variant ?? "ghost"}
      >
        <span aria-hidden="true" data-slot="copy-button-icon">
          {copyState() === "success" ? "✓" : copyState() === "error" ? "!" : "⧉"}
        </span>
      </Button>
      <span aria-atomic="true" aria-live="polite" class="sr-only" data-slot="copy-button-status">
        {announcement}
      </span>
    </span>
  );
}
