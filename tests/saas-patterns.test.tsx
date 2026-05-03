import { describe, expect, it } from "vite-plus/test";

import { Button, Card, CardContent, EmptyState, Stack } from "../src/components";

describe("product SaaS composition patterns", () => {
  it("builds dashboard content while leaving the shell in userland", () => {
    const page = (
      <div class="ops-app-shell">
        <aside class="ops-app-shell-nav">
          {Stack({ children: ["Overview", "Customers", "Settings"], gap: "2", p: "4" })}
        </aside>
        <main class="ops-app-shell-main">
          <section class="page-header">
            <div class="page-header-copy">
              <h1>Acme Console</h1>
              <p>Operational overview</p>
            </div>
            {Button({ children: "New project", variant: "primary" })}
          </section>
          {Stack({
            gap: "5",
            children: [
              <section class="page-header">
                <div class="page-header-copy">
                  <p>Dashboard</p>
                  <h2>Good morning</h2>
                </div>
                <div>Last 30 days</div>
              </section>,
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
        Card({
          children: CardContent({
            children: EmptyState({
              title: "No destructive actions configured",
              description: "Add safeguards before enabling irreversible actions.",
              actions: Button({ children: "Review policies", variant: "secondary" }),
            }),
          }),
        }),
      ],
    });

    expect(settings).toBeTruthy();
  });
});
