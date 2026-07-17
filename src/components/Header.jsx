import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/hooks/useAuth'
import toast from 'react-hot-toast'

export default function Header({
  totalCDs = 0,
  totalBooks = 0,
  activeCatalog = 'CD',
  onCatalogChange,
  searchTerm = '',
  onSearchChange
}) {
  const { user, isAuthenticated, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const isHomePage = location.pathname === '/'
  const isReviewPage = location.pathname === '/review'

  const handleNavClick = (catalog) => {
    // If not on home page, navigate to home first
    if (!isHomePage) {
      navigate('/', { state: { catalogType: catalog } })
    }
    // Call onCatalogChange if provided (for when already on home page)
    if (onCatalogChange) {
      onCatalogChange(catalog)
    }
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50" style={{ backgroundColor: 'var(--color-header-bg)' }}>
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Logo */}
          <Link to="/" className="flex flex-col text-white">
            <span className="font-serif font-bold text-lg leading-tight">Drumshanbo</span>
            <span className="font-serif text-[10px] text-white/70 leading-tight">Music Library</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            <button
              onClick={() => handleNavClick('CD')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeCatalog === 'CD' && !isReviewPage
                  ? 'text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              style={activeCatalog === 'CD' && !isReviewPage ? { backgroundColor: 'var(--color-nav-active)' } : {}}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth={2} />
                <circle cx="12" cy="12" r="3" strokeWidth={2} />
              </svg>
              Albums
              <span className="text-xs opacity-70">({totalCDs})</span>
            </button>

            <button
              onClick={() => handleNavClick('Book')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeCatalog === 'Book' && !isReviewPage
                  ? 'text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              style={activeCatalog === 'Book' && !isReviewPage ? { backgroundColor: 'var(--color-nav-active)' } : {}}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Books
              <span className="text-xs opacity-70">({totalBooks})</span>
            </button>

            {/* Review tab - admin only */}
            {isAuthenticated && (
              <Link
                to="/review"
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isReviewPage
                    ? 'text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                style={isReviewPage ? { backgroundColor: 'var(--color-nav-active)' } : {}}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Review
              </Link>
            )}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search Bar - Desktop */}
          <div className="hidden md:block relative w-72">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search albums, artists..."
              className="w-full pl-10 pr-4 py-2 bg-white/15 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:border-white/40 focus:bg-white/20 transition-colors"
            />
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div
                  className="hidden sm:flex items-center justify-center w-8 h-8 rounded-md text-sm font-semibold text-white"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  {user?.email?.[0]?.toUpperCase() || 'A'}
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm text-white transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg text-sm text-white font-medium transition-colors"
                style={{ backgroundColor: 'var(--color-highlight)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-highlight-muted)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-highlight)'}
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t border-white/10"
            style={{ backgroundColor: 'var(--color-header-bg)' }}
          >
            <nav className="flex flex-col p-2">
              <button
                onClick={() => handleNavClick('CD')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${
                  activeCatalog === 'CD' && !isReviewPage
                    ? 'text-white bg-white/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth={2} />
                  <circle cx="12" cy="12" r="3" strokeWidth={2} />
                </svg>
                Albums
                <span className="text-xs opacity-70">({totalCDs})</span>
              </button>

              <button
                onClick={() => handleNavClick('Book')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${
                  activeCatalog === 'Book' && !isReviewPage
                    ? 'text-white bg-white/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Books
                <span className="text-xs opacity-70">({totalBooks})</span>
              </button>

              {isAuthenticated && (
                <Link
                  to="/review"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isReviewPage
                      ? 'text-white bg-white/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Review
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Mobile Search Bar */}
      <div
        className="md:hidden px-4 py-2 border-t border-white/10"
        style={{ backgroundColor: 'var(--color-header-bg)' }}
      >
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-white/15 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:border-white/40 focus:bg-white/20 transition-colors"
          />
        </div>
      </div>
    </>
  )
}
