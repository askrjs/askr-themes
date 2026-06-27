import { fileURLToPath } from "node:url";

const askrDist = fileURLToPath(new URL("./node_modules/@askrjs/askr/dist/", import.meta.url));

const askrExportAliases: Record<string, string> = {
  "": "index.js",
  boot: "boot/index.js",
  components: "components/index.js",
  control: "control/index.js",
  data: "data/index.js",
  foundations: "foundations/index.js",
  "foundations/icon": "foundations/icon/index.js",
  "foundations/interactions": "foundations/interactions/index.js",
  "foundations/state": "foundations/state/index.js",
  "foundations/structures": "foundations/structures/index.js",
  "foundations/utilities": "foundations/utilities/index.js",
  fx: "fx/index.js",
  "jsx-dev-runtime": "jsx-dev-runtime.js",
  "jsx-runtime": "jsx-runtime.js",
  resources: "resources/index.js",
  router: "router/index.js",
  ssg: "ssg/index.js",
  ssr: "ssr/index.js",
  testing: "testing/index.js",
};

export const askrRuntimeAliases = Object.entries(askrExportAliases).map(([subpath, file]) => ({
  find: subpath.length === 0 ? /^@askrjs\/askr$/ : new RegExp(`^@askrjs/askr/${subpath}$`),
  replacement: `${askrDist}${file}`,
}));

export const linkedWorkspaceDeps = [
  /\/node_modules\/@askrjs\/(?:askr|ui)\//,
  /^@askrjs\/(?:askr|ui)(?:\/.*)?$/,
];
