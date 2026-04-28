import { describe, expect, it } from "vite-plus/test";

import {
  Button,
  Card,
  CardContent,
  EmptyState,
  FormSection,
  PageHeader,
  SettingsSection,
  Stack,
} from "../src/components";

describe("product SaaS scaffold patterns", () => {
  it("builds dashboard content while leaving the shell in userland", () => {
    const page = (
      <div class="ops-app-shell">
        <aside class="ops-app-shell-nav">
          {Stack({ children: ["Overview", "Customers", "Settings"], gap: "2", p: "4" })}
        </aside>
        <main class="ops-app-shell-main">
          {PageHeader({
            title: "Acme Console",
            description: "Operational overview",
            actions: Button({ children: "New project", variant: "primary" }),
          })}
          {Stack({
            gap: "5",
            children: [
              PageHeader({ eyebrow: "Dashboard", title: "Good morning", actions: "Last 30 days" }),
              Stack({
                gap: "4",
                children: [
                  Card({ children: CardContent({ children: "Revenue" }) }),
                  Card({ children: CardContent({ children: "Activation" }) }),
                  Card({ children: CardContent({ children: "Retention" }) }),
                ],
              }),
            ],
          })}
        </main>
      </div>
    );

    expect(page).toBeTruthy();
  });

  it("builds settings and empty states from reusable pattern primitives", () => {
    const settings = Stack({
      gap: "5",
      children: [
        FormSection({
          title: "Profile",
          description: "Public information for this workspace.",
          actions: Button({ children: "Save", variant: "primary" }),
          children: "fields",
        }),
        SettingsSection({
          title: "Danger zone",
          description: "Actions that affect every member.",
          children: EmptyState({
            title: "No destructive actions configured",
            description: "Add safeguards before enabling irreversible actions.",
          }),
        }),
      ],
    });

    expect(settings).toBeTruthy();
  });
});
