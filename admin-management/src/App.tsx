import { useState, type FormEvent } from 'react'
import ContentManager from './ContentManager'
import bgUrl from './assets/bg.jpg'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (username === 'admin' && password === 'admin') {
      setError('')
      setIsLoggedIn(true)
      setPassword('')
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    }
  }

  if (isLoggedIn) {
    return (
      <ContentManager
        onLogout={() => {
          setIsLoggedIn(false)
          setUsername('')
          setPassword('')
          setError('')
        }}
      />
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* BG */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${bgUrl})`
        }}
      />

      <div className="flex items-center justify-center min-h-screen relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-center mb-6 text-[#16A34A]">
            เข้าสู่ระบบ
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-gray-900"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white py-2 rounded-md transition font-semibold text-gray-900"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App
