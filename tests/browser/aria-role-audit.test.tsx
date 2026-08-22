import axe from "axe-core";
import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";
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
} from "../../src/components";
import { createTestRegistry, resetTestRoutes, testRoute } from "../router-test-utils";

describe("ARIA and role audit", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    resetTestRoutes();
    window.history.replaceState({}, "", "/aria-role-audit");
  });

  afterEach(() => {
    cleanupApp(container);
    container.remove();
    resetTestRoutes();
  });

  it("should not emit incomplete interactive ARIA patterns from styling-only components", async () => {
    testRoute("/aria-role-audit", () => (
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

    await createSPA({ root: container, registry: createTestRegistry() });
    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

    expect(
      results.violations.map((violation) => ({
        id: violation.id,
        targets: violation.nodes.map((node) => node.target.join(" ")),
      })),
    ).toEqual([]);
  });
});
