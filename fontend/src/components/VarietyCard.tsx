import React from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

interface VarietyCardProps {
  item: {
    _id?: string;
    name: string;
    variety_image?: string;
    description?: string;

    // ===== เพิ่ม field จาก DB =====
    sweetness?: number;   // CCS
    yield?: number;       // ตัน/ไร่
    soil_type?: string;  // ประเภทดิน
  };

  isFavorite: boolean;
  onCardClick: (id: string | undefined) => void;
  onFavoriteClick: (e: React.MouseEvent, id: string | undefined) => void;
}

const VarietyCard: React.FC<VarietyCardProps> = ({
  item,
  isFavorite,
  onCardClick,
  onFavoriteClick,
}) => {
  return (
    <div
      onClick={() => onCardClick(item._id)}
      className="bg-white rounded-3xl shadow-md transition-all duration-300 overflow-hidden cursor-pointer hover:shadow-xl"
    >
      {/* ================= Image ================= */}
      <div className="relative h-64 overflow-hidden bg-gray-200">

        {/* CCS Badge */}
        {item.sweetness && (
          <div className="absolute top-3 left-3 z-20 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold shadow">
            CCS {item.sweetness}
          </div>
        )}

        {/* Favorite Heart */}
        <button
          onClick={(e) => onFavoriteClick(e, item._id)}
          aria-label={isFavorite ? 'ยกเลิกถูกใจ' : 'ถูกใจ'}
          className={`absolute top-3 right-3 z-20 p-2 rounded-full bg-white shadow
            ${isFavorite ? 'text-red-600' : 'text-gray-400'}
          `}
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </button>

        <img
          src={
            item.variety_image
              ? `http://localhost:5001/images/variety/${item.variety_image}`
              : '/sugarcane-bg.jpg'
          }
          alt={item.name}
          className="
            w-full h-full object-cover
            transition-transform duration-300 ease-in-out
            hover:scale-110
          "
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/sugarcane-bg.jpg';
          }}
        />
      </div>

      {/* ================= Details ================= */}
      <div className="p-5 bg-gradient-to-b from-white to-gray-50 space-y-2">

        {/* Title */}
        <h3 className="text-lg font-bold text-[#1D724A]">
          {item.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
          {item.description || 'ไม่มีรายละเอียด'}
        </p>

        {/* Stats */}
        <div className="flex gap-4 pt-1 text-sm text-gray-700">

          {item.yield !== undefined && (
            <div className="flex gap-1">
              🌱 <span>{item.yield} ตัน/ไร่</span>
            </div>
          )}

          {item.soil_type && (
            <div className="flex gap-1">
              💧 <span>{item.soil_type}</span>
            </div>
          )}

        </div>

        {/* Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCardClick(item._id);
          }}
          className="
            w-full mt-3 py-2
            border border-[#1D724A]
            text-[#1D724A]
            rounded-full
            font-semibold
            transition

            hover:bg-[#1D724A]
            hover:text-white
          "
        >
          ดูรายละเอียด
        </button>

      </div>
    </div>
  );
};

export default VarietyCard;
