import { describe, expect, it } from "vite-plus/test";

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
  ListGroup,
  ListGroupItem,
} from "../../src/surfaces";
import {
  ButtonGroup,
  Close,
  Field as ControlField,
  FieldError as ControlFieldError,
  FieldHint as ControlFieldHint,
  InputGroup,
  InputGroupText,
} from "../../src/controls";
import { Pagination, PaginationEllipsis, PaginationItem, PaginationLink } from "../../src/navs";

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe("theme alias classes", () => {
  it("emits the familiar surface aliases by default", () => {
    expect(asElement(Card({ children: "body" })).props.class).toBe("card");
    expect(asElement(Card({ children: "body" })).props["data-padding"]).toBeUndefined();
    expect(
      asElement(Card({ children: "body", variant: "raised", padding: "lg" })).props.class,
    ).toBe("card card-raised card-lg");
    expect(
      asElement(Card({ children: "body", variant: "raised", padding: "lg" })).props["data-padding"],
    ).toBe("lg");
    expect(asElement(CardHeader({ children: "header" })).props.class).toBe("card-header");
    expect(
      asElement(CardHeader({ children: "header", class: "card-header-extra" })).props.class,
    ).toBe("card-header card-header-extra");
    expect(asElement(CardTitle({ children: "title" })).props.class).toBe("card-title");
    expect(asElement(CardDescription({ children: "description" })).props.class).toBe(
      "card-description",
    );
    expect(asElement(CardContent({ children: "content" })).props.class).toBe("card-content");
    expect(asElement(CardFooter({ children: "footer" })).props.class).toBe("card-footer");
    expect(asElement(CardActions({ children: "actions" })).props.class).toBe("card-actions");
    expect(asElement(Badge({ children: "new", variant: "success" })).props.class).toBe(
      "badge badge-success",
    );
    expect(
      asElement(Badge({ children: "new", variant: "success", class: "my-badge" })).props.class,
    ).toBe("badge badge-success my-badge");
    expect(
      asElement(Alert({ title: "Notice", variant: "info", dismissible: true, onDismiss: () => {} }))
        .props.class,
    ).toBe("alert alert-info alert-dismissible");
  });

  it("emits the familiar control aliases by default", () => {
    expect(asElement(ButtonGroup({ children: "group" })).props.class).toBe("btn-group");
    expect(asElement(ButtonGroup({ children: "group", orientation: "vertical" })).props.class).toBe(
      "btn-group btn-group-vertical",
    );
    expect(asElement(Close({})).props.class).toBe("btn-close");
    expect(asElement(InputGroup({ children: "input" })).props.class).toBe("input-group");
    expect(asElement(InputGroupText({ children: "USD" })).props.class).toBe("input-group-text");
    expect(asElement(ControlField({ children: "field" })).props.class).toBe("field");
    expect(asElement(ControlFieldHint({ children: "hint" })).props.class).toBe("field-hint");
    expect(asElement(ControlFieldError({ children: "error" })).props.class).toBe("field-error");
  });

  it("emits the familiar list and pagination aliases by default", () => {
    expect(asElement(ListGroup({ children: "items" })).props.class).toBe("list-group");
    expect(
      asElement(ListGroup({ children: "items", flush: true, orientation: "horizontal" })).props
        .class,
    ).toBe("list-group list-group-flush list-group-horizontal");
    expect(
      asElement(ListGroupItem({ children: "row", action: true, active: true, disabled: true }))
        .props.class,
    ).toBe("list-group-item list-group-item-action active disabled");

    const pagination = asElement(
      Pagination({
        children: PaginationItem({
          children: PaginationLink({ href: "/docs", children: "1" }),
        }),
      }),
    );
    const paginationList = asElement(pagination.props.children);

    expect(pagination.props.class).toBe("pagination");
    expect(paginationList.props.class).toBe("pagination-list");
    expect(
      asElement(PaginationItem({ children: "item", active: true, disabled: true })).props.class,
    ).toBe("page-item active disabled");
    expect(
      asElement(PaginationLink({ href: "/docs", children: "1", active: true, disabled: true }))
        .props.class,
    ).toBe("page-link active disabled");
    expect(asElement(PaginationEllipsis({})).props.class).toBe("pagination-ellipsis");
  });
});
