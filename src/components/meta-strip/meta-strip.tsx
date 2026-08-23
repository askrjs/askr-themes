import type { JSX } from "@askrjs/askr/jsx-runtime";
import { classes } from "../_internal/classes";
import type { MetaStripProps } from "./meta-strip.types";

/** Semantic compact key/value facts with consistent inline or stacked wrapping. */
export function MetaStrip(props: MetaStripProps): JSX.Element {
  const { class: className, density = "inline", items, ref, ...rest } = props;

  return (
    <dl
      {...rest}
      ref={ref}
      class={classes("meta-strip", className)}
      data-density={density}
      data-slot="meta-strip"
    >
      {items.map((item, index) => (
        <div data-slot="meta-strip-item" key={`${item.label}-${index}`}>
          <dt data-slot="meta-strip-label">{item.label}</dt>
          <dd
            data-font={item.font ?? "body"}
            data-numeric={item.numeric ?? "normal"}
            data-slot="meta-strip-value"
          >
            {item.value}
            {item.caption !== undefined ? (
              <span data-slot="meta-strip-caption">{item.caption}</span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
