import React from 'react';
import EditVarietyForm from './EditVarietyForm';
import AddVarietyForm from './AddVarietyForm';

type MenuItem = {
  _id?: string;
  name: string;
  description?: string;
  soil_type?: string;
  pest?: string[];
  disease?: string[];
  yield?: string;
  age?: string;
  sweetness?: string;
  variety_image?: string;
  parent_varieties?: string;
  growth_characteristics?: string[];
  planting_tips?: string[];
  suitable_for?: string[];
};

type VarietyModalProps = {
  mode: 'add' | 'edit';
  isOpen: boolean;
  onClose: () => void;
  formData: MenuItem;
  setFormData: (data: MenuItem) => void;
  selectedImagePreview: string | null;
  selectedImageFile: File | null;
  setSelectedImageFile: (file: File | null) => void;
  onSubmit: () => void;
};

// AddVarietyForm and EditVarietyForm include their own SectionTitle and ArrayInput helpers

const VarietyModal: React.FC<VarietyModalProps> = ({
  mode,
  isOpen,
  onClose,
  formData,
  setFormData,
  selectedImagePreview,
  setSelectedImageFile,
  onSubmit,
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
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'add' ? 'เพิ่มพันธุ์อ้อยใหม่' : 'แก้ไขพันธุ์อ้อย'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 60px)' }}>
          <div className="px-5 py-3">
            {mode === 'add' ? (
              <AddVarietyForm
                formData={formData}
                setFormData={setFormData}
                selectedImagePreview={selectedImagePreview}
                setSelectedImageFile={setSelectedImageFile}
                onSubmit={onSubmit}
              />
            ) : (
              <EditVarietyForm
                formData={formData}
                setFormData={setFormData}
                selectedImagePreview={selectedImagePreview}
                setSelectedImageFile={setSelectedImageFile}
                onSubmit={onSubmit}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VarietyModal;
