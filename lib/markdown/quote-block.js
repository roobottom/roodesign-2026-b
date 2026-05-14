module.exports = function quoteBlockPlugin(md) {
  md.block.ruler.before('html_block', 'quote_block', function(state, startLine, endLine, silent) {
    const lineStart = state.bMarks[startLine] + state.tShift[startLine]
    const lineText = state.src.slice(lineStart, state.eMarks[startLine])

    if (!/^<quote(\s|>)/i.test(lineText)) return false

    const attrMatch = lineText.match(/attribution="([^"]*)"/i)
    const attribution = attrMatch ? attrMatch[1] : ''

    // Find the closing </quote> tag
    let closeIndex = -1
    for (let i = startLine + 1; i < endLine; i++) {
      const s = state.bMarks[i] + state.tShift[i]
      if (state.src.slice(s, state.eMarks[i]).trim().toLowerCase() === '</quote>') {
        closeIndex = i
        break
      }
    }

    if (closeIndex === -1) return false
    if (silent) return true

    // Collect inner lines and render as markdown
    const innerLines = []
    for (let i = startLine + 1; i < closeIndex; i++) {
      innerLines.push(state.src.slice(state.bMarks[i], state.eMarks[i]))
    }
    const innerHtml = state.md.render(innerLines.join('\n'))

    const attributionHtml = attribution
      ? `<footer class="blockquote-attribution"><cite>— ${state.md.renderInline(attribution)}</cite></footer>\n`
      : ''

    const token = state.push('html_block', '', 0)
    token.map = [startLine, closeIndex + 1]
    token.content = `<blockquote>\n${innerHtml}${attributionHtml}</blockquote>\n`

    state.line = closeIndex + 1
    return true
  }, { alt: ['paragraph', 'reference', 'blockquote', 'list'] })
}
