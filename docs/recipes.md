# App Recipes

Recipes are copyable starting points for boring, correct app UI. They are not
exports. Keep app-specific shells, split pages, form pages, responsive rows,
panels, card lists, and action rows in userland until repeated usage proves
they deserve promotion.

Every recipe follows the same rules:

- `Block` is the only layout engine.
- Use `Container` when content needs page width and gutters.
- Use semantic wrappers for readability.
- Use visual components for appearance.
- Keep responsive behavior explicit.
- Avoid extra panels, decorative copy, and product-specific shell behavior.

## Simple Login Page

Use when the user needs a plain auth screen.

Do:

- One centered card.
- Title plus short description.
- Label plus input for email and password.
- Full-width submit button.
- Inline error state.
- Header actions remain visible on mobile.

Do not:

- Add side panels unless explicitly requested.
- Use responsive Navbar collapse for one or two actions.
- Add helper text under every field by default.
- Add decorative cards or marketing copy.

```tsx
import { Link } from "@askrjs/askr/router";
import { Block, Container, Header, NavBrand } from "@askrjs/themes/components";
import { Button, Field, FieldError, Input, Label } from "@askrjs/themes/components";
import { Card } from "@askrjs/themes/components";
import { ThemeToggle } from "@askrjs/themes/theme";

export function LoginPage({ error }: { error?: string }) {
  return (
    <Block minHeight="screen">
      <Header>
        <Container paddingY="md">
          <Block direction="row" align="center" justify="between" gap="md">
            <NavBrand asChild>
              <Link href="/">Askr</Link>
            </NavBrand>
            <ThemeToggle variant="ghost" size="icon" />
          </Block>
        </Container>
      </Header>

      <Block as="main" grow center padding="lg">
        <Block maxWidth="sm" width="full">
          <Card>
            <Block gap="lg">
              <Block gap="xs">
                <h1>Sign in</h1>
                <p>Use your workspace account.</p>
              </Block>
              <Block as="form" gap="md">
                <Field>
                  <Label for="email">Email</Label>
                  <Input id="email" name="email" type="email" autocomplete="email" />
                </Field>
                <Field>
                  <Label for="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    aria-invalid={error ? "true" : undefined}
                  />
                  {error ? <FieldError>{error}</FieldError> : null}
                </Field>
                <Button type="submit" variant="primary" style={{ width: "100%" }}>
                  Continue
                </Button>
              </Block>
            </Block>
          </Card>
        </Block>
      </Block>
    </Block>
  );
}
```

Responsive behavior: the header stays a simple row. Do not collapse this
Navbar-like header; there is only a brand and theme toggle.

Intended hooks:

- `header`
- `container`
- `nav-brand`
- `card`
- `field`, `field-error`
- `input`, `button`
- `theme-toggle-content`

Optional app CSS:

```css
.login-page :where([data-slot="card"]) {
  width: 100%;
}
```

## Auth Header

Use when auth pages need a brand and one or two global actions.

```tsx
import { Link } from "@askrjs/askr/router";
import { Block, Container, Header, NavBrand, NavItem } from "@askrjs/themes/components";
import { ThemeToggle } from "@askrjs/themes/theme";

export function AuthHeader() {
  return (
    <Header>
      <Container paddingY="md">
        <Block direction="row" align="center" justify="between" gap="md">
          <NavBrand asChild>
            <Link href="/">Askr</Link>
          </NavBrand>
          <Block direction="row" align="center" gap="sm">
            <NavItem href="/help">Help</NavItem>
            <ThemeToggle variant="ghost" size="icon" />
          </Block>
        </Block>
      </Container>
    </Header>
  );
}
```

Responsive behavior: keep actions visible. If this header needs more than two
actions, switch to the Navbar recipe and consider `collapseAt`.

Intended hooks:

- `header`
- `container`
- `nav-brand`
- `nav-item`
- `theme-toggle-content`

## Admin Shell

Use when the app has persistent left navigation plus a sticky topbar.

Do:

- Keep the sidebar app-specific.
- Use `Sidebar`, `NavGroup`, and `NavLink` for structure.
- Keep topbar actions compact.
- Let `Main` grow.

Do not:

