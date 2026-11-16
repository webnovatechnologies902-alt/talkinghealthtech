import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleCard from '../../components/ArticleCard/ArticleCard'
import Button from '../../components/Button/Button'
import ContentStatus from '../../components/ContentStatus/ContentStatus'
import PodcastCard from '../../components/PodcastCard/PodcastCard'
import SectionHeading from '../../components/SectionHeading/SectionHeading'
import { listArticles } from '../../services/articleService'
import { listCategories } from '../../services/categoryService'
import { listEvents } from '../../services/eventService'
import { listCompanies } from '../../services/companyService'
import { listJobs } from '../../services/jobService'
import { listPodcasts } from '../../services/podcastService'
import { subscribeToNewsletter } from '../../services/newsletterService'
import { toArticleCard, toEventCard, toPodcastCard } from '../../utils/contentFormatters'
import styles from './Home.module.css'

const categoryIcons = {
  'digital health': 'bi-phone',
  'artificial intelligence': 'bi-stars',
  'healthtech startups': 'bi-lightbulb',
  'healthcare innovation': 'bi-graph-up-arrow',
  'medical technology': 'bi-heart-pulse',
}

function Home() {
  const [content, setContent] = useState({ articles: [], podcasts: [], categories: [], events: [], companies: [], jobs: [] })
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [reloadNumber, setReloadNumber] = useState(0)
  const [email, setEmail] = useState('')
  const [newsletterMessage, setNewsletterMessage] = useState('')
  const [newsletterError, setNewsletterError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let controller
    const timer = setTimeout(() => {
      controller = new AbortController()
      Promise.allSettled([
        listArticles('page=1&limit=6', controller.signal),
        listPodcasts('page=1&limit=2', controller.signal),
        listCategories({ type: 'article', page: 1, limit: 5 }, controller.signal),
        listEvents('page=1&limit=3&sort=event_soonest', controller.signal),
        listCompanies('page=1&limit=8', controller.signal),
        listJobs('page=1&limit=3', controller.signal),
      ]).then((results) => {
        if (controller.signal.aborted) return
        const [articles, podcasts, categories, events, companies, jobs] = results
        setContent({
          articles: articles.status === 'fulfilled' ? articles.value.items.map(toArticleCard) : [],
          podcasts: podcasts.status === 'fulfilled' ? podcasts.value.items.map(toPodcastCard) : [],
          categories: categories.status === 'fulfilled' ? categories.value : [],
          events: events.status === 'fulfilled' ? events.value.items.map(toEventCard) : [],
          companies: companies.status === 'fulfilled' ? companies.value.items : [],
          jobs: jobs.status === 'fulfilled' ? jobs.value.items : [],
        })
        setErrors({
          articles: articles.status === 'rejected' ? articles.reason.message : '',
          podcasts: podcasts.status === 'rejected' ? podcasts.reason.message : '',
          categories: categories.status === 'rejected' ? categories.reason.message : '',
          events: events.status === 'rejected' ? events.reason.message : '',
          companies: companies.status === 'rejected' ? companies.reason.message : '',
          jobs: jobs.status === 'rejected' ? jobs.reason.message : '',
        })
        setLoading(false)
      })
    }, 0)

    return () => {
      clearTimeout(timer)
      controller?.abort()
    }
  }, [reloadNumber])

  function retryContent() {
    setLoading(true)
    setErrors({})
    setReloadNumber((number) => number + 1)
  }

  async function subscribe(event) {
    event.preventDefault()
    setSubmitting(true)
    setNewsletterError('')
    setNewsletterMessage('')
    try {
      const result = await subscribeToNewsletter(email.trim())
      setNewsletterMessage(result.message || 'Thanks for subscribing.')
      setEmail('')
    } catch (error) {
      setNewsletterError(error.message || 'Unable to subscribe right now. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const featuredArticle = content.articles[0]

  return (
    <>
      <section className={styles.hero}>
        <div className={`site-container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}><span /> HealthTech, in conversation</p>
            <h1>Better health starts with <span>better ideas.</span></h1>
            <p className={styles.intro}>Stories, insights and conversations with the people shaping a more connected, human future for healthcare.</p>
            <div className={styles.heroActions}>
              <Button href="/articles">Explore the latest <i className="bi bi-arrow-right" aria-hidden="true" /></Button>
              <Link className={styles.secondaryLink} to="/podcasts"><i className="bi bi-play-circle" aria-hidden="true" /> Listen to the podcast</Link>
            </div>
            <div className={styles.trustLine}><i className="bi bi-check-circle-fill" aria-hidden="true" /> Independent stories for a healthier future</div>
          </div>
          <div className={styles.heroVisual}>
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=90"
              alt="Healthcare professional using a tablet while speaking with a patient"
              width="720"
              height="790"
              fetchPriority="high"
            />
            <div className={styles.imageCaption}><span className={styles.captionIcon}><i className="bi bi-heart-pulse" aria-hidden="true" /></span><span><strong>People first.</strong><br />Technology with purpose.</span></div>
            <span className={styles.visualDot} aria-hidden="true" />
          </div>
        </div>
        <div className={styles.heroBottom}>
          <div className={`site-container ${styles.heroBottomInner}`}>
            <span>Curious about what comes next in healthcare?</span>
            <span className={styles.bottomTopics}>Digital care <i /> Emerging technology <i /> Human stories</span>
          </div>
        </div>
      </section>

      <section className={`section-space ${styles.featuredSection}`}>
        <div className="site-container">
          <SectionHeading
            eyebrow="The latest perspective"
            title="Stories moving health forward"
            description="Fresh thinking from across the health technology community."
            action={<Link className={styles.textLink} to="/articles">All stories <i className="bi bi-arrow-right" aria-hidden="true" /></Link>}
          />
          {loading && <ContentStatus loading skeletonCount={3} />}
          {!loading && errors.articles && <ContentStatus error={errors.articles} onRetry={retryContent} />}
          {!loading && !errors.articles && !featuredArticle && <ContentStatus empty emptyMessage="New stories are on their way." />}
          {!loading && !errors.articles && featuredArticle && (
            <div className={styles.featuredGrid}>
              <ArticleCard article={featuredArticle} featured />
              <div className={styles.sideStories}>
                {content.articles.slice(1, 3).map((article) => <ArticleCard key={article._id} article={article} />)}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className={`section-space ${styles.latestSection}`}>
        <div className="site-container">
          <SectionHeading
            eyebrow="News & insights"
            title="A fresh take on healthtech"
            description="Explore the ideas, people and breakthroughs shaping the future of care."
            action={<Button href="/articles" variant="secondary">View all stories <i className="bi bi-arrow-right" aria-hidden="true" /></Button>}
          />
          {loading && <ContentStatus loading skeletonCount={3} />}
          {!loading && errors.articles && <ContentStatus error={errors.articles} onRetry={retryContent} />}
          {!loading && !errors.articles && content.articles.length <= 3 && <ContentStatus empty emptyMessage="More stories are on their way." />}
          {!loading && !errors.articles && content.articles.length > 3 && (
            <div className={styles.articleGrid}>
              {content.articles.slice(3, 6).map((article) => <ArticleCard key={article._id} article={article} />)}
            </div>
          )}
        </div>
      </section>

      <section className={`section-space ${styles.categorySection}`}>
        <div className="site-container">
          <SectionHeading align="center" eyebrow="Explore the landscape" title="Ideas across healthtech" description="From bold new ventures to technology changing care, follow the topics that matter to you." />
          {loading && <ContentStatus loading skeletonCount={5} />}
          {!loading && errors.categories && <ContentStatus error={errors.categories} onRetry={retryContent} />}
          {!loading && !errors.categories && !content.categories.length && <ContentStatus empty emptyMessage="Categories will appear here as they are published." />}
          {!loading && !errors.categories && content.categories.length > 0 && (
            <div className={styles.categoryGrid}>
              {content.categories.map((category, index) => (
                <Link className={styles.categoryTile} key={category._id} to={`/articles?category=${encodeURIComponent(category.slug)}`}>
                  <span className={styles.categoryIcon}><i className={`bi ${categoryIcons[category.name.toLowerCase()] || 'bi-heart-pulse'}`} aria-hidden="true" /></span>
                  <span className={styles.categoryText}>{category.name}</span>
                  <span className={styles.categoryArrow}><i className="bi bi-arrow-up-right" aria-hidden="true" /></span>
                  <span className={styles.categoryNumber}>{String(index + 1).padStart(2, '0')}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={`section-space ${styles.podcastSection}`}>
        <div className="site-container">
          <div className={styles.podcastHeading}>
            <SectionHeading eyebrow="Listen in" title="Conversations worth hearing" description="Honest conversations with the people making healthcare better." />
            <Button href="/podcasts" variant="secondary">All episodes <i className="bi bi-arrow-right" aria-hidden="true" /></Button>
          </div>
          {loading && <ContentStatus loading skeletonCount={2} />}
          {!loading && errors.podcasts && <ContentStatus error={errors.podcasts} onRetry={retryContent} />}
          {!loading && !errors.podcasts && !content.podcasts.length && <ContentStatus empty emptyMessage="New podcast episodes are coming soon." />}
          {!loading && !errors.podcasts && content.podcasts.length > 0 && (
            <div className={styles.podcastGrid}>
              {content.podcasts.map((podcast) => <PodcastCard key={podcast._id} podcast={podcast} />)}
            </div>
          )}
        </div>
      </section>

      <section className={`section-space ${styles.upcomingSection}`}>
        <div className="site-container">
          <SectionHeading
            eyebrow="Meet, learn, connect"
            title="Upcoming events"
            description="Join the healthtech community for practical conversations and new perspectives."
            action={<Link className={styles.textLink} to="/events">All events <i className="bi bi-arrow-right" aria-hidden="true" /></Link>}
          />
          {loading && <ContentStatus loading skeletonCount={3} />}
          {!loading && errors.events && <ContentStatus error={errors.events} onRetry={retryContent} />}
          {!loading && !errors.events && !content.events.length && <ContentStatus empty emptyMessage="There are no upcoming events listed yet." />}
          {!loading && !errors.events && content.events.length > 0 && (
            <div className={styles.upcomingList}>
              {content.events.map((event) => (
                <Link to={`/events/${event.slug}`} className={styles.upcomingItem} key={event._id}>
                  <span className={styles.upcomingDate}>{event.dateLabel}</span>
                  <span><strong>{event.title}</strong><small>{event.type} · {event.location}</small></span>
                  <i className="bi bi-arrow-up-right" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={`section-space ${styles.companySection}`}>
        <div className="site-container">
          <SectionHeading
            eyebrow="HealthTech ecosystem"
            title="Companies moving care forward"
            description="Meet organisations building useful technology and services for health."
            action={<Link className={styles.textLink} to="/directory">Company directory <i className="bi bi-arrow-right" aria-hidden="true" /></Link>}
          />
          {loading && <ContentStatus loading skeletonCount={4} />}
          {!loading && errors.companies && <ContentStatus error={errors.companies} onRetry={retryContent} />}
          {!loading && !errors.companies && !content.companies.length && <ContentStatus empty emptyMessage="Company profiles are coming soon." />}
          {!loading && !errors.companies && content.companies.length > 0 && (
            <div className={styles.companyGrid}>
              {content.companies.slice(0, 4).map((company) => (
                <Link className={styles.companyTile} to={`/directory/${company.slug}`} key={company._id}>
                  {company.logo && <img src={company.logo} alt="" loading="lazy" />}
                  <span><strong>{company.name}</strong><small>{company.sector || company.location}</small></span>
                  <i className="bi bi-arrow-up-right" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={`section-space ${styles.jobsSection}`}>
        <div className="site-container">
          <SectionHeading
            eyebrow="Careers in healthtech"
            title="Opportunities to make a difference"
            description="Find roles with teams working at the intersection of healthcare and technology."
            action={<Link className={styles.textLink} to="/jobs">All jobs <i className="bi bi-arrow-right" aria-hidden="true" /></Link>}
          />
          {loading && <ContentStatus loading skeletonCount={2} />}
          {!loading && errors.jobs && <ContentStatus error={errors.jobs} onRetry={retryContent} />}
          {!loading && !errors.jobs && !content.jobs.length && <ContentStatus empty emptyMessage="There are no current job listings." />}
          {!loading && !errors.jobs && content.jobs.length > 0 && (
            <div className={styles.jobList}>
              {content.jobs.map((job) => (
                <Link className={styles.jobTile} to={`/jobs/${job.slug}`} key={job._id}>
                  <span><strong>{job.title}</strong><small>{job.company?.name} · {job.location} · {job.employmentType}</small></span>
                  <i className="bi bi-arrow-up-right" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={styles.newsletter} id="newsletter">
        <div className={`site-container ${styles.newsletterInner}`}>
          <div className={styles.newsletterCopy}>
            <span className={styles.mailIcon}><i className="bi bi-envelope-paper" aria-hidden="true" /></span>
            <div><p className={styles.newsletterLabel}>The Talking HealthTech briefing</p><h2>A little more insight in your inbox.</h2><p>Our weekly roundup of stories, ideas and conversations shaping healthcare.</p></div>
          </div>
          <form className={styles.newsletterForm} onSubmit={subscribe}>
            <label htmlFor="newsletter-email">Your email address</label>
            <div className={styles.emailRow}>
              <input id="newsletter-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" maxLength="254" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={submitting} />
              <button type="submit" disabled={submitting}>{submitting ? 'Subscribing…' : 'Subscribe'} <i className="bi bi-arrow-right" aria-hidden="true" /></button>
            </div>
            <p className={styles.formNote} role={newsletterError ? 'alert' : 'status'} aria-live="polite">{newsletterError || newsletterMessage || 'By subscribing, you agree to receive our occasional newsletter.'}</p>
          </form>
        </div>
      </section>
    </>
  )
}

export default Home
