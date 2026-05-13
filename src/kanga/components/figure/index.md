---
title: Figure
isShortcode: true
---
Images with captions should be called with the Figure component. This component is designed for use within articles and diary posts. If you need more fine-grain control, use the lower-level responsive image helpers directly.

<example height='500'>

## Shortcode arguments

Call the shortcode like so:

```
<figure
  url="/images/path/to/img.jpg"
  alt="Describe the image"
  caption="The image caption"
  classes="classname classname"
  link="https://roobottom.com"
  transform="wide">
```

| Argument | Type | Description |
| :- | :- | :- |
| `url` | string | Required. The URL of the image. |
| `alt` | string | Optional, but recommended. Alt text for the generated image. |
| `caption` | string | Optional. The figure caption. At least one of `alt` or `caption` must be provided. |
| `classes` | string | Classes to apply to the figure container. |
| `link` | string | A link for the image, if required.  |
| `transform` | string | Optional. Use `wide` to render the wider responsive preset. Omit it for the default figure preset. |

## Behaviour

Figure now renders responsive image markup using the site's Eleventy image pipeline.

* Raster images are generated into responsive `picture` markup at build time
* the default preset is sized for normal article figures
* `transform="wide"` switches to the wider preset
* if neither `alt` nor `caption` is supplied, the build will fail

This means Figure is no longer just a convenience wrapper around a resized image URL. It is now the main content-image component for prose pages.

## Special figure classes

There are special classes available for the figure component.

| Class name | Description | 
| :- | :- |
| `wide` | Images appear wider within a `prose` container. |
| `right` | Floats the image right. Applies a max-width of 50%. |
| `shadow` | A drop shadow is applied to the image. |
| `browser` | A browser frame is applied to the image. |
