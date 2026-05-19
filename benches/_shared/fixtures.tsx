import {
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
import { GitHubLogo, GoogleLogo, MicrosoftLogo } from "../../src/logos";
import {
  Alert,
  Badge,
  Card,
  CardActions,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Divider,
  ListGroup,
  ListGroupItem,
  Separator,
  Skeleton,
} from "../../src/surfaces";
import {
  NavBrand,
  NavGroup,
  NavItem,
  NavLink,
  Navbar,
  Shell,
  ShellMain,
  ShellNav,
  Sidebar,
  SidebarToggle,
} from "../../src/shells";
import { ThemePicker, ThemeProvider, ThemeToggle } from "../../src/theme";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@askrjs/ui";

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

export function buildFeedbackFixture(): JSX.Element {
  return (
    <section data-bench="feedback">
      <EmptyState
        icon={<BenchIcon label="!" />}
        title="No results"
        description="Try changing the current filters."
        actions={<button type="button">Reset</button>}
      />
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
        <CardHeader>
          <CardTitle>Card title</CardTitle>
          <CardDescription>Short supporting copy</CardDescription>
        </CardHeader>
        <CardContent>Card body</CardContent>
        <CardFooter>Card footer</CardFooter>
        <CardActions>
          <button type="button">Primary action</button>
        </CardActions>
      </Card>
      <ListGroup>
        <ListGroupItem>First item</ListGroupItem>
        <ListGroupItem>Second item</ListGroupItem>
      </ListGroup>
      <Divider />
      <Separator />
      <Skeleton />
    </section>
  );
}

export function buildLayoutsFixture(): JSX.Element {
  return (
    <section data-bench="layouts">
      <AspectRatio ratio={16 / 9}>
        <figure>Media</figure>
      </AspectRatio>
      <Block gap="2">
        <Box>Box</Box>
        <Container size="lg">
          <Stack gap="2">
            <Flex gap="2" direction="column">
              <Inline gap="2">Inline</Inline>
              <Section size="2">Section</Section>
            </Flex>
            <Spacer basis="1rem" />
            <Block gap="1">
              <div>Nested block</div>
            </Block>
          </Stack>
        </Container>
      </Block>
    </section>
  );
}

export function buildLogosFixture(): JSX.Element {
  return (
    <section data-bench="logos">
      <GitHubLogo title="GitHub" />
      <GoogleLogo title="Google" size="lg" />
      <MicrosoftLogo title="Microsoft" size={28} />
    </section>
  );
}

export function buildPublicFamilyPage(): JSX.Element {
  return (
    <div data-bench="public-family">
      {buildControlsFixture()}
      {buildFeedbackFixture()}
      {buildLayoutsFixture()}
      {buildSurfacesFixture()}
      {buildLogosFixture()}
    </div>
  );
}

export function ThemeBenchLayout(props: { children?: unknown }): JSX.Element {
  const { children } = props;

  return (
    <ThemeProvider defaultTheme="light" storageKey="askr-theme">
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
    </ThemeProvider>
  );
}

export function NavbarBenchLayout(props: { children?: unknown }): JSX.Element {
  const { children } = props;

  return (
    <div data-bench="navbar-layout">
      <Navbar id="docs-navbar" aria-label="Docs navigation" breakpoint="md">
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
      <Navbar id="docs-navbar" aria-label="Docs navigation" breakpoint="md">
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
    <Shell variant="sidebar">
      <ShellNav>
        <Sidebar
          id="docs-sidebar"
          aria-label="Docs navigation"
          breakpoint="md"
          collapsible="icon"
          defaultCollapsed
        >
          <SidebarToggle
            expandedIcon={<BenchIcon label="E" state="expanded" />}
            collapsedIcon={<BenchIcon label="C" state="collapsed" />}
          />
          <NavBrand>
            <a href="/">
              <BenchIcon label="Askr" />
              <strong>Askr</strong>
            </a>
          </NavBrand>
          <NavGroup label="Guides">
            <NavLink href="/docs" match="exact">
              <BenchIcon label="Overview" />
              <span>Overview</span>
            </NavLink>
            <NavLink href="/docs/components">
              <BenchIcon label="Components" />
              <span>Components</span>
            </NavLink>
          </NavGroup>
          <NavGroup align="end">
            <NavLink href="/settings">
              <BenchIcon label="Settings" />
              <span>Settings</span>
            </NavLink>
          </NavGroup>
        </Sidebar>
      </ShellNav>
      <ShellMain data-bench="sidebar-main">{children}</ShellMain>
    </Shell>
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
