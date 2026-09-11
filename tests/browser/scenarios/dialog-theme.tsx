import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "../../../src/overlays";
import { mountRoute } from "./_spa";

import "../../../src/themes/default/index.css";

/** A deliberately oversized Dialog surface, to verify centered viewport clamping. */
export default async function dialog(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/dialog-theme", () => (
    <Dialog>
      <DialogTrigger>Open dialog</DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent style={{ width: "40rem", height: "900px" }}>
          <DialogTitle>Add blob</DialogTitle>
          <DialogDescription>
            A deliberately oversized dialog surface to verify centered viewport clamping.
          </DialogDescription>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  ));
}

/** The same oversized surface, built from the AlertDialog family. */
export async function alertDialog(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/alert-dialog-theme", () => (
    <AlertDialog>
      <AlertDialogTrigger>Open alert</AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogContent style={{ width: "40rem", height: "900px" }}>
          <AlertDialogTitle>Delete blob?</AlertDialogTitle>
          <AlertDialogDescription>
            A deliberately oversized alert surface to verify centered viewport clamping.
          </AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  ));
}
