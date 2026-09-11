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
} from "../../../src/controls";
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
} from "../../../src/core";
import {
  Alert,
  AspectRatio,
  Badge,
  Card,
  Separator,
  Skeleton,
  Spinner,
} from "../../../src/surfaces";
import { mountRoute } from "./_spa";

import "../../../src/themes/default/index.css";

/** Every remaining public family on one page. */
export async function families(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/families", () => (
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
}

/** An attached input group inside a width-constrained toolbar action slot. */
export async function constrainedToolbar(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/families", () => (
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
}

/** A partially configured Block beside a plain control styled identically. */
export async function partialBlock(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/families", () => (
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
}
