import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../lib/hooks/useAuth'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { updatePassword, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if not in a password reset session
  useEffect(() => {
    // Give Supabase a moment to process the token from the URL
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        toast.error('Invalid or expired reset link')
        navigate('/login')
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await updatePassword(password)
      toast.success('Password updated successfully!')
      navigate('/')
    } catch (error) {
      console.error('Password update error:', error)
      toast.error(error.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Set New Password</h1>
          <p className="text-slate-600 mt-2">Drumshanbo Music Library</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-irish-green focus:border-irish-green outline-none transition-colors"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-irish-green focus:border-irish-green outline-none transition-colors"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-irish-green text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-slate-600 hover:text-irish-green transition-colors"
          >
            &larr; Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
