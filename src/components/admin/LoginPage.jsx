import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../lib/hooks/useAuth'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login') // 'login' or 'forgot'
  const { signIn, resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'login') {
        await signIn(email, password)
        toast.success('Logged in successfully')
        navigate('/')
      } else {
        await resetPassword(email)
        toast.success('Password reset email sent! Check your inbox.')
        setMode('login')
      }
    } catch (error) {
      console.error('Auth error:', error)
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === 'login' ? 'Admin Login' : 'Reset Password'}
          </h1>
          <p className="text-slate-600 mt-2">Drumshanbo Music Library</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-irish-green focus:border-irish-green outline-none transition-colors"
              placeholder="admin@example.com"
            />
          </div>

          {mode === 'login' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-irish-green focus:border-irish-green outline-none transition-colors"
                placeholder="Enter your password"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-irish-green text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? (mode === 'login' ? 'Signing in...' : 'Sending...')
              : (mode === 'login' ? 'Sign In' : 'Send Reset Link')}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={() => setMode(mode === 'login' ? 'forgot' : 'login')}
            className="text-sm text-irish-green hover:underline transition-colors"
          >
            {mode === 'login' ? 'Forgot your password?' : 'Back to login'}
          </button>
          <div>
            <Link
              to="/"
              className="text-sm text-slate-600 hover:text-irish-green transition-colors"
            >
              &larr; Back to catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
