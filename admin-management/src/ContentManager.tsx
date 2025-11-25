import { useMemo, useState, useEffect, useRef } from 'react'

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

  // Delete variety
  const handleDeleteItem = async (id: string | undefined) => {
    if (!id) return
    
    if (!window.confirm('คุณแน่ใจว่าต้องการลบพันธุ์อ้อยนี้?')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/varieties/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete variety')
      }

      // Remove item from state
      setItems(items.filter(item => item._id !== id))
      alert('ลบพันธุ์อ้อยเรียบร้อยแล้ว')
    } catch (err) {
      console.error('Error deleting variety:', err)
      alert('เกิดข้อผิดพลาดในการลบ')
    }
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

      const data = await response.json()
      // server returns { message, data: savedVariety }
      const savedVariety = data && data.data ? data.data : data

      // Update UI with the newly created variety
      setItems(prev => [savedVariety, ...prev])

      // Reset add form and close panel
      setFormData(initialFormData)
      setSelectedImageFile(null)
      setSelectedImagePreview(null)
      setShowAddPanel(false)

      alert('เพิ่มพันธุ์อ้อยเรียบร้อยแล้ว')
    } catch (err) {
      console.error('Error creating variety:', err)
      alert('ไม่สามารถเพิ่มพันธุ์อ้อยได้ โปรดลองอีกครั้ง')
    } finally {
      setLoading(false)
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

      const data = await response.json()
      const updated = data && data.data ? data.data : data

      // Replace item in list
      setItems(prev => prev.map(it => (it._id === updated._id ? updated : it)))

      setEditingItem(null)
      setEditingImageFile(null)
      setEditingImagePreview(null)

      alert('บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว')
    } catch (err) {
      console.error('Error updating variety:', err)
      alert('ไม่สามารถบันทึกการเปลี่ยนแปลงได้ โปรดลองอีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
            <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">รายการพันธุ์อ้อยทั้งหมด</h1>

            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-2xl">
                <label className="sr-only">ค้นหา</label>
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
            {loading && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
              </div>
            )}
            {error && (
              <div className="col-span-full text-center py-8">
                <p className="text-red-500">เกิดข้อผิดพลาด: {error}</p>
              </div>
            )}
            {!loading && !error && filteredItems.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">ไม่พบข้อมูล</p>
              </div>
            )}
            {!loading && filteredItems.map((item) => (
              <div key={item._id || item.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full relative group">
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteItem(item._id)}
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
                  <h3 className="text-lg font-bold text-[#DA2C32] mb-2">
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
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg">
                    แก้ไขพันธุ์อ้อย
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Overlay and Panel */}
          {showAddPanel && (
            <div 
              className="fixed inset-0 bg-black/20 z-40" 
              onClick={closeAddPanel}
            />
          )}
          <div
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-white rounded-lg shadow-2xl z-50 transition-all duration-300 ${
              showAddPanel ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
              <div className="max-h-[90vh] overflow-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">เพิ่มพันธุ์อ้อยใหม่</h3>
                <button
                  onClick={closeAddPanel}
                  className="text-gray-400 hover:text-red-500 text-2xl leading-none"
                  aria-label="ปิด"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">รูปภาพพันธุ์อ้อย</label>
                  <div className="h-28 border-2 border-dashed rounded-md flex items-center justify-center text-gray-400 relative overflow-hidden">
                    {selectedImagePreview ? (
                      <img src={selectedImagePreview} alt="preview" className="w-full h-full object-cover" />
                    ) : formData.variety_image ? (
                      <img src={`${API_BASE_URL}/images/variety/${formData.variety_image}`} alt="existing" className="w-full h-full object-cover" />
                    ) : (
                      <label className="flex items-center justify-center w-full h-full cursor-pointer">
                        <span>คลิกเพื่ออัปโหลดรูปภาพ</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files && e.target.files[0] ? e.target.files[0] : null
                            setSelectedImageFile(file)
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">ชื่อพันธุ์อ้อย *</label>
                  <input 
                    className="w-full border rounded-md px-3 py-2" 
                    placeholder="เช่น เค 88-92" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">คำอธิบาย</label>
                  <textarea
                    className="w-full border rounded-md px-3 py-2 h-20"
                    placeholder="คำอธิบายสั้น ๆ หรือรายละเอียดของพันธุ์อ้อย"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">ดินที่เหมาะสม *</label>
                  <input 
                    className="w-full border rounded-md px-3 py-2" 
                    placeholder="เช่น ดินร่วนเหนียว" 
                    value={formData.soil_type}
                    onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">พันธุ์แม่พ่อ</label>
                  <input 
                    className="w-full border rounded-md px-3 py-2" 
                    placeholder="เช่น F143 (แม่) X ROC1 (พ่อ)"
                    value={formData.parent_varieties || ''}
                    onChange={(e) => setFormData({ ...formData, parent_varieties: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">ผลผลิต (ตัน/ไร่) *</label>
                  <input 
                    className="w-full border rounded-md px-3 py-2" 
                    placeholder="เช่น 15-16"
                    value={formData.yield}
                    onChange={(e) => setFormData({ ...formData, yield: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">อายุ (เดือน) *</label>
                  <input 
                    className="w-full border rounded-md px-3 py-2" 
                    placeholder="เช่น 11-12"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">ความหวาน (Brix) *</label>
                  <input 
                    className="w-full border rounded-md px-3 py-2" 
                    placeholder="เช่น 10-12"
                    value={formData.sweetness}
                    onChange={(e) => setFormData({ ...formData, sweetness: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">แมลง</label>
                  <div className="space-y-2">
                    {(formData.pest || []).map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          className="flex-1 border rounded-md px-3 py-2"
                          value={item}
                          onChange={(e) => {
                            const updated = [...(formData.pest || [])]
                            updated[idx] = e.target.value
                            setFormData({ ...formData, pest: updated })
                          }}
                        />
                        <button
                          onClick={() => {
                            const updated = (formData.pest || []).filter((_, i) => i !== idx)
                            setFormData({ ...formData, pest: updated })
                          }}
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setFormData({ ...formData, pest: [...(formData.pest || []), ''] })}
                      className="w-full border-2 border-dashed border-gray-300 rounded-md px-3 py-2 text-gray-600 hover:bg-gray-50"
                    >
                      + เพิ่มแมลง
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">โรค</label>
                  <div className="space-y-2">
                    {(formData.disease || []).map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          className="flex-1 border rounded-md px-3 py-2"
                          value={item}
                          onChange={(e) => {
                            const updated = [...(formData.disease || [])]
                            updated[idx] = e.target.value
                            setFormData({ ...formData, disease: updated })
                          }}
                        />
                        <button
                          onClick={() => {
                            const updated = (formData.disease || []).filter((_, i) => i !== idx)
                            setFormData({ ...formData, disease: updated })
                          }}
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setFormData({ ...formData, disease: [...(formData.disease || []), ''] })}
                      className="w-full border-2 border-dashed border-gray-300 rounded-md px-3 py-2 text-gray-600 hover:bg-gray-50"
                    >
                      + เพิ่มโรค
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">ลักษณะการเจริญเติบโต</label>
                  <div className="space-y-2">
                    {(formData.growth_characteristics || []).map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          className="flex-1 border rounded-md px-3 py-2"
                          value={item}
                          onChange={(e) => {
                            const updated = [...(formData.growth_characteristics || [])]
                            updated[idx] = e.target.value
                            setFormData({ ...formData, growth_characteristics: updated })
                          }}
                        />
                        <button
                          onClick={() => {
                            const updated = (formData.growth_characteristics || []).filter((_, i) => i !== idx)
                            setFormData({ ...formData, growth_characteristics: updated })
                          }}
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setFormData({ ...formData, growth_characteristics: [...(formData.growth_characteristics || []), ''] })}
                      className="w-full border-2 border-dashed border-gray-300 rounded-md px-3 py-2 text-gray-600 hover:bg-gray-50"
                    >
                      + เพิ่มลักษณะการเจริญเติบโต
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">เคล็ดลับการปลูก</label>
                  <div className="space-y-2">
                    {(formData.planting_tips || []).map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          className="flex-1 border rounded-md px-3 py-2"
                          value={item}
                          onChange={(e) => {
                            const updated = [...(formData.planting_tips || [])]
                            updated[idx] = e.target.value
                            setFormData({ ...formData, planting_tips: updated })
                          }}
                        />
                        <button
                          onClick={() => {
                            const updated = (formData.planting_tips || []).filter((_, i) => i !== idx)
                            setFormData({ ...formData, planting_tips: updated })
                          }}
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setFormData({ ...formData, planting_tips: [...(formData.planting_tips || []), ''] })}
                      className="w-full border-2 border-dashed border-gray-300 rounded-md px-3 py-2 text-gray-600 hover:bg-gray-50"
                    >
                      + เพิ่มเคล็ดลับการปลูก
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">เหมาะสำหรับพื้นที่</label>
                  <div className="space-y-2">
                    {(formData.suitable_for || []).map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          className="flex-1 border rounded-md px-3 py-2"
                          value={item}
                          onChange={(e) => {
                            const updated = [...(formData.suitable_for || [])]
                            updated[idx] = e.target.value
                            setFormData({ ...formData, suitable_for: updated })
                          }}
                        />
                        <button
                          onClick={() => {
                            const updated = (formData.suitable_for || []).filter((_, i) => i !== idx)
                            setFormData({ ...formData, suitable_for: updated })
                          }}
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setFormData({ ...formData, suitable_for: [...(formData.suitable_for || []), ''] })}
                      className="w-full border-2 border-dashed border-gray-300 rounded-md px-3 py-2 text-gray-600 hover:bg-gray-50"
                    >
                      + เพิ่มพื้นที่เหมาะสม
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleAddSubmit}
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
                  >
                    เพิ่มพันธุ์อ้อย
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Modal Overlay and Panel */}
          {editingItem && (
            <div 
              className="fixed inset-0 bg-black/20 z-40" 
              onClick={closeEditPanel}
            />
          )}
          <div
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-white rounded-lg shadow-2xl z-50 transition-all duration-300 ${
              editingItem ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <div className="max-h-[90vh] overflow-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">แก้ไขพันธุ์อ้อย</h3>
                <button
                  onClick={closeEditPanel}
                  className="text-gray-400 hover:text-red-500 text-2xl leading-none"
                  aria-label="ปิด"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">รูปภาพพันธุ์อ้อย</label>
                  <div className="h-28 border-2 border-dashed rounded-md flex items-center justify-center text-gray-400 relative overflow-hidden bg-gray-50">
                    {/* show new preview if selected, else old image as background with overlay, else placeholder */}
                    {editingImagePreview ? (
                      <img src={editingImagePreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        {/* show old image as background */}
                        {editingItem?.variety_image && (
                          <img src={`${API_BASE_URL}/images/variety/${editingItem.variety_image}`} alt="existing" className="absolute inset-0 w-full h-full object-cover" />
                        )}
                        {/* overlay with text */}
                        <label className="relative z-10 flex flex-col items-center justify-center gap-2 cursor-pointer">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-center text-sm text-gray-500 font-medium">คลิกเพื่ออัปโหลดรูปภาพ</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files && e.target.files[0] ? e.target.files[0] : null
                              setEditingImageFile(file)
                            }}
                          />
                        </label>
                      </>
                    )}

                    {/* invisible overlay input so clicking anywhere opens file chooser */}
                    <label aria-label="อัปโหลดรูปภาพ" className="absolute inset-0 cursor-pointer z-5">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0] ? e.target.files[0] : null
                          setEditingImageFile(file)
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">ชื่อพันธุ์อ้อย *</label>
                  <input 
                    className="w-full border rounded-md px-3 py-2" 
                    value={editingItem?.name || ''}
                    onChange={(e) => setEditingItem(editingItem ? { ...editingItem, name: e.target.value } : null)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">คำอธิบาย</label>
                  <textarea
                    className="w-full border rounded-md px-3 py-2 h-20"
                    placeholder="คำอธิบายสั้น ๆ หรือรายละเอียดของพันธุ์อ้อย"
                    value={editingItem?.description || ''}
                    onChange={(e) => setEditingItem(editingItem ? { ...editingItem, description: e.target.value } : null)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">ดินที่เหมาะสม *</label>
                  <input 
                    className="w-full border rounded-md px-3 py-2" 
                    value={editingItem?.soil_type || ''}
                    onChange={(e) => setEditingItem(editingItem ? { ...editingItem, soil_type: e.target.value } : null)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">พันธุ์แม่พ่อ</label>
                  <input 
                    className="w-full border rounded-md px-3 py-2" 
                    value={editingItem?.parent_varieties || ''}
                    onChange={(e) => setEditingItem(editingItem ? { ...editingItem, parent_varieties: e.target.value } : null)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">ผลผลิต (ตัน/ไร่) *</label>
                  <input 
                    className="w-full border rounded-md px-3 py-2" 
                    value={editingItem?.yield || ''}
                    onChange={(e) => setEditingItem(editingItem ? { ...editingItem, yield: e.target.value } : null)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">อายุ (เดือน) *</label>
                  <input 
                    className="w-full border rounded-md px-3 py-2" 
                    value={editingItem?.age || ''}
                    onChange={(e) => setEditingItem(editingItem ? { ...editingItem, age: e.target.value } : null)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">ความหวาน (Brix) *</label>
                  <input 
                    className="w-full border rounded-md px-3 py-2" 
                    value={editingItem?.sweetness || ''}
                    onChange={(e) => setEditingItem(editingItem ? { ...editingItem, sweetness: e.target.value } : null)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">แมลง</label>
                  <div className="space-y-2">
                    {(editingItem?.pest || []).map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          className="flex-1 border rounded-md px-3 py-2"
                          value={item}
                          onChange={(e) => {
                            if (!editingItem) return
                            const updated = [...(editingItem.pest || [])]
                            updated[idx] = e.target.value
                            setEditingItem({ ...editingItem, pest: updated })
                          }}
                        />
                        <button
                          onClick={() => {
                            if (!editingItem) return
                            const updated = (editingItem.pest || []).filter((_, i) => i !== idx)
                            setEditingItem({ ...editingItem, pest: updated })
                          }}
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        if (!editingItem) return
                        setEditingItem({ ...editingItem, pest: [...(editingItem.pest || []), ''] })
                      }}
                      className="w-full border-2 border-dashed border-gray-300 rounded-md px-3 py-2 text-gray-600 hover:bg-gray-50"
                    >
                      + เพิ่มแมลง
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">โรค</label>
                  <div className="space-y-2">
                    {(editingItem?.disease || []).map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          className="flex-1 border rounded-md px-3 py-2"
                          value={item}
                          onChange={(e) => {
                            if (!editingItem) return
                            const updated = [...(editingItem.disease || [])]
                            updated[idx] = e.target.value
                            setEditingItem({ ...editingItem, disease: updated })
                          }}
                        />
                        <button
                          onClick={() => {
                            if (!editingItem) return
                            const updated = (editingItem.disease || []).filter((_, i) => i !== idx)
                            setEditingItem({ ...editingItem, disease: updated })
                          }}
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        if (!editingItem) return
                        setEditingItem({ ...editingItem, disease: [...(editingItem.disease || []), ''] })
                      }}
                      className="w-full border-2 border-dashed border-gray-300 rounded-md px-3 py-2 text-gray-600 hover:bg-gray-50"
                    >
                      + เพิ่มโรค
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">ลักษณะการเจริญเติบโต</label>
                  <div className="space-y-2">
                    {(editingItem?.growth_characteristics || []).map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          className="flex-1 border rounded-md px-3 py-2"
                          value={item}
                          onChange={(e) => {
                            if (!editingItem) return
                            const updated = [...(editingItem.growth_characteristics || [])]
                            updated[idx] = e.target.value
                            setEditingItem({ ...editingItem, growth_characteristics: updated })
                          }}
                        />
                        <button
                          onClick={() => {
                            if (!editingItem) return
                            const updated = (editingItem.growth_characteristics || []).filter((_, i) => i !== idx)
                            setEditingItem({ ...editingItem, growth_characteristics: updated })
                          }}
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        if (!editingItem) return
                        setEditingItem({ ...editingItem, growth_characteristics: [...(editingItem.growth_characteristics || []), ''] })
                      }}
                      className="w-full border-2 border-dashed border-gray-300 rounded-md px-3 py-2 text-gray-600 hover:bg-gray-50"
                    >
                      + เพิ่มลักษณะการเจริญเติบโต
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">เคล็ดลับการปลูก</label>
                  <div className="space-y-2">
                    {(editingItem?.planting_tips || []).map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          className="flex-1 border rounded-md px-3 py-2"
                          value={item}
                          onChange={(e) => {
                            if (!editingItem) return
                            const updated = [...(editingItem.planting_tips || [])]
                            updated[idx] = e.target.value
                            setEditingItem({ ...editingItem, planting_tips: updated })
                          }}
                        />
                        <button
                          onClick={() => {
                            if (!editingItem) return
                            const updated = (editingItem.planting_tips || []).filter((_, i) => i !== idx)
                            setEditingItem({ ...editingItem, planting_tips: updated })
                          }}
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        if (!editingItem) return
                        setEditingItem({ ...editingItem, planting_tips: [...(editingItem.planting_tips || []), ''] })
                      }}
                      className="w-full border-2 border-dashed border-gray-300 rounded-md px-3 py-2 text-gray-600 hover:bg-gray-50"
                    >
                      + เพิ่มเคล็ดลับการปลูก
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">เหมาะสำหรับพื้นที่</label>
                  <div className="space-y-2">
                    {(editingItem?.suitable_for || []).map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          className="flex-1 border rounded-md px-3 py-2"
                          value={item}
                          onChange={(e) => {
                            if (!editingItem) return
                            const updated = [...(editingItem.suitable_for || [])]
                            updated[idx] = e.target.value
                            setEditingItem({ ...editingItem, suitable_for: updated })
                          }}
                        />
                        <button
                          onClick={() => {
                            if (!editingItem) return
                            const updated = (editingItem.suitable_for || []).filter((_, i) => i !== idx)
                            setEditingItem({ ...editingItem, suitable_for: updated })
                          }}
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        if (!editingItem) return
                        setEditingItem({ ...editingItem, suitable_for: [...(editingItem.suitable_for || []), ''] })
                      }}
                      className="w-full border-2 border-dashed border-gray-300 rounded-md px-3 py-2 text-gray-600 hover:bg-gray-50"
                    >
                      + เพิ่มพื้นที่เหมาะสม
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleEditSubmit}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    บันทึกการเปลี่ยนแปลง
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
