---
title: Responsive images
---

At build time, the image pipeline processes every raster image (jpg, jpeg, png, webp, avif) into optimised, responsive output. SVGs and external URLs are passed through unchanged.

Three helpers are available depending on context: a **filter** for inline template expressions, a **shortcode** for tag-style calls, and a **URL filter** when you only need the processed path (e.g. a CSS background).

---

## Presets

All three helpers accept a `preset` that controls which widths are generated and the `sizes` hint sent to the browser.

| Preset | Widths | `sizes` hint | Use for |
| :- | :- | :- | :- |
| `figure` | 480, 768, 1024, 1440 | `(max-width: 768px) 100vw, 768px` | Default for prose figures |
| `wide` | 768, 1024, 1200, 1600 | `(max-width: 1200px) 100vw, 1200px` | Full-width or hero images |
| `card` | 320, 480, 640 | `(max-width: 900px) 100vw, 33vw` | Card thumbnails |
| `masonry` | 320, 600, 900, 1200 | `(max-width: 900px) 50vw, 25vw` | Masonry/gallery tiles |

---

## `responsiveImage` filter

Outputs a complete `<picture>` element with `<source>` and `<img>` tags. Use this when you need an image inline in a template.

<example height="400">

```html
{{ cover | responsiveImage({ alt: coverAlt, preset: 'wide' }) | safe }}
```

The filter accepts an options object:

| Option | Type | Default | Description |
| :- | :- | :- | :- |
| `alt` | string | `""` | Alt text for the `<img>`. |
| `preset` | string | `"figure"` | Which size preset to use (see above). |
| `className` | string | — | Class applied to the `<img>`. |
| `id` | string | — | ID applied to the `<img>`. |
| `sizes` | string | preset default | Override the `sizes` attribute. |
| `loading` | string | `"lazy"` | `lazy` or `eager`. |
| `decoding` | string | `"async"` | `async` or `sync`. |

**Example — article cover image:**

```html
{% if cover %}
  {{ cover | responsiveImage({ alt: coverAlt, preset: 'wide', loading: 'eager' }) }}
{% endif %}
```

**Example — card thumbnail:**

```html
{{ article.data.cover | responsiveImage({ alt: '', preset: 'card' }) }}
```

---

## `responsiveImage` shortcode

The same output as the filter, but as a tag-style shortcode. Useful in markdown content or when the filter syntax is awkward.

```njk
{% responsiveImage "/images/path/to/image.jpg", { alt: "Describe the image", preset: "wide" } %}
```

For prose images with captions, prefer the higher-level [Figure](/kanga/figure/) component instead — it wraps this shortcode and adds caption markup.

---

## `responsiveImageUrl` filter

Returns just the processed URL of the largest image at a given preset, without any `<picture>` markup. Use this for CSS `background-image` or anywhere you need a plain URL.

<example 'url' height="340">

```html
<div style="background-image: url('{{ cover | responsiveImageUrl('wide') }}')"></div>
```

The filter takes a single argument — the preset name (default: `"card"`).

**Example — card with CSS background:**

```html
{% if item.data.cover %}
  <div class="card__cover"
    style="background-image: url('{{ item.data.cover | responsiveImageUrl('card') }}')">
  </div>
{% endif %}
```

---

## Fallback behaviour

If an image hasn't been processed (not in the build manifest) or the URL is external, all three helpers fall back gracefully — the filter and shortcode render a plain `<img>` tag, and the URL filter returns the original URL unchanged.
