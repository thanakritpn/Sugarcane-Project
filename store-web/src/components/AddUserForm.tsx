import React from 'react';

const SectionTitle = ({ title }: { title: string }) => (
  <h4 className="text-sm font-semibold text-gray-800 mt-2 mb-2">{title}</h4>
);

interface UserFormData {
  username: string;
  email: string;
  password: string;
  role: 'Admin' | 'User';
  profile_image?: string;
}

const AddUserForm = ({
  formData,
  setFormData,
  selectedImagePreview,
  setSelectedImageFile,
  onSubmit,
  submitButtonText = 'บันทึกผู้ใช้ใหม่',
  isEditMode = false,
}: {
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  selectedImagePreview: string | null;
  setSelectedImageFile: (file: File | null) => void;
  onSubmit: () => void;
  submitButtonText?: string;
  isEditMode?: boolean;
}) => {
  return (
    <div className="px-6 pb-6 space-y-4">
      {/* Image Upload */}
      <SectionTitle title="รูปโปรไฟล์" />

      <div className="flex justify-center">
        <label className="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center overflow-hidden text-gray-500 bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
          {selectedImagePreview || formData.profile_image ? (
            <img
              src={
                selectedImagePreview ||
                `http://localhost:5001/images/users/${formData.profile_image}`
              }
              alt="preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/user-placeholder.png';
              }}
            />
          ) : (
            <span className="text-center text-sm">คลิกเพื่ออัปโหลด</span>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setSelectedImageFile(file);
            }}
          />
        </label>
      </div>

      {/* Basic Info */}
      <SectionTitle title="ข้อมูลพื้นฐาน" />

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
          className="w-full border rounded-md px-3 py-2 text-gray-900 
                     focus:ring-2 focus:ring-[#15803D] outline-none"
        />
        <div className="mt-1 text-xs text-gray-500">
          • 3-20 ตัวอักษร • ใช้ได้เฉพาะ a-z, A-Z, 0-9, _ เท่านั้น
        </div>
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
          className={`w-full border rounded-md px-3 py-2 text-gray-900 
                     focus:ring-2 focus:ring-[#15803D] outline-none ${
                       isEditMode ? 'bg-gray-200 cursor-not-allowed text-gray-600' : ''
                     }`}
        />
      </div>

      {/* รหัสผ่าน */}
      <div>
        <label className="block text-sm font-semibold text-gray-800">
          รหัสผ่าน {!isEditMode && <span className="text-red-500">*</span>}
          {isEditMode && <span className="text-gray-500 text-xs ml-2">(ล็อค - เว้นว่างหากไม่ต้องการเปลี่ยน)</span>}
        </label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => !isEditMode && setFormData({ ...formData, password: e.target.value })}
          placeholder={isEditMode ? '••••••••' : 'ระบุรหัสผ่าน'}
          disabled={isEditMode}
          className={`w-full border rounded-md px-3 py-2 text-gray-900 
                     focus:ring-2 focus:ring-[#15803D] outline-none ${
                       isEditMode ? 'bg-gray-200 cursor-not-allowed text-gray-600' : ''
                     }`}
        />
        {!isEditMode && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h5 className="text-blue-800 text-xs font-semibold mb-1">ข้อกำหนดรหัสผ่าน:</h5>
            <ul className="text-blue-700 text-xs space-y-0.5">
              <li>• อย่างน้อย 8 ตัวอักษร</li>
              <li>• มีตัวอักษรพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว</li>
              <li>• มีตัวอักษรพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว</li>
              <li>• มีตัวเลข (0-9) อย่างน้อย 1 ตัว</li>
              <li>• มีอักขระพิเศษ (!@#$%^&* เป็นต้น) อย่างน้อย 1 ตัว</li>
            </ul>
          </div>
        )}
      </div>

      {/* บทบาท */}
      <div>
        <label className="block text-sm font-semibold text-gray-800">
          บทบาท <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
          className="w-full border rounded-md px-3 py-2 text-gray-900 
                     focus:ring-2 focus:ring-[#15803D] outline-none"
        >
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>
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

export default AddUserForm;
