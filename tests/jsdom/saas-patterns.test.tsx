import { describe, expect, it } from "vite-plus/test";

import { Button } from "../../src/controls";
import { EmptyState } from "../../src/feedback";
import { Block } from "../../src/core";
import { Card, CardContent } from "../../src/surfaces";

describe("product SaaS composition patterns", () => {
  it("should builds dashboard content while leaving app layout in userland", () => {
    const page = (
      <div class="ops-app-layout">
        <aside class="ops-app-layout-nav">
          {Block({ children: ["Overview", "Customers", "Settings"], gap: "sm", padding: "md" })}
        </aside>
        <main class="ops-app-layout-main">
          <section class="page-header">
            <div class="page-header-copy">
              <h1>Acme Console</h1>
              <p>Operational overview</p>
            </div>
            {Button({ children: "New project", variant: "primary" })}
          </section>
          {Block({
            gap: "xl",
            children: [
              <section class="page-header">
                <div class="page-header-copy">
                  <p>Dashboard</p>
                  <h2>Good morning</h2>
                </div>
                <div>Last 30 days</div>
              </section>,
              Block({
                gap: "lg",
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

  it("should builds settings and empty states from reusable pattern primitives", () => {
    const settings = Block({
      gap: "xl",
      children: [
        Card({
          children: CardContent({
            children: EmptyState({
              title: "No destructive actions configured",
              description: "Add safeguards before enabling irreversible actions.",
              action: Button({ children: "Review policies", variant: "secondary" }),
            }),
          }),
        }),
      ],
    });

    expect(settings).toBeTruthy();
  });
});
