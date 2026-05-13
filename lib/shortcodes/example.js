const fs = require('fs')
const path = require('path')

const EXAMPLE_ROOT = path.join(process.cwd(), 'src/kanga/example')
const LANGUAGE_MAP = {
  '.njk': 'liquid',
  '.md': 'markdown'
}

module.exports = function (exampleUrl, height = 300) {
  const normalizedUrl = normalizeExampleUrl(exampleUrl)
  const source = resolveSourceFile(normalizedUrl)

  if (!source) {
    console.warn(`[kanga] Example source not found for ${exampleUrl}`)
    return `<p>Example source not found for <code>${escapeHtml(exampleUrl)}</code>.</p>`
  }

  const fileContent = escapeHtml(removeFrontmatter(fs.readFileSync(source.filePath, 'utf8')))

  return `
<div class="example">
<header class="example-header">
  <a href="${normalizedUrl}" target="_blank" class="example-open-link">Open this example in a new tab</a>
</header>
<iframe src="${normalizedUrl}" class="example-iframe" height="${height}"></iframe>
<details>
<summary><span class="example-summary-link">View the code for this example</span></summary>
<div class="example-code">

<pre class="language-${source.language}">
<code>${fileContent}</code>
</pre>

</div>
</details>
</div>
`
}

function normalizeExampleUrl(exampleUrl = '') {
  return exampleUrl.startsWith('/') ? exampleUrl : `/${exampleUrl}`
}

function resolveSourceFile(exampleUrl) {
  const relativePath = exampleUrl
    .replace(/^\/kanga\/example\//, '')
    .replace(/^\//, '')

  for (const ext of Object.keys(LANGUAGE_MAP)) {
    const filePath = path.join(EXAMPLE_ROOT, `${relativePath}${ext}`)
    if (fs.existsSync(filePath)) {
      return {
        filePath,
        language: LANGUAGE_MAP[ext]
      }
    }
  }

  return null
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
