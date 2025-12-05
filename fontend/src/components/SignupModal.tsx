import React, { useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSignup: (email: string) => void;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
};

const SignupModal: React.FC<Props> = ({ isOpen, onClose, onSignup, onShowToast }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation functions
  const validatePassword = (pwd: string): { valid: boolean; message: string } => {
    if (pwd.length < 8) {
      return { valid: false, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' };
    }
    if (!/[a-z]/.test(pwd)) {
      return { valid: false, message: 'รหัสผ่านต้องมีตัวอักษรพิมพ์เล็ก (a-z)' };
    }
    if (!/[A-Z]/.test(pwd)) {
      return { valid: false, message: 'รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่ (A-Z)' };
    }
    if (!/[0-9]/.test(pwd)) {
      return { valid: false, message: 'รหัสผ่านต้องมีตัวเลข (0-9)' };
    }
    if (!/[!@#$%^&*]/.test(pwd)) {
      return { valid: false, message: 'รหัสผ่านต้องมีอักขระพิเศษ (!@#$%^&*)' };
    }
    return { valid: true, message: '' };
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('กรุณากรอกข้อมูลทั้งหมด');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('กรุณาใส่อีเมลที่ถูกต้อง');
      return;
    }

    if (username.trim().length < 3) {
      setError('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      return;
    }

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      setLoading(true);
      const resp = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          username: username.trim(),
          name: name.trim(),
          password,
          confirmPassword
        }),
      });

      if (!resp.ok) {
        const data = await resp.json();
        setError(data.error || 'เกิดข้อผิดพลาดในการสมัคร');
        return;
      }

      const data = await resp.json();
      // Store user info locally
      try {
        localStorage.setItem('user', JSON.stringify({ email: data.email, id: data.id }));
      } catch (e) {
        // ignore
      }
      onShowToast?.('สมัครสมาชิกสำเร็จ', 'success');
      onSignup(data.email);
    } catch (err) {
      console.error('Signup request failed', err);
      setError('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">สมัครสมาชิก</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">สร้างบัญชีใหม่เพื่อใช้ฟีเจอร์ครบวงจร</p>

        <form onSubmit={handleSubmit}>

            <label className="block text-sm font-medium text-gray-700">ชื่อผู้ใช้</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              placeholder="กรอกชื่อผู้ใช้"
              className="w-full mt-1 mb-3 px-3 py-2 border border-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
              autoFocus
            />

            <label className="block text-sm font-medium text-gray-700">อีเมล</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="กรอกอีเมล"
              className="w-full mt-1 mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
            />

          <label className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="กรอกรหัสผ่าน (อย่างน้อย 8 ตัว ผสม ตัวใหญ่-เล็ก ตัวเลข และอักขระพิเศษ)"
            className="w-full mt-1 mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
          />
          <p className="text-xs text-gray-500 mb-3">
            ✓ อย่างน้อย 8 ตัวอักษร ✓ ผสมตัวอักษรพิมพ์เล็ก ✓ ผสมตัวอักษรพิมพ์ใหญ่ ✓ ผสมตัวเลข ✓ ผสมอักขระพิเศษ (!@#$%^&*)
          </p>

          <label className="block text-sm font-medium text-gray-700">ยืนยันรหัสผ่าน</label>
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            placeholder="กรอกรหัสผ่านอีกครั้ง"
            className="w-full mt-1 mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
          />

          {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-[#1D724A] text-white hover:bg-[#155838] disabled:opacity-50"
          >
            {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupModal;
