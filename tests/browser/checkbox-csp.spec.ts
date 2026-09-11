import { readFileSync } from "node:fs";

import { HARNESS_URL, expect, test } from "./fixtures";

const checkboxCss = readFileSync(
  new URL("../../src/themes/default/styles/forms/checkbox.css", import.meta.url),
  "utf8",
);

interface CheckboxCspResult {
  key: string;
  checkedImage: string;
  indeterminateImage: string;
  violations: string[];
}

test("should render checked and indeterminate indicators under same-origin image CSP", async ({
  page,
}) => {
  await page.goto(HARNESS_URL);

  const observed = await page.evaluate<CheckboxCspResult, string>(async (css) => {
    const key = crypto.randomUUID();
    const frame = document.createElement("iframe");
    const result = new Promise<CheckboxCspResult>((resolve) => {
      const receiveResult = (event: MessageEvent<CheckboxCspResult>) => {
        if (event.source === frame.contentWindow && event.data?.key === key) {
          window.removeEventListener("message", receiveResult);
          resolve(event.data);
        }
      };
      window.addEventListener("message", receiveResult);
    });
    frame.srcdoc = `<!doctype html>
    <html>
      <head>
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'unsafe-inline'; script-src 'nonce-checkbox-csp'">
        <script nonce="checkbox-csp">
          const violations = [];
          window.addEventListener("securitypolicyviolation", (event) => {
            violations.push(event.blockedURI);
          });
          window.addEventListener("load", () => {
            setTimeout(() => {
              parent.postMessage({
                key: ${JSON.stringify(key)},
                checkedImage: getComputedStyle(document.querySelector('[data-state="checked"]')).backgroundImage,
                indeterminateImage: getComputedStyle(document.querySelector('[data-state="indeterminate"]')).backgroundImage,
                violations,
              }, "*");
            }, 50);
          }, { once: true });
        </script>
        <style>
          :root {
            --ak-color-input: rgb(100 116 139);
            --ak-color-surface: rgb(255 255 255);
            --ak-color-primary: rgb(37 99 235);
            --ak-color-text-inverse: rgb(255 255 255);
            --ak-radius-sm: 0.25rem;
            --ak-duration-fast: 100ms;
            --ak-ease-standard: ease;
            --ak-focus-ring-width: 2px;
            --ak-color-focus-ring: rgb(37 99 235);
            --ak-color-disabled-bg: rgb(226 232 240);
          }
          ${css}
        </style>
      </head>
      <body>
        <input type="checkbox" data-slot="checkbox" data-state="checked" checked>
        <input type="checkbox" data-slot="checkbox" data-state="indeterminate">
      </body>
    </html>`;
    document.body.append(frame);

    return result;
  }, checkboxCss);

  expect(observed.violations).toEqual([]);
  expect(observed.checkedImage).toContain("gradient");
  expect(observed.indeterminateImage).toContain("gradient");
  expect(observed.checkedImage).not.toBe(observed.indeterminateImage);
});
