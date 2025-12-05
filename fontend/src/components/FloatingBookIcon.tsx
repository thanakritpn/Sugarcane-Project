import React from 'react';
import { FaBook } from 'react-icons/fa';

const FloatingBookIcon: React.FC<{ count?: number; onClick?: () => void }> = ({ count, onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label="รายการที่ถูกใจ"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1D724A] text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-transform transform hover:scale-105"
    >
      <FaBook className="w-6 h-6" />
      {typeof count === 'number' && count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
          {count}
        </span>
      )}
    </button>
  );
};

export default FloatingBookIcon;
