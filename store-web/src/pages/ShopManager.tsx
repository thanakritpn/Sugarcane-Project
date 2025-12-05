import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaStore, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import ShopModal from "../components/ShopModal";
import ToastContainer, { useToast } from "../components/ToastContainer";
import { validateShopForm, checkUsernameExists, checkEmailExists } from "../utils/validation";

interface Shop {
  _id: string;
  username: string;
  email: string;
  shopName: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  shop_image?: string;
  createdAt: string;
  updatedAt: string;
}

interface ShopFormData {
  username: string;
  email: string;
  password: string;
  shopName: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  shop_image?: string;
}

export default function ShopManager() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [editingShopId, setEditingShopId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ShopFormData>({
    username: "",
    email: "",
    password: "",
    shopName: "",
    phone: "",
    address: "",
    district: "",
    province: "",
    shop_image: "",
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string>("");
  const { toasts, addToast, removeToast } = useToast();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const API_BASE_URL = 'http://localhost:5001';

  // Fetch shops from database
  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchShops = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/shops`, {
          signal: abortController.signal
        });
        if (!response.ok) {
          throw new Error('Failed to fetch shops');
        }
        const data = await response.json();
        setShops(data);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('Error fetching shops:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch shops');
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
    
    return () => abortController.abort();
  }, [API_BASE_URL]);

  // Generate image preview when file is selected
  useEffect(() => {
    if (selectedImageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedImageFile);
    }
  }, [selectedImageFile]);

  const handleOpenEdit = (shop: Shop) => {
    setEditingShopId(shop._id);
    setFormData({
      username: shop.username,
      email: shop.email,
      password: "••••••••", // Show locked password
      shopName: shop.shopName,
      phone: shop.phone,
      address: shop.address,
      district: shop.district,
      province: shop.province,
      shop_image: shop.shop_image,
    });
    if (shop.shop_image) {
      setSelectedImagePreview(`${API_BASE_URL}/images/shops/${shop.shop_image}`);
    } else {
      setSelectedImagePreview("");
    }
    setSelectedImageFile(null);
    setShowEditPanel(true);
  };

  const handleAddSubmit = async () => {
    // Clear previous validation errors
    setValidationErrors([]);
    
    // Validate form data
    const validation = validateShopForm(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      addToast('กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง', 'error', 5000);
      return;
    }
    
    setIsValidating(true);
    
    // Check for duplicate username
    const usernameCheck = await checkUsernameExists(formData.username);
    if (usernameCheck.error) {
      addToast(usernameCheck.error, 'error');
      setIsValidating(false);
      return;
    }
    if (usernameCheck.exists) {
      addToast('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว กรุณาเลือกชื่อผู้ใช้อื่น', 'error', 4000);
      setIsValidating(false);
      return;
    }
    
    // Check for duplicate email
    const emailCheck = await checkEmailExists(formData.email);
    if (emailCheck.error) {
      addToast(emailCheck.error, 'error');
      setIsValidating(false);
      return;
    }
    if (emailCheck.exists) {
      addToast('อีเมลนี้มีอยู่ในระบบแล้ว กรุณาเลือกอีเมลอื่น', 'error', 4000);
      setIsValidating(false);
      return;
    }
    
    setIsValidating(false);

    try {
      const payload = new FormData();
      payload.append("username", formData.username);
      payload.append("email", formData.email);
      payload.append("password", formData.password);
      payload.append("shopName", formData.shopName);
      payload.append("phone", formData.phone);
      payload.append("address", formData.address);
      payload.append("district", formData.district);
      payload.append("province", formData.province);
      
      if (selectedImageFile) {
        payload.append("shop_image", selectedImageFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/shops/register`, {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create shop");
      }

      const result = await response.json();
      const newShop = result.data; // API returns data in .data property
      setShops([...shops, newShop]);
      setShowAddPanel(false);
      setFormData({
        username: "",
        email: "",
        password: "",
        shopName: "",
        phone: "",
        address: "",
        district: "",
        province: "",
        shop_image: "",
      });
      setSelectedImageFile(null);
      setSelectedImagePreview("");
      addToast('เพิ่มร้านค้าเรียบร้อยแล้ว: ' + formData.shopName, 'success');
    } catch (err: any) {
      console.error("Error adding shop:", err);
      const errorMessage = err.message || 'ไม่สามารถเพิ่มร้านค้าได้';
      addToast('เกิดข้อผิดพลาด: ' + errorMessage, 'error', 4000);
    }
  };

  const handleEditSubmit = async () => {
    if (!editingShopId) return;

    // Clear previous validation errors
    setValidationErrors([]);
    
    // Create modified formData for validation (remove placeholder password)
    const validationData = {
      ...formData,
      password: formData.password === "••••••••" ? "" : formData.password
    };
    
    // Validate form data (edit mode)
    const validation = validateShopForm(validationData, true);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      addToast('กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง', 'error', 5000);
      return;
    }

    try {
      let body: string | FormData;
      let headers: HeadersInit = {};

      if (selectedImageFile) {
        body = new FormData();
        (body as FormData).append("shopName", formData.shopName);
        (body as FormData).append("phone", formData.phone);
        (body as FormData).append("address", formData.address);
        (body as FormData).append("district", formData.district);
        (body as FormData).append("province", formData.province);
        if (formData.password && formData.password !== "••••••••") {
          (body as FormData).append("password", formData.password);
        }
        (body as FormData).append("shop_image", selectedImageFile);
      } else {
        headers = { "Content-Type": "application/json" };
        body = JSON.stringify({
          shopName: formData.shopName,
          phone: formData.phone,
          address: formData.address,
          district: formData.district,
          province: formData.province,
          ...(formData.password && formData.password !== "••••••••" && { password: formData.password }),
        });
      }

      const response = await fetch(`${API_BASE_URL}/api/shops/${editingShopId}`, {
        method: "PUT",
        body,
        ...(Object.keys(headers).length > 0 && { headers }),
      });

      if (!response.ok) {
        throw new Error("Failed to update shop");
      }

      const result = await response.json();
      const updatedShop = result.data; // API returns data in .data property
      setShops(shops.map((s) => (s._id === editingShopId ? updatedShop : s)));
      setShowEditPanel(false);
      setEditingShopId(null);
      setFormData({
        username: "",
        email: "",
        password: "",
        shopName: "",
        phone: "",
        address: "",
        district: "",
        province: "",
        shop_image: "",
      });
      setSelectedImageFile(null);
      setSelectedImagePreview("");
      addToast('อัปเดตร้านค้าเรียบร้อยแล้ว: ' + formData.shopName, 'success');
    } catch (err) {
      console.error("Error updating shop:", err);
      const errorMessage = err instanceof Error ? err.message : 'ไม่สามารถอัปเดตร้านค้าได้';
      addToast('เกิดข้อผิดพลาด: ' + errorMessage, 'error', 4000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบร้านค้านี้?')) {
      return;
    }

    try {
      const deletedShop = shops.find(shop => shop._id === id);
      const response = await fetch(`${API_BASE_URL}/api/shops/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete shop');
      }
      setShops((prev) => prev.filter((shop) => shop._id !== id));
      addToast('ลบร้านค้าเรียบร้อยแล้ว: ' + (deletedShop?.shopName || 'ร้านค้า'), 'success');
    } catch (err) {
      console.error('Error deleting shop:', err);
      const errorMessage = err instanceof Error ? err.message : 'ไม่สามารถลบร้านค้าได้';
      addToast('เกิดข้อผิดพลาด: ' + errorMessage, 'error', 4000);
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

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-[96px]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1D724A] flex items-center justify-center">
              <FaStore className="w-6 h-6 text-white" />
            </div>
            <div className="leading-tight">
              <h2 className="text-xl font-bold text-gray-800">
                จัดการร้านค้า
              </h2>
              <p className="text-gray-500">
                พบ {shops.length} ร้านค้า
              </p>
            </div>
          </div>

          <button 
            onClick={() => {
              setShowAddPanel(true);
              setFormData({
                username: "",
                email: "",
                password: "",
                shopName: "",
                phone: "",
                address: "",
                district: "",
                province: "",
                shop_image: "",
              });
              setSelectedImageFile(null);
              setSelectedImagePreview("");
            }}
            className="bg-[#1D724A] hover:bg-[#155838] text-white font-semibold py-2.5 px-8 rounded-lg shadow-md hover:shadow-lg transition">
            <FaPlus className="inline-block mr-2" /> เพิ่มร้านค้าใหม่
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
            <p className="text-gray-600 font-medium">กำลังโหลดข้อมูลร้านค้า...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 font-medium">เกิดข้อผิดพลาด: {error}</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && shops.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaStore className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ยังไม่มีร้านค้า
            </h3>
            <p className="text-gray-500">
              เริ่มต้นโดยการเพิ่มร้านค้าใหม่
            </p>
          </div>
        )}

        {/* Shop Cards Grid */}
        {!loading && !error && shops.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {shops.map((shop) => (
              <div key={shop._id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full relative group">
                <button
                  onClick={() => handleDelete(shop._id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition z-10 bg-white/80 hover:bg-white rounded-lg p-1"
                  title="ลบร้านค้า"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>

                <div className="h-40 bg-gradient-to-br from-[#1D724A] to-[#22C55E] flex items-center justify-center relative overflow-hidden">
                  {shop.shop_image ? (
                    <>
                      <img src={`${API_BASE_URL}/images/shops/${shop.shop_image}`} alt={shop.shopName} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-bold text-lg truncate drop-shadow-lg">{shop.shopName}</h3>
                        <p className="text-white/90 text-sm drop-shadow-md">@{shop.username}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-bold text-lg truncate">{shop.shopName}</h3>
                        <p className="text-white/90 text-sm">@{shop.username}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="space-y-2 mb-4 min-h-[6rem]">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaEnvelope className="w-3 h-3 text-[#1D724A] flex-shrink-0" />
                      <span className="text-xs truncate">{shop.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaPhone className="w-3 h-3 text-[#1D724A] flex-shrink-0" />
                      <span className="text-xs">{shop.phone}</span>
                    </div>

                    <div className="flex items-start gap-2 text-gray-600">
                      <FaMapMarkerAlt className="w-3 h-3 text-[#1D724A] flex-shrink-0 mt-0.5" />
                      <div className="text-xs leading-relaxed">
                        <div className="line-clamp-2">{shop.address}</div>
                        <div className="text-gray-500">
                          อ.{shop.district} จ.{shop.province}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    สมัครเมื่อ {formatDate(shop.createdAt)}
                  </div>

                  <button
                    onClick={() => handleOpenEdit(shop)}
                    className="bg-[#1D724A] hover:bg-[#155838] text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                    title="แก้ไขข้อมูลร้านค้า"
                  >
                    <FaEdit className="w-4 h-4" /> แก้ไข
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Shop Modal */}
        <ShopModal
          isOpen={showAddPanel}
          onClose={() => setShowAddPanel(false)}
          formData={formData}
          setFormData={setFormData}
          selectedImagePreview={selectedImagePreview}
          selectedImageFile={selectedImageFile}
          setSelectedImageFile={setSelectedImageFile}
          onSubmit={handleAddSubmit}
          title="เพิ่มร้านค้าใหม่"
          submitButtonText="เพิ่มร้านค้า"
          isEditMode={false}
        />

        {/* Edit Shop Modal */}
        <ShopModal
          isOpen={showEditPanel}
          onClose={() => setShowEditPanel(false)}
          formData={formData}
          setFormData={setFormData}
          selectedImagePreview={selectedImagePreview}
          selectedImageFile={selectedImageFile}
          setSelectedImageFile={setSelectedImageFile}
          onSubmit={handleEditSubmit}
          title="แก้ไขข้อมูลร้านค้า"
          submitButtonText="บันทึกการเปลี่ยนแปลง"
          isEditMode={true}
        />

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-red-800 font-medium text-sm mb-1">ข้อมูลไม่ถูกต้อง:</h4>
                  <ul className="text-red-700 text-xs space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => setValidationErrors([])}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </div>
    </div>
  );
}