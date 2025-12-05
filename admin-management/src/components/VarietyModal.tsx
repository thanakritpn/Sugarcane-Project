import React from 'react';

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

const SectionTitle = ({ title }: { title: string }) => (
  <h4 className="text-sm font-semibold text-gray-800 mt-6 mb-2">{title}</h4>
);

const ArrayInput = ({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[] | undefined;
  onChange: (updated: string[]) => void;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-800 mb-1">{label}</label>

    <div className="space-y-2">
      {(values || []).map((item, idx) => (
        <div key={idx} className="flex gap-2">
          <input
            className="flex-1 border rounded-md px-3 py-2 text-gray-900 
                       focus:ring-2 focus:ring-[#15803D] outline-none"
            value={item}
            onChange={(e) => {
              const updated = [...(values || [])];
              updated[idx] = e.target.value;
              onChange(updated);
            }}
          />
          <button
            onClick={() => onChange((values || []).filter((_, i) => i !== idx))}
            className="px-2 py-2 text-red-600 hover:bg-red-100 rounded-md"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        onClick={() => onChange([...(values || []), ''])}
        className="w-full border-2 border-dashed border-gray-300 rounded-md px-3 py-2 text-gray-600 hover:bg-gray-50"
      >
        + เพิ่ม
      </button>
    </div>
  </div>
);

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
        w-[480px] bg-white rounded-xl shadow-2xl z-50 transition-all duration-300
        ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-xl flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">
            {mode === 'add' ? 'เพิ่มพันธุ์อ้อยใหม่' : 'แก้ไขพันธุ์อ้อย'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[80vh] overflow-auto px-6 pb-6 space-y-4">

          {/* Image Upload */}
          <SectionTitle title="รูปภาพพันธุ์อ้อย" />

          <div className="relative h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden text-gray-500 bg-gray-50 hover:bg-gray-100 transition">
            {(selectedImagePreview || formData.variety_image) ? (
              <img
                src={
                  selectedImagePreview ||
                  `http://localhost:5001/images/variety/${formData.variety_image}`
                }
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <label className="cursor-pointer flex items-center justify-center w-full h-full">
                คลิกเพื่ออัปโหลด
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
            )}
          </div>

          {/* Basic Info */}
          <SectionTitle title="ข้อมูลพื้นฐาน" />

          {/* ชื่อพันธุ์อ้อย */}
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              ชื่อพันธุ์อ้อย <span className="text-red-500">*</span>
            </label>

            <input
              className="w-full border rounded-md px-3 py-2 mt-1 text-gray-900 
                         focus:ring-2 focus:ring-[#15803D] outline-none"
              placeholder="เช่น เค 88-92"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <p className="text-xs text-gray-500 mt-1">
              กรอกชื่อพันธุ์อ้อย เช่น เค 88-92 หรือพันธุ์อื่น ๆ
            </p>
          </div>

          {/* พันธุ์แม่พ่อ */}
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              พันธุ์แม่พ่อ
            </label>

            <input
              className="w-full border rounded-md px-3 py-2 mt-1 text-gray-900 
                         focus:ring-2 focus:ring-[#15803D] outline-none"
              placeholder="เช่น F143 (แม่) X ROC1 (พ่อ)"
              value={formData.parent_varieties || ''}
              onChange={(e) =>
                setFormData({ ...formData, parent_varieties: e.target.value })
              }
            />

            <p className="text-xs text-gray-500 mt-1">
              หากทราบสายพันธุ์แม่และพ่อ สามารถระบุเพื่อความครบถ้วนของข้อมูล
            </p>
          </div>

          {/* ดินที่เหมาะสม */}
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              ดินที่เหมาะสม <span className="text-red-500">*</span>
            </label>

            <select
              className="w-full border rounded-md px-3 py-2 mt-1 text-gray-900 
                         focus:ring-2 focus:ring-[#15803D] outline-none"
              value={formData.soil_type || ''}
              onChange={(e) =>
                setFormData({ ...formData, soil_type: e.target.value })
              }
            >
              <option value="">-- เลือกชนิดดิน --</option>
              <option value="ดินเหนียว">ดินเหนียว</option>
              <option value="ดินร่วนเหนียว">ดินร่วนเหนียว</option>
              <option value="ดินร่วน">ดินร่วน</option>
              <option value="ดินร่วนทราย">ดินร่วนทราย</option>
              <option value="ดินทราย">ดินทราย</option>
            </select>

            <p className="text-xs text-gray-500 mt-1">
              เลือกชนิดของดินที่เหมาะกับการปลูกพันธุ์อ้อยนี้
            </p>
          </div>

          {/* คำอธิบาย */}
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              คำอธิบาย
            </label>

            <textarea
              className="w-full border rounded-md px-3 py-2 mt-1 h-20 text-gray-900 
                         focus:ring-2 focus:ring-[#15803D] outline-none"
              placeholder="คำอธิบายพันธุ์อ้อย"
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <p className="text-xs text-gray-500 mt-1">
              ระบุรายละเอียดเพิ่มเติม เช่น จุดเด่น ความเหมาะสม และข้อมูลสำคัญของพันธุ์อ้อย
            </p>
          </div>

          {/* Numeric Section */}
          <SectionTitle title="ข้อมูลเชิงตัวเลข" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-800">
                ผลผลิต (ตัน/ไร่)
              </label>

              <input
                className="w-full border rounded-md px-3 py-2 mt-1 text-gray-900
                           focus:ring-2 focus:ring-[#15803D] outline-none"
                value={formData.yield}
                onChange={(e) =>
                  setFormData({ ...formData, yield: e.target.value })
                }
              />

              <p className="text-xs text-gray-500 mt-1">
                เช่น 15-16 ตัน/ไร่
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800">
                อายุ (เดือน)
              </label>

              <input
                className="w-full border rounded-md px-3 py-2 mt-1 text-gray-900
                           focus:ring-2 focus:ring-[#15803D] outline-none"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
              />

              <p className="text-xs text-gray-500 mt-1">
                เช่น 11-12 เดือน
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800">
                ความหวาน (Brix)
              </label>

              <input
                className="w-full border rounded-md px-3 py-2 mt-1 text-gray-900
                           focus:ring-2 focus:ring-[#15803D] outline-none"
                value={formData.sweetness}
                onChange={(e) =>
                  setFormData({ ...formData, sweetness: e.target.value })
                }
              />

              <p className="text-xs text-gray-500 mt-1">
                เช่น 10-12 Brix
              </p>
            </div>
          </div>

          {/* Array Inputs */}
          <SectionTitle title="ข้อมูลเพิ่มเติม" />

          <ArrayInput
            label="แมลงที่พบได้"
            values={formData.pest}
            onChange={(list) => setFormData({ ...formData, pest: list })}
          />

          <ArrayInput
            label="โรคที่อาจพบ"
            values={formData.disease}
            onChange={(list) => setFormData({ ...formData, disease: list })}
          />

          <ArrayInput
            label="ลักษณะการเจริญเติบโต"
            values={formData.growth_characteristics}
            onChange={(list) =>
              setFormData({ ...formData, growth_characteristics: list })
            }
          />

          <ArrayInput
            label="เคล็ดลับการปลูก"
            values={formData.planting_tips}
            onChange={(list) =>
              setFormData({ ...formData, planting_tips: list })
            }
          />

          <ArrayInput
            label="พื้นที่ที่เหมาะสม"
            values={formData.suitable_for}
            onChange={(list) =>
              setFormData({ ...formData, suitable_for: list })
            }
          />

          {/* Submit */}
          <button
            onClick={onSubmit}
            className="w-full bg-[#1D724A] hover:bg-[#155838] text-white 
                       font-semibold py-3 rounded-lg shadow-md mt-6 transition"
          >
            {mode === 'add' ? 'เพิ่มพันธุ์อ้อย' : 'บันทึกการแก้ไข'}
          </button>
        </div>
      </div>
    </>
  );
};

export default VarietyModal;
