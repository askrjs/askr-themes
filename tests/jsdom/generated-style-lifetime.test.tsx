import { cleanupApp, createIsland } from "@askrjs/askr/boot";
import { state } from "@askrjs/askr";
import { createRouteRegistry, route } from "@askrjs/askr/router";
import { renderToString } from "@askrjs/askr/ssr";
import { flush } from "@askrjs/askr/testing";
import { afterEach, expect, it } from "vite-plus/test";

import { Block, Grid } from "../../src/core";
import { AspectRatio, Skeleton } from "../../src/surfaces";
import { withThemeStyles } from "../../src/ssr";
import { styleDeclarationsToClass } from "../../src/components/_internal/style";

const roots: HTMLElement[] = [];
const NONCE = "MDEyMzQ1Njc4OWFiY2RlZg";
const families = [
  {
    name: "Block",
    render: (width: string, ref?: (node: HTMLElement | null) => void) => (
      <Block ref={ref} style={{ width }} />
    ),
  },
  {
    name: "Grid",
    render: (width: string, ref?: (node: HTMLElement | null) => void) => (
      <Grid ref={ref} columns={2} style={{ width }} />
    ),
  },
  {
    name: "AspectRatio",
    render: (width: string, ref?: (node: HTMLElement | null) => void) => (
      <AspectRatio ref={ref} ratio={2} style={{ width }} />
    ),
  },
  {
    name: "Skeleton",
    render: (width: string, ref?: (node: HTMLElement | null) => void) => (
      <Skeleton ref={ref} width={width} />
    ),
  },
];
const ssrRegistry = createRouteRegistry(() => {
  route("/", () => <Block style={{ width: "743px" }}>server content</Block>);
  for (const family of families) route(`/${family.name}`, () => family.render("747px"));
});

function attachedRoot(): HTMLElement {
  const root = document.createElement("div");
  document.body.append(root);
  roots.push(root);
  return root;
}

function registryText(): string {
  return document.querySelector("style[data-askr-style-registry]")?.textContent ?? "";
}

async function settle(): Promise<void> {
  for (let index = 0; index < 4; index += 1) {
    await Promise.resolve();
    flush();
  }
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    cleanupApp(root);
    root.remove();
  }
  for (const style of document.querySelectorAll("style[data-askr-style-registry]")) {
    style.remove();
  }
});

it("should keep every generated rule when mounting a new subtree above the reclamation threshold", async () => {
  const root = attachedRoot();
  const Root = () => (
    <div>
      {Array.from({ length: 520 }, (_, index) => (
        <Block key={index} data-generated-case={index} style={{ width: `${index + 1}px` }} />
      ))}
    </div>
  );
  createIsland({ root, component: Root });
  await settle();
  const blocks = Array.from(root.querySelectorAll<HTMLElement>("[data-generated-case]"));
  expect(blocks).toHaveLength(520);
  expect(blocks.every((node) => node.isConnected)).toBe(true);
  const cssText = registryText();
  const missing = blocks.flatMap((node, index) => {
    const className = Array.from(node.classList).find((value) => value.startsWith("ak-style-"));
    return className && cssText.includes(`.${className}{`) ? [] : [index];
  });
  expect(missing).toEqual([]);
}, 15_000);

it("should retain every imperative generated rule used by connected elements above capacity", () => {
  const root = attachedRoot();
  const generated: string[] = [];
  for (let index = 0; index < 520; index += 1) {
    const className = styleDeclarationsToClass(`width:${index + 1}px`)!;
    const node = document.createElement("div");
    node.className = className;
    root.append(node);
    generated.push(className);
  }
  const cssText = registryText();
  expect(generated.filter((className) => !cssText.includes(`.${className}{`))).toEqual([]);
}, 15_000);

