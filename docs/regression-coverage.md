# Regression Coverage Matrix

This ledger keeps theme regressions tied to public user-visible contracts:
exports, class/slot structure, CSS tokens, responsive layout, and composed
`askr-ui` behavior.

## Package baseline

| Surface                     | Coverage expectation                                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Package exports and aliases | Unit package-surface, alias, moved-component, and components-entrypoint tests.                                 |
| Component families          | Unit coverage matrix maps every public family to direct tests and benches.                                     |
| CSS and tokens              | Token, selector, contrast, no-important, visual-quality, and template-parity tests.                            |
| jsdom composition           | Core structure, theme provider, nav, route persistence, and slot-contract tests.                               |
| Browser visual behavior     | Navbar, sidebar, route persistence, overlay recipe, table theme, public family, and visual-polish smoke tests. |
| Bench coverage              | Tier 2 public families, Tier 3 composition, and Tier 4 browser flows after correctness is protected.           |

## Regression classes

| Class                        | Required durable coverage                                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Responsive navigation regressions | Browser tests must cover long labels, breakpoint collapse, menu close paths, Escape, resize, and nav activation.             |
| Overlay composition drift    | Browser tests must compose themed overlays through public exports and assert real `askr-ui` behavior remains intact.               |
| Token or selector drift      | Unit contracts must assert semantic token names, selectors, aliases, contrast, and template parity.                                |
| Slot/prop passthrough drift  | Unit or jsdom tests must assert `asChild`, class merging, data slots, ARIA passthrough, and ref-safe composition where applicable. |
| Route/theme persistence      | jsdom and browser tests must assert theme state across navigation and reload-shaped flows.                                         |
| Cross-package version drift  | Package surface tests and integration smoke must fail before a released `askr-ui` or `askr` dependency breaks themed exports.      |

## Current focused follow-ups

- Navbar, sidebar, overlays, theme route persistence, and visual-polish browser
  smoke tests cover the highest-risk visual regressions.
- Public family coverage is enforced by `tests/unit/component-coverage.test.ts`;
  update that matrix with each new export instead of relying on ad hoc tests.
- When a themed regression is caused by runtime ownership, event timing, or
  portal cleanup, add the package-local test first and then add an `askr` or
  `askr-ui` regression at the lower layer if it reproduces there.

Release validation for this matrix is:

```bash
npm run lint
npm run build
npm run test:checks
npm run test:unit
npm run test:jsdom
npm run test:browser
```
