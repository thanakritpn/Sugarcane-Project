import { useState, type FormEvent } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import ContentManager from "./ContentManager";
import UserManager from "./pages/UserManager";
import ShopManager from "./pages/ShopManager";
import ToastContainer, { useToast } from "./components/ToastContainer";
import ShopRegisterModal from "./components/ShopRegisterModal";

import bgUrl from "./assets/bg.jpg";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [shopData, setShopData] = useState<any>(null);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Call shop authentication API
      const response = await fetch('http://localhost:5001/api/shops/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }
      
      // Successful login
      setShopData(data.data);
      setIsLoggedIn(true);
      setPassword("");
      addToast(`ยินดีต้อนรับ ${data.data.shopName}`, 'success');
      
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // ---------------- LOGIN PAGE ----------------
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen relative">
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-sm"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bgUrl})`,
          }}
        />

        <div className="flex items-center justify-center min-h-screen relative z-10 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-white/20">
            {/* Logo and Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#16A34A] to-[#15803D] rounded-xl mb-3 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                ร้านค้าอ้อย
              </h2>
              <p className="text-gray-600 text-xs">
                ระบบจัดการร้านค้าอ้อย - เข้าสู่ระบบสำหรับเจ้าของร้าน
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    อีเมล
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="กรอกอีเมลของร้าน"
                      disabled={isLoading}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent text-gray-900 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    รหัสผ่าน
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่าน"
                      disabled={isLoading}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent text-gray-900 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-red-800 font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 transform
                  ${isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-[#16A34A] to-[#15803D] hover:from-[#15803D] hover:to-[#1D724A] hover:shadow-lg hover:scale-[1.02]'
                  }
                `}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>กำลังตรวจสอบ...</span>
                  </div>
                ) : (
                  'เข้าสู่ระบบ'
                )}
              </button>
            </form>

            {/* Register Button */}
            <div className="mt-4 text-center">
              <p className="text-gray-600 text-xs mb-3">
                ยังไม่มีบัญชีร้านค้า?
              </p>
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="w-full py-2 bg-white border-2 border-[#16A34A] text-[#16A34A] text-sm font-semibold rounded-lg hover:bg-[#16A34A] hover:text-white transition-all duration-200 transform hover:scale-[1.02]"
              >
                สมัครสมาชิกร้านค้า
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-blue-800 font-semibold text-xs">หมายเหตุ:</h4>
                  <p className="text-blue-700 text-xs mt-1">
                    เฉพาะร้านค้าที่ลงทะเบียนแล้วเท่านั้นที่สามารถเข้าถึงระบบจัดการได้
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Register Modal */}
        <ShopRegisterModal 
          isOpen={showRegisterModal}
          onClose={() => {
            console.log('Closing modal');
            setShowRegisterModal(false);
          }}
          onSuccess={(message) => {
            addToast(message, 'success');
            setShowRegisterModal(false);
          }}
        />
        
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </div>
    );
  }

  // ---------------- DASHBOARD ----------------
  return (
    <BrowserRouter>
      <Header 
        query={searchQuery}
        setQuery={setSearchQuery}
        onLogout={() => setIsLoggedIn(false)}
      />
      <Routes>
        <Route path="/" element={<ContentManager onLogout={() => {
          setIsLoggedIn(false);
          setShopData(null);
          setEmail("");
          setPassword("");
          setError("");
          addToast('ออกจากระบบเรียบร้อยแล้ว', 'success');
        }} />} />
        <Route path="/users" element={<UserManager />} />
        <Route path="/content" element={<ContentManager onLogout={() => {
          setIsLoggedIn(false);
          setShopData(null);
          setEmail("");
          setPassword("");
          setError("");
          addToast('ออกจากระบบเรียบร้อยแล้ว', 'success');
        }} />} />
        <Route path="/stores" element={<ShopManager />} />
      </Routes>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </BrowserRouter>
  );
}

export default App;
