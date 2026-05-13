const path = require('path')

module.exports = {
  layout: 'layouts/kanga-example.njk',
  section_id: 'kanga-example',
  type: 'kanga-example',
  eleventyExcludeFromCollections: true,
  eleventyComputed: {
    exampleSection: (data) => {
      if (!data?.page?.inputPath) {
        return data.exampleSection
      }

      return path.basename(path.dirname(data.page.inputPath))
    },
    permalink: (data) => {
      if (!data?.page) {
        return data.permalink
      }

      return `/kanga/example/${data.exampleSection || path.basename(path.dirname(data.page.inputPath))}/${data.page.fileSlug}/index.html`
    },
    title: (data) => {
      if (!data.title) {
        return data.title
      }

      return data.title.endsWith(' - Example') ? data.title : `${data.title} - Example`
    }
  }
}
