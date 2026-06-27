import { describe, expect, it } from "vite-plus/test";

import { Alert, Badge, Card } from "../../src/surfaces";
import {
  ButtonGroup,
  Close,
  Field as ControlField,
  FieldError as ControlFieldError,
  FieldHint as ControlFieldHint,
  InputGroup,
  InputGroupText,
} from "../../src/controls";

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe("theme alias classes", () => {
  it("should emits the familiar surface aliases by default", () => {
    expect(asElement(Card({ children: "body" })).props.class).toBe("card");
    expect(asElement(Card({ children: "body", variant: "raised" })).props.class).toBe(
      "card card-raised",
    );
    expect(asElement(Badge({ children: "new", variant: "success" })).props.class).toBe(
      "badge badge-success",
    );
    expect(
      asElement(Badge({ children: "new", variant: "success", class: "my-badge" })).props.class,
    ).toBe("badge badge-success my-badge");
    expect(
      asElement(Alert({ title: "Notice", variant: "info", onDismiss: () => {} })).props.class,
    ).toBe("alert alert-info alert-dismissible");
  });

  it("should emits the familiar control aliases by default", () => {
    expect(asElement(ButtonGroup({ children: "group" })).props.class).toBe("btn-group");
    expect(asElement(ButtonGroup({ children: "group", orientation: "vertical" })).props.class).toBe(
      "btn-group btn-group-vertical",
    );
    expect(asElement(Close({})).props.class).toBe("btn-close");
    expect(asElement(InputGroup({ children: "input" })).props.class).toBe("input-group");
    expect(asElement(InputGroupText({ children: "USD" })).props.class).toBe("input-group-text");
    expect(asElement(ControlField({ children: "field" })).props.class).toBe("field");
    expect(
      asElement(ControlField({ children: "field", invalid: true })).props["data-invalid"],
    ).toBe("true");
    expect(asElement(ControlFieldHint({ children: "hint" })).props.class).toBe("field-hint");
    expect(asElement(ControlFieldError({ children: "error" })).props.class).toBe("field-error");
    expect(asElement(ControlFieldError({ children: "error" })).props.role).toBe("alert");
  });
});
