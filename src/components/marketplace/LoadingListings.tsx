export function LoadingListings() {
  return (
    <div className="listing-grid" aria-label="Loading listings" aria-busy="true">
      {[1, 2, 3, 4].map((item) => (
        <div className="listing-skeleton" key={item}><span /><i /><i /></div>
      ))}
    </div>
  )
}
