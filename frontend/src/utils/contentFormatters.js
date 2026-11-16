import fallbackImage from '../assets/hero.png'

function formatDate(value) {
  if (!value) return 'Recently'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Recently'
    : new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).format(date)
}

function readTime(content = '') {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 220))
}

export function toArticleCard(article) {
  return {
    ...article,
    category: article.category?.name ?? 'HealthTech',
    categorySlug: article.category?.slug ?? '',
    date: formatDate(article.publishedAt ?? article.createdAt),
    readTime: readTime(article.content ?? article.excerpt),
    author: article.author?.name ?? 'Talking HealthTech',
    image: article.featuredImage || fallbackImage,
    imageAlt: article.title ? `Illustration for ${article.title}` : 'Healthcare technology',
  }
}

export function toPodcastCard(podcast) {
  return {
    ...podcast,
    series: podcast.category?.name ?? podcast.host ?? 'Talking HealthTech',
    duration: podcast.duration ? `${podcast.duration} min` : 'Episode',
    image: podcast.thumbnail || fallbackImage,
    imageAlt: `Podcast artwork for ${podcast.title}`,
    href: podcast.audioUrl || podcast.videoUrl || `/podcasts/${podcast.slug}`,
  }
}

export function toEventCard(event) {
  const date = new Date(event.eventDate)
  return {
    ...event,
    dateLabel: Number.isNaN(date.getTime())
      ? 'Date to be announced'
      : new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long' }).format(date),
    type: event.category?.name ?? event.location,
  }
}

export function formatDateTime(value) {
  return formatDate(value)
}

export { fallbackImage }
