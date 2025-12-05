import { useMemo, useState, useEffect, useRef } from 'react'
import VarietyModal from './components/VarietyModal'

type MenuItem = {
  _id?: string
  id?: number
  name: string
  description?: string
  soil_type?: string
  pest?: string[]
  disease?: string[]
  yield?: string
  age?: string
  sweetness?: string
  variety_image?: string
  parent_varieties?: string
  growth_characteristics?: string[]
  planting_tips?: string[]
  suitable_for?: string[]
  createdAt?: string
}

const initialFormData: MenuItem = {
  name: '',
  description: '',
  soil_type: '',
  pest: [],
  disease: [],
  yield: '',
  age: '',
  sweetness: '',
  variety_image: '',
  parent_varieties: '',
  growth_characteristics: [],
  planting_tips: [],
  suitable_for: [],
}

export default function ContentManager({ onLogout }: { onLogout: () => void }) {
  const [query, setQuery] = useState('')
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<MenuItem>(initialFormData)

  // Image file states for add/edit flows
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null)

  const [editingImageFile, setEditingImageFile] = useState<File | null>(null)
  const [editingImagePreview, setEditingImagePreview] = useState<string | null>(null)

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; itemId?: string }>({ show: false })

  // Toast notification state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'add' | 'edit' }>({
    show: false,
    message: '',
    type: 'add',
  })

  // refs for modal scroll containers so we can reset scroll position when reopening
  const addPanelRef = useRef<HTMLDivElement | null>(null)
  const editPanelRef = useRef<HTMLDivElement | null>(null)

  // generate object URLs for previews and cleanup
  useEffect(() => {
    if (!selectedImageFile) {
      setSelectedImagePreview(null)
      return
    }
    const url = URL.createObjectURL(selectedImageFile)
    setSelectedImagePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [selectedImageFile])

  useEffect(() => {
    if (!editingImageFile) {
      setEditingImagePreview(null)
      return
    }
    const url = URL.createObjectURL(editingImageFile)
    setEditingImagePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [editingImageFile])

  const API_BASE_URL = 'http://localhost:5001'

  // Close handlers that also clear form state
  const closeAddPanel = () => {
    setShowAddPanel(false)
    setFormData(initialFormData)
    setSelectedImageFile(null)
    setSelectedImagePreview(null)
    // ensure next open starts scrolled to top
    if (addPanelRef.current) addPanelRef.current.scrollTop = 0
  }

  const closeEditPanel = () => {
    setEditingItem(null)
    // also clear add-form data to avoid leftover values when switching between add/edit
    setFormData(initialFormData)
    setEditingImageFile(null)
    setEditingImagePreview(null)
    // ensure next open starts scrolled to top
    if (editPanelRef.current) editPanelRef.current.scrollTop = 0
  }

  // Delete variety (no confirm here)
  const handleDeleteItem = async (id: string | undefined) => {
    if (!id) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/varieties/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete variety')
      }
      setItems(items.filter(item => item._id !== id))
      setToast({ show: true, message: 'ลบพันธุ์อ้อยเรียบร้อยแล้ว', type: 'edit' })
      setTimeout(() => setToast({ show: false, message: '', type: 'edit' }), 2000)
    } catch (err) {
      console.error('Error deleting variety:', err)
      alert('เกิดข้อผิดพลาดในการลบ')
    }
    setDeleteModal({ show: false })
  }
  useEffect(() => {
    const fetchVarieties = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/varieties`)
        if (!response.ok) {
          throw new Error('Failed to fetch varieties')
        }
        const data = await response.json()
        setItems(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching varieties:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchVarieties()
  }, [])

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

  // Reset modal scroll to top when opened (use timeout to ensure layout/transition settled)
  useEffect(() => {
    if (showAddPanel && addPanelRef.current) {
      setTimeout(() => { addPanelRef.current && (addPanelRef.current.scrollTop = 0) }, 0)
    }
  }, [showAddPanel])

  useEffect(() => {
    if (editingItem && editPanelRef.current) {
      setTimeout(() => { editPanelRef.current && (editPanelRef.current.scrollTop = 0) }, 0)
    }
  }, [editingItem])

  const filteredItems = useMemo(() => {
    return items.filter((it: MenuItem) => {
      const matchesQuery = 
        it.name.toLowerCase().includes(query.toLowerCase()) ||
        (it.parent_varieties && it.parent_varieties.toLowerCase().includes(query.toLowerCase())) ||
        (it.soil_type && it.soil_type.toLowerCase().includes(query.toLowerCase()))
      return matchesQuery
    })
  }, [query, items])

  // Submit new variety to backend (backend expects JSON body)
  const handleAddSubmit = async () => {
    // Basic required-field validation (matches backend required fields)
    if (!formData.name || !formData.soil_type || !formData.yield || !formData.age || !formData.sweetness) {
      alert('กรุณากรอกฟิลด์ที่จำเป็น: ชื่อ, ดินที่เหมาะสม, ผลผลิต, อายุ, ความหวาน')
      return
    }

    try {
      setLoading(true)

      let response: Response

      // If user selected an image file, send multipart/form-data so backend can persist the file
      if (selectedImageFile) {
        const form = new FormData()
        form.append('variety_image', selectedImageFile)
        form.append('name', formData.name)
        form.append('description', formData.description || '')
        form.append('soil_type', formData.soil_type || '')
        form.append('parent_varieties', formData.parent_varieties || '')
        form.append('yield', formData.yield || '')
        form.append('age', formData.age || '')
        form.append('sweetness', formData.sweetness || '')
        // arrays: stringify so backend can parse JSON
        form.append('pest', JSON.stringify(formData.pest || []))
        form.append('disease', JSON.stringify(formData.disease || []))
        form.append('growth_characteristics', JSON.stringify(formData.growth_characteristics || []))
        form.append('planting_tips', JSON.stringify(formData.planting_tips || []))
        form.append('suitable_for', JSON.stringify(formData.suitable_for || []))

        response = await fetch(`${API_BASE_URL}/api/varieties`, {
          method: 'POST',
          body: form,
        })
      } else {
        const payload = {
          name: formData.name,
          description: formData.description || '',
          soil_type: formData.soil_type || '',
          pest: formData.pest || [],
          disease: formData.disease || [],
          yield: formData.yield || '',
          age: formData.age || '',
          sweetness: formData.sweetness || '',
          variety_image: formData.variety_image || '',
          parent_varieties: formData.parent_varieties || '',
          growth_characteristics: formData.growth_characteristics || [],
          planting_tips: formData.planting_tips || [],
          suitable_for: formData.suitable_for || [],
        }

        response = await fetch(`${API_BASE_URL}/api/varieties`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      }

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(errText || 'Failed to create variety')
      }

      await response.json()
      // server returns { message, data: savedVariety }

      // Reset add form and close panel
      setFormData(initialFormData)
      setSelectedImageFile(null)
      setSelectedImagePreview(null)
      setShowAddPanel(false)

      // Show loading state while fetching
      setLoading(true)
      
      // Small delay to show loading state, then fetch fresh data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Fetch fresh data from server
      try {
        const response = await fetch(`${API_BASE_URL}/api/varieties`)
        if (response.ok) {
          const data = await response.json()
          setItems(data)
        }
      } catch (err) {
        console.error('Error refreshing varieties:', err)
      }
      
      setLoading(false)

      // Show toast notification
      setToast({
        show: true,
        message: 'เพิ่มพันธุ์อ้อยเรียบร้อยแล้ว',
        type: 'add',
      })
      
      // Auto-close toast after 2 seconds
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'add' })
      }, 2000)
    } catch (err) {
      console.error('Error creating variety:', err)
      setLoading(false)
      alert('ไม่สามารถเพิ่มพันธุ์อ้อยได้ โปรดลองอีกครั้ง')
    }
  }

  // Submit edits for an existing variety (supports optional image upload)
  const handleEditSubmit = async () => {
    if (!editingItem) return

    try {
      setLoading(true)

      let response: Response

      if (editingImageFile) {
        const form = new FormData()
        form.append('variety_image', editingImageFile)
        form.append('name', editingItem.name)
        form.append('description', editingItem.description || '')
        form.append('soil_type', editingItem.soil_type || '')
        form.append('parent_varieties', editingItem.parent_varieties || '')
        form.append('yield', editingItem.yield || '')
        form.append('age', editingItem.age || '')
        form.append('sweetness', editingItem.sweetness || '')
        form.append('pest', JSON.stringify(editingItem.pest || []))
        form.append('disease', JSON.stringify(editingItem.disease || []))
        form.append('growth_characteristics', JSON.stringify(editingItem.growth_characteristics || []))
        form.append('planting_tips', JSON.stringify(editingItem.planting_tips || []))
        form.append('suitable_for', JSON.stringify(editingItem.suitable_for || []))

        response = await fetch(`${API_BASE_URL}/api/varieties/${editingItem._id}`, {
          method: 'PUT',
          body: form,
        })
      } else {
        const payload = { ...editingItem }
        response = await fetch(`${API_BASE_URL}/api/varieties/${editingItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(errText || 'Failed to update variety')
      }

      await response.json()

      // Reset edit form and close panel
      setEditingItem(null)
      setEditingImageFile(null)
      setEditingImagePreview(null)

      // Show loading state while fetching
      setLoading(true)
      
      // Small delay to show loading state, then fetch fresh data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Fetch fresh data from server
      try {
        const response = await fetch(`${API_BASE_URL}/api/varieties`)
        if (response.ok) {
          const data = await response.json()
          setItems(data)
        }
      } catch (err) {
        console.error('Error refreshing varieties:', err)
      }
      
      setLoading(false)

      // Show toast notification
      setToast({
        show: true,
        message: 'บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว',
        type: 'edit',
      })
      
      // Auto-close toast after 2 seconds
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'edit' })
      }, 2000)
    } catch (err) {
      console.error('Error updating variety:', err)
      setLoading(false)
      alert('ไม่สามารถบันทึกการเปลี่ยนแปลงได้ โปรดลองอีกครั้ง')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              {/* Sugarcane SVG Logo */}
              <span className="inline-block">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="20" cy="20" rx="18" ry="18" fill="#E6F4EA" />
                  <path d="M13 30C15 22 17 14 20 10C23 14 25 22 27 30" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M18 28C19 24 20 20 22 16" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M15 25C16.5 21 18.5 17 20 15" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="20" cy="20" r="18" stroke="#16A34A" strokeWidth="1.5"/>
                </svg>
              </span>
              <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">รายการพันธุ์อ้อยทั้งหมด</h1>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-2xl">
                <label className="sr-only">ค้นหา</label>
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ค้นหา..."
                    className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-gray-900"
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
              className="bg-[#1D724A] hover:bg-[#155838] text-white font-semibold py-2.5 px-8 rounded-lg shadow-md hover:shadow-lg transition"
            >
              + เพิ่มพันธุ์อ้อย
            </button>
          </div>
        <div className="relative">
          {/* content area stays in place */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6`}
          >
            {loading && (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <div className="relative w-16 h-16 mb-4">
                  {/* Spinning circle */}
                  <svg className="animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth="4"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#1D724A" strokeWidth="4" strokeLinecap="round"></path>
                  </svg>
                </div>
                <p className="text-gray-600 font-medium text-lg">กำลังโหลดข้อมูล...</p>
                <p className="text-gray-400 text-sm mt-2">โปรดรอสักครู่</p>
              </div>
            )}
            {error && (
              <div className="col-span-full text-center py-8">
                <p className="text-red-500">เกิดข้อผิดพลาด: {error}</p>
              </div>
            )}
            {!loading && !error && filteredItems.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 animate-in fade-in duration-200">
                <div className="bg-gradient-to-r from-[#1D724A]/10 via-white to-[#1D724A]/10 rounded-full p-6 shadow-lg mb-4">
                  <svg className="w-16 h-16 text-[#1D724A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" stroke="#1D724A" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35" stroke="#1D724A" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">ไม่พบข้อมูล</h2>
                <p className="text-gray-500 text-lg">ลองเปลี่ยนคำค้นหาหรือเพิ่มข้อมูลใหม่</p>
              </div>
            )}
            {!loading && filteredItems.map((item) => (
              <div key={item._id || item.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full relative group">
                {/* Delete Button */}
                <button
                  onClick={() => setDeleteModal({ show: true, itemId: item._id })}
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
                  {item.variety_image ? (
                    <img 
                      src={`${API_BASE_URL}/images/variety/${item.variety_image}`} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-10 pattern"></div>
                      <span className="relative text-sm font-medium">ไม่มีรูปภาพ</span>
                    </>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-[#1D724A]">
                    {item.name}
                  </h3>

                  {/* Description - prefer `description` field, fallback to growth_characteristics */}
                  <div className="min-h-[4.5rem] mb-4">
                    {item.description ? (
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{item.description}</p>
                    ) : (item.growth_characteristics && item.growth_characteristics.length > 0 && (
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {item.growth_characteristics.join(' • ')}
                      </p>
                    ))}
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => setEditingItem(item)}
                    className="bg-[#1D724A] hover:bg-[#155838] text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition"
                  >
                    แก้ไข
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Overlay and Panel */}
          {(showAddPanel || !!editingItem) && (
            <div 
              className="fixed inset-0 bg-black/20 z-40" 
              onClick={showAddPanel ? closeAddPanel : closeEditPanel}
            />
          )}
          {/* Delete Confirmation Modal */}
          {deleteModal.show && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteModal({ show: false })} />
              <div className="relative bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm mx-auto flex flex-col items-center animate-in fade-in duration-200">
                <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <h2 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการลบพันธุ์อ้อย</h2>
                <p className="text-gray-600 mb-6 text-center">คุณแน่ใจหรือไม่ว่าต้องการลบพันธุ์อ้อยนี้? การลบนี้ไม่สามารถย้อนกลับได้</p>
                <div className="flex gap-4 w-full">
                  <button
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition"
                    onClick={() => setDeleteModal({ show: false })}
                  >ยกเลิก</button>
                  <button
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition"
                    onClick={() => handleDeleteItem(deleteModal.itemId)}
                  >ลบ</button>
                </div>
              </div>
            </div>
          )}
          <VarietyModal
            mode={showAddPanel ? 'add' : 'edit'}
            isOpen={showAddPanel || !!editingItem}
            onClose={showAddPanel ? closeAddPanel : closeEditPanel}
            formData={showAddPanel ? formData : editingItem || formData}
            setFormData={showAddPanel ? setFormData : editingItem ? (d) => setEditingItem({ ...editingItem, ...d }) : setFormData}
            selectedImagePreview={showAddPanel ? selectedImagePreview : editingImagePreview}
            selectedImageFile={showAddPanel ? selectedImageFile : editingImageFile}
            setSelectedImageFile={showAddPanel ? setSelectedImageFile : setEditingImageFile}
            onSubmit={showAddPanel ? handleAddSubmit : handleEditSubmit}
          />

          {/* Toast Notification - Top Right */}
          {toast.show && (
            <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{toast.message}</span>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}