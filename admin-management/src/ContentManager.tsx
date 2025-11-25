import { useMemo, useState, useEffect } from 'react'

type MenuItem = {
  id: number
  title: string
  subtitle?: string
  description?: string
  price: string
  orders: number
  category: string
  soil?: string
  insects?: string[]
  diseases?: string[]
}

const SAMPLE_ITEMS: MenuItem[] = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  title: 'RK2',
  subtitle: 'พันธุ์อ้อย',
  description: 'พันธุ์อ้อยที่มีความต้านทานต่อแมลงและโรคสูง เหมาะสำหรับปลูกในพื้นที่ลาดเชิงเขา ให้ผลผลิตสูง',
  price: '$30.00',
  orders: 100,
  category: 'All Categories',
  soil: 'ดินร่วน',
  insects: ['แมลง1', 'แมลง2'],
  diseases: ['โรค1', 'โรค2'],
}))

export default function ContentManager({ onLogout }: { onLogout: () => void }) {
  const [query, setQuery] = useState('')
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

  // Lock scroll when modal is open
  useEffect(() => {
    if (showAddPanel || editingItem) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showAddPanel, editingItem])

  const categories = ['All Categories', 'Spicy Basil', 'Chili Stir-Fry', 'Vegetable Dishes', 'Saucy']

  const items = useMemo(() => {
    return SAMPLE_ITEMS.filter((it) => {
      const matchesQuery = 
        it.title.toLowerCase().includes(query.toLowerCase()) ||
        (it.description && it.description.toLowerCase().includes(query.toLowerCase())) ||
        (it.subtitle && it.subtitle.toLowerCase().includes(query.toLowerCase()))
      return matchesQuery
    })
  }, [query])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
            <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">รายการพันธุ์อ้อยทั้งหมด</h1>

            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-2xl">
                <label className="sr-only">Search</label>
                <div className="relative">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ค้นหาชื่อพันธุ์อ้อย หรือ คำอธิบาย..."
                    className="w-full border border-gray-300 rounded-full px-4 py-2 pl-10 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.386-1.414 1.415-4.387-4.387zM8 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="text-gray-600 hover:text-red-600 transition p-2"
              title="ออกจากระบบ"
              aria-label="ออกจากระบบ"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-end mb-6">
            <button
              onClick={() => setShowAddPanel(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium transition shadow-sm"
            >
              + เพิ่มพันธุ์อ้อย
            </button>
          </div>
        <div className="relative">
          {/* content area stays in place */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6`}
          >
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full relative group">
                {/* Delete Button */}
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition z-10 bg-white/80 hover:bg-white rounded-lg p-1"
                  title="ลบเมนู"
                  aria-label="ลบเมนู"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Image Container */}
                <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-400 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 pattern"></div>
                  <span className="relative text-sm font-medium">Image</span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-[#DA2C32] mb-1">
                    {item.title}
                  </h3>

                  {/* Description - 2-3 lines with ellipsis */}
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Edit Button */}
                  <button 
                    onClick={() => setEditingItem(item)}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg mt-4">
                    Edit Menu
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Overlay and Panel */}
          {showAddPanel && (
            <div 
              className="fixed inset-0 bg-black/20 z-40" 
              onClick={() => setShowAddPanel(false)}
            />
          )}
          <div
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-white rounded-lg shadow-2xl z-50 transition-all duration-300 ${
              showAddPanel ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <div className="max-h-[90vh] overflow-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add New Food</h3>
                <button
                  onClick={() => setShowAddPanel(false)}
                  className="text-gray-400 hover:text-red-500 text-2xl leading-none"
                  aria-label="Close panel"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Food Image</label>
                  <div className="h-28 border-2 border-dashed rounded-md flex items-center justify-center text-gray-400">Click to upload</div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Food name</label>
                  <input className="w-full border rounded-md px-3 py-2" placeholder="Fried rice with Pineapple" />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Subtitle</label>
                  <input className="w-full border rounded-md px-3 py-2" placeholder="with meat" />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Food Category</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Price starts at</label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 bg-gray-100 rounded-l-md">฿</span>
                    <input className="w-full border rounded-r-md px-3 py-2" defaultValue="50.00" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Description</label>
                  <textarea
                    className="w-full border rounded-md px-3 py-2 h-24"
                    defaultValue={"A flavorful Thai dish combining minced meat, holy basil, garlic, and chili. Served with rice and often topped with a crispy fried egg."}
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      // mock add behaviour
                      console.log('Add food (mock)')
                      setShowAddPanel(false)
                    }}
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Modal Overlay and Panel */}
          {editingItem && (
            <div 
              className="fixed inset-0 bg-black/20 z-40" 
              onClick={() => setEditingItem(null)}
            />
          )}
          <div
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-white rounded-lg shadow-2xl z-50 transition-all duration-300 ${
              editingItem ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <div className="max-h-[90vh] overflow-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Edit Food</h3>
                <button
                  onClick={() => setEditingItem(null)}
                  className="text-gray-400 hover:text-red-500 text-2xl leading-none"
                  aria-label="Close panel"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Food Image</label>
                  <div className="h-28 border-2 border-dashed rounded-md flex items-center justify-center text-gray-400">Click to upload</div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Food name</label>
                  <input className="w-full border rounded-md px-3 py-2" defaultValue={editingItem?.title} />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Subtitle</label>
                  <input className="w-full border rounded-md px-3 py-2" defaultValue={editingItem?.subtitle} />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Food Category</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Price starts at</label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 bg-gray-100 rounded-l-md">฿</span>
                    <input className="w-full border rounded-r-md px-3 py-2" defaultValue={editingItem?.price.replace('$', '').replace('.00', '')} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Description</label>
                  <textarea
                    className="w-full border rounded-md px-3 py-2 h-24"
                    defaultValue={"A flavorful Thai dish combining minced meat, holy basil, garlic, and chili. Served with rice and often topped with a crispy fried egg."}
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      // mock edit behaviour
                      console.log('Edit food (mock)', editingItem?.id)
                      setEditingItem(null)
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
