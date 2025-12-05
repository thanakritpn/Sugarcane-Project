import React from 'react';

interface SearchBarProps {
  searchText: string;
  setSearchText: (text: string) => void;
  handleSearch: () => void;
  onScrollClick?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchText,
  setSearchText,
  handleSearch,
  onScrollClick,
}) => (
  <div className="max-w-xl mx-auto w-full">
    
    {/* ================= Search Bar ================= */}
    <div className="rounded-full border-2 border-[#16a34a]">
      <div className="relative bg-white/95 backdrop-blur-sm rounded-full">

        {/* Input */}
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="คิดหาพันธุ์อ้อย เช่น ทนแล้ง, ดินเหนียว..."
          className="
            w-full
            pl-6 pr-16 py-3
            text-base
            rounded-full
            border-0
            shadow-lg
            focus:outline-none
            focus:ring-0
            text-gray-700
            bg-white/95
            backdrop-blur-sm
            placeholder-gray-500
          "
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="
            absolute right-2 top-1/2 transform -translate-y-1/2
            p-2 rounded-full
            bg-[#16a34a] hover:bg-[#15803d]
            transition-colors shadow-md
          "
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

      </div>
    </div>


{/* ================= Scroll Arrow ================= */}
        <div className="flex justify-center mt-14">
        <button
            onClick={onScrollClick}
            aria-label="Scroll down"
            className="
            w-8 h-8
            flex items-center justify-center
            border border-white/60
            rounded-full
            text-white/60
            bg-transparent
            hover:text-white hover:border-white
            transition-all
            animate-bounce
            "
        >
            <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
            />
            </svg>
        </button>
        </div>





  </div>
);

export default SearchBar;
