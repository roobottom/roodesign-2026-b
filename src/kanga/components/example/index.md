---
title: Example
isShortcode: true
---
Inception alert! The example component is used in Kanga docs to show examples of components. It currently works with:

* Markdown `.md` files
* Nunjucks `.njk` files

The component will render the example in an iFrame at the specified height and extract the code into a `details`.

<example height='350'>

## Shortcode arguments

Call the shortcode like so:

```
<example height="300">
<example name="error" height="300">
```

| Argument | Type | Description |
| - | - | - |
| `name` | string | Optional. The example variant name inside the current doc's `examples/` folder. Omit it to use `default`. |
| `height` | string | The height of the iFrame. Defaults to 300. | 

If you need to point at a completely different example route, the longer `url` form still works.
