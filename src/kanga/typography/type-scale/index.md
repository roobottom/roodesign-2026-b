---
title: Type scale
---
The type on this site is based on a fluid scale between two set points: a minimum viewport width of `320` and a maximum width of `1100`. Between these widths, the type responds in proportion to the scale of `1.2`. 

## Type scale classes
There are type scale classes that can be used to override text elements.

| Step | Class | Min size @320 | Max size @1100 |
|:--|:--|--:|--:|
| -2 | `.type-scale--2` | 11.81 | 14.58 |
| -1 | `.type-scale--1` | 14.17 | 17.50 |
| 0 | `.type-scale-0` | 17.00 | 21.00 |
| 1 | `.type-scale-1` | 20.40 | 25.20 |
| 2 | `.type-scale-2` | 24.48 | 30.24 |
| 3 | `.type-scale-3` | 29.38 | 36.29 |
| 4 | `.type-scale-4` | 35.25 | 43.55 |
| 5 | `.type-scale-5` | 42.30 | 52.25 |
| 6 | `.type-scale-6` | 50.76 | 62.71 |
| 7 | `.type-scale-7` | 60.91 | 75.25 |
| 8 | `.type-scale-8` | 73.10 | 90.30 |
| 9 | `.type-scale-9` | 87.72 | 108.36 |
| 10 | `.type-scale-10` | 105.26 | 130.03 |

<example height='400'>

## Type scale CSS variables
Each step in the scale also has a CSS variable.

| Step | CSS variable |
|:--|--:|
| -2 | `var(--step--2)` | 
| -1 | `var(--step--1)` |
| 0 | `var(--step-0)` |
| 1 | `var(--step-1)` |
| 2 | `var(--step-2)` |
| 3 | `var(--step-3)` |
| 4 | `var(--step-4)` |
| 5 | `var(--step-5)` |
| 6 | `var(--step-6)` |
| 7 | `var(--step-7)` |
| 8 | `var(--step-8)` |
| 9 | `var(--step-9)` |
| 10 | `var(--step-10)` |

## Spanning steps with type-range

For elements that should be smaller on narrow screens and larger on wide screens — beyond what a single step provides — use `type-range($min-step, $max-step)`. It compiles to a single `clamp()` spanning from the px value of one step to another.

Both arguments must be valid step numbers (-2 to 10). Passing anything outside that range will cause the build to fail with an error.

``` {.language-scss}
@use "../core/settings" as *;

.my-element {
  font-size: #{type-range(5, 8)}; // step-5 at 320px → step-8 at 1100px
}
```

| Argument | Description |
| :- | :- |
| `$min-step` | Step number at the narrow viewport (320px). |
| `$max-step` | Step number at the wide viewport (1100px). |

## Advanced use

The type and spacing systems are built on three Sass functions defined in `core/settings.scss`. Components and pages should use `var(--step-N)` — these functions are for system-level work only.

### `fluid($min, $max)`

Generates a `clamp()` that scales linearly between two px values across the site's viewport range (320–1100px). All values are unitless px numbers.

``` {.language-scss}
font-size: #{fluid(34, 52)}; // clamp(34px, …, 52px)
```

### `rhythm($units)`

Returns a fluid value expressed as a multiple of the body line-height (26px min, 28px max). Ties spacing and sizing to the same baseline as the text, so layout breathes in step with the type.

``` {.language-scss}
margin-bottom: #{rhythm(1)};   // one leading unit  ≈ 26–28px
margin-bottom: #{rhythm(2)};   // two leading units ≈ 52–56px
margin-bottom: #{rhythm(0.5)}; // half a unit       ≈ 13–14px
```

### `rhythm-px($min, $max)`

Like `rhythm()` but accepts raw px values and converts them to leading units internally. Useful when you know the target size in pixels but want it locked to the rhythm system.

``` {.language-scss}
line-height: #{rhythm-px(38, 55)}; // scales from 38px to 55px, in rhythm units
```
