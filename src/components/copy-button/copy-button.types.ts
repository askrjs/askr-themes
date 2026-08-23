import type { ButtonNativeProps } from "@askrjs/ui";

export type CopyButtonProps = Omit<ButtonNativeProps, "children" | "onPress"> & {
  text: string;
  label: string;
  successMessage?: string;
  failureMessage?: string;
  resetAfter?: number;
};
