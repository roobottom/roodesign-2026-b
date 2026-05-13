const fs = require('fs')
const path = require('path')
const Image = require('@11ty/eleventy-img')
const attrs = require('../shortcodes/attrs.js')

const PROJECT_ROOT = process.cwd()
const IMAGES_ROOT = path.join(PROJECT_ROOT, 'src/assets/images')
const CACHE_OUTPUT_DIR = path.join(PROJECT_ROOT, '.cache/generated-images')
const DIST_OUTPUT_DIR = path.join(PROJECT_ROOT, 'dist/assets/images/generated')
const URL_PATH = '/assets/images/generated/'
const MANIFEST_PATH = path.join(PROJECT_ROOT, '.cache/image-manifest.json')
const META_PATH = path.join(PROJECT_ROOT, '.cache/image-manifest.meta.json')
const IMAGE_PIPELINE_VERSION = '2'

const RASTER_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])

const PRESETS = {
  figure: {
    widths: [480, 768, 1024, 1440],
    sizes: '(max-width: 768px) 100vw, 768px'
  },
  wide: {
    widths: [768, 1024, 1200, 1600],
    sizes: '(max-width: 1200px) 100vw, 1200px'
  },
  card: {
    widths: [320, 480, 640],
    sizes: '(max-width: 900px) 100vw, 33vw'
  },
  masonry: {
    widths: [320, 600, 900, 1200],
    sizes: '(max-width: 900px) 50vw, 25vw'
  }
}

let manifestCache = null

function isRasterImage(filePath) {
  return RASTER_EXTENSIONS.has(path.extname(filePath).toLowerCase())
}

function getFormatsForSource(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.png') {
    return ['webp', 'png']
  }
  return ['webp']
}

function walkDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkDirectory(fullPath))
    } else {
      files.push(fullPath)
    }
  }

  return files
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/')
}

function getSourceUrlVariants(absPath) {
  const relative = toPosixPath(path.relative(IMAGES_ROOT, absPath))
  return [`/images/${relative}`, `/assets/images/${relative}`]
}

function resolveSourcePath(url) {
  if (!url || typeof url !== 'string' || /^https?:\/\//.test(url)) {
    return null
  }

  const normalized = url.split('?')[0]

  if (normalized.startsWith('/images/')) {
    return path.join(IMAGES_ROOT, normalized.slice('/images/'.length))
  }

  if (normalized.startsWith('/assets/images/')) {
    return path.join(IMAGES_ROOT, normalized.slice('/assets/images/'.length))
  }

  return null
}

function loadManifest() {
  if (manifestCache) {
    return manifestCache
  }

  if (!fs.existsSync(MANIFEST_PATH)) {
    manifestCache = {}
    return manifestCache
  }

  manifestCache = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
  return manifestCache
}

function computeSourceFingerprint(allFiles) {
  const fileParts = allFiles
    .sort((a, b) => a.localeCompare(b))
    .map((absPath) => {
      const relative = toPosixPath(path.relative(IMAGES_ROOT, absPath))
      const stats = fs.statSync(absPath)
      return `${relative}:${stats.size}:${Math.floor(stats.mtimeMs)}`
    })

  return `${IMAGE_PIPELINE_VERSION}|${JSON.stringify(PRESETS)}|${fileParts.join('|')}`
}

function loadManifestMeta() {
  if (!fs.existsSync(META_PATH)) {
    return null
  }

  return JSON.parse(fs.readFileSync(META_PATH, 'utf8'))
}

function saveManifestMeta(meta) {
  fs.writeFileSync(META_PATH, JSON.stringify(meta), 'utf8')
}

function getFirstGeneratedAssetPathFromManifest(manifest, outputDir) {
  if (!manifest || typeof manifest !== 'object') {
    return null
  }

  for (const sourceEntry of Object.values(manifest)) {
    if (!sourceEntry || typeof sourceEntry !== 'object') {
      continue
    }

    for (const presetEntry of Object.values(sourceEntry)) {
      if (!presetEntry || !presetEntry.metadata) {
        continue
      }

      const metadata = presetEntry.metadata
      for (const formatEntry of Object.values(metadata)) {
        if (!Array.isArray(formatEntry) || formatEntry.length === 0) {
          continue
        }

        const candidateUrl = formatEntry[0].url
        if (!candidateUrl || typeof candidateUrl !== 'string') {
          continue
        }

        if (!candidateUrl.startsWith(URL_PATH)) {
          continue
        }

        const relativeGeneratedPath = candidateUrl.slice(URL_PATH.length)
        return path.join(outputDir, relativeGeneratedPath)
      }
    }
  }

  return null
}

function hasGeneratedAssetsOnDisk(outputDir) {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return false
  }

  const manifest = loadManifest()
  const firstGeneratedAssetPath = getFirstGeneratedAssetPathFromManifest(manifest, outputDir)

  if (!firstGeneratedAssetPath) {
    return false
  }

  return fs.existsSync(firstGeneratedAssetPath)
}

