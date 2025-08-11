export interface Guest {
  id: string
  name: string
  email: string
  registered_at: string
  checked_in_at?: string
  device_id?: string
  created_at: string
}

export interface Event {
  id: string
  name: string
  chapter_number: number
  date: string
  status: 'upcoming' | 'live' | 'completed'
  max_capacity: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  brand: string
  price: number
  size: string
  condition: string
  description: string
  measurements: Record<string, any>
  images: string[]
  created_at: string
}

export interface Look {
  id: string
  event_id: string
  look_number: number
  name: string
  hero_image: string
  active: boolean
  created_at: string
  products?: Product[]
}

export interface Wishlist {
  id: string
  guest_id: string
  product_id: string
  look_id: string
  wish_type: 'product' | 'look'
  position: number
  added_at: string
  event_id: string
}

export interface Announcement {
  id: string
  event_id: string
  message: string
  sent_at: string
  sent_by: string
}

export interface Analytics {
  id: string
  event_id: string
  guest_id: string
  action: string
  product_id?: string
  look_id?: string
  timestamp: string
}