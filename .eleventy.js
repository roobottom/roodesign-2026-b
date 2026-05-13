const sass = require('sass')
const path = require('path')
const fs = require('fs')
const markdownIt = require('markdown-it')
const markdownItAttrs = require('markdown-it-attrs')
const markdownItAnchor = require('markdown-it-anchor')
const markdownItDiv = require('markdown-it-div')
const markdownItAbbr = require('markdown-it-abbr')
const markdownItFootnote = require('markdown-it-footnote')
const markdownItShortcode = require('markdown-it-shortcode-tag')

// Filters
const date = require('./lib/filters/date.js')
const dateDiff = require('./lib/filters/date-diff.js')
const daysToPeriod = require('./lib/filters/days-to-period.js')
const similarPosts = require('./lib/filters/similar-posts.js')
const slugify = require('./lib/filters/slugify.js')
const smartypants = require('./lib/filters/smartypants.js')
const firstSentence = require('./lib/filters/first-sentence.js')
const markdown = require('./lib/filters/markdown.js')
const plural = require('./lib/filters/plural.js')
const numberToWords = require('./lib/filters/number-to-words.js')
const leadingZero = require('./lib/filters/leading-zero.js')
const { buildResponsiveImageManifest, renderResponsiveImage, getResponsiveImageUrl } = require('./lib/images/responsive.js')

// Shortcodes
const exampleShortcode = require('./lib/shortcodes/example.js')
const figureShortcode = require('./lib/shortcodes/figure.js')
const statusNamesShortcode = require('./lib/shortcodes/statusNames.js')

