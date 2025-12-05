import { useState } from "react";
import Card from "./Card";
import { FaSeedling, FaBug, FaDisease, FaChevronDown, FaFilter } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setFilter, resetFilters } from "../store/slices/varietiesSlice";

interface FilterSidebarProps {
  onResetSearch: () => void;
}

const SOIL_TYPES = ["ดินร่วน", "ดินร่วนทราย", "ดินร่วนเหนียว", "ดินทราย", "ดินเหนียว"];
const PEST_TYPES = ["หนอนเจาะลำต้น", "หนอนกออ้อย", "หวี่ขาว"];
const DISEASE_TYPES = ["เหี่ยวเน่าแดง", "โรคแส้ดำ", "โรคจุดใบเหลือง", "โรคกอตะไคร้", "โรคใบขาว"];

export default function FilterSidebar({ onResetSearch }: FilterSidebarProps) {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state) => state.varieties);

  // ฟังก์ชันลบ filter เดี่ยว
  const handleRemoveChip = (value: string) => {
    if (filters.soil.includes(value)) {
      dispatch(setFilter({ filterType: "soil", value }));
    }
    if (filters.pest.includes(value)) {
      dispatch(setFilter({ filterType: "pest", value }));
    }
    if (filters.disease.includes(value)) {
      dispatch(setFilter({ filterType: "disease", value }));
    }
  };

  const [open, setOpen] = useState({
    soil: true,
    pest: false,
    disease: false,
  });

  const toggle = (key: keyof typeof open) => {
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFilterChange = (
    filterType: "soil" | "pest" | "disease",
    value: string
  ) => {
    dispatch(setFilter({ filterType, value }));
  };

  const handleResetAll = () => {
    dispatch(resetFilters());
    onResetSearch();
  };

  // ...Card component moved to Card.tsx...

  return (
    <div className="w-80 flex-shrink-0 bg-white rounded-xl shadow-lg flex flex-col max-h-[calc(100vh-10rem)] sticky top-24">
      {/* Header - Sticky within the sidebar */}
      <div className="bg-white rounded-t-xl p-5 border-b border-gray-100">
        {/* Header */}
        <div className="flex items-start justify-between">
          
          {/* Left: Icon + Title */}
          <div className="flex items-center gap-3">
            
            {/* Circle Icon */}
            <div className="w-12 h-12 rounded-full bg-[#1D724A] flex items-center justify-center text-white">
              <FaFilter size={18} />
            </div>

            {/* Text */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 leading-tight">
                ตัวกรอง
              </h3>
              <p className="text-sm text-gray-500">
                {filters.soil.length + filters.pest.length + filters.disease.length} รายการที่เลือก
              </p>
            </div>

          </div>

          {/* Right: Reset */}
          <button
            onClick={handleResetAll}
            className="text-sm text-red-500 hover:text-red-600"
          >
            ล้าง
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-5 overflow-y-auto flex-1">

        {/* Soil */}
        <div className="mb-5">
          <Card
            title="ลักษณะดิน"
            icon={<FaSeedling className="text-[#1D724A]" />}
            color="bg-[#1D724A]/5"
            isOpen={open.soil}
            onToggle={() => toggle("soil")}
          >
            {SOIL_TYPES.map((soil) => (
              <label key={soil} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.soil.includes(soil)}
                  onChange={(e) => handleFilterChange("soil", e.target.value)}
                  value={soil}
                  className="accent-green-600"
                />
                <span>{soil}</span>
              </label>
            ))}
          </Card>
        </div>

        {/* Pest */}
        <div className="mb-5">
          <Card
            title="ต้านทานแมลง"
            icon={<FaBug className="text-orange-500" />}
            color="bg-orange-50"
            isOpen={open.pest}
            onToggle={() => toggle("pest")}
          >
            {PEST_TYPES.map((pest) => (
              <label key={pest} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.pest.includes(pest)}
                  onChange={(e) => handleFilterChange("pest", e.target.value)}
                  value={pest}
                  className="accent-green-600"
                />
                <span>{pest}</span>
              </label>
            ))}
          </Card>
        </div>

        {/* Disease */}
        <div className="mb-5">
          <Card
            title="ต้านทานโรค"
            icon={<FaDisease className="text-blue-500" />}
            color="bg-blue-50"
            isOpen={open.disease}
            onToggle={() => toggle("disease")}
          >
            {DISEASE_TYPES.map((disease) => (
              <label key={disease} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.disease.includes(disease)}
                  onChange={(e) => handleFilterChange("disease", e.target.value)}
                  value={disease}
                  className="accent-green-600"
                />
                <span>{disease}</span>
              </label>
            ))}
          </Card>
        </div>

        {/* ================= Selected Filters Chips ================= */}
        {(filters.soil.length > 0 ||
          filters.pest.length > 0 ||
          filters.disease.length > 0) && (
          <div className="mt-4 pt-3 border-t space-y-2">
            <div className="flex flex-wrap gap-2">
              {[...filters.soil, ...filters.pest, ...filters.disease].map(
                (item) => (
                  <span
                    key={item}
                    className="
                      flex items-center gap-2
                      bg-[#1D724A]/10
                      text-[#1D724A]
                      px-4 py-1.5
                      rounded-full
                      text-sm
                      font-medium
                    "
                  >
                    {item}
                    <button
                      onClick={() => handleRemoveChip(item)}
                      className="
                        text-[#1D724A]
                        hover:text-red-500
                        transition
                      "
                    >
                      ✕
                    </button>
                  </span>
                )
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
