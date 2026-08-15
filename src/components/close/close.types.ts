import type { ButtonNativeProps } from "@askrjs/ui";

/** Props specific to {@link Close}, layered on top of {@link ButtonNativeProps}. */
export type CloseOwnProps = {
  label?: string;
};

/** Props for the {@link Close} component. */
export type CloseNativeProps = ButtonNativeProps & CloseOwnProps;
