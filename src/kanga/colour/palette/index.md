---
title: Palette
---
Any page can have a 7-stop colour palette generated from a single seed hex colour. The palette is calculated in OKLCH — a perceptually uniform colour space — so all seven stops are equally vivid rather than fading to muddy greys at the extremes.

## Setting a palette

Add `colour` to any page's frontmatter. The value must be a quoted hex string:

```yaml
colour: "#f5388a"
```

The build generates the full palette and injects the CSS custom properties inline on `<body>`:

```html
<body style="--colour-xx-dark: #290010; --colour-x-dark: #510026; ...">
```

All components use `--c-*` semantic tokens which are automatically remapped to the palette — no per-component changes needed.

## Palette stops

Seven stops are generated, spread across the lightness range of the colour space. The seed colour is placed at whichever stop best matches its natural lightness, and the remaining stops are derived from it.

| Variable | Role |
| :- | :- |
| `--colour-xx-dark` | Darkest — page background on dark pages |
| `--colour-x-dark` | Very dark — component backgrounds on dark pages |
| `--colour-dark` | Dark — link colour on light pages |
| `--colour-mid` | Mid — accent, active indicators |
| `--colour-light` | Light — link colour on dark pages |
| `--colour-x-light` | Very light — borders on light pages |
| `--colour-xx-light` | Lightest — page background on light pages |

Two additional vars are generated for text legibility on the seed colour:

| Variable | Role |
| :- | :- |
| `--colour-on-mid` | High-contrast text colour for use on `--colour-mid` |
| `--colour-on-mid-secondary` | Secondary text colour for use on `--colour-mid` |

<example height="320">

## Illumination

The `illumination` key controls whether the page uses a light or dark background. Defaults to `light` if omitted.

```yaml
illumination: dark
```

On `light` pages with a palette set, the page background becomes `--colour-xx-light` and text becomes `--colour-xx-dark`. On `dark` pages, this is reversed. Without a palette, dark pages fall back to a neutral `#1a1a1a` background.
