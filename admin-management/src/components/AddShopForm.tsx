import React from 'react';

const SectionTitle = ({ title }: { title: string }) => (
  <h4 className="text-sm font-semibold text-gray-800 mt-2 mb-2">{title}</h4>
);

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

interface AddShopFormProps {
  formData: ShopFormData;
  setFormData: (data: ShopFormData) => void;
  selectedImagePreview: string | null;
  setSelectedImageFile: (file: File | null) => void;
  onSubmit: () => void;
  submitButtonText?: string;
  isEditMode?: boolean;
}

const AddShopForm = ({
  formData,
  setFormData,
  selectedImagePreview,
  setSelectedImageFile,
  onSubmit,
  submitButtonText = 'บันทึกร้านค้า',
  isEditMode = false,
}: AddShopFormProps) => {
  return (
    <div className="px-6 pb-6 space-y-4 max-h-[80vh] overflow-y-auto">
      {/* Image Upload */}
      <SectionTitle title="รูปภาพร้านค้า" />

      <label className="relative h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 transition cursor-pointer group">
        {(selectedImagePreview || formData.shop_image) ? (
          <>
            <img
              src={
                selectedImagePreview ||
                `http://localhost:5001/images/shops/${formData.shop_image}`
              }
              alt="preview"
              className="w-full h-full object-cover"
            />
            {isEditMode && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white font-semibold text-center">คลิกเพื่อแก้ไข</span>
              </div>
            )}
          </>
        ) : (
          <span className="text-gray-500">คลิกเพื่ออัปโหลด</span>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden shop-image-input"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setSelectedImageFile(file);
          }}
        />
      </label>

      {/* Basic Info */}
      <SectionTitle title="ข้อมูลพื้นฐาน" />

      {/* ชื่อร้านค้า */}
      <div>
        <label className="block text-sm font-semibold text-gray-800">
          ชื่อร้านค้า <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.shopName}
          onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
          placeholder="ระบุชื่อร้านค้า"
          className="w-full border rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#1D724A] outline-none"
          disabled={isEditMode}
        />
      </div>

      {/* ชื่อผู้ใช้ */}
      <div>
        <label className="block text-sm font-semibold text-gray-800">
          ชื่อผู้ใช้ <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="ระบุชื่อผู้ใช้"
          className="w-full border rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#1D724A] outline-none"
          disabled={isEditMode}
        />
      </div>

      {/* อีเมล */}
      <div>
        <label className="block text-sm font-semibold text-gray-800">
          อีเมล <span className="text-red-500">*</span>
          {isEditMode && <span className="text-gray-500 text-xs ml-2">(ล็อค)</span>}
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => !isEditMode && setFormData({ ...formData, email: e.target.value })}
          placeholder="ระบุอีเมล"
          disabled={isEditMode}
          className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#1D724A] outline-none ${
            isEditMode ? 'bg-gray-200 cursor-not-allowed text-gray-600' : ''
          }`}
        />
      </div>

      {/* รหัสผ่าน */}
      <div>
        <label className="block text-sm font-semibold text-gray-800">
          รหัสผ่าน {!isEditMode && <span className="text-red-500">*</span>}
          {isEditMode && <span className="text-gray-500 text-xs ml-2">(ไม่บังคับ)</span>}
        </label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder={isEditMode ? 'ปล่อยว่างเพื่อไม่เปลี่ยนรหัสผ่าน' : 'ระบุรหัสผ่าน'}
          className={`w-full border rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#1D724A] outline-none ${
            isEditMode ? 'bg-gray-200 cursor-not-allowed text-gray-600' : ''
          }`}
          disabled={isEditMode}
        />
      </div>

      {/* Contact Info */}
      <SectionTitle title="ข้อมูลติดต่อ" />

      {/* เบอร์โทรศัพท์ */}
      <div>
        <label className="block text-sm font-semibold text-gray-800">
          เบอร์โทรศัพท์ <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="ระบุเบอร์โทร"
          className="w-full border rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#1D724A] outline-none"
        />
      </div>

      {/* ที่อยู่ */}
      <div>
        <label className="block text-sm font-semibold text-gray-800">
          ที่อยู่ <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="ระบุที่อยู่"
          className="w-full border rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#1D724A] outline-none"
        />
      </div>

      {/* อำเภอ */}
      <div>
        <label className="block text-sm font-semibold text-gray-800">
          อำเภอ <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.district}
          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
          placeholder="ระบุอำเภอ"
          className="w-full border rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#1D724A] outline-none"
        />
      </div>

      {/* จังหวัด */}
      <div>
        <label className="block text-sm font-semibold text-gray-800">
          จังหวัด <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.province}
          onChange={(e) => setFormData({ ...formData, province: e.target.value })}
          placeholder="ระบุจังหวัด"
          className="w-full border rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#1D724A] outline-none"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 mt-8 pt-4 border-t">
        <button
          onClick={onSubmit}
          className="flex-1 bg-[#1D724A] hover:bg-[#155838] text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition"
        >
          {submitButtonText}
        </button>
      </div>
    </div>
  );
};

export default AddShopForm;