it("should retain the committed registry after a later sibling rejects a proposed style", async () => {
  const root = attachedRoot();
  let reject = false;
  const Rejection = () => {
    if (reject) throw Error("reject generated style proposal");
    return <span />;
  };
  const Root = () => (
    <div>
      <Block data-generated-case="proposal" style={{ width: reject ? "941px" : "940px" }} />
      <Rejection />
    </div>
  );
  createIsland({ root, component: Root });
  await settle();
  const previousMarkup = root.innerHTML;
  const previousCss = registryText();
  reject = true;
  expect(() => createIsland({ root, component: Root })).toThrow("reject generated style proposal");
  reject = false;
  await settle();
  expect(root.innerHTML).toBe(previousMarkup);
  expect(registryText()).toBe(previousCss);
});

it("should collect SSR styles without mutating an available browser document", () => {
  const before = document.head.innerHTML;
  const html = renderToString({
    url: "/",
    registry: ssrRegistry,
    cspNonce: NONCE,
    document: withThemeStyles(
      ({ appHtml }) => `<!doctype html><html><head></head><body>${appHtml}</body></html>`,
    ),
  });
  expect(html).toContain("width:743px");
  expect(html).toContain(`nonce="${NONCE}"`);
  expect(document.head.innerHTML).toBe(before);
});

it.each(families)(
  "should keep $name caller refs stable across committed and discarded style updates",
  async ({ render }) => {
    const root = attachedRoot();
    let width = "701px";
    let reject = false;
    const notifications: Array<HTMLElement | null> = [];
    const ref = (node: HTMLElement | null) => {
      notifications.push(node);
      if (node) {
        const generated = Array.from(node.classList).find((value) =>
          value.startsWith("ak-style-"),
        )!;
        expect(registryText()).toContain(`.${generated}{`);
      }
    };
    const Rejection = () => {
      if (reject) throw Error("reject family style proposal");
      return <span />;
    };
    const Root = () => (
      <div>
        {render(width, ref)}
        <Rejection />
      </div>
    );
    createIsland({ root, component: Root });
    await settle();
    const node = root.querySelector<HTMLElement>("[data-slot]")!;
    expect(notifications).toEqual([node]);
    width = "702px";
    createIsland({ root, component: Root });
    await settle();
    expect(notifications).toEqual([node]);
    const before = registryText();
    width = "703px";
    reject = true;
    expect(() => createIsland({ root, component: Root })).toThrow("reject family style proposal");
    reject = false;
    width = "702px";
    expect(registryText()).toBe(before);
    await settle();
    expect(notifications).toEqual([node]);
    expect(registryText()).toBe(before);
    width = "704px";
    createIsland({ root, component: Root });
    await settle();
    expect(notifications).toEqual([node]);
    expect(registryText()).toContain("704px");
    cleanupApp(root);
    expect(notifications).toEqual([node, null]);
  },
);

it.each(families)(
  "should register $name request styles without adopting browser registries during SSR",
  ({ name }) => {
    const before = document.head.innerHTML;
    const html = renderToString({
      url: `/${name}`,
      registry: ssrRegistry,
      cspNonce: NONCE,
      document: withThemeStyles(
        ({ appHtml }) => `<!doctype html><html><head></head><body>${appHtml}</body></html>`,
      ),
    });
    expect(html).toContain("747px");
    expect(html).toContain(`nonce="${NONCE}"`);
    expect(document.head.innerHTML).toBe(before);
  },
);

it("should preserve direct Block construction and synchronous generated rules outside render", async () => {
  const ref = { current: null as HTMLElement | null };
  const element = Block({ style: { width: "711px" }, ref });
  expect(element.type).toBe("div");
  expect(element.props.ref).toBe(ref);
  expect(registryText()).toContain("width:711px");
  const root = attachedRoot();
  createIsland({ root, component: () => element });
  expect(ref.current).toBe(root.firstElementChild);
  cleanupApp(root);
  expect(ref.current).toBeNull();
});

it("should keep detached committed subtree rules available before connection", async () => {
  const root = document.createElement("div");
  roots.push(root);
  const Root = () => (
    <section>
      {Array.from({ length: 520 }, (_, index) => (
        <Block key={index} style={{ width: `${index + 1011}px` }} />
      ))}
    </section>
  );
  createIsland({ root, component: Root });
  await settle();
  const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-slot=block]"));
  expect(nodes).toHaveLength(520);
  expect(nodes.every((node) => !node.isConnected)).toBe(true);
  const missing = nodes.flatMap((node, index) =>
    registryText().includes(
      `.${Array.from(node.classList).find((value) => value.startsWith("ak-style-"))}{`,
    )
      ? []
      : [index],
  );
  expect(missing).toEqual([]);
  document.body.append(root);
  expect(nodes.every((node) => node.isConnected)).toBe(true);
}, 15_000);

