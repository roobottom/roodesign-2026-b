// Returns up to 3 posts that share the most tags with the current post.
// Works with 11ty collection items (post.data.tags, post.page.fileSlug).
const getSharedTagCount = (tagsA, tagsB) => {
  if (!tagsA || !tagsB) return 0
  return tagsA.filter(Set.prototype.has, new Set(tagsB)).length
}

module.exports = (collection, currentSlug, tags) => {
  if (!tags || !collection) return []
  return collection
    .filter((post) => {
      const postSlug = post.page ? post.page.fileSlug : post.slug
      return postSlug !== currentSlug && getSharedTagCount(post.data ? post.data.tags : post.tags, tags) >= 1
    })
    .sort((a, b) => {
      const tagsA = a.data ? a.data.tags : a.tags
      const tagsB = b.data ? b.data.tags : b.tags
      return getSharedTagCount(tagsB, tags) - getSharedTagCount(tagsA, tags)
    })
    .slice(0, 3)
}
