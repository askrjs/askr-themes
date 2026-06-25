import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import {
  Button,
  ButtonGroup,
  Close,
  Field,
  FieldError,
  FieldHint,
  InputGroup,
  InputGroupText,
} from "../../src/controls";
import {
  Aside,
  Block,
  Container,
  EmptyState,
  Header,
  Main,
  Page,
  PageHeader,
  Section,
  Sidebar,
  Toolbar,
} from "../../src/core";
import {
  Alert,
  AspectRatio,
  Badge,
  Card,
  Separator,
  Skeleton,
  Spinner,
} from "../../src/surfaces";

import "../../src/themes/default/index.css";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function px(value: string): number {
  return Number.parseFloat(value.replace("px", ""));
}

describe("public family browser smoke", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    clearRoutes();
    window.history.replaceState({}, "", "/families");
  });

  afterEach(() => {
    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }

    clearRoutes();
  });

  it("should renders the remaining public families in a browser mount", async () => {
    route("/families", () => (
      <Page>
        <Header sticky>
          <Container>
            <Block direction="row" align="center" justify="between" paddingY="md">
              <strong>Askr</strong>
              <Button>Save</Button>
            </Block>
          </Container>
        </Header>

        <PageHeader
          title="Families"
          description="Theme surface smoke coverage."
          actions={<Button variant="secondary">Create</Button>}
        />

        <Toolbar
          title="Controls"
          actions={
            <ButtonGroup>
              <Button>One</Button>
              <Button variant="secondary">Two</Button>
            </ButtonGroup>
          }
        />

        <Section>
          <Close />
          <InputGroup>
            <InputGroupText>USD</InputGroupText>
            <input aria-label="Amount" />
          </InputGroup>
          <Field>
            <FieldHint>Enter the amount</FieldHint>
            <FieldError>Amount is required</FieldError>
          </Field>
        </Section>

        <Block direction={{ base: "column", lg: "row" }} gap="lg">
          <Main>
            <Block gap="lg">
              <AspectRatio ratio={16 / 9}>
                <figure>Media</figure>
              </AspectRatio>
              <Card>
                <Block gap="xs">
                  <h3>Card header</h3>
                  <p>Card body</p>
                </Block>
                <Block direction="row" gap="sm">
                  <span>Card footer</span>
                  <button type="button">Card action</button>
                </Block>
              </Card>
            </Block>
          </Main>
          <Aside width="sidebar" shrink={false}>
            Aside
          </Aside>
        </Block>

        <Sidebar aria-label="Workspace">
          <Block as="nav" gap="sm">
            <a href="/families">Overview</a>
          </Block>
        </Sidebar>

        <Section>
          <Alert title="Heads up" description="Something happened." />
          <Badge variant="success">New</Badge>
          <Separator />
          <Skeleton />
        </Section>

        <Section>
          <EmptyState
            title="Nothing here"
            description="Try adding content."
            action={<button type="button">Add</button>}
          />
          <Spinner label="Loading" />
        </Section>
      </Page>
    ));

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    for (const slot of [
      "page",
      "header",
      "page-header",
      "toolbar",
      "section",
      "main",
      "aside",
      "sidebar",
      "button",
      "button-group",
      "input-group",
      "field",
      "field-hint",
      "field-error",
      "aspect-ratio",
      "card",
      "alert",
      "badge",
      "separator",
      "skeleton",
      "empty-state",
      "progress-circle",
    ]) {
      expect(container?.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull();
    }

    const layoutBlocks = [
      ...(container?.querySelectorAll('[data-ak-layout="true"][class*="ak-style-"]') ?? []),
    ] as HTMLElement[];
    const header = container?.querySelector('[data-slot="header"]') as HTMLElement | null;
    const sidebar = container?.querySelector('[data-slot="sidebar"]') as HTMLElement | null;
    const aspectRatioEl = container?.querySelector(
      '[data-slot="aspect-ratio"]',
    ) as HTMLElement | null;

    expect(layoutBlocks.length).toBeGreaterThan(0);
    expect(layoutBlocks.some((block) => getComputedStyle(block).display === "flex")).toBe(true);
    expect(
      layoutBlocks.some((block) => {
        const style = getComputedStyle(block);
        return px(style.rowGap) > 0 || px(style.columnGap) > 0;
      }),
    ).toBe(true);
    expect(getComputedStyle(header!).position).toBe("sticky");
    expect(getComputedStyle(sidebar!).borderRightWidth).not.toBe("0px");
    expect(getComputedStyle(aspectRatioEl!).aspectRatio).not.toBe("auto");
  });
});
