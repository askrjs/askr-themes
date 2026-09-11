import {
  Block,
  Center,
  Cluster,
  Container,
  Grid,
  Heading,
  Page,
  PageHeader,
  Section,
  Sidebar,
  Stack,
  Text,
  Toolbar,
} from "../../../src/core";
import { Input } from "../../../src/controls";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "../../../src/overlays";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../../src/surfaces";
import { mountRoute } from "./_spa";

import "../../../src/themes/default/index.css";

/** Responsive container/section/block/grid stack that crosses the `lg` breakpoint. */
export async function responsiveLayout(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/responsive-layout", () => (
    <Container class="responsive-container" size="xl" paddingX={{ base: "sm", lg: "xl" }}>
      <Section class="responsive-section" paddingY={{ base: "sm", lg: "xl" }}>
        <Block class="responsive-block" direction={{ base: "column", lg: "row" }}>
          <Grid class="responsive-grid" columns={{ base: 1, md: 2, lg: 3 }}>
            <div>one</div>
            <div>two</div>
            <div>three</div>
          </Grid>
        </Block>
        <Toolbar title="A long project title" actions={<button>Toolbar action</button>} />
        <PageHeader title="Overview" actions={<button>Header action</button>} />
      </Section>
    </Container>
  ));
}

/** A `Page` shell whose content should fill the container width. */
export async function pageWidth(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/page-width", () => (
    <Page>
      <Heading level={1}>Operations overview</Heading>
      <Grid class="page-grid" columns={2}>
        <div>Deployments</div>
        <div>Incidents</div>
      </Grid>
    </Page>
  ));
}

/** Nested blocks inside a fixed-width row, one of which opts back into `min-width: auto`. */
export async function blockShrink(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/block-shrink", () => (
    <Block class="constrained-row" direction="row" width="full" style="width:280px">
      <Block class="shrinking-child" grow>
        <Text truncate>production-control-plane-event-identifier-with-long-content</Text>
      </Block>
      <Block class="fixed-child">Inspect</Block>
      <Block class="explicit-auto" minWidth="auto">
        Natural width
      </Block>
    </Block>
  ));
}

/** The four form control states the default theme has to keep readable. */
export async function formStates(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/form-states", () => (
    <div data-theme="light">
      <Input aria-label="Invalid field" aria-invalid="true" value="invalid" />
      <Input aria-label="Disabled field" disabled value="disabled" />
      <Input aria-label="Readonly field" readOnly value="readonly" />
      <Input aria-label="Placeholder field" placeholder="Helpful placeholder" />
    </div>
  ));
}

/** A long-content table inside a narrow horizontally scrollable wrapper. */
export async function narrowTable(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/narrow-table", () => (
    <div class="table-width" style="width:320px;overflow-x:auto">
      <Table aria-label="Deployments">
        <TableHead>
          <TableRow>
            <TableHeaderCell>
              Deployment environment with a deliberately long heading
            </TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>production-north-america-control-plane-blue</TableCell>
            <TableCell>Healthy</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ));
}

/** A dropdown nested inside a dialog that is itself nested inside a sidebar. */
export async function nestedOverlays(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/nested-overlays", () => (
    <Sidebar aria-label="Workspace sidebar">
      <Dialog>
        <DialogTrigger>Open settings</DialogTrigger>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Choose a workspace action.</DialogDescription>
            <Dropdown id="dialog-actions">
              <DropdownTrigger>Actions</DropdownTrigger>
              <DropdownContent aria-label="Dialog actions">
                <DropdownItem>Save</DropdownItem>
                <DropdownItem>Archive</DropdownItem>
              </DropdownContent>
            </Dropdown>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </Sidebar>
  ));
}

/** Stack/Cluster/Center intent layouts at a narrow viewport. */
export async function intentLayouts(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/intent-layouts", () => (
    <Stack gap="sm" width="full" data-test="stack">
      <Cluster gap="xs" data-test="cluster">
        <span style="width:240px;flex-shrink:0">Primary action</span>
        <span style="width:240px;flex-shrink:0">Secondary action</span>
      </Cluster>
      <Center width="full" height="sm" data-test="center">
        <span>Loading</span>
      </Center>
    </Stack>
  ));
}
