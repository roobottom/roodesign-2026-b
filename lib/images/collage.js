const sharp = require('sharp')
const crypto = require('crypto')
const path = require('path')
const fs = require('fs')

const PROJECT_ROOT = process.cwd()
const IMAGES_ROOT = path.join(PROJECT_ROOT, 'src/assets/images')
const CACHE_DIR = path.join(PROJECT_ROOT, '.cache/generated-images')
const DIST_DIR = path.join(PROJECT_ROOT, 'dist/assets/images/generated')
const URL_PREFIX = '/assets/images/generated/'

const CANVAS_W = 800
const CANVAS_H = 600

function resolveSourcePath(url) {
  if (!url || typeof url !== 'string') return null
  const stripped = url.split('?')[0]
  if (stripped.startsWith('/images/')) return path.join(IMAGES_ROOT, stripped.slice('/images/'.length))
  if (stripped.startsWith('/assets/images/')) return path.join(IMAGES_ROOT, stripped.slice('/assets/images/'.length))
  return null
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  }
}

function computeCells(count, gap) {
  const W = CANVAS_W
  const H = CANVAS_H
  const g = gap

  if (count === 1) {
    return [{ x: 0, y: 0, w: W, h: H }]
  }

  if (count === 2) {
    const cw = Math.floor((W - g) / 2)
    return [
      { x: 0, y: 0, w: cw, h: H },
      { x: cw + g, y: 0, w: W - cw - g, h: H }
    ]
  }

  if (count === 3) {
    const leftW = Math.floor((W - g) * 2 / 3)
    const rightW = W - leftW - g
    const ch = Math.floor((H - g) / 2)
    return [
      { x: 0, y: 0, w: leftW, h: H },
      { x: leftW + g, y: 0, w: rightW, h: ch },
      { x: leftW + g, y: ch + g, w: rightW, h: H - ch - g }
    ]
  }

  // 4 images: 2×2
  const cw = Math.floor((W - g) / 2)
  const ch = Math.floor((H - g) / 2)
  return [
    { x: 0, y: 0, w: cw, h: ch },
    { x: cw + g, y: 0, w: W - cw - g, h: ch },
    { x: 0, y: ch + g, w: cw, h: H - ch - g },
    { x: cw + g, y: ch + g, w: W - cw - g, h: H - ch - g }
  ]
}

async function generateCollage(urls, { background = '#000000', gap = 4 } = {}) {
  const clipped = (urls || []).slice(0, 4)
  const count = clipped.length
  if (count === 0) return null

  const cacheKey = crypto
    .createHash('md5')
    .update(JSON.stringify({ urls: clipped, background, gap }))
    .digest('hex')
    .slice(0, 10)

  const filename = `collage-${cacheKey}.webp`
  const cachePath = path.join(CACHE_DIR, filename)
  const distPath = path.join(DIST_DIR, filename)
  const url = `${URL_PREFIX}${filename}`

  // Return cached result if already generated
  if (fs.existsSync(cachePath)) {
    fs.mkdirSync(path.dirname(distPath), { recursive: true })
    if (!fs.existsSync(distPath)) fs.copyFileSync(cachePath, distPath)
    return url
  }

  const cells = computeCells(count, gap)
  const bg = hexToRgb(background)

  const composites = (
    await Promise.all(
      clipped.map(async (imageUrl, i) => {
        const src = resolveSourcePath(imageUrl)
        if (!src || !fs.existsSync(src)) return null
        const cell = cells[i]
        const buffer = await sharp(src)
          .resize(cell.w, cell.h, { fit: 'cover', position: 'centre' })
          .toBuffer()
        return { input: buffer, left: cell.x, top: cell.y }
      })
    )
  ).filter(Boolean)

  fs.mkdirSync(CACHE_DIR, { recursive: true })
  fs.mkdirSync(path.dirname(distPath), { recursive: true })

  await sharp({
    create: { width: CANVAS_W, height: CANVAS_H, channels: 3, background: bg }
  })
    .composite(composites)
    .webp({ quality: 85 })
    .toFile(cachePath)

  fs.copyFileSync(cachePath, distPath)
  return url
}

module.exports = { generateCollage }
