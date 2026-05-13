const path = require('path')
const slugify = require('../../lib/filters/slugify.js')

function isExamplePage(inputPath = '') {
  return inputPath.split(path.sep).includes('example')
}

function isLandingPage(inputPath = '') {
  return inputPath.endsWith(`${path.sep}src${path.sep}kanga${path.sep}index.md`) || inputPath === 'src/kanga/index.md'
}

function getKangaSection(inputPath = '') {
  const normalized = inputPath.split(path.sep)
  const exampleIndex = normalized.indexOf('example')

  if (exampleIndex !== -1 && normalized[exampleIndex + 1]) {
    return normalized[exampleIndex + 1]
  }

  return path.basename(path.dirname(inputPath))
}

module.exports = {
  layout: 'layouts/kanga.njk',
  section_id: 'kanga',
  type: 'kanga',
  eleventyComputed: {
    kangaSection: (data) => {
      if (!data?.page?.inputPath || isLandingPage(data.page.inputPath) || isExamplePage(data.page.inputPath)) {
        return data.kangaSection
      }

      return getKangaSection(data.page.inputPath)
    },
    kangaSlug: (data) => {
      if (!data?.page) {
        return data.kangaSlug
      }

      if (isLandingPage(data.page.inputPath)) {
        return ''
      }

      return slugify(data.title || data.page.fileSlug)
    },
    showBreadcrumbs: (data) => {
      if (!data?.page?.inputPath) {
        return false
      }

      return !isLandingPage(data.page.inputPath) && !isExamplePage(data.page.inputPath)
    },
    permalink: (data) => {
      if (!data?.page?.inputPath || isExamplePage(data.page.inputPath)) {
        return data.permalink
      }

      if (isLandingPage(data.page.inputPath)) {
        return '/kanga/index.html'
      }

      return `/kanga/${data.kangaSlug || slugify(data.title || data.page.fileSlug)}/index.html`
    }
  }
}
