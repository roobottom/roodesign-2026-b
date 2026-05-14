module.exports = function quoteShortcode(attribution) {
  if (!attribution || !attribution.trim()) return ''
  return `<p class="blockquote-attribution"><cite>— ${attribution}</cite></p>`
}