function syncGeneratedAssetsToDist() {
  if (!fs.existsSync(CACHE_OUTPUT_DIR)) {
    return false
  }

  fs.mkdirSync(path.dirname(DIST_OUTPUT_DIR), { recursive: true })
  fs.cpSync(CACHE_OUTPUT_DIR, DIST_OUTPUT_DIR, { recursive: true, force: true })
  return true
}

async function generateImageMetadata(sourcePath, presetName) {
  const preset = PRESETS[presetName]
  const metadata = await Image(sourcePath, {
    widths: preset.widths,
    formats: getFormatsForSource(sourcePath),
    outputDir: CACHE_OUTPUT_DIR,
    urlPath: URL_PATH,
    sharpAvifOptions: { quality: 45 },
    sharpWebpOptions: { quality: 65 },
    sharpJpegOptions: { quality: 78 }
  })

  return {
    metadata,
    sizes: preset.sizes
  }
}

async function buildResponsiveImageManifest() {
  if (!fs.existsSync(IMAGES_ROOT)) {
    console.log('[images] No source image directory found; skipping responsive image generation.')
    manifestCache = {}
    return
  }

  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true })

  const allFiles = walkDirectory(IMAGES_ROOT).filter(isRasterImage)
  const fingerprint = computeSourceFingerprint(allFiles)
  const existingMeta = loadManifestMeta()

  if (
    existingMeta &&
    existingMeta.fingerprint === fingerprint &&
    fs.existsSync(MANIFEST_PATH) &&
    hasGeneratedAssetsOnDisk(CACHE_OUTPUT_DIR)
  ) {
    console.log('[images] Cache hit: reusing existing responsive image manifest and generated assets.')
    loadManifest()

    if (!hasGeneratedAssetsOnDisk(DIST_OUTPUT_DIR)) {
      console.log('[images] dist output missing; syncing generated assets from cache...')
      syncGeneratedAssetsToDist()
      console.log('[images] Sync complete.')
    }

    return
  }

  console.log(`[images] Cache miss: generating responsive assets for ${allFiles.length} source images...`)
  const manifest = {}
  let generatedCount = 0

  for (const absPath of allFiles) {
    const variants = getSourceUrlVariants(absPath)

    for (const variant of variants) {
      manifest[variant] = {}
    }

    for (const presetName of Object.keys(PRESETS)) {
      const generated = await generateImageMetadata(absPath, presetName)
      for (const variant of variants) {
        manifest[variant][presetName] = generated
      }
    }

    generatedCount += 1
    if (generatedCount % 25 === 0 || generatedCount === allFiles.length) {
      console.log(`[images] Generated ${generatedCount}/${allFiles.length} source images...`)
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest), 'utf8')
  saveManifestMeta({ fingerprint })
  manifestCache = manifest

  console.log('[images] Generation complete. Syncing generated assets into dist...')
  syncGeneratedAssetsToDist()
  console.log('[images] Sync complete.')
}

function renderFallbackImage({ url, alt = '', className, id, loading = 'lazy', decoding = 'async' }) {
  return `<img src="${url}" ${attrs({ alt, class: className, id, loading, decoding })}>`
}

function normalizeAssetUrl(url) {
  if (!url || typeof url !== 'string') {
    return url
  }

  const normalized = url.split('?')[0]
  if (normalized.startsWith('/images/')) {
    return `/assets/images/${normalized.slice('/images/'.length)}`
  }

  return normalized
}

function getResponsiveImageUrl({
  url,
  preset = 'card'
}) {
  const sourcePath = resolveSourcePath(url)
  if (!sourcePath || !isRasterImage(sourcePath)) {
    return normalizeAssetUrl(url)
  }

  const manifest = loadManifest()
  const presetData = manifest[url] && manifest[url][preset]

  if (!presetData || !presetData.metadata) {
    return normalizeAssetUrl(url)
  }

  const metadata = presetData.metadata
  const preferredFormats = ['webp', 'png']

  for (const format of preferredFormats) {
    if (metadata[format] && metadata[format].length > 0) {
      return metadata[format][metadata[format].length - 1].url
    }
  }

  return normalizeAssetUrl(url)
}

function renderResponsiveImage({
  url,
  alt = '',
  className,
  id,
  preset = 'figure',
  sizes,
  loading = 'lazy',
  decoding = 'async'
}) {
  const sourcePath = resolveSourcePath(url)
  if (!sourcePath || !isRasterImage(sourcePath)) {
    return renderFallbackImage({ url, alt, className, id, loading, decoding })
  }

  const manifest = loadManifest()
  const presetData = manifest[url] && manifest[url][preset]

  if (!presetData || !presetData.metadata) {
    return renderFallbackImage({ url, alt, className, id, loading, decoding })
  }

  const htmlOptions = {
    whitespaceMode: 'inline'
  }

  return Image.generateHTML(
    presetData.metadata,
    Object.assign(
      {
        alt,
        sizes: sizes || presetData.sizes,
        loading,
        decoding
      },
      className ? { class: className } : {},
      id ? { id } : {}
    ),
    htmlOptions
  )
}

module.exports = {
  buildResponsiveImageManifest,
  renderResponsiveImage,
  getResponsiveImageUrl
}
