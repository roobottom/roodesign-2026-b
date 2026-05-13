const path = require('path')

function isExamplePage(inputPath = '') {
  return inputPath.split(path.sep).includes('examples')
}

function isLandingPage(inputPath = '') {
  return inputPath.endsWith(`${path.sep}src${path.sep}kanga${path.sep}index.md`) || inputPath === 'src/kanga/index.md'
}

function getRelativeParts(inputPath = '') {
  const normalized = inputPath.split(path.sep)
  const kangaIndex = normalized.lastIndexOf('kanga')

  if (kangaIndex === -1) {
    return []
  }

  return normalized.slice(kangaIndex + 1)
}

function getKangaSection(inputPath = '') {
  return getRelativeParts(inputPath)[0]
}

function getDocSlug(inputPath = '') {
  const parts = getRelativeParts(inputPath)

  if (isLandingPage(inputPath)) {
    return ''
  }

  if (isExamplePage(inputPath)) {
    const examplesIndex = parts.indexOf('examples')
    return examplesIndex > 0 ? parts[examplesIndex - 1] : ''
  }

  return parts[1] || path.basename(inputPath, path.extname(inputPath))
}

function getExampleVariant(inputPath = '') {
  return path.basename(inputPath, path.extname(inputPath))
}

function getExampleSlug(inputPath = '') {
  const docSlug = getDocSlug(inputPath)
  const variant = getExampleVariant(inputPath)

  return variant === 'default' ? docSlug : `${docSlug}-${variant}`
}

module.exports = {
  eleventyComputed: {
    layout: (data) => isExamplePage(data?.page?.inputPath || '') ? 'layouts/kanga-example.njk' : 'layouts/kanga.njk',
    section_id: (data) => isExamplePage(data?.page?.inputPath || '') ? 'kanga-example' : 'kanga',
    type: (data) => isExamplePage(data?.page?.inputPath || '') ? 'kanga-example' : 'kanga',
    eleventyExcludeFromCollections: (data) => isExamplePage(data?.page?.inputPath || ''),
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

      return getDocSlug(data.page.inputPath)
    },
    exampleSection: (data) => {
      if (!data?.page?.inputPath || !isExamplePage(data.page.inputPath)) {
        return data.exampleSection
      }

      return getKangaSection(data.page.inputPath)
    },
    title: (data) => {
      if (!data?.page?.inputPath || !isExamplePage(data.page.inputPath) || !data.title) {
        return data.title
      }

      return data.title.endsWith(' - Example') ? data.title : `${data.title} - Example`
    },
    showBreadcrumbs: (data) => {
      if (!data?.page?.inputPath) {
        return false
      }

      return !isLandingPage(data.page.inputPath) && !isExamplePage(data.page.inputPath)
    },
    permalink: (data) => {
      if (!data?.page?.inputPath) {
        return data.permalink
      }

      if (isExamplePage(data.page.inputPath)) {
        return `/kanga/example/${getKangaSection(data.page.inputPath)}/${getExampleSlug(data.page.inputPath)}/index.html`
      }

      if (isLandingPage(data.page.inputPath)) {
        return '/kanga/index.html'
      }

      return `/kanga/${data.kangaSlug || getDocSlug(data.page.inputPath)}/index.html`
    }
  }
}
