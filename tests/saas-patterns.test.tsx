import { describe, expect, it } from "vite-plus/test";

import {
  AppShell,
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
  it("builds a dashboard shell with no app-specific CSS", () => {
    const page = AppShell({
      sidebar: Stack({ children: ["Overview", "Customers", "Settings"], gap: "2", p: "4" }),
      topbar: PageHeader({
        title: "Acme Console",
        description: "Operational overview",
        actions: Button({ children: "New project", variant: "primary" }),
      }),
      children: Stack({
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
      }),
    });

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
