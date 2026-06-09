export type Category = {
  id: string
  name: string
  slug: string
  icon: string
}

export type Listing = {
  id: string
  owner_id: string
  category_id: string
  title: string
  description: string
  province: string
  address: string
  price_per_night: number
  max_guests: number
  images: string[]
  amenities: string[]
  is_active: boolean
  rating_avg: number
  review_count: number
  created_at: string
  categories?: Category
  users?: { full_name: string; avatar_url: string }
}

export type Booking = {
  id: string
  listing_id: string
  guest_id: string
  check_in: string
  check_out: string
  guests: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status: 'unpaid' | 'paid'
  created_at: string
  listings?: Listing
}

export type Review = {
  id: string
  listing_id: string
  reviewer_id: string
  booking_id: string
  rating: number
  comment: string
  created_at: string
  users?: { full_name: string; avatar_url: string }
}

export type Profile = {
  id: string
  full_name: string
  avatar_url: string
  phone: string
  bio: string
  is_host: boolean
  created_at: string
}
