import { useState, useEffect } from "react";
import { FaBox, FaStore, FaLeaf, FaTag, FaCheckCircle, FaTimesCircle, FaBoxes, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import ToastContainer, { useToast } from "../components/ToastContainer";

interface Variety {
  _id: string;
  name: string;
  soil_type?: string;
  yield?: string;
  description?: string;
  variety_image?: string;
}

interface Shop {
  _id: string;
  shopName: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  shop_image?: string;
}

interface InventoryItem {
  _id: string;
  variety: Variety;
  price: number;
  status: "available" | "out_of_stock";
  quantity?: number;
  createdAt: string;
  updatedAt: string;
}

interface ShopInventory {
  shop: Shop;
  inventories: InventoryItem[];
}

const API_BASE_URL = 'http://localhost:5001';

export default function InventoryManager({ searchQuery = "" }: { searchQuery?: string }) {
  const [shopInventories, setShopInventories] = useState<ShopInventory[]>([]);
  const [currentShopInventory, setCurrentShopInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity: 0,
    status: "available" as "available" | "out_of_stock"
  });
  
  // Add inventory modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [allVarieties, setAllVarieties] = useState<Variety[]>([]);
  const [addFormData, setAddFormData] = useState({
    varietyId: "",
    quantity: 0,
    price: 0,
    status: "available" as "available" | "out_of_stock"
  });

  // Fetch shop inventories from database
  const fetchInventories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current shop data from localStorage
      const shopDataStr = localStorage.getItem('shopData');
      if (!shopDataStr) {
        throw new Error('ไม่พบข้อมูลร้านค้า');
      }
      
      const shopData = JSON.parse(shopDataStr);
      const shopId = shopData._id;
      
      // Fetch only this shop's inventory
      const response = await fetch(`${API_BASE_URL}/api/shop-inventory/shop/${shopId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inventories');
      }

      const data = await response.json();
      setShopInventories(data);
      
      // Extract only current shop's inventories
      if (data.length > 0) {
        setCurrentShopInventory(data[0].inventories || []);
      }
    } catch (err: any) {
      console.error('Error fetching inventories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch inventories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();
    fetchAllVarieties();
  }, []);

  // Fetch all varieties
  const fetchAllVarieties = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/varieties`);
      if (!response.ok) throw new Error('Failed to fetch varieties');
      const data = await response.json();
      setAllVarieties(data);
    } catch (err) {
      console.error('Error fetching varieties:', err);
    }
  };

  // Open modal for editing inventory
  const openModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      quantity: item.quantity || 0,
      status: item.status
    });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormData({ quantity: 0, status: "available" });
  };

  // Open add inventory modal
  const openAddModal = () => {
    setAddFormData({
      varietyId: "",
      quantity: 0,
      price: 0,
      status: "available"
    });
    setShowAddModal(true);
  };

  // Close add inventory modal
  const closeAddModal = () => {
    setShowAddModal(false);
    setAddFormData({
      varietyId: "",
      quantity: 0,
      price: 0,
      status: "available"
    });
  };

  // Add inventory
  const addInventory = async () => {
    if (!addFormData.varietyId || addFormData.price <= 0) {
      addToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }

    try {
      setAddLoading(true);
      
      // Get current shop data from localStorage
      const shopDataStr = localStorage.getItem('shopData');
      if (!shopDataStr) {
        throw new Error('ไม่พบข้อมูลร้านค้า');
      }
      
      const shopData = JSON.parse(shopDataStr);
      const shopId = shopData._id;

      console.log('Adding inventory with data:', {
        shop: shopId,
        variety: addFormData.varietyId,
        quantity: addFormData.quantity,
        price: addFormData.price,
        status: addFormData.status
      });

      const response = await fetch(`${API_BASE_URL}/api/shop-inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopId: shopId,
          varietyId: addFormData.varietyId,
          quantity: addFormData.quantity,
          price: addFormData.price,
          status: addFormData.status
        }),
      });

      const responseData = await response.json();
      console.log('API Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to add inventory');
      }

      // Refresh inventories
      await fetchInventories();
      addToast('เพิ่มสินค้าเรียบร้อยแล้ว', 'success');
      closeAddModal();
    } catch (err: any) {
      console.error('Error adding inventory:', err);
      addToast(`เกิดข้อผิดพลาด: ${err.message}`, 'error');
    } finally {
      setAddLoading(false);
    }
  };

  // Update inventory
  const updateInventory = async () => {
    if (!selectedItem) return;
    
    try {
      setModalLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/shop-inventory/${selectedItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: formData.quantity,
          status: formData.status
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update inventory');
      }

      // Refresh inventories
      await fetchInventories();
      addToast(`อัปเดตสินค้า ${selectedItem.variety.name} เรียบร้อยแล้ว`, 'success');
      closeModal();
    } catch (err: any) {
      console.error('Error updating inventory:', err);
      addToast('เกิดข้อผิดพลาดในการอัปเดตสินค้า', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('th-TH') + ' บาท';
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'available':
        return {
          text: 'พร้อมจำหน่าย',
          icon: FaCheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100'
        };
      case 'out_of_stock':
        return {
          text: 'หมด',
          icon: FaTimesCircle,
          color: 'text-red-600',
          bg: 'bg-red-100'
        };
      default:
        return {
          text: 'ไม่ทราบสถานะ',
          icon: FaTimesCircle,
          color: 'text-gray-600',
          bg: 'bg-gray-100'
        };
    }
  };

  // Filter shop inventories based on search query
  const filteredInventories = currentShopInventory.filter(item =>
    item.variety && item.variety.name && (
      item.variety.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.variety.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    )
  );

  const totalInventoryItems = currentShopInventory.length;
  const availableItems = currentShopInventory.filter(item => item.status === 'available').length;

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-[96px]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1D724A] flex items-center justify-center">
              <FaBoxes className="w-6 h-6 text-white" />
            </div>
            <div className="leading-tight">
              <h2 className="text-xl font-bold text-gray-800">
                คลังสินค้า
              </h2>
              <p className="text-gray-500">
                {totalInventoryItems} รายการสินค้า • {availableItems} พร้อมจำหน่าย
              </p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="bg-[#1D724A] hover:bg-[#155838] text-white font-semibold px-4 py-2.5 rounded-lg transition flex items-center gap-2 whitespace-nowrap"
          >
            <FaPlus className="w-4 h-4" />
            เพิ่มสินค้า
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative w-12 h-12 mb-4">
              <svg className="animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth="4"></circle>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#1D724A" strokeWidth="4" strokeLinecap="round"></path>
              </svg>
            </div>
            <p className="text-gray-600 font-medium">กำลังโหลดข้อมูลคลังสินค้า...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 font-medium">เกิดข้อผิดพลาด: {error}</div>
            <button 
              onClick={fetchInventories}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && currentShopInventory.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBoxes className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ยังไม่มีข้อมูลคลังสินค้า
            </h3>
            <p className="text-gray-500">
              ร้านค้าของคุณยังไม่มีการเพิ่มสายพันธุ์อ้อยในคลังสินค้า
            </p>
          </div>
        )}

        {/* No Search Results */}
        {!loading && !error && currentShopInventory.length > 0 && filteredInventories.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ไม่พบผลลัพธ์
            </h3>
            <p className="text-gray-500">
              ไม่พบสายพันธุ์อ้อยที่ตรงกับคำค้นหา "{searchQuery}"
            </p>
          </div>
        )}

        {/* Product Cards Grid */}
        {!loading && !error && filteredInventories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredInventories.map((item) => {
              // Safety check: skip items without variety data
              if (!item.variety || !item.variety.name) {
                return null;
              }
              
              const statusInfo = getStatusInfo(item.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={item._id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 flex flex-col h-full">
                  {/* Product Image */}
                  <div className="relative w-full h-40 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center overflow-hidden">
                    {item.variety.variety_image ? (
                      <img 
                        src={`${API_BASE_URL}/images/variety/${item.variety.variety_image}`} 
                        alt={item.variety.name} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <FaLeaf className="w-16 h-16 text-green-400/40" />
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm ${
                        item.status === 'available' 
                          ? 'bg-[#1D724A]/90 text-white shadow-green-200' 
                          : 'bg-red-500/90 text-white shadow-red-200'
                      } shadow-lg`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          {statusInfo.text}
                        </span>
                      </div>
                    </div>
                    {/* Quantity Corner Badge */}
                    {item.quantity && (
                      <div className="absolute top-4 left-4">
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                          <div className="flex items-center gap-1.5">
                            <FaBox className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-sm font-bold text-gray-800">{item.quantity} หน่วย</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Product Info */}
                  <div className="p-6 flex flex-col">
                    <h4 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 leading-tight">
                      {item.variety.name}
                    </h4>
                    {item.variety.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                        {item.variety.description}
                      </p>
                    )}
                    {/* Product Details */}
                    <div className="space-y-3 mb-2">
                    {/* ...existing code... */}
                    </div>
                    {/* Price Section (moved up) */}
                    <div className="bg-white rounded-lg px-4 py-3 mb-2 w-full flex flex-row items-center justify-between border border-[#1D724A]">
                      <span className="text-xs font-medium text-[#1D724A]">ราคา</span>
                      <span className="text-xl font-bold text-[#1D724A] mx-auto">{item.price.toLocaleString('th-TH')} ฿</span>
                      <span className="text-xs text-[#1D724A] text-right min-w-fit">ต่อหน่วย</span>
                    </div>
                    {/* Action Button */}
                    <button 
                      onClick={() => openModal(item)}
                      className="w-full bg-[#1D724A] border-2 border-[#1D724A] text-white hover:bg-white hover:text-[#1D724A] font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                      <FaEdit className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                      จัดการสินค้า
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Modal สำหรับจัดการสินค้า */}
      {showModal && selectedItem && selectedItem.variety && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1D724A] flex items-center justify-center">
                  <FaEdit className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">จัดการสินค้า</h3>
                  <p className="text-sm text-gray-600">{selectedItem.variety?.name || 'ไม่ระบุ'}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              {/* จำนวนสินค้า */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  จำนวนสินค้า <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#1D724A] outline-none"
                  placeholder="กรอกจำนวนสินค้า"
                  value={formData.quantity || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({ ...formData, quantity: parseInt(value) || 0 });
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  ระบุจำนวนสินค้าที่มีอยู่ในคลัง
                </p>
              </div>

              {/* สถานะสินค้า */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  สถานะสินค้า <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#1D724A] outline-none"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "available" | "out_of_stock" })}
                >
                  <option value="available">พร้อมจำหน่าย</option>
                  <option value="out_of_stock">หมด</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  เลือกสถานะปัจจุบันของสินค้า
                </p>
              </div>

              {/* ข้อมูลสินค้าปัจจุบัน */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">ข้อมูลปัจจุบัน</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">ราคา:</span> {selectedItem.price.toLocaleString('th-TH')} บาท</p>
                  <p><span className="font-medium">จำนวนเดิม:</span> {selectedItem.quantity || 0} หน่วย</p>
                  <p><span className="font-medium">สถานะเดิม:</span> {selectedItem.status === 'available' ? 'พร้อมจำหน่าย' : 'หมด'}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                disabled={modalLoading}
              >
                ยกเลิก
              </button>
              <button
                onClick={updateInventory}
                disabled={modalLoading}
                className="flex-1 px-4 py-2 bg-[#1D724A] hover:bg-[#155838] text-white rounded-lg transition flex items-center justify-center gap-2"
              >
                {modalLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  'บันทึกการเปลี่ยนแปลง'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal สำหรับเพิ่มสินค้าใหม่ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1D724A] flex items-center justify-center">
                  <FaPlus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">เพิ่มสินค้าใหม่</h3>
                  <p className="text-sm text-gray-600">เพิ่มพันธุ์อ้อยให้กับคลังสินค้า</p>
                </div>
              </div>
              <button
                onClick={closeAddModal}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* เลือกสายพันธุ์อ้อย */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  สายพันธุ์อ้อย <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#1D724A] outline-none"
                  value={addFormData.varietyId}
                  onChange={(e) => setAddFormData({ ...addFormData, varietyId: e.target.value })}
                >
                  <option value="">-- เลือกสายพันธุ์อ้อย --</option>
                  {allVarieties.map((variety) => (
                    <option key={variety._id} value={variety._id}>
                      {variety.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  เลือกสายพันธุ์อ้อยที่ต้องการเพิ่มเข้าคลัง
                </p>
              </div>

              {/* จำนวนสินค้า */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  จำนวนสินค้า <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#1D724A] outline-none"
                  placeholder="กรอกจำนวนสินค้า"
                  value={addFormData.quantity || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setAddFormData({ ...addFormData, quantity: parseInt(value) || 0 });
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  ระบุจำนวนสินค้าที่มีอยู่ในคลัง
                </p>
              </div>

              {/* ราคา */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  ราคา (บาท) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#1D724A] outline-none"
                  placeholder="กรอกราคาต่อหน่วย"
                  value={addFormData.price || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    setAddFormData({ ...addFormData, price: parseFloat(value) || 0 });
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  ราคาต่อหน่วย (บาท)
                </p>
              </div>

              {/* สถานะสินค้า */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  สถานะสินค้า <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#1D724A] outline-none"
                  value={addFormData.status}
                  onChange={(e) => setAddFormData({ ...addFormData, status: e.target.value as "available" | "out_of_stock" })}
                >
                  <option value="available">พร้อมจำหน่าย</option>
                  <option value="out_of_stock">หมด</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  เลือกสถานะปัจจุบันของสินค้า
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={closeAddModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                disabled={addLoading}
              >
                ยกเลิก
              </button>
              <button
                onClick={addInventory}
                disabled={addLoading}
                className="flex-1 px-4 py-2 bg-[#1D724A] hover:bg-[#155838] text-white rounded-lg transition flex items-center justify-center gap-2"
              >
                {addLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  'เพิ่มสินค้า'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
