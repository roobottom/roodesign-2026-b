---
title: Breakpoints
---
For the most part, this site uses standard breakpoints that respond to the viewport width:

| Breakpoint name | Sizes |
| :- | -: |
| upto-min | <320 |
| min | >320 |
| mid | >520 |
| max | >980 |
| beyond-max | >1100 |

There are also special breakpoints if I need to restrict CSS to a certain viewport width:

| Breakpoint name | Sizes |
| :- | -: |
| min-only | >320 <520 |
| mid-only | >520 <980 |
| max-only | >980 <1100 |

## Using the breakpoints in Sass

Breakpoints live in the `$bp` map in `core/settings.scss`. Use `map.get()` to interpolate them into a media query, either nested inside a rule or as a wrapper:

``` {.language-scss}
@use "sass:map";
@use "../core/settings" as *;

// nested
.element {
  font-size: var(--step-0);
  @media #{map.get($bp, mid)} {
    font-size: var(--step-1);
  }
}

// wrapped
@media #{map.get($bp, mid)} {
  .element {
    font-size: var(--step-1);
  }
}
```
