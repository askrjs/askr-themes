import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  ButtonGroup,
  Checkbox,
  FieldLegend,
  FieldSet,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
  NavBrand,
  NavGroup,
  NavLink,
  Navbar,
  Pill,
  Pills,
  Switch,
  Tab,
  Tabs,
} from "../../../src/components";
import { mountRoute } from "./_spa";

import "../../../src/themes/default/index.css";

/**
 * The real components, composed the way a consumer composes them, for the
 * heuristics in `heuristics.ts`. The audit page is hand-written markup; this
 * tree is what the components actually render, so it catches a gap between the
 * two (for example attributes a component sets that the sample omits).
 */
export default async function realComponents(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/workspace", () => (
    <div style="display:grid;gap:1rem;padding:0.5rem">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Organizations</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/prod">Production workspace</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/prod/targets">Deployment targets</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Navbar collapseAt="md" aria-label="Workspace">
        <NavBrand>
          <a href="/">
            <span aria-hidden="true">A</span>
            <strong data-nav-brand-label>Askr Production Workspace</strong>
          </a>
        </NavBrand>
        <NavGroup>
          <NavLink href="/workspace" match="exact">
            Components
          </NavLink>
          <NavLink href="/usage">Usage analytics</NavLink>
          <NavLink href="/docs">Long documentation destination</NavLink>
        </NavGroup>
      </Navbar>

      <ButtonGroup attached aria-label="Density">
        <Button variant="outline">Compact</Button>
        <Button variant="outline">Comfortable</Button>
        <Button variant="outline">Spacious</Button>
      </ButtonGroup>

      <div style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center">
        <label style="display:flex;gap:0.5rem;align-items:center">
          <Checkbox defaultChecked />
          <span>Notify me</span>
        </label>
        <Switch defaultChecked aria-label="Enabled" />
        <Button variant="link">Reset filters</Button>
      </div>

      <Tabs aria-label="Sections">
        <Tab href="/workspace" aria-current="page">
          Profile
        </Tab>
        <Tab href="/billing">Billing</Tab>
        <Tab href="/security">Security policies</Tab>
      </Tabs>

      <Pills aria-label="Filters">
        <Pill href="/open" aria-current="page">
          Open
        </Pill>
        <Pill href="/queued">Queued review</Pill>
        <Pill href="/archived">Archived</Pill>
      </Pills>

      <Item variant="outline" data-testid="program-item">
        <ItemContent>
          <ItemTitle>Introducing Premier to customers</ItemTitle>
          <ItemDescription>
            How and when to bring up the Premier Program on a sales call.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="primary" size="sm">
            Open
          </Button>
        </ItemActions>
      </Item>

      <Item variant="outline" data-testid="many-actions-item">
        <ItemContent>
          <ItemTitle>Program actions</ItemTitle>
          <ItemDescription>Review the program before publishing it.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline">Preview program</Button>
          <Button variant="outline">Edit program</Button>
          <Button variant="primary">Publish program</Button>
        </ItemActions>
      </Item>

      <FieldSet>
        <FieldLegend>Programs</FieldLegend>
        <label style="display:flex;gap:0.5rem;align-items:center">
          <Checkbox /> Premier
        </label>
        <label style="display:flex;gap:0.5rem;align-items:center">
          <Checkbox /> Loans
        </label>
      </FieldSet>
    </div>
  ));
}
