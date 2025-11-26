import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string) => void;
};

const LoginModal: React.FC<Props> = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    try {
      const resp = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!resp.ok) {
        if (resp.status === 401) {
          setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        } else {
          setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        }
        return;
      }

  const data = await resp.json();
  // store minimal user info locally (include id returned from backend)
  try { localStorage.setItem('user', JSON.stringify({ email: data.email, id: data.id })); } catch {}
  onLogin(data.email);
    } catch (err) {
      console.error('Login request failed', err);
      setError('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">เข้าสู่ระบบ</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">กรุณาเข้าสู่ระบบเพื่อใช้ฟีเจอร์ถูกใจ</p>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
            autoFocus
          />

          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="w-full mt-1 mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
          />

          {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

          <button type="submit" className="w-full py-2 rounded-lg bg-[#16a34a] text-white hover:bg-[#15803d]">เข้าสู่ระบบ</button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-2">ยังไม่มีบัญชี?</p>
          <a 
            href="#signup" 
            className="text-sm text-[#16a34a] font-semibold hover:underline"
          >
            สมัครสมาชิก
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
