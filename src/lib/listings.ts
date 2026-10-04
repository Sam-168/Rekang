import type { Listing, ListingFilters } from '../types/marketplace'

export const listings: Listing[] = [
  {
    id: 'textbooks', title: 'Second-hand textbooks', price: 280, category: 'Books', campus: 'Bellville', imageIndex: 0,
    description: 'Three first-year textbooks in good condition. Some highlighted pages, all covers intact. Collect at the Bellville campus library.',
    seller: { id: 'naledi', name: 'Naledi Mokoena', initials: 'NM', verified: true, rating: 4.8, reviews: 12 },
    status: 'available', condition: 'Good condition', postedLabel: '2 days ago',
  },
  {
    id: 'headphones', title: 'Wireless headphones', price: 650, category: 'Electronics', campus: 'Bellville', imageIndex: 1,
    description: 'Comfortable over-ear wireless headphones with charging cable. Lightly used and in full working condition.',
    seller: { id: 'naledi', name: 'Naledi Mokoena', initials: 'NM', verified: true, rating: 4.8, reviews: 12 },
    status: 'available', condition: 'Like new', postedLabel: 'Today',
  },
  {
    id: 'desk-lamp', title: 'Study desk lamp', price: 180, category: 'Home', campus: 'Bellville', imageIndex: 2,
    description: 'Compact cream desk lamp with adjustable shade. Ideal for a residence desk or study corner.',
    seller: { id: 'aisha', name: 'Aisha Jacobs', initials: 'AJ', verified: true, rating: 4.6, reviews: 8 },
    status: 'available', condition: 'Good condition', postedLabel: 'Yesterday',
  },
  {
    id: 'student-laptop', title: 'Student laptop', price: 3200, category: 'Electronics', campus: 'Bellville', imageIndex: 3,
    description: 'Reliable laptop for assignments and online classes. Charger included. Collection and inspection on campus.',
    seller: { id: 'thabo', name: 'Thabo Molefe', initials: 'TM', verified: true, rating: 4.7, reviews: 16 },
    status: 'available', condition: 'Used', postedLabel: '3 days ago',
  },
  {
    id: 'canvas-backpack', title: 'Canvas backpack', price: 220, category: 'Home', campus: 'Bellville', imageIndex: 4,
    description: 'Durable black canvas backpack with a padded laptop sleeve and two front compartments.',
    seller: { id: 'thabo', name: 'Thabo Molefe', initials: 'TM', verified: true, rating: 4.7, reviews: 16 },
    status: 'available', condition: 'Good condition', postedLabel: '4 days ago',
  },
  {
    id: 'guitar', title: 'Acoustic guitar', price: 900, category: 'Home', campus: 'Bellville', imageIndex: 5,
    description: 'Full-size acoustic guitar with a warm sound. A few signs of use, freshly restrung and ready to play.',
    seller: { id: 'lerato', name: 'Lerato Dube', initials: 'LD', verified: true, rating: 4.9, reviews: 7 },
    status: 'available', condition: 'Good condition', postedLabel: '1 week ago',
  },
]

const wait = (milliseconds = 350) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))

export const listingService = {
  async search(filters: ListingFilters) {
    await wait()
    const query = filters.query.trim().toLowerCase()
    return listings.filter((listing) =>
      listing.status === 'available' &&
      (!query || `${listing.title} ${listing.description} ${listing.category}`.toLowerCase().includes(query)) &&
      (filters.category === 'All' || listing.category === filters.category) &&
      listing.price >= filters.minPrice &&
      listing.price <= filters.maxPrice &&
      listing.campus === filters.campus,
    )
  },

  async findById(id: string) {
    await wait(180)
    return listings.find((listing) => listing.id === id) ?? null
  },

  async save(input: Omit<Listing, 'id' | 'seller' | 'imageIndex' | 'status' | 'postedLabel'>, id?: string) {
    await wait(550)
    return { ...input, id: id ?? `listing-${Date.now()}` }
  },
}
