const fs = require('fs')
const path = require('path')

const KANGA_ROOT = path.join(process.cwd(), 'src/kanga')
const LANGUAGE_MAP = {
  '.njk': 'liquid',
  '.md': 'markdown'
}

module.exports = function (exampleRef = 'default', height = 300, context = {}) {
  const resolved = resolveExample(exampleRef, context)

  if (!resolved) {
    console.warn(`[kanga] Example source not found for ${exampleRef}`)
    return `<p>Example source not found for <code>${escapeHtml(String(exampleRef))}</code>.</p>`
  }

  const fileContent = escapeHtml(removeFrontmatter(fs.readFileSync(resolved.filePath, 'utf8')))

  return `
<div class="example">
<header class="example-header">
  <a href="${resolved.url}" target="_blank" class="example-open-link">Open this example in a new tab</a>
</header>
<iframe src="${resolved.url}" class="example-iframe" height="${height}"></iframe>
<details>
<summary><span class="example-summary-link">View the code for this example</span></summary>
<div class="example-code">

<pre class="language-${resolved.language}">
<code>${fileContent}</code>
</pre>

</div>
</details>
</div>
`
}

function resolveExample(exampleRef, context) {
  const normalizedRef = normalizeExampleRef(exampleRef)

  if (isExampleUrl(normalizedRef)) {
    const normalizedUrl = normalizeExampleUrl(normalizedRef)
    const source = resolveSourceFileFromUrl(normalizedUrl)

    if (!source) {
      return null
    }

    return {
      ...source,
      url: normalizedUrl
    }
  }

  const pageInputPath = context?.page?.inputPath || context?.inputPath || ''
  const docContext = getDocContext(pageInputPath)

  if (!docContext) {
    return null
  }

  const variant = normalizedRef || 'default'
  const source = resolveSourceFileFromDocContext(docContext, variant)

  if (!source) {
    return null
  }

  return {
    ...source,
    url: buildExampleUrl(docContext, variant)
  }
}

function normalizeExampleRef(exampleRef) {
  if (exampleRef === undefined || exampleRef === null || exampleRef === true) {
    return 'default'
  }

  return String(exampleRef).trim()
}

function isExampleUrl(exampleRef) {
  return /^\/?kanga\/example\//.test(exampleRef)
}

function normalizeExampleUrl(exampleUrl = '') {
  return exampleUrl.startsWith('/') ? exampleUrl : `/${exampleUrl}`
}

function resolveSourceFileFromUrl(exampleUrl) {
  const match = exampleUrl.match(/^\/kanga\/example\/([^/]+)\/([^/]+)\/?$/)

  if (!match) {
    return null
  }

  const [, section, routeSlug] = match
  const sectionRoot = path.join(KANGA_ROOT, section)

  if (!fs.existsSync(sectionRoot)) {
    return null
  }

  const entries = fs.readdirSync(sectionRoot, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    const docSlug = entry.name
    const examplesDir = path.join(sectionRoot, docSlug, 'examples')

    if (!fs.existsSync(examplesDir)) {
      continue
    }

    for (const exampleFile of fs.readdirSync(examplesDir)) {
      const ext = path.extname(exampleFile)
      const variant = path.basename(exampleFile, ext)

      if (!LANGUAGE_MAP[ext]) {
        continue
      }

      const candidateSlug = variant === 'default' ? docSlug : `${docSlug}-${variant}`
      if (candidateSlug === routeSlug) {
        return {
          filePath: path.join(examplesDir, exampleFile),
          language: LANGUAGE_MAP[ext]
        }
      }
    }
  }

  return null
}

function getDocContext(inputPath = '') {
  if (!inputPath) {
    return null
  }

  const normalized = inputPath.split(path.sep)
  const kangaIndex = normalized.lastIndexOf('kanga')

  if (kangaIndex === -1) {
    return null
  }

  const parts = normalized.slice(kangaIndex + 1)
  const section = parts[0]
  const docSlug = parts[1]

  if (!section || !docSlug) {
    return null
  }

  return { section, docSlug }
}

function resolveSourceFileFromDocContext(docContext, variant) {
  const examplesDir = path.join(KANGA_ROOT, docContext.section, docContext.docSlug, 'examples')

  if (!fs.existsSync(examplesDir)) {
    return null
  }

  for (const ext of Object.keys(LANGUAGE_MAP)) {
    const filePath = path.join(examplesDir, `${variant}${ext}`)
    if (fs.existsSync(filePath)) {
      return {
        filePath,
        language: LANGUAGE_MAP[ext]
      }
    }
  }

  return null
}

function buildExampleUrl(docContext, variant) {
  const slug = variant === 'default' ? docContext.docSlug : `${docContext.docSlug}-${variant}`
  return `/kanga/example/${docContext.section}/${slug}`
}

function removeFrontmatter(content) {
  return content.replace(/^---[\s\S]+?---\s*/, '')
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