- Export a `SidebarLayout` too early.
- Hide required actions in the sidebar on mobile without a product decision.
- Add nested cards around every page section.

```tsx
import { Link } from "@askrjs/askr/router";
import {
  Block,
  Container,
  Header,
  Main,
  NavBrand,
  NavGroup,
  NavLink,
  PageHeader,
  Sidebar,
} from "@askrjs/themes/components";
import { Button } from "@askrjs/themes/components";
import { ThemeToggle } from "@askrjs/themes/theme";

export function AdminShell({ children }: { children?: unknown }) {
  return (
    <Block minHeight="screen" direction="row">
      <Sidebar>
        <NavBrand asChild>
          <Link href="/">Askr</Link>
        </NavBrand>
        <Block as="nav" gap="lg" aria-label="Workspace">
          <NavGroup title="Workspace">
            <NavLink href="/dashboard" match="exact">
              Dashboard
            </NavLink>
            <NavLink href="/projects">Projects</NavLink>
            <NavLink href="/activity">Activity</NavLink>
          </NavGroup>
          <NavGroup title="Admin">
            <NavLink href="/users">Users</NavLink>
            <NavLink href="/settings">Settings</NavLink>
          </NavGroup>
        </Block>
      </Sidebar>

      <Main>
        <Header sticky>
          <Container paddingY="md">
            <Block direction="row" align="center" justify="between" gap="md">
              <PageHeader title="Dashboard" />
              <Block direction="row" align="center" gap="sm">
                <ThemeToggle variant="ghost" size="icon" />
                <Button variant="primary">New project</Button>
              </Block>
            </Block>
          </Container>
        </Header>
        <Container>
          <Block paddingY="xl" gap="lg">
            {children}
          </Block>
        </Container>
      </Main>
    </Block>
  );
}
```

Responsive behavior: this is a desktop-first admin shell. For narrow screens,
make an app-specific decision: keep a compact sidebar, replace it with a
product drawer, or use a top Navbar. Do not bake that decision into core.

Intended hooks:

- `sidebar`, `nav-brand`, `nav-group`, `nav-group-label`, `nav-group-body`,
  `nav-item`
- `main`, `header`, `container`
- `page-header`, `page-header-title`

Optional app CSS:

```css
.admin-shell :where([data-slot="sidebar"]) {
  width: 17rem;
}

.admin-shell :where([data-slot="nav-item"][aria-current="page"]) {
  font-weight: var(--ak-font-weight-medium);
}
```

## Local Nav Patterns

Use when an app needs a path trail or paged links. These are recipes, not
exports, because labels, separators, routing behavior, and disabled states vary
quickly between products.

```tsx
import { Block } from "@askrjs/themes/components";

export function PathTrail() {
  return (
    <Block as="nav" aria-label="Path" direction="row" align="center" gap="sm">
      <a href="/dashboard">Dashboard</a>
      <span aria-hidden="true">/</span>
      <a href="/projects">Projects</a>
      <span aria-hidden="true">/</span>
      <span aria-current="page">Payments API</span>
    </Block>
  );
}

export function PagedLinks() {
  return (
    <Block as="nav" aria-label="Pages" direction="row" align="center" gap="sm">
      <a href="/projects?page=1">Previous</a>
      <a href="/projects?page=1">1</a>
      <span aria-current="page">2</span>
      <a href="/projects?page=3">3</a>
      <a href="/projects?page=3">Next</a>
    </Block>
  );
}
```

## Settings Form Page

Use for account, workspace, billing, and integration settings.

```tsx
import { Block, Page, PageHeader } from "@askrjs/themes/components";
import {
  Button,
  Field,
  FieldHint,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@askrjs/themes/components";
import { Card } from "@askrjs/themes/components";

export function SettingsPage() {
  return (
    <Page>
      <PageHeader title="Settings" description="Manage workspace defaults." />

      <Card>
        <Block as="form" gap="md">
          <h2>Workspace</h2>
          <Field>
            <Label for="name">Workspace name</Label>
            <Input id="name" name="name" />
          </Field>
          <Field>
            <Label for="timezone">Timezone</Label>
            <Select name="timezone">
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
              </SelectContent>
            </Select>
            <FieldHint>Used for reports and notifications.</FieldHint>
          </Field>
          <Block direction="row" justify="end" gap="sm">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Block>
        </Block>
      </Card>
    </Page>
  );
}
```

