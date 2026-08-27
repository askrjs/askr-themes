import { describe, expect, it } from "vite-plus/test";
import { Center, Cluster, Stack } from "../../src/components/intent-layouts";

type ElementLike = { props: Record<string, unknown> };
const element = (value: unknown) => value as ElementLike;

describe("intent-level layouts", () => {
  it("should name common layout policy while retaining the Block resolver", () => {
    const stack = element(Stack({ gap: "sm", children: "flow" }));
    const cluster = element(Cluster({ gap: "xs", children: "chips" }));
    const center = element(Center({ minHeight: "sm", children: "loader" }));

    expect(stack.props["data-slot"]).toBe("stack");
    expect(cluster.props["data-slot"]).toBe("cluster");
    expect(center.props["data-slot"]).toBe("center");
    expect(stack.props["data-ak-layout"]).toBe("true");
    expect(cluster.props["data-ak-layout"]).toBe("true");
    expect(center.props["data-ak-layout"]).toBe("true");
    expect(stack.props.class).toMatch(/ak-dyn-/);
    expect(cluster.props.class).toMatch(/ak-dyn-/);
    expect(center.props.class).toMatch(/ak-dyn-/);
  });

  it("should enforce owned axes even given untyped conflicting values", () => {
    expect(element(Stack({ direction: "row" } as never)).props.class).toBe(
      element(Stack({ direction: "column" } as never)).props.class,
    );
    expect(element(Cluster({ wrap: false } as never)).props.class).toBe(
      element(Cluster({ wrap: true } as never)).props.class,
    );
    expect(element(Center({ align: "start", justify: "end" } as never)).props.class).toBe(
      element(Center({ align: "center", justify: "center" } as never)).props.class,
    );
  });
});
