---
title: Photo collage
---

Composites up to 4 images into a single generated image file at build time using Sharp. The layout adapts automatically to the number of images supplied. Output is a cached WebP at 800×600.

## Layouts

| Images | Layout |
| :- | :- |
| 1 | Single image fills the tile |
| 2 | Side by side, equal width |
| 3 | Large image left, two stacked right |
| 4 | 2×2 grid |

## Usage

Pass an array of image URLs through the `photoCollage` filter. It returns a single image URL you can use in an `<img>` tag.

```html
<img src="{{ [
  '/images/foo.jpg',
  '/images/bar.jpg'
] | photoCollage }}" alt="">
```

## Options

Both options are passed as a second argument object.

| Option | Type | Default | Description |
| :- | :- | :- | :- |
| `background` | string | `"#000000"` | Hex colour for the gap areas between images. |
| `gap` | number | `4` | Gap between images in pixels. |

```html
<img src="{{ images | photoCollage({ background: '#f0f0f0', gap: 8 }) }}" alt="">
```

## Examples

### 4 images

<example height="420">

### 3 images

<example url='three' height="420">

### 2 images

<example url='two' height="420">

## Caching

Generated collages are cached in `.cache/generated-images/` and keyed by a hash of the input URLs, background colour, and gap value. Unchanged collages are not reprocessed on subsequent builds.
