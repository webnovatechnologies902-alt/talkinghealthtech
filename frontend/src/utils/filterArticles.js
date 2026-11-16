function filterArticles(articles, category, search) {
  const categoryForData = category === 'HealthTech Startups' ? 'Startups' : category
  const normalizedSearch = search.toLowerCase().trim()

  return articles.filter((article) => {
    const matchesCategory = category === 'All stories' || article.category === categoryForData
    const matchesSearch = !normalizedSearch
      || `${article.title} ${article.excerpt} ${article.category}`.toLowerCase().includes(normalizedSearch)
    return matchesCategory && matchesSearch
  })
}

export default filterArticles
