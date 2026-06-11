import { Search, SlidersHorizontal } from 'lucide-react'
import Navbar from '@/components/Navbar'
import ListingCard from '@/components/ListingCard'
import { createServerReadClient } from '@/lib/supabase'

const PROVINCES = [
  'ทั้งหมด','เชียงใหม่','กรุงเทพฯ','ภูเก็ต','กระบี่','เชียงราย',
  'ขอนแก่น','นครราชสีมา','สุราษฎร์ธานี','อยุธยา','น่าน','แม่ฮ่องสอน',
]

export const dynamic = 'force-dynamic'

async function getListings(province?: string) {
  try {
    const supabase = createServerReadClient()
    let query = supabase
      .from('listings')
      .select('*, categories(name, slug)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (province && province !== 'ทั้งหมด') {
      query = query.eq('province', province)
    }

    const { data } = await query.limit(24)
    return data ?? []
  } catch {
    return []
  }
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: { province?: string }
}) {
  const listings = await getListings(searchParams.province)

  return (
    <div className="min-h-screen bg-orange-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">ค้นหาที่พัก</h1>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">กรอง:</span>
          </div>
          {PROVINCES.map(p => (
            <a
              key={p}
              href={p === 'ทั้งหมด' ? '/listings' : `/listings?province=${encodeURIComponent(p)}`}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                (searchParams.province ?? 'ทั้งหมด') === p
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600'
              }`}
            >
              {p}
            </a>
          ))}
        </div>

        {/* Results */}
        {listings.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 mb-4">พบ {listings.length} ที่พัก</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-500 text-lg">ไม่พบที่พักในจังหวัดนี้</p>
          </div>
        )}
      </div>
    </div>
  )
}
