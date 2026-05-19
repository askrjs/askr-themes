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
import { EmptyState, Spinner } from "../../src/feedback";
import {
  AspectRatio,
  Block,
  Box,
  Container,
  Flex,
  Inline,
  Section,
  Spacer,
  Stack,
} from "../../src/layouts";
import {
  Alert,
  Badge,
  Card,
  CardActions,
  CardContent,
  CardFooter,
  CardHeader,
  ListGroup,
  ListGroupItem,
  Separator,
  Skeleton,
} from "../../src/surfaces";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
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

  it("renders the remaining public families in a browser mount", async () => {
    route("/families", () => (
      <div>
        <section>
          <Button>Save</Button>
          <ButtonGroup>
            <Button>One</Button>
            <Button variant="secondary">Two</Button>
          </ButtonGroup>
          <Close />
          <InputGroup>
            <InputGroupText>USD</InputGroupText>
            <input aria-label="Amount" />
          </InputGroup>
          <Field>
            <FieldHint>Enter the amount</FieldHint>
            <FieldError>Amount is required</FieldError>
          </Field>
        </section>

        <section>
          <AspectRatio ratio={16 / 9}>
            <figure>Media</figure>
          </AspectRatio>
          <Block gap="2">Block</Block>
          <Box>Box</Box>
          <Container size="lg">Container</Container>
          <Flex gap="2" direction="column">
            Flex
          </Flex>
          <Inline gap="2">Inline</Inline>
          <Section size="2">Section</Section>
          <Spacer basis="1rem" />
          <Stack gap="2">Stack</Stack>
        </section>

        <section>
          <Alert title="Heads up" description="Something happened." />
          <Badge variant="success">New</Badge>
          <Card>
            <CardHeader>Card header</CardHeader>
            <CardContent>Card body</CardContent>
            <CardFooter>Card footer</CardFooter>
            <CardActions>Card actions</CardActions>
          </Card>
          <ListGroup>
            <ListGroupItem>First item</ListGroupItem>
          </ListGroup>
          <Separator />
          <Skeleton />
        </section>

        <section>
          <EmptyState
            title="Nothing here"
            description="Try adding content."
            actions={<button type="button">Add</button>}
          />
          <Spinner label="Loading" />
        </section>
      </div>
    ));

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    expect(container?.querySelector('[data-slot="button"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="button-group"]')).not.toBeNull();
    expect(container?.querySelector("button.btn-close")).not.toBeNull();
    expect(container?.querySelector('[data-slot="input-group"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="field"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="field-hint"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="field-error"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="aspect-ratio"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="block"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="box"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="container"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="flex"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="inline"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="section"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="spacer"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="stack"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="alert"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="badge"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="card"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="list-group"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="separator"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="skeleton"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="empty-state"]')).not.toBeNull();
    expect(container?.querySelector('[data-slot="progress-circle"]')).not.toBeNull();

    const containerEl = container?.querySelector('[data-slot="container"]') as HTMLElement | null;
    const flexEl = container?.querySelector('[data-slot="flex"]') as HTMLElement | null;
    const inlineEl = container?.querySelector('[data-slot="inline"]') as HTMLElement | null;
    const aspectRatioEl = container?.querySelector(
      '[data-slot="aspect-ratio"]',
    ) as HTMLElement | null;
    const spacerEl = container?.querySelector('[data-slot="spacer"]') as HTMLElement | null;

    expect(containerEl?.getAttribute("data-size")).toBe("initial:lg");
    expect(flexEl?.getAttribute("data-gap")).toBe("initial:2");
    expect(inlineEl?.getAttribute("data-slot")).toBe("inline");
    expect(String(aspectRatioEl?.getAttribute("style"))).toContain("aspect-ratio:");
    expect(String(spacerEl?.getAttribute("style"))).toContain("flex-basis:");
  });
});
