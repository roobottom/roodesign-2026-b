/**
 * Kanga colour palette generator
 * Algorithm C — OKLCH (Roodesign 2026)
 *
 * Generates a 7-stop palette from a seed hex using the OKLCH
 * perceptually-uniform colour space. Unlike HSL, OKLCH keeps
 * chroma independent of lightness — so dark and light stops
 * stay vivid rather than collapsing to grey.
 *
 * Stop names and OKLCH lightness targets:
 *   xxDark  L≈0.18  — near-black with clear hue
 *   xDark   L≈0.28  — dark background
 *   dark    L≈0.38  — card / mid-dark background
 *   mid              — the original seed colour, untouched
 *   light   L≈0.72  — medium-light accent
 *   xLight  L≈0.87  — light background
 *   xxLight L≈0.95  — near-white with a hint of hue
 */

function hexToLinear(hex) {
  const c = hex.replace('#', '')
  return [0, 2, 4].map(i => {
    const v = parseInt(c.slice(i, i + 2), 16) / 255
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
}

function linearToHex(rgb) {
  return '#' + rgb.map(v => {
    v = Math.max(0, Math.min(1, v))
    v = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
    return Math.round(v * 255).toString(16).padStart(2, '0')
  }).join('')
}

function linearToOklab(r, g, b) {
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  ]
}

function oklabToLinear(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b
  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_
  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ]
}

function hexToOklch(hex) {
  const [L, a, b] = linearToOklab(...hexToLinear(hex))
  const C = Math.sqrt(a * a + b * b)
  const H = (Math.atan2(b, a) * 180) / Math.PI
  return [L, C, H < 0 ? H + 360 : H]
}

function oklchToHex(L, C, H) {
  const hRad = (H * Math.PI) / 180

  function toLinear(c) {
    return oklabToLinear(L, c * Math.cos(hRad), c * Math.sin(hRad))
  }

  function inGamut(c) {
    return toLinear(c).every(v => v >= -0.0002 && v <= 1.0002)
  }

  if (!inGamut(C)) {
    let lo = 0, hi = C
    for (let i = 0; i < 10; i++) {
      const mid = (lo + hi) / 2
      if (inGamut(mid)) lo = mid; else hi = mid
    }
    C = lo
  }

  return linearToHex(toLinear(C))
}

const STOPS = [
  { key: 'xxDark',  L: 0.18, CScale: 0.45, maxL: 0.24 },
  { key: 'xDark',   L: 0.28, CScale: 0.60, maxL: 0.34 },
  { key: 'dark',    L: 0.38, CScale: 0.80, maxL: 0.46 },
  { key: 'mid',     L: 0.52, CScale: 1.00, maxL: 0.60 },
  { key: 'light',   L: 0.65, CScale: 0.72, maxL: 0.73 },
  { key: 'xLight',  L: 0.80, CScale: 0.45, maxL: 0.87 },
  { key: 'xxLight', L: 0.92, CScale: 0.20, maxL: Infinity },
]

function seedSlot(L) {
  return STOPS.findIndex(s => L < s.maxL)
}

function generatePalette(seedHex) {
  const [seedL, C, H] = hexToOklch(seedHex)
  const slot = seedSlot(seedL)

  const stops = Object.fromEntries(
    STOPS.map((s, i) => [
      s.key,
      i === slot ? seedHex : oklchToHex(s.L, C * s.CScale, H),
    ])
  )

  const onSeed          = seedL < 0.60 ? stops.xxLight : stops.xxDark
  const onSeedSecondary = seedL < 0.60 ? stops.xLight  : stops.xDark

  return { ...stops, onSeed, onSeedSecondary }
}

module.exports = { generatePalette }
