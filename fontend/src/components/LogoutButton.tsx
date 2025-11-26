import React, { useState } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';

const LogoutButton: React.FC = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Clear all user data from localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('favorites');
      
      // Dispatch logout event
      try {
        window.dispatchEvent(new CustomEvent('app:logout'));
      } catch (e) {
        console.error('Error dispatching logout event:', e);
      }
      
      // Wait a moment then reload to ensure everything is cleared
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (e) {
      console.error('Logout error:', e);
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      title="ออกจากระบบ"
      className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/90 hover:bg-white shadow-md text-gray-700 hover:text-red-600 transition-colors disabled:opacity-50"
      aria-label="Logout"
    >
      <FaSignOutAlt size={18} />
    </button>
  );
};

export default LogoutButton;
