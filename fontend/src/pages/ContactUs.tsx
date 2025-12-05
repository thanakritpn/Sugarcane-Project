import React from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

function ContactUs() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(() => !!(localStorage.getItem('user')));
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('favorites');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setShowLoginModal(true)}
        onCartClick={() => {}}
        onLogoutClick={handleLogout}
        forceSolid={true}
      />

      <div className="pt-[100px] pb-12 bg-gradient-to-br from-green-100 to-green-200 min-h-screen">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">ติดต่อเรา</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Member 1 */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">จีรนันท์ ปรากฎหาญ</h2>
              <div className="space-y-3 text-gray-600">
                <div>
                  <p className="text-sm font-semibold text-gray-500">รหัสนักศึกษา</p>
                  <p className="text-lg">1650703935</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">อีเมล</p>
                  <a
                    href="mailto:jeeranan.prak@bumail.net"
                    className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                  >
                    jeeranan.prak@bumail.net
                  </a>
                </div>
              </div>
            </div>

            {/* Member 2 */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">อารยา ไช่</h2>
              <div className="space-y-3 text-gray-600">
                <div>
                  <p className="text-sm font-semibold text-gray-500">รหัสนักศึกษา</p>
                  <p className="text-lg">1650703828</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">อีเมล</p>
                  <a
                    href="mailto:araya.tsai@bumail.net"
                    className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                  >
                    araya.tsai@bumail.net
                  </a>
                </div>
              </div>
            </div>

            {/* Member 3 */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">ธนกฤต เพ็ชรนก</h2>
              <div className="space-y-3 text-gray-600">
                <div>
                  <p className="text-sm font-semibold text-gray-500">รหัสนักศึกษา</p>
                  <p className="text-lg">1650702085</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">อีเมล</p>
                  <a
                    href="mailto:thanakrit.petn@bumail.net"
                    className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                  >
                    thanakrit.petn@bumail.net
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ContactUs;
