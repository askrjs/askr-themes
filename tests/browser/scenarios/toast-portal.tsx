import { Portal } from "@askrjs/askr/foundations";

import { Toast, ToastHost, ToastTitle, ToastViewport } from "../../../src/components";
import { mountRoute } from "./_spa";

import "../../../src/themes/default/index.css";

export default async function closedToastBesidePortal(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/toast-portal", () => (
    <ToastHost>
      <Portal>
        <div>Sidebar content</div>
      </Portal>
      <ToastViewport />
      <Toast open={false}>
        <ToastTitle>Validation result</ToastTitle>
      </Toast>
    </ToastHost>
  ));
}
