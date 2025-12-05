import { NavLink } from "react-router-dom";
import { FaSeedling, FaSignOutAlt } from "react-icons/fa";

export default function Header({
  query,
  setQuery,
  onLogout,
}: {
  query: string;
  setQuery: (value: string) => void;
  onLogout: () => void;
}) {
  const menuClass = ({ isActive }: { isActive: boolean }) =>
    `relative pb-1 transition
     ${isActive 
        ? "border-b-2 border-white text-white"
        : "text-white/80 hover:text-white"
     }`;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#1D724A]">
      <div className="container mx-auto px-6 h-[72px] flex items-center justify-between text-white">

        {/* LEFT */}
        <div className="flex items-center gap-8">

          {/* LOGO */}
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shadow">
              <FaSeedling className="text-white text-lg" />
            </div>
            <span className="text-lg font-semibold tracking-wide">
              Thai Sugarcane
            </span>
          </NavLink>

          {/* MENUS */}
          <nav className="flex items-center h-full gap-6 text-sm font-medium pt-[1px]">

            <NavLink to="/users" className={menuClass}>
              คลังสินค้า
            </NavLink>

            <NavLink to="/orders" className={menuClass}>
              รายการสั่งซื้อ
            </NavLink>

          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหา..."
            className="
              w-[360px] px-4 py-2 rounded-lg
              border border-white/30 bg-white/10
              text-white placeholder-white/70
              focus:outline-none focus:ring-2 focus:ring-white
            "
          />

          <button
            onClick={onLogout}
            className="
              text-xl text-white/80 hover:text-red-300
              transition
            "
          >
            <FaSignOutAlt />
          </button>
        </div>

      </div>
    </header>
  );
}
