import { describe, expect, it } from "vite-plus/test";

import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Spinner,
} from "../src/components";

describe("breadcrumb and spinner wrappers", () => {
  it("renders deterministic breadcrumb and spinner element trees", () => {
    const breadcrumbOne = Breadcrumb({
      children: (
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbCurrent>Overview</BreadcrumbCurrent>
          </BreadcrumbItem>
        </BreadcrumbList>
      ),
    });
    const breadcrumbTwo = Breadcrumb({
      children: (
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbCurrent>Overview</BreadcrumbCurrent>
          </BreadcrumbItem>
        </BreadcrumbList>
      ),
    });
    const spinnerOne = Spinner({ label: "Syncing" }) as {
      type: unknown;
      props: Record<string, unknown>;
    };
    const spinnerTwo = Spinner({ label: "Syncing" }) as {
      type: unknown;
      props: Record<string, unknown>;
    };

    expect(breadcrumbOne).toEqual(breadcrumbTwo);
    expect(spinnerOne.type).toBe(spinnerTwo.type);
    expect(spinnerOne.props.value).toBeNull();
    expect(spinnerOne.props["aria-label"]).toBe("Syncing");
    expect(typeof spinnerOne.props.getValueLabel).toBe("function");
    expect(spinnerOne.props.value).toBe(spinnerTwo.props.value);
    expect(spinnerOne.props["aria-label"]).toBe(spinnerTwo.props["aria-label"]);
  });
});
