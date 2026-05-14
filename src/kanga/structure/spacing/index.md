---
title: Spacing
---
Spacing is calculated from the body line-height (26px min, 28px max) times a modifier. This ties layout spacing to the same baseline as the text, so gaps between elements are always a whole or fractional number of text lines.

| Size | Modifier | Min size @320 | Max size @1100 |
| :- | -: | -: | -: |
| xxs | 0.25 | 6.50 | 7.00 |
| xs | 0.50 | 13.00 | 14.00 |
| s | 1.00 | 26.00 | 28.00 |
| m | 2.00 | 52.00 | 56.00 |
| l | 3.00 | 78.00 | 84.00 |
| xl | 4.00 | 104.00 | 112.00 |
| xxl | 5.00 | 130.00 | 140.00 |

## Spacing classes

Spacing classes are available for all sizes and directions for padding and margin, in the following pattern:

``` {.language-html}
<element class="space--[type]-[direction]-[size]">
```

For example, if you wanted to add `m` margin-top to an element, use the class:

``` {.language-html}
<element class="space--margin-top-m">
```

There's also a special `all` direction, which adds margin or padding to the whole element. For example,

``` {.language-html}
<element class="space--padding-all-s">
```

The following example gives a visual representation of the scale, using padding.

<example height='300'>

## Spacing variables

Spacing variables are available for all sizes.

| Size | Variable |
| :- | :- |
| xxs | `var(--space-xxs)` |
| xs | `var(--space-xs)` |
| s | `var(--space-s)` |
| m | `var(--space-m)` |
| l | `var(--space-l)` |
| xl | `var(--space-xl)` |
| xxl | `var(--space-xxl)` |

## Advanced use

The spacing system is built on two Sass functions in `core/settings.scss`. Use the `--space-N` CSS variables in components — these functions are for system-level work only.

### `rhythm($units)`

Returns a fluid value expressed as a multiple of the body line-height (26px min, 28px max). This is what generates every `--space-N` token.

``` {.language-scss}
margin-bottom: #{rhythm(1)};   // one leading unit  ≈ 26–28px
margin-bottom: #{rhythm(2)};   // two leading units ≈ 52–56px
margin-bottom: #{rhythm(0.5)}; // half a unit       ≈ 13–14px
```

### `rhythm-px($min, $max)`

Like `rhythm()` but accepts raw px values and converts them to leading units internally. Useful when you know a target size in pixels but want it locked to the rhythm system.

``` {.language-scss}
line-height: #{rhythm-px(38, 55)}; // scales from 38px to 55px, in rhythm units
```