module.exports = function (eleventyConfig) {

  // ---------------------------------------------------------------------------
  // SASS pipeline — compile the 2022 theme before each build
  // ---------------------------------------------------------------------------
  eleventyConfig.on('eleventy.before', async () => {
    console.time('[build] prebuild')
    console.log('[build] Compiling Sass...')
    const result = sass.compile('src/assets/sass/roobottom-2022.scss', {
      loadPaths: ['src/assets/sass'],
      style: 'expanded'
    })
    fs.mkdirSync('dist/assets/css', { recursive: true })
    fs.writeFileSync('dist/assets/css/roobottom-2022.css', result.css)
    console.log('[build] Sass complete. Preparing responsive images...')

    await buildResponsiveImageManifest()
    console.timeEnd('[build] prebuild')
  })

  // ---------------------------------------------------------------------------
  // Passthrough copies
  // ---------------------------------------------------------------------------
  eleventyConfig.addPassthroughCopy('src/assets/js')
  // Copy fonts to /fonts/ to match $path-fonts: '/fonts/' in SCSS settings
  eleventyConfig.addPassthroughCopy({ 'src/assets/static/fonts': 'fonts' })
  eleventyConfig.addPassthroughCopy('src/assets/static/sprites')
  eleventyConfig.addPassthroughCopy('src/assets/static/favicon.ico')

  // ---------------------------------------------------------------------------
  // Filters
  // ---------------------------------------------------------------------------
  eleventyConfig.addFilter('date', date)
  eleventyConfig.addFilter('dateDiff', dateDiff)
  eleventyConfig.addFilter('daysToPeriod', daysToPeriod)
  eleventyConfig.addFilter('similarPosts', similarPosts)
  eleventyConfig.addFilter('slugify', slugify)
  eleventyConfig.addFilter('smartypants', smartypants)
  eleventyConfig.addFilter('firstSentence', firstSentence)
  eleventyConfig.addFilter('markdown', markdown)
  eleventyConfig.addFilter('plural', plural)
  eleventyConfig.addFilter('numberToWords', numberToWords)
  eleventyConfig.addFilter('leadingZero', leadingZero)
  eleventyConfig.addFilter('responsiveImage', (url, options = {}) =>
    renderResponsiveImage({ url, ...options })
  )
  eleventyConfig.addFilter('responsiveImageUrl', (url, preset = 'card') =>
    getResponsiveImageUrl({ url, preset })
  )
  eleventyConfig.addFilter('taggedContent', (collection = [], tag) => {
    if (!tag) {
      return []
    }

    return collection
      .filter((item) => {
        const type = item?.data?.type
        const itemTags = item?.data?.tags || []
        return (type === 'articles' || type === 'stories') && itemTags.includes(tag)
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  })

  // title-case a string (used in tags component)
  eleventyConfig.addFilter('title', (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
  )

  // ---------------------------------------------------------------------------
  // Shortcodes
  // ---------------------------------------------------------------------------

  // {% figure "/images/foo.jpg", "Alt text", "Caption", "wide" %}
  eleventyConfig.addShortcode('figure', (url, alt, caption, classes, link, transformType) => {
    return figureShortcode({ url, alt, caption, classes, link, transform: transformType })
  })

  eleventyConfig.addShortcode('example', (url, height) => exampleShortcode(url, height))

  eleventyConfig.addShortcode('responsiveImage', (url, options = {}) =>
    renderResponsiveImage({ url, ...options })
  )

  // {% statusNames %} — renders the status legend table
  eleventyConfig.addShortcode('statusNames', () => statusNamesShortcode())

  // ---------------------------------------------------------------------------
  // Markdown
  // ---------------------------------------------------------------------------
  const md = markdownIt({ typographer: true, quotes: '\u201c\u201d\u2018\u2019', html: true })
    .use(markdownItAttrs)
    .use(markdownItAnchor)
    .use(markdownItDiv)
    .use(markdownItAbbr)
    .use(markdownItFootnote)
    .use(markdownItShortcode, {
      example: { render: (attrs) => exampleShortcode(attrs.url, attrs.height) },
      figure: { render: (attrs) => figureShortcode(attrs) },
      statusNames: { render: () => statusNamesShortcode() }
    })

  // Custom footnote renderers (match roobottom-2024 style)
  md.renderer.rules.footnote_ref = (tokens, idx) => {
    const n = (tokens[idx].meta.id + 1).toString()
    return `<sup class="footnote-ref"><a href="#fn${n}" id="fnref${n}">${n}</a></sup>`
  }
  md.renderer.rules.footnote_anchor = (tokens, idx) => {
    const n = (tokens[idx].meta.id + 1).toString()
    return ` <a href="#fnref${n}" class="footnote-backref">↩</a>`
  }

  eleventyConfig.setLibrary('md', md)

  // ---------------------------------------------------------------------------
  // Collections
  // ---------------------------------------------------------------------------
  eleventyConfig.addCollection('articles', (api) =>
    api.getFilteredByGlob('src/articles/**/*.md')
      .filter(p => !p.data.eleventyExcludeFromCollections)
      .reverse()
  )

  eleventyConfig.addCollection('stories', (api) =>
    api.getFilteredByGlob('src/stories/**/*.md')
      .filter(p => !p.data.eleventyExcludeFromCollections)
      .reverse()
  )

  eleventyConfig.addCollection('kangaPages', (api) =>
    api.getFilteredByGlob('src/kanga/**/*.md')
      .filter((item) => {
        const inputPath = item.inputPath.split(path.sep).join('/')
        return !inputPath.endsWith('/src/kanga/index.md') && inputPath !== 'src/kanga/index.md' && !inputPath.includes('/example/')
      })
      .sort((a, b) => a.data.title.localeCompare(b.data.title))
  )

  eleventyConfig.addCollection('kanga', (api) => {
    const groupedSections = new Map()
    const pages = api.getFilteredByGlob('src/kanga/**/*.md')
      .filter((item) => {
        const inputPath = item.inputPath.split(path.sep).join('/')
        return !inputPath.endsWith('/src/kanga/index.md') && inputPath !== 'src/kanga/index.md' && !inputPath.includes('/example/')
      })

    for (const item of pages) {
      const section = item.data.kangaSection
      if (!section) {
        continue
      }

      if (!groupedSections.has(section)) {
        groupedSections.set(section, {
          title: section,
          items: []
        })
      }

      groupedSections.get(section).items.push({
        title: item.data.title,
        slug: item.data.kangaSlug,
        url: item.url
      })
    }

    return Array.from(groupedSections.values())
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((section) => ({
        ...section,
        items: section.items.sort((a, b) => a.title.localeCompare(b.title))
      }))
  })

  eleventyConfig.addCollection('subjects', (api) => {
    const tags = new Set()
    const content = [
      ...api.getFilteredByGlob('src/articles/**/*.md'),
      ...api.getFilteredByGlob('src/stories/**/*.md')
    ].filter((item) => !item.data.eleventyExcludeFromCollections)

    for (const item of content) {
      const itemTags = item.data.tags || []
      for (const tag of itemTags) {
        if (typeof tag === 'string' && tag.trim()) {
          tags.add(tag.trim())
        }
      }
    }

    return Array.from(tags).sort((a, b) => a.localeCompare(b))
  })

  // ---------------------------------------------------------------------------
  // Directory config
  // ---------------------------------------------------------------------------
  return {
    dir: {
      input: 'src',
      output: 'dist',
      includes: '_includes',
      data: '_data'
    },
    templateFormats: ['njk', 'md', 'html'],
    markdownTemplateEngine: false,
    htmlTemplateEngine: 'njk'
  }
}