it("should leave committed CSS unchanged when structural insertion aborts before refs publish", async () => {
  const root = attachedRoot();
  let replace = false;
  const Root = () => (
    <div>
      <Block style={{ width: replace ? "722px" : "721px" }} />
      {replace ? <span data-reject-insertion="true" /> : null}
    </div>
  );
  createIsland({ root, component: Root });
  await settle();
  const host = root.firstElementChild!;
  const markup = root.innerHTML;
  const css = registryText();
  const originalInsert = host.insertBefore;
  host.insertBefore = function (node, before) {
    if (node instanceof Element && node.hasAttribute("data-reject-insertion"))
      throw Error("reject structural style commit");
    return originalInsert.call(this, node, before);
  };
  replace = true;
  try {
    expect(() => createIsland({ root, component: Root })).toThrow("reject structural style commit");
  } finally {
    host.insertBefore = originalInsert;
  }
  await settle();
  expect(root.innerHTML).toBe(markup);
  expect(registryText()).toBe(css);
});

it("should forward actual node and caller ref replacements synchronously", async () => {
  const root = attachedRoot();
  let section = false;
  let alternate = false;
  const first: Array<HTMLElement | null> = [];
  const second: Array<HTMLElement | null> = [];
  const firstRef = (node: HTMLElement | null) => first.push(node);
  const secondRef = (node: HTMLElement | null) => second.push(node);
  const Root = () => (
    <Block
      as={section ? "section" : "div"}
      ref={alternate ? secondRef : firstRef}
      style={{ width: "731px" }}
    />
  );
  createIsland({ root, component: Root });
  const initial = root.firstElementChild;
  expect(first).toEqual([initial]);
  section = true;
  createIsland({ root, component: Root });
  const replacement = root.firstElementChild;
  expect(replacement).not.toBe(initial);
  expect(first).toEqual([initial, null, replacement]);
  alternate = true;
  createIsland({ root, component: Root });
  expect(first).toEqual([initial, null, replacement, null]);
  expect(second).toEqual([replacement]);
  cleanupApp(root);
  expect(second).toEqual([replacement, null]);
});

it("should preserve stable object refs when styles are added and removed", async () => {
  const root = attachedRoot();
  let width: string | undefined;
  const ref = { current: null as HTMLElement | null };
  const Root = () => <Block ref={ref} style={{ width }} />;
  createIsland({ root, component: Root });
  const node = ref.current!;
  expect(node).toBe(root.firstElementChild);
  width = "733px";
  createIsland({ root, component: Root });
  expect(ref.current).toBe(node);
  expect(registryText()).toContain("width:733px");
  width = undefined;
  createIsland({ root, component: Root });
  expect(ref.current).toBe(node);
  expect(Array.from(node.classList).some((value) => value.startsWith("ak-style-"))).toBe(false);
  cleanupApp(root);
  expect(ref.current).toBeNull();
});

it("should preserve asChild native refs and generated classes", async () => {
  const root = attachedRoot();
  const ref = { current: null as HTMLElement | null };
  const Root = () => (
    <Block asChild ref={ref} style={{ width: "735px" }}>
      <section data-generated-case="asChild" />
    </Block>
  );
  createIsland({ root, component: Root });
  expect(ref.current).toBe(root.firstElementChild);
  expect(ref.current?.tagName).toBe("SECTION");
  expect(registryText()).toContain("width:735px");
  cleanupApp(root);
  expect(ref.current).toBeNull();
});

