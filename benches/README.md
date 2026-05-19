# Bench Tiers

The bench suite is split into four tiers so each layer of the package can be
tracked separately.

| Tier | Environment | What it models | Signal |
| --- | --- | --- | --- |
| `tier1` | `node` | Pure helper work | Allocation cost, string/object normalization, and tree traversal overhead |
| `tier2` | `jsdom` | Static component render | Prop normalization and JSX tree assembly for public families |
| `tier3` | `jsdom` | Stateful composition | Reconciliation cost for shell, nav, and theme updates |
| `tier4` | browser | Real user flows | Mounting, responsive behavior, theme persistence, and style-sensitive regressions |

Guidelines:

- Keep bench names stable when the same scenario appears in multiple tiers.
- Use `tier1` for helper code that does not need DOM APIs.
- Use `tier2` for render trees that do not need live interaction.
- Use `tier3` for mounted jsdom flows that change component state or route
  state.
- Use `tier4` for browser-only flows where layout, paint, or CSS geometry are
  part of the signal.
- Keep the scenarios deterministic. Avoid network access, randomness, and
  wall-clock dependence.

Out of scope:

- CI thresholds or perf gating.
- Exhaustive per-component coverage.
- Synthetic micro-optimizations that do not map to a real package surface.
