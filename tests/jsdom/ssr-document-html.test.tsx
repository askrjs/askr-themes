import { describe, expect, it } from "vite-plus/test";
import { withThemeStyles } from "../../src/ssr";

const inertDocuments = [
  '<html><head></head><body><!-- <div class="ak-style-fake">ignored</div> --></body></html>',
  `<html><head></head><body><script>const example='<span class="ak-style-fake"></span>';</script></body></html>`,
  `<html><head><style>.example::before{content:' class="ak-style-fake"'}</style></head><body></body></html>`,
  '<html><head></head><body><textarea> class="ak-style-fake"</textarea></body></html>',
  '<html><head><title> class="ak-style-fake"</title></head><body></body></html>',
  `<html><head></head><body><div data-example=' class="ak-style-fake"'>plain</div></body></html>`,
  '<html><head></head><body><script></scripture><div class="ak-style-fake"></div></script></body></html>',
];

describe("SSR document HTML boundaries", () => {
  it.each(inertDocuments)(
    "should agree with parsed DOM about inert generated-class text: %s",
    (html) => {
      const parsed = new DOMParser().parseFromString(html, "text/html");
      const generatedClasses = Array.from(parsed.querySelectorAll("[class]")).flatMap((element) =>
        Array.from(element.classList).filter((name) => name.startsWith("ak-style-")),
      );
      expect(generatedClasses).toEqual([]);
      const renderDocument = withThemeStyles(() => html);
      expect(renderDocument({ appHtml: "plain", context: {} })).toBe(html);
      expect(renderDocument({ appHtml: "plain", context: { styles: [] } })).toBe(html);
    },
  );

  it.each([
    '<div CLASS = "plain&#9;ak-style-real"></div>',
    '<script data-note=">">ignored</ScRiPt ><div class=ak-style-real></div>',
    "<script>ignored</script/><div class=ak-style-real></div>",
    "<div class=ak-style-real />",
    '<div class="&#97;k-style-real"></div>',
    '<div class="other&#32;ak-style-real"></div>',
    '<div class="ak-style-&#114;eal"></div>',
  ])("should validate the generated class actually parsed from %s", (appHtml) => {
    const parsed = new DOMParser().parseFromString(appHtml, "text/html");
    const generatedClasses = Array.from(parsed.querySelectorAll("[class]")).flatMap((element) =>
      Array.from(element.classList).filter((name) => name.startsWith("ak-style-")),
    );
    expect(generatedClasses).toEqual(["ak-style-real"]);
    expect(() =>
      withThemeStyles(({ appHtml }) => `<html><head></head><body>${appHtml}</body></html>`)({
        appHtml,
        context: { styles: [] },
      }),
    ).toThrow(/missing request-local.*ak-style-real/i);
  });

  it("should preserve an unquoted slash as part of the actual class value", () => {
    const appHtml = "<div class=ak-style-real/>";
    const parsed = new DOMParser().parseFromString(appHtml, "text/html");
    expect(parsed.querySelector("div")?.getAttribute("class")).toBe("ak-style-real/");
    expect(() =>
      withThemeStyles(({ appHtml }) => `<html><head></head><body>${appHtml}</body></html>`)({
        appHtml,
        context: { styles: [{ id: "ak-style-real", cssText: ".ak-style-real{color:red}" }] },
      }),
    ).toThrow(/ak-style-real\//);
  });

  it("should place the registry in the real head while preserving quoted attribute content", () => {
    const html = withThemeStyles(
      ({ appHtml }) =>
        `<html><head><meta data-example="</head><body>"></head><body>${appHtml}</body></html>`,
    )({
      appHtml: '<div class="ak-style-real"></div>',
      context: { styles: [{ id: "ak-style-real", cssText: ".ak-style-real{color:red}" }] },
    });
    const parsed = new DOMParser().parseFromString(html, "text/html");
    expect(parsed.head.querySelector("meta")?.getAttribute("data-example")).toBe("</head><body>");
    expect(parsed.head.querySelectorAll("style[data-askr-style-registry]")).toHaveLength(1);
    expect(parsed.body.querySelectorAll("style[data-askr-style-registry]")).toHaveLength(0);
    expect(parsed.head.querySelector("style")?.textContent).toContain(".ak-style-real{color:red}");
  });
});
