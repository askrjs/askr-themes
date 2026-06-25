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
import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Nav,
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "../../src/navs";
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
  AspectRatio,
  ListGroup,
  ListGroupItem,
  Separator,
  Skeleton,
  Spinner,
} from "../../src/surfaces";
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

export function buildCoreFixture(): JSX.Element {
  return (
    <section data-bench="core">
      <AspectRatio ratio={16 / 9}>
        <figure>Media</figure>
      </AspectRatio>
      <Block gap="sm">
        <Block border radius="md" padding="md">Block</Block>
        <Container size="lg">
          <Block gap="sm">
            <Block gap="sm" direction="column">
              <Block direction="row" gap="sm">Inline row</Block>
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
      <Breadcrumb aria-label="Docs breadcrumb">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbCurrent>Overview</BreadcrumbCurrent>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Nav aria-label="Primary">
        <NavGroup title="Docs">
          <NavItem href="/docs">Overview</NavItem>
          <NavLink href="/docs/components">Components</NavLink>
        </NavGroup>
      </Nav>
      <Pagination>
        <PaginationItem>
          <PaginationLink href="/docs">1</PaginationLink>
        </PaginationItem>
        <PaginationEllipsis />
        <PaginationItem>
          <PaginationLink href="/docs/components" active>
            2
          </PaginationLink>
        </PaginationItem>
      </Pagination>
    </section>
  );
}

export function buildBrowserNavsFixture(): JSX.Element {
  return (
    <section data-bench="navs-browser">
      <Breadcrumb aria-label="Docs breadcrumb">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbCurrent>Overview</BreadcrumbCurrent>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Nav aria-label="Primary">
        <NavGroup title="Docs">
          <NavItem href="/docs">Overview</NavItem>
          <NavItem href="/docs/components">Components</NavItem>
        </NavGroup>
      </Nav>
      <Pagination>
        <PaginationItem active>1</PaginationItem>
        <PaginationEllipsis />
        <PaginationItem>2</PaginationItem>
      </Pagination>
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
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Route content</CardDescription>
        </CardHeader>
        <CardContent>
          <Block gap="sm">
            {Array.from({ length: rows }, (_, index) => (
              <Card key={index} variant="raised">
                <CardHeader>
                  <CardTitle>Item {index + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>Content {index + 1}</div>
                </CardContent>
              </Card>
            ))}
          </Block>
        </CardContent>
        <CardFooter>
          <Badge variant="info">{rows} records</Badge>
        </CardFooter>
      </Card>
    </section>
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
