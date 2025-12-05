import React, { useState, useEffect } from "react";
import { FaSeedling, FaShoppingCart, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onCartClick: () => void;      // กดตะกร้า
  onLogoutClick: () => void;    // กด logout
  cartCount?: number;           // จำนวนสินค้าในรถเข็น
  forceSolid?: boolean;         // บังคับพื้นหลังสีเขียวทึบตลอด
}

const Header: React.FC<HeaderProps> = ({
  isLoggedIn,
  onLoginClick,
  onCartClick,
  onLogoutClick,
  cartCount = 0,
  forceSolid = false,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <div
        className={`
          container mx-auto px-6 h-[72px]
          flex items-center justify-between
          text-white transition-all duration-300
          ${forceSolid ? "bg-[#1D724A]" : isScrolled ? "bg-[#1D724A]/90 backdrop-blur-md" : "bg-transparent"}
        `}
      >
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1D724A] rounded-full flex items-center justify-center shadow">
            <FaSeedling className="text-white text-lg" />
          </div>
          <span className="text-lg font-semibold tracking-wide">
            Thai Sugarcane
          </span>
        </div>

        {/* MENU + RIGHT ICONS */}
        <nav className="flex items-center gap-8 text-sm font-medium">
          <span onClick={() => navigate("/")} className="cursor-pointer hover:underline">หน้าแรก</span>
          <span onClick={() => navigate("/contact")} className="cursor-pointer hover:underline">ติดต่อเรา</span>

          {isLoggedIn ? (
            <div className="flex items-center gap-5 text-white/80">
              {/* ตะกร้าสินค้า */}
              <button
                type="button"
                onClick={onCartClick}
                className="text-xl hover:text-white transition relative"
                title="ตะกร้าสินค้า"
              >
                <FaShoppingCart />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={onLogoutClick}
                className="text-xl hover:text-red-300 transition"
                title="ออกจากระบบ"
              >
                <FaSignOutAlt />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="
                px-4 py-2 rounded-xl
                bg-white/90 text-[#1D724A]
                hover:bg-white transition
                font-semibold text-sm
              "
            >
              เข้าสู่ระบบ
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
