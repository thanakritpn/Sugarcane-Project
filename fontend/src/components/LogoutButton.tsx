import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';

const LogoutButton: React.FC = () => {
  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
    } catch (e) {
      // ignore
    }
    // dispatch event in case other parts want to listen
    try {
      window.dispatchEvent(new CustomEvent('app:logout'));
    } catch (e) {}
    // reload to let app re-read login state
    window.location.reload();
  };

  return (
    <button
      onClick={handleLogout}
      title="ออกจากระบบ"
      className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/90 hover:bg-white shadow-md text-gray-700"
      aria-label="Logout"
    >
      <FaSignOutAlt size={18} />
    </button>
  );
};

export default LogoutButton;
