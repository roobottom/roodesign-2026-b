const attrs = require('./attrs.js')
const path = require('path')
const { renderResponsiveImage } = require('../images/responsive.js')

/**
 * Constructs an HTML figure element with an image and optional caption and link.
 * @param {Object} params - The parameters for the figure and image elements.
 * @param {string} params.url - The URL of the image.
 * @param {string} params.caption - The caption for the figure; if absent, no figcaption is created.
 * @param {string} params.classes - CSS classes to apply to the figure element.
 * @param {string} [params.link=null] - Optional URL to make the image a clickable link.
 * @param {string} [params.transform='default'] - Transformation type to apply to the image URL. Defaults to 'default'.
 * @returns {string} An HTML string representing a figure element with nested img and optional figcaption elements.
 */

module.exports = function(params) {
  const hasCaption = Boolean(params.caption && params.caption.trim())
  const hasAlt = Boolean(params.alt && params.alt.trim())
  if (!hasCaption && !hasAlt) {
    throw new Error(`Figure is missing both alt text and caption for image: ${params.url}`)
  }

  const preset = params.transform === 'wide' ? 'wide' : 'figure'

  return `
<figure ${attrs({'class':params.classes})}>
  ${params.link ? '<a href="' + params.link + '">' : ''}
  ${renderResponsiveImage({
    url: params.url,
    alt: hasAlt ? params.alt : '',
    id: path.basename(params.url, path.extname(params.url)),
    preset,
    sizes: preset === 'wide'
      ? '(max-width: 1200px) 100vw, 1200px'
      : '(max-width: 768px) 100vw, 768px'
  })}
  ${params.link ? '</a>' : ''}
  ${figcaption(params.caption)}
</figure>
  `
}

/**
 * Creates an HTML figcaption element.
 * @param {string} caption - The text content for the figcaption element.
 * @returns {string} An HTML figcaption element, or an empty string if no caption is provided.
 */
const figcaption = (caption) => {
  return caption ? `<figcaption>${caption}</figcaption>` : ''
}