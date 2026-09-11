import { Spinner } from "../../../src/surfaces";
import { mountRoute } from "./_spa";

export default async function labelledSpinner(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/status", () => (
    <div>
      <Spinner label="Syncing" />
    </div>
  ));
}
