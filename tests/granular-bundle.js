import { build } from "vite";

const fixtureId = "\0granular-consumer";
const result = await build({
  configFile: false,
  logLevel: "silent",
  plugins: [
    {
      name: "granular-consumer",
      resolveId(id) {
        if (id === "granular-consumer") return fixtureId;
      },
      load(id) {
        if (id !== fixtureId) return;
        return [
          'import { Input } from "@askrjs/themes/input";',
          'import { Label } from "@askrjs/themes/label";',
          'import "@askrjs/themes/default/foundations.css";',
          'import "@askrjs/themes/default/input.css";',
          'import "@askrjs/themes/default/label.css";',
          "console.log(Input, Label);",
        ].join("\n");
      },
    },
  ],
  build: {
    write: false,
    rollupOptions: { input: "granular-consumer" },
  },
});

const outputs = Array.isArray(result) ? result.flatMap(({ output }) => output) : result.output;
const javascript = outputs
  .filter(({ type }) => type === "chunk")
  .map(({ code }) => code)
  .join("\n");
const css = outputs
  .filter(({ type, fileName }) => type === "asset" && fileName.endsWith(".css"))
  .map(({ source }) => String(source))
  .join("\n");

for (const unrelated of ["DialogPortal", "PopoverContent", "VirtualTable", "SidebarRail"]) {
  if (javascript.includes(unrelated)) {
    throw new Error(`Granular JavaScript bundle includes unrelated ${unrelated}.`);
  }
}

for (const unrelated of ["dialog-content", "popover-content", "sidebar"]) {
  if (new RegExp(`data-slot=["']?${unrelated}["']?`, "u").test(css)) {
    throw new Error(`Granular CSS bundle includes unrelated selector ${unrelated}.`);
  }
}

if (!/data-slot=["']?input["']?/u.test(css) || !/data-slot=["']?label["']?/u.test(css)) {
  throw new Error("Granular CSS bundle is missing Input or Label styles.");
}

if (Buffer.byteLength(css) >= 60_000) {
  throw new Error(`Expected granular CSS below 60 kB, received ${Buffer.byteLength(css)} bytes.`);
}
