import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Listing } from '@/types'

export default function ListingCard({ listing }: { listing: Listing }) {
  const thumb = listing.images?.[0] ?? 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600'

  return (
    <Link href={`/listings/${listing.id}`} className="group block rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={thumb}
          alt={listing.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full">
          {listing.categories?.name ?? 'ที่พัก'}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm">{listing.title}</h3>
          {listing.rating_avg > 0 && (
            <div className="flex items-center gap-1 shrink-0 text-xs text-gray-500">
              <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
              <span>{listing.rating_avg.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <MapPin className="w-3 h-3 text-orange-400" />
          <span>{listing.province}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-orange-600 font-bold">{formatPrice(listing.price_per_night)}</span>
            <span className="text-gray-400 text-xs"> / คืน</span>
          </div>
          <span className="text-xs text-gray-400">{listing.review_count} รีวิว</span>
        </div>
      </div>
    </Link>
  )
}
