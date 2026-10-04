import { Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/marketplace/EmptyState'
import { ListingCard } from '../../components/marketplace/ListingCard'
import { LoadingListings } from '../../components/marketplace/LoadingListings'
import { useMarketplace } from '../../context/useMarketplace'
import { listingService } from '../../lib/listings'
import { categories, type Listing } from '../../types/marketplace'

export function MarketplacePage() {
  const { filters, setFilters } = useMarketplace()
  const [query, setQuery] = useState(filters.query)
  const [results, setResults] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    let active = true
    listingService.search(filters)
      .then((items) => { if (active) setResults(items) })
      .catch(() => { if (active) setFailed(true) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [filters, requestVersion])

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setFailed(false)
    setFilters({ ...filters, query })
  }

  function selectCategory(category: (typeof categories)[number]) {
    setLoading(true)
    setFailed(false)
    setFilters({ ...filters, category })
  }

  function clearFilters() {
    setQuery('')
    setLoading(true)
    setFailed(false)
    setFilters({ query: '', category: 'All', minPrice: 0, maxPrice: 5000, campus: 'Bellville' })
  }

  return (
    <div className="market-page">
      <section className="market-hero">
        <p className="eyebrow">Bellville campus</p>
        <h1>Your campus marketplace.</h1>
        <form className="market-search" onSubmit={submitSearch} role="search">
          <Search size={18} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search listings" placeholder="Search books, tech and more" />
          <button type="submit">Search</button>
        </form>
        <div className="market-toolbar">
          <div className="category-tabs" aria-label="Listing categories">
            {categories.map((category) => (
              <button key={category} className={filters.category === category ? 'is-active' : ''} type="button" onClick={() => selectCategory(category)}>{category}</button>
            ))}
          </div>
          <Link className="filter-link" to="/filters"><SlidersHorizontal size={17} />Filters{(filters.minPrice > 0 || filters.maxPrice < 5000) && <span />}</Link>
        </div>
      </section>

      <section className="market-results" aria-live="polite">
        <div className="section-heading"><div><p className="eyebrow">Recently listed</p><h2>Available near you</h2></div><span>{loading ? 'Loading' : `${results.length} listings`}</span></div>
        {loading ? <LoadingListings /> : failed ? (
          <EmptyState title="Couldn’t load listings.">Check your connection and try again.<button className="button button--primary" type="button" onClick={() => { setLoading(true); setFailed(false); setRequestVersion((version) => version + 1) }}>Try again</button></EmptyState>
        ) : results.length === 0 ? (
          <EmptyState title="No matching listings.">Try a broader search or clear your filters.<button className="button button--primary" type="button" onClick={clearFilters}>Clear filters</button></EmptyState>
        ) : <div className="listing-grid">{results.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>}
      </section>
    </div>
  )
}
