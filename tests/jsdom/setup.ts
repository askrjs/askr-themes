import { vi } from "vite-plus/test";

Object.defineProperty(window, "scrollTo", {
  configurable: true,
  writable: true,
  value: vi.fn(),
});
