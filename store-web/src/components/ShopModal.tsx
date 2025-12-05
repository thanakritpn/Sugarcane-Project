import React from 'react';
import AddShopForm from './AddShopForm';

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

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ShopFormData;
  setFormData: (data: ShopFormData) => void;
  selectedImagePreview: string | null;
  selectedImageFile: File | null;
  setSelectedImageFile: (file: File | null) => void;
  onSubmit: () => void;
  title?: string;
  submitButtonText?: string;
  isEditMode?: boolean;
}

const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  selectedImagePreview,
  setSelectedImageFile,
  onSubmit,
  title = 'เพิ่มร้านค้าใหม่',
  submitButtonText = 'บันทึกร้านค้า',
  isEditMode = false,
}) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
        w-[90%] max-w-xl bg-white rounded-lg shadow-2xl z-50 transition-all duration-300 max-h-[85vh]
        ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-5 py-3 rounded-t-lg flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 60px)' }}>
          <div className="px-5 py-3">
            <AddShopForm
              formData={formData}
              setFormData={setFormData}
              selectedImagePreview={selectedImagePreview}
              setSelectedImageFile={setSelectedImageFile}
              onSubmit={onSubmit}
              submitButtonText={submitButtonText}
              isEditMode={isEditMode}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopModal;
