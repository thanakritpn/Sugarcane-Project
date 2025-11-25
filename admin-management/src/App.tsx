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
    // Mock authentication: accept username=admin and password=admin
    if (username === 'admin' && password === 'admin') {
      setError('')
      setIsLoggedIn(true)
      // clear password for safety in UI
      setPassword('')
      console.log('Mock login success', { username })
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
      console.log('Mock login failed', { username })
    }
  }

  if (isLoggedIn) {
    // Render the content manager page after login
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
      {/* Background image with dark gradient + small blur */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${bgUrl})` }}
        aria-hidden="true"
      />

      <div className="flex items-center justify-center min-h-screen relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">เข้าสู่ระบบ</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
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
