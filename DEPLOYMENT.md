# Deployment Notes (Railway)

## Responsive image pipeline

This project pre-generates responsive images at build time using `@11ty/eleventy-img`.

- Source images live in `src/assets/images/`
- Generated variants are written to `dist/assets/images/generated/`
- The image manifest/cache is stored at `.cache/image-manifest.json`

The first build can take a long time while variants are generated.
Subsequent builds are much faster when cache is preserved.

## Railway caching recommendation

For faster deploys, configure Railway to preserve the `.cache/` directory between builds.

If cache is not persisted, each deploy behaves like a cold build and image generation work is repeated.

## Browser formats

Generated formats:

- `avif`
- `webp`
- source-compatible fallback (`jpeg` or `png`)

This gives modern compression with broad fallback support.
