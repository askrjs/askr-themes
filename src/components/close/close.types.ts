import type { ButtonNativeProps } from "@askrjs/ui";

export type CloseOwnProps = {
  label?: string;
};

export type CloseNativeProps = ButtonNativeProps & CloseOwnProps;
