import {
  ButtonGroup,
  Close,
  Field,
  FieldError,
  FieldHint,
  InputGroup,
  InputGroupText,
} from "../../src/controls";
import {
  Block,
  Container,
  EmptyState,
  NavBrand,
  NavGroup,
  NavItem,
  NavLink,
  Navbar,
  Section,
  Sidebar,
} from "../../src/core";
import { Pill, Pills, Tab, Tabs } from "../../src/navs";
import {
  Alert,
  AspectRatio,
  Badge,
  Card,
  Separator,
  Skeleton,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../src/surfaces";
import { ThemePicker, ThemeScope, ThemeToggle } from "../../src/theme";

function BenchIcon(props: { label: string; state?: string }): JSX.Element {
  const { label, state } = props;

  return (
    <span data-slot="icon" data-state={state} aria-hidden="true">
      {label.slice(0, 1)}
    </span>
  );
}

export function buildControlsFixture(): JSX.Element {
  return (
    <section data-bench="controls">
      <ButtonGroup>
        <button type="button">One</button>
        <button type="button">Two</button>
        <button type="button">Three</button>
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
  );
}

export function buildStatusSurfaceFixture(): JSX.Element {
  return (
    <section data-bench="status-surfaces">
      <Spinner label="Loading" />
    </section>
  );
}

export function buildSurfacesFixture(): JSX.Element {
  return (
    <section data-bench="surfaces">
      <Alert title="Heads up" description="Something happened." />
      <Badge variant="success">New</Badge>
      <Card>
        <Block gap="xs">
          <h3>Card title</h3>
          <p>Short supporting copy</p>
        </Block>
        <Block>Card body</Block>
        <Block direction="row" gap="sm" justify="end">
          <button type="button">Primary action</button>
        </Block>
      </Card>
      <Separator />
      <Skeleton />
    </section>
  );
}

export function buildCoreFixture(): JSX.Element {
  return (
    <section data-bench="core">
      <AspectRatio ratio={16 / 9}>
        <figure>Media</figure>
      </AspectRatio>
      <Block gap="sm">
        <Block border radius="md" padding="md">
          Block
        </Block>
        <Container size="lg">
          <Block gap="sm">
            <Block gap="sm" direction="column">
              <Block direction="row" gap="sm">
                Inline row
              </Block>
              <Section>Section</Section>
            </Block>
            <Block gap="xs">
              <div>Nested block</div>
            </Block>
            <EmptyState
              icon={<BenchIcon label="!" />}
              title="No results"
              description="Try changing the current filters."
              action={<button type="button">Reset</button>}
            />
          </Block>
        </Container>
      </Block>
    </section>
  );
}

export function buildNavsFixture(): JSX.Element {
  return (
    <section data-bench="navs">
      <Tabs aria-label="Sections">
        <Tab href="/docs" active>
          Overview
        </Tab>
        <Tab href="/docs/components">Components</Tab>
      </Tabs>
      <Pills aria-label="Filters">
        <Pill href="/docs" active>
          Docs
        </Pill>
        <Pill href="/settings">Settings</Pill>
      </Pills>
    </section>
  );
}

export function buildBrowserNavsFixture(): JSX.Element {
  return (
    <section data-bench="navs-browser">
      <Tabs aria-label="Sections">
        <Tab href="/docs" active>
          Overview
        </Tab>
        <Tab href="/docs/components">Components</Tab>
      </Tabs>
      <Pills aria-label="Filters">
        <Pill href="/docs" active>
          Docs
        </Pill>
        <Pill href="/settings">Settings</Pill>
      </Pills>
    </section>
  );
}

export function buildPublicFamilyPage(): JSX.Element {
  return (
    <div data-bench="public-family">
      {buildControlsFixture()}
      {buildStatusSurfaceFixture()}
      {buildBrowserNavsFixture()}
      {buildCoreFixture()}
      {buildSurfacesFixture()}
    </div>
  );
}

export function buildRouteTransitionPage(props: { title: string; rows?: number }): JSX.Element {
  const { title, rows = 12 } = props;

  return (
    <section data-bench="route-transition" data-title={title}>
      <Card>
        <Block gap="xs">
          <h3>{title}</h3>
          <p>Route content</p>
        </Block>
        <Block gap="sm">
          {Array.from({ length: rows }, (_, index) => (
            <Card key={index} variant="raised">
              <h4>Item {index + 1}</h4>
              <div>Content {index + 1}</div>
            </Card>
          ))}
        </Block>
        <Block direction="row" gap="sm">
          <Badge variant="info">{rows} records</Badge>
        </Block>
      </Card>
    </section>
  );
}

export function ThemeBenchLayout(props: { children?: unknown }): JSX.Element {
  const { children } = props;

  return (
    <ThemeScope defaultTheme="light" storageKey="askr-theme">
      <header data-bench="theme-header">
        <ThemePicker
          label="Theme"
          themes={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
        <ThemeToggle
          themes={["light", "dark"]}
          lightIcon={<BenchIcon label="L" state="light" />}
          darkIcon={<BenchIcon label="D" state="dark" />}
          systemIcon={<BenchIcon label="S" state="system" />}
        />
      </header>
      <main data-bench="theme-main">{children}</main>
    </ThemeScope>
  );
}

export function NavbarBenchLayout(props: { children?: unknown }): JSX.Element {
  const { children } = props;

  return (
    <div data-bench="navbar-layout">
      <Navbar id="docs-navbar" aria-label="Docs navigation" collapseAt="md">
        <NavBrand>
          <a href="/">
            <BenchIcon label="Askr" />
            <strong>Askr</strong>
          </a>
        </NavBrand>
        <NavGroup align="center">
          <NavLink href="/docs" match="exact">
            Overview
          </NavLink>
          <NavLink href="/docs/components">Components</NavLink>
        </NavGroup>
        <NavGroup align="end">
          <NavLink href="/settings">Settings</NavLink>
        </NavGroup>
      </Navbar>
      <main data-bench="navbar-main">{children}</main>
    </div>
  );
}

export function NavbarStaticLayout(props: { children?: unknown }): JSX.Element {
  const { children } = props;

  return (
    <div data-bench="navbar-layout">
      <Navbar id="docs-navbar" aria-label="Docs navigation" collapseAt="md">
        <NavBrand>
          <a href="/">
            <BenchIcon label="Askr" />
            <strong>Askr</strong>
          </a>
        </NavBrand>
        <NavGroup align="center">
          <NavItem href="/docs">Overview</NavItem>
          <NavItem href="/docs/components">Components</NavItem>
        </NavGroup>
        <NavGroup align="end">
          <NavItem href="/settings">Settings</NavItem>
        </NavGroup>
      </Navbar>
      <main data-bench="navbar-main">{children}</main>
    </div>
  );
}

export function SidebarBenchLayout(props: { children?: unknown }): JSX.Element {
  const { children } = props;

  return (
    <Block minHeight="screen" direction="row">
      <Sidebar id="docs-sidebar" aria-label="Docs navigation">
        <NavBrand>
          <a href="/">
            <BenchIcon label="Askr" />
            <strong>Askr</strong>
          </a>
        </NavBrand>
        <NavGroup title="Guides">
          <NavLink href="/docs" match="exact">
            <BenchIcon label="Overview" />
            <span>Overview</span>
          </NavLink>
          <NavLink href="/docs/components">
            <BenchIcon label="Components" />
            <span>Components</span>
          </NavLink>
        </NavGroup>
        <NavGroup>
          <NavLink href="/settings">
            <BenchIcon label="Settings" />
            <span>Settings</span>
          </NavLink>
        </NavGroup>
      </Sidebar>
      <Block as="main" grow data-bench="sidebar-main">
        {children}
      </Block>
    </Block>
  );
}

export function buildTablePage(): JSX.Element {
  return (
    <Table aria-label="Users">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Alice</TableCell>
          <TableCell>alice@example.com</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Bob</TableCell>
          <TableCell>bob@example.com</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