it("should retain separate committed nonce registries", () => {
  for (const [nonce, width] of [
    [NONCE, "751px"],
    ["c2Vjb25kLW5vbmNlLTEyMw", "752px"],
  ]) {
    createIsland({
      root: attachedRoot(),
      component: () => <Block style={{ width }} />,
      cspNonce: nonce,
    });
  }
  const registries = Array.from(
    document.querySelectorAll<HTMLStyleElement>("style[data-askr-style-registry]"),
  );
  expect(registries).toHaveLength(2);
  expect(registries.find((style) => style.nonce === NONCE)?.textContent).toContain("751px");
  expect(registries.find((style) => style.nonce !== NONCE)?.textContent).toContain("752px");
});

it("should preserve later parent state when direct Block calls shrink grow and reorder", async () => {
  const root = attachedRoot();
  let names = ["first", "second"];
  const refs = new Map<string, (node: HTMLElement | null) => void>();
  const attached = new Map<string, HTMLElement>();
  for (const name of ["first", "second", "third"]) {
    refs.set(name, (node) => {
      if (node) attached.set(name, node);
      else attached.delete(name);
    });
  }
  let parentState: ReturnType<typeof state<string>> | undefined;
  const Root = () => {
    const blocks = names.map((name) => (
      <div key={name}>
        {Block({ ref: refs.get(name), "data-generated-name": name, style: { width: "759px" } })}
      </div>
    ));
    parentState = state("parent state survives");
    return <section data-parent-state={parentState()}>{blocks}</section>;
  };
  createIsland({ root, component: Root });
  const originalState = parentState;
  for (const next of [["second"], ["second", "first", "third"], ["first", "second"]]) {
    names = next;
    createIsland({ root, component: Root });
    await settle();
    expect(parentState).toBe(originalState);
    expect(root.firstElementChild?.getAttribute("data-parent-state")).toBe("parent state survives");
    expect([...attached.keys()].sort()).toEqual([...names].sort());
  }
  cleanupApp(root);
  expect(attached.size).toBe(0);
});

it("should allow later reclamation after a detached committed subtree unmounts", async () => {
  const root = document.createElement("div");
  roots.push(root);
  createIsland({
    root,
    component: () => (
      <section>
        {Array.from({ length: 520 }, (_, index) => (
          <Block key={index} style={{ width: `${index + 2011}px` }} />
        ))}
      </section>
    ),
  });
  await settle();
  expect(registryText()).toContain("width:2011px");
  cleanupApp(root);
  styleDeclarationsToClass("width:2999px");
  expect(registryText()).not.toContain("width:2011px");
  expect(registryText()).toContain("width:2999px");
}, 15_000);

it("should publish a committed node rule in its owning document", () => {
  const otherDocument = document.implementation.createHTMLDocument("generated styles");
  const root = otherDocument.createElement("div");
  otherDocument.body.append(root);
  roots.push(root);
  const before = document.head.innerHTML;
  createIsland({ root, component: () => <Block style={{ width: "761px" }} /> });
  expect(root.firstElementChild?.ownerDocument).toBe(otherDocument);
  expect(otherDocument.querySelector("style[data-askr-style-registry]")?.textContent).toContain(
    "width:761px",
  );
  expect(document.head.innerHTML).toBe(before);
});

it("should retain independent generated bindings composed onto the same native child", async () => {
  const root = document.createElement("div");
  roots.push(root);
  const notifications: Array<HTMLElement | null> = [];
  const ref = (node: HTMLElement | null) => notifications.push(node);
  const Root = () => (
    <Block asChild ref={ref} style={{ height: "773px" }}>
      <AspectRatio asChild ratio={2} style={{ width: "774px" }}>
        <figure />
      </AspectRatio>
    </Block>
  );
  createIsland({ root, component: Root });
  const node = root.firstElementChild as HTMLElement;
  expect(notifications).toEqual([node]);
  await settle();
  expect(notifications).toEqual([node]);
  const generated = Array.from(node.classList).filter((value) => value.startsWith("ak-style-"));
  expect(generated).toHaveLength(2);
  for (let index = 0; index < 513; index += 1)
    styleDeclarationsToClass(`--ak-composed-pressure:${index}`);
  for (const className of generated) expect(registryText()).toContain(`.${className}{`);
  createIsland({ root, component: Root });
  await settle();
  expect(notifications).toEqual([node]);
  cleanupApp(root);
  expect(notifications).toEqual([node, null]);
}, 15_000);
