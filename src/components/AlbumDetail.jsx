import { useEffect, useState } from 'react'
import { getImageUrl } from '../lib/storage'

export default function AlbumDetail({ album, onClose, onFilterClick, onEdit }) {
  const [imageError, setImageError] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  useEffect(() => {
    // Reset flip state when album changes
    setIsFlipped(false)
    setImageError(false)
  }, [album.id])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsFlipped(false)
      onClose()
    }
  }

  const handleFilterAndClose = (filterType, value) => {
    onClose()
    onFilterClick(filterType, value)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-xl shadow-2xl"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        {/* Close Button & Edit Button */}
        <div className="sticky top-4 float-right mr-4 flex gap-2 z-10">
          {onEdit && (
            <button
              onClick={onEdit}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-text-inverse)' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-secondary)'}
              title="Edit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => {
              setIsFlipped(false)
              onClose()
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-colors"
            style={{ backgroundColor: 'var(--color-neutral-light)', color: 'var(--color-text-muted)' }}
          >
            ×
          </button>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Album Cover */}
            <div>
              <div
                className={`flip-card aspect-square ${album.trackList && album.trackList.length > 0 ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (album.trackList && album.trackList.length > 0) {
                    setIsFlipped(!isFlipped)
                  }
                }}
              >
                <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
                  {/* Front - Album Cover */}
                  <div className="flip-card-front">
                    <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg overflow-hidden shadow-lg">
                      {!imageError ? (
                        <img
                          src={getImageUrl(album.image)}
                          alt={album.title}
                          onError={() => setImageError(true)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <div className="text-center">
                            <div className="text-8xl mb-4">💿</div>
                            <div className="text-lg">No cover available</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hover Indicator - Only show if trackList exists */}
                    {album.trackList && album.trackList.length > 0 && (
                      <div className="flip-indicator">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Back - Track List */}
                  {album.trackList && album.trackList.length > 0 && (
                    <div className="flip-card-back">
                      <div
                        className="aspect-square rounded-lg shadow-lg p-4 sm:p-6 overflow-y-auto"
                        style={{ backgroundColor: 'var(--color-bg-card)' }}
                      >
                        <h3
                          className="text-lg font-bold mb-4"
                          style={{ color: 'var(--color-text)' }}
                        >
                          Track List
                        </h3>
                        <ol className="space-y-1">
                          {album.trackList.map((track, idx) => (
                            <li key={idx} className="text-sm">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleFilterAndClose('track', track)
                                }}
                                className="text-left w-full hover:underline transition-colors py-1"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                {track}
                              </button>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Streaming Links */}
              {(album.links?.spotify || album.links?.appleMusic || album.links?.website) && (
                <div className="mt-4 space-y-2">
                  {album.links.spotify && (
                    <a
                      href={album.links.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 px-4 text-white rounded-lg text-center text-sm font-medium transition-colors"
                      style={{ backgroundColor: '#1DB954' }}
                    >
                      Listen on Spotify
                    </a>
                  )}
                  {album.links.appleMusic && (
                    <a
                      href={album.links.appleMusic}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 px-4 text-white rounded-lg text-center text-sm font-medium transition-colors"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      Listen on Apple Music
                    </a>
                  )}
                  {album.links.website && (
                    <a
                      href={album.links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 px-4 text-white rounded-lg text-center text-sm font-medium transition-colors"
                      style={{ backgroundColor: 'var(--color-secondary)' }}
                    >
                      Visit Website
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Album Details */}
            <div>
              <h2
                className="text-2xl sm:text-3xl font-bold mb-2 font-serif"
                style={{ color: 'var(--color-text)' }}
              >
                {album.title}
              </h2>

              {/* Artists */}
              <div className="mb-4">
                <h3
                  className="text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Artists
                </h3>
                <div className="flex flex-wrap gap-2">
                  {album.artists.map((artist, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleFilterAndClose('artist', artist)}
                      className="badge cursor-pointer transition-colors"
                      style={{ backgroundColor: 'var(--color-secondary-light)', color: 'var(--color-secondary)' }}
                    >
                      {artist}
                    </button>
                  ))}
                </div>
              </div>

              {/* Publisher & Year */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3
                    className="text-sm font-medium mb-1"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Publisher
                  </h3>
                  <button
                    onClick={() => handleFilterAndClose('publisher', album.publisher)}
                    className="hover:underline transition-colors"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {album.publisher}
                  </button>
                </div>
                <div>
                  <h3
                    className="text-sm font-medium mb-1"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Year
                  </h3>
                  <button
                    onClick={() => handleFilterAndClose('year', album.year)}
                    className="hover:underline transition-colors"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {album.year}
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h3
                  className="text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Description
                </h3>
                <p
                  className="leading-relaxed text-sm sm:text-base"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {album.description}
                </p>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                {album.tracks && (
                  <div>
                    <h3
                      className="text-sm font-medium mb-1"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Tracks
                    </h3>
                    <p style={{ color: 'var(--color-text)' }}>{album.tracks}</p>
                  </div>
                )}
                {album.runtime && (
                  <div>
                    <h3
                      className="text-sm font-medium mb-1"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Runtime
                    </h3>
                    <p style={{ color: 'var(--color-text)' }}>{album.runtime}</p>
                  </div>
                )}
                {album.catalogNumber && (
                  <div>
                    <h3
                      className="text-sm font-medium mb-1"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Catalog #
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--color-text)' }}>{album.catalogNumber}</p>
                  </div>
                )}
                {album.format && (
                  <div>
                    <h3
                      className="text-sm font-medium mb-1"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Format
                    </h3>
                    <p style={{ color: 'var(--color-text)' }}>{album.format}</p>
                  </div>
                )}
                {album.discs && album.discs > 1 && (
                  <div>
                    <h3
                      className="text-sm font-medium mb-1"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Discs
                    </h3>
                    <p style={{ color: 'var(--color-text)' }}>{album.discs}</p>
                  </div>
                )}
              </div>

              {/* Genres */}
              {album.genre.length > 0 && (
                <div className="mb-4">
                  <h3
                    className="text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Genres
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {album.genre.map(genre => (
                      <button
                        key={genre}
                        onClick={() => handleFilterAndClose('genre', genre)}
                        className="badge cursor-pointer transition-colors"
                        style={{ backgroundColor: 'var(--color-neutral-light)', color: 'var(--color-secondary)' }}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Instruments */}
              {album.instruments.length > 0 && (
                <div>
                  <h3
                    className="text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Instruments
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {album.instruments.map(instrument => (
                      <button
                        key={instrument}
                        onClick={() => handleFilterAndClose('instrument', instrument)}
                        className="badge cursor-pointer transition-colors"
                        style={{ backgroundColor: 'var(--color-highlight-light)', color: 'var(--color-highlight)' }}
                      >
                        {instrument}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
