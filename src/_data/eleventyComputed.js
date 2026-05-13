const path = require('path')

const datePrefix = /^\d{4}-\d{2}-\d{2}-/

module.exports = {
  permalink: (data) => {
    if (!data || !data.page) {
      return data?.permalink
    }

    const inputPath = data.page.inputPath || ''
    const ext = path.extname(inputPath)
    const inputSlug = path.basename(inputPath, ext)

    if (data.type === 'articles' && datePrefix.test(inputSlug)) {
      const slug = inputSlug.replace(datePrefix, '')
      return `/articles/${slug}/index.html`
    }

    if (data.type === 'stories' && datePrefix.test(inputSlug)) {
      const slug = inputSlug.replace(datePrefix, '')
      return `/stories/${slug}/index.html`
    }

    return data.permalink
  }
}