Responsive behavior: the form remains one column. Use `Page` and `Card` for a
quiet surface. Do not split settings forms into columns unless the product has
enough stable content to justify it.

## Data Table Page

Use for searchable admin data with an empty or error state.

```tsx
import { Block, EmptyState, Page, PageHeader, Toolbar } from "@askrjs/themes/components";
import { Button, Field, Input, Label } from "@askrjs/themes/components";
import {
  Alert,
  Badge,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@askrjs/themes/components";

export function ProjectsTablePage({
  projects,
  error,
}: {
  projects: Array<{ id: string; name: string; status: string }>;
  error?: string;
}) {
  return (
    <Page>
      <PageHeader
        title="Projects"
        description="Manage active project work."
        actions={<Button variant="primary">New project</Button>}
      />

      {error ? (
        <Alert variant="danger" title="Projects failed to load" description={error} />
      ) : null}

      <Card>
        <Block gap="md">
          <Toolbar
            title="All projects"
            actions={
              <Field>
                <Label for="project-filter">Filter</Label>
                <Input id="project-filter" name="filter" placeholder="Search projects" />
              </Field>
            }
          />

          {projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Create your first project to get started."
              action={<Button variant="primary">Create project</Button>}
            />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>
                      <Badge variant="success">{project.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Block>
      </Card>
    </Page>
  );
}
```

Responsive behavior: table cells should be allowed to wrap. If a table cannot
fit narrow screens, solve that in the product with columns, horizontal scroll,
or a dedicated mobile view.

Intended hooks:

- `page-header`, `toolbar`, `toolbar-actions`
- `alert`
- `card`
- `table`, `table-row`, `table-header-cell`, `table-cell`
- `empty-state`

Optional app CSS:

```css
.projects-page :where([data-slot="toolbar-actions"]) {
  flex-wrap: wrap;
}

.projects-page :where([data-slot="table-cell"]) {
  vertical-align: middle;
}
```

## Dropdown Action Menu

Use for compact row or account actions.

```tsx
import { Button } from "@askrjs/themes/components";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownTrigger,
} from "@askrjs/themes/components";

export function ProjectActions() {
  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button variant="ghost" size="sm">
          Actions
        </Button>
      </DropdownTrigger>
      <DropdownContent align="end">
        <DropdownItem>Edit</DropdownItem>
        <DropdownItem>Duplicate</DropdownItem>
        <DropdownSeparator />
        <DropdownItem>Delete</DropdownItem>
      </DropdownContent>
    </Dropdown>
  );
}
```

Responsive behavior: keep labels short and let the content fit within viewport
width. Use `NavDropdown` only when the menu is part of Navbar.

Intended hooks:

- `dropdown-trigger`
- `dropdown-content`
- `dropdown-item`
- `dropdown-separator`

Optional app CSS:

```css
.project-actions :where([data-slot="dropdown-content"]) {
  min-width: 12rem;
}
```

## Detail Page With Side Panel

Use when a page has primary content plus stable secondary metadata.

```tsx
import { Block, Page, PageHeader } from "@askrjs/themes/components";
import { Badge, Card } from "@askrjs/themes/components";

export function ProjectDetailPage() {
  return (
    <Page>
      <PageHeader title="Payments API" description="Production project details." />
      <Block direction={{ base: "column", lg: "row" }} gap="lg" align="start">
        <Block grow gap="lg">
          <Card>
            <Block gap="sm">
              <h2>Overview</h2>
              <p>Primary content goes here.</p>
            </Block>
          </Card>
        </Block>
        <Block width={{ base: "full", lg: "sidebar" }} shrink={false}>
          <Card>
            <Block gap="sm">
              <h2>Metadata</h2>
              <Badge variant="success">Live</Badge>
              <span>Owner: Platform</span>
            </Block>
          </Card>
        </Block>
      </Block>
    </Page>
  );
}
```

Responsive behavior: stack content before metadata on small screens. Keep the
side panel product-specific; do not promote it to a core layout component yet.

Intended hooks:

- `page-header`
- `card`
- `badge`
