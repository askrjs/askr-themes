import axe from "axe-core";

import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  ButtonGroup,
  CalendarBody,
  CalendarCell,
  CalendarDay,
  CalendarGrid,
  CalendarRow,
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  Command,
  CommandItem,
  CommandList,
  FieldError,
  InputGroup,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Separator,
  Spinner,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../src/components";
import { mountRoute } from "./_spa";

/** The axe violation shape the spec asserts on, reduced to plain JSON. */
export interface AuditViolation {
  id: string;
  targets: string[];
}

/**
 * Mounts every styling-only component that carries ARIA attributes and exposes
 * an `audit` control so axe keeps running inside the browser.
 */
export default async function ariaRoleAudit(root: HTMLElement): Promise<{
  audit: () => Promise<AuditViolation[]>;
}> {
  await mountRoute(root, "/aria-role-audit", () => (
    <main>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="/page/1" active>
              1
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <Alert title="Notice" description="Saved" />
      <ButtonGroup aria-label="Document actions">
        <button type="button">Save</button>
      </ButtonGroup>
      <InputGroup aria-label="Amount">
        <input aria-label="Amount" />
      </InputGroup>
      <FieldError>Amount is required</FieldError>
      <Separator />
      <Spinner />
      <CalendarGrid>
        <CalendarBody>
          <CalendarRow>
            <CalendarCell>
              <CalendarDay selected>1</CalendarDay>
            </CalendarCell>
          </CalendarRow>
        </CalendarBody>
      </CalendarGrid>
      <Combobox>
        <ComboboxInput aria-label="Project" />
        <ComboboxList>
          <ComboboxOption>Askr</ComboboxOption>
        </ComboboxList>
      </Combobox>
      <Command>
        <CommandList>
          <CommandItem selected>Open</CommandItem>
        </CommandList>
      </Command>
      <ResizablePanelGroup>
        <ResizablePanel>First</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>Second</ResizablePanel>
      </ResizablePanelGroup>
      <TabsList>
        <TabsTrigger>Preview</TabsTrigger>
      </TabsList>
      <TabsContent>Panel</TabsContent>
    </main>
  ));

  return {
    audit: async () => {
      const results = await axe.run(root, { rules: { "color-contrast": { enabled: false } } });
      return results.violations.map((violation) => ({
        id: violation.id,
        targets: violation.nodes.map((node) => node.target.join(" ")),
      }));
    },
  };
}
