---
title: Tokens
---
Semantic colour tokens (`--c-*`) are the layer between raw palette values and components. Every component references a `--c-*` token — never a `--colour-*` palette stop directly. This means all components adapt to a page's palette automatically.

Tokens are defined in `src/assets/sass/core/colours.scss` and cascade in three layers:

1. **`:root`** — default light values, always present
2. **`body[data-illumination="light"][style*="--colour-xx-light"]`** — palette overrides for light pages with a colour set
3. **`body[data-illumination="dark"]`** — dark mode overrides (with `--colour-*` fallbacks for pages without a palette)

## Token reference

| Token | Default | Purpose |
| :- | :- | :- |
| `--c-text` | `#333333` | Body text |
| `--c-text-secondary` | `#666666` | De-emphasised text, captions, metadata |
| `--c-link` | `#333333` | Link colour |
| `--c-link-hover` | `#023047` | Link hover state |
| `--c-link-focus` | `#0573aa` | Link focus state |
| `--c-border` | `#cccccc` | Borders, dividers, rules |
| `--c-background` | `#ffffff` | Page background (used for hole-punch outlines in gallery/masonry) |
| `--c-focus` | `rgba(0,0,0,0.2)` | Focus ring colour |
| `--c-component-background` | `white` | Card and panel backgrounds |
| `--c-component-background-tint` | `#f1f1f1` | Tinted panel backgrounds |
| `--c-site-header-background` | `white` | Site header background |
| `--c-site-header-border-bottom` | `none` | Site header bottom border |
| `--c-site-footer-background` | `none` | Site footer background |
| `--c-site-footer-border-top` | `1px solid --c-border` | Site footer top border |
| `--c-code-background` | `#f5f5f5` | Code block background |
| `--c-code-border` | `1px solid #e0e0e0` | Code block border |
| `--c-hr` | `--c-border` | Horizontal rule colour |

## Intentionally static tokens

These tokens do not change with the palette or illumination — they carry semantic meaning that overrides aesthetic theming.

| Token | Value | Reason |
| :- | :- | :- |
| `--c-error` | `#ff0054` | Must always be red for accessibility |
| `--c-error-focus` | `rgba(255,0,84,0.5)` | Error focus ring |
| `--c-callout-background` | yellow tint | Callouts carry a fixed amber meaning |
| `--c-callout-border` | `#FFB703` | As above |
| `--c-callout-text` | `#333333` | As above |

## Card-specific tokens

The card component has its own named tokens that alias the global ones, making it possible to restyle cards independently if needed.

| Token | Default |
| :- | :- |
| `--card-background` | `--c-component-background` |
| `--card-text` | `--c-text` |
| `--card-link` | `--c-link` |
| `--card-meta-text` | `--c-text-secondary` |
| `--card-cover-blend` | `normal` |
| `--card-pattern-from` | `--c-link` |
| `--card-pattern-to` | `--c-link-hover` |
