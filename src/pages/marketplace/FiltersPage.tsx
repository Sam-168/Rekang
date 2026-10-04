import { ArrowLeft } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMarketplace } from '../../context/useMarketplace'
import { defaultFilters } from '../../context/MarketplaceContext'
import { categories, type ListingFilters } from '../../types/marketplace'

export function FiltersPage() {
  const navigate = useNavigate()
  const { filters, setFilters } = useMarketplace()
  const [draft, setDraft] = useState<ListingFilters>(filters)

  function submit(event: FormEvent) {
    event.preventDefault()
    setFilters(draft)
    navigate('/home')
  }

  function clear() {
    setDraft(defaultFilters)
    setFilters(defaultFilters)
  }

  return (
    <div className="narrow-page">
      <button className="back-link" type="button" onClick={() => navigate(-1)}><ArrowLeft size={18} />Back</button>
      <p className="eyebrow">Marketplace filters</p>
      <h1>Find what you need.</h1>
      <p className="page-copy">Refine listings without leaving your campus.</p>
      <form className="filter-form" onSubmit={submit}>
        <fieldset>
          <legend>Category</legend>
          <div className="filter-choices">
            {categories.map((category) => <button key={category} className={draft.category === category ? 'is-active' : ''} type="button" onClick={() => setDraft({ ...draft, category })}>{category}</button>)}
          </div>
        </fieldset>
        <div className="price-fields">
          <label><span>Minimum price (R)</span><input type="number" min="0" value={draft.minPrice} onChange={(event) => setDraft({ ...draft, minPrice: Math.max(0, Number(event.target.value)) })} /></label>
          <label><span>Maximum price (R)</span><input type="number" min="0" value={draft.maxPrice} onChange={(event) => setDraft({ ...draft, maxPrice: Math.max(0, Number(event.target.value)) })} /></label>
        </div>
        <label className="select-field"><span>Campus</span><select value={draft.campus} onChange={(event) => setDraft({ ...draft, campus: event.target.value })}><option>Bellville</option></select></label>
        {draft.minPrice > draft.maxPrice && <p className="validation-error" role="alert">Maximum price must be greater than the minimum price.</p>}
        <button className="button button--primary button--block" type="submit" disabled={draft.minPrice > draft.maxPrice}>Show results</button>
        <button className="button button--secondary button--block" type="button" onClick={clear}>Clear filters</button>
      </form>
    </div>
  )
}
