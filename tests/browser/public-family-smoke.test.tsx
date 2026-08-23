import { createTestRegistry, resetTestRoutes, testRoute } from "../router-test-utils";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";

import {
  Button,
  ButtonGroup,
  Close,
  Field,
  FieldError,
  FieldHint,
  Input,
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
  MetaStrip,
  Page,
  PageHeader,
  Section,
  Sidebar,
  Toolbar,
} from "../../src/core";
import { Alert, AspectRatio, Badge, Card, Separator, Skeleton, Spinner } from "../../src/surfaces";

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
    resetTestRoutes();
    window.history.replaceState({}, "", "/families");
  });

  afterEach(() => {
    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }

    resetTestRoutes();
  });

  it("should render the remaining public families in a browser mount", async () => {
    testRoute("/families", () => (
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
        <MetaStrip
          data-testid="inline-meta"
          items={[
            { label: "Region", value: "us-east-1", font: "mono" },
            { label: "Replicas", value: 3, numeric: "tabular" },
          ]}
        />
        <MetaStrip
          data-testid="stacked-meta"
          density="stacked"
          style={{ inlineSize: "12rem" }}
          items={[
            {
              label: "Identifier",
              value: "a-very-long-identifier-that-must-wrap-within-the-container",
              font: "mono",
            },
          ]}
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

        <Block rowFrom="lg" gap="lg">
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

    await createSPA({ root: container!, registry: createTestRegistry() });
    await settle();

    for (const slot of [
      "page",
      "header",
      "page-header",
      "meta-strip",
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
    expect(
      getComputedStyle(container!.querySelector('[data-slot="page-header-copy"]')!).flexDirection,
    ).toBe("column");
    expect(
      getComputedStyle(container!.querySelector('[data-slot="page-header"]')!).flexDirection,
    ).toBe("row");
    const inlineMeta = container!.querySelector('[data-testid="inline-meta"]') as HTMLElement;
    const stackedMeta = container!.querySelector('[data-testid="stacked-meta"]') as HTMLElement;
    expect(inlineMeta.tagName).toBe("DL");
    expect(inlineMeta.querySelectorAll(":scope > div > dt")).toHaveLength(2);
    expect(inlineMeta.querySelectorAll(":scope > div > dd")).toHaveLength(2);
    expect(getComputedStyle(inlineMeta).flexWrap).toBe("wrap");
    expect(getComputedStyle(stackedMeta).flexDirection).toBe("column");
    expect(stackedMeta.scrollWidth).toBeLessThanOrEqual(stackedMeta.clientWidth);
  });

  it("should keep attached input groups on one row in constrained toolbar actions", async () => {
    testRoute("/families", () => (
      <Page>
        <Toolbar
          title="Event rows"
          actions={
            <div style={{ inlineSize: "14.5rem" }}>
              <InputGroup>
                <InputGroupText>?</InputGroupText>
                <Input aria-label="Filter log events" placeholder="Filter events" />
              </InputGroup>
            </div>
          }
        />
      </Page>
    ));

    await createSPA({ root: container!, registry: createTestRegistry() });
    await settle();

    const group = container?.querySelector('[data-slot="input-group"]') as HTMLElement | null;
    const prefix = container?.querySelector('[data-slot="input-group-text"]') as HTMLElement | null;
    const input = container?.querySelector('[data-slot="input"]') as HTMLInputElement | null;

    expect(group).not.toBeNull();
    expect(prefix).not.toBeNull();
    expect(input).not.toBeNull();
    expect(getComputedStyle(group!).flexWrap).toBe("nowrap");
    expect(
      Math.abs(prefix!.getBoundingClientRect().top - input!.getBoundingClientRect().top),
    ).toBeLessThan(1);
  });

  it("should preserve native CSS initials for Block properties omitted by the caller", async () => {
    testRoute("/families", () => (
      <>
        <style>{`
          .partial-block,
          .partial-control {
            display: flex;
            align-items: flex-start;
          }
        `}</style>
        <Block className="partial-block">Content</Block>
        <div className="partial-control">Control</div>
      </>
    ));

    await createSPA({ root: container!, registry: createTestRegistry() });
    await settle();

    const block = container?.querySelector(".partial-block") as HTMLElement;
    const control = container?.querySelector(".partial-control") as HTMLElement;
    const blockStyle = getComputedStyle(block);
    const controlStyle = getComputedStyle(control);

    expect(blockStyle.display).toBe("flex");
    expect(blockStyle.alignItems).toBe("flex-start");

    for (const property of [
      "flexDirection",
      "flexWrap",
      "justifyContent",
      "gap",
      "flexGrow",
      "flexShrink",
      "minWidth",
      "maxWidth",
      "boxSizing",
      "position",
      "borderTopStyle",
      "borderTopWidth",
      "borderRadius",
      "boxShadow",
    ] as const) {
      expect(blockStyle[property], property).toBe(controlStyle[property]);
    }
  });
});
