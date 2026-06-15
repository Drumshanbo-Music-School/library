import { useEffect, useState } from 'react'

export default function AlbumDetail({ album, onClose, onFilterClick }) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            setIsFlipped(false)
            onClose()
          }}
          className="sticky top-4 float-right mr-4 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-2xl text-slate-600 hover:text-slate-900 z-10"
        >
          ×
        </button>

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
                          src={`/images/${album.image}`}
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
                      <div className="aspect-square bg-white rounded-lg shadow-lg p-6 overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4 text-slate-900">
                          Track List
                        </h3>
                        <ol className="space-y-2">
                          {album.trackList.map((track, idx) => (
                            <li key={idx} className="text-sm">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleFilterAndClose('track', track)
                                }}
                                className="text-left w-full hover:text-irish-green hover:underline transition-colors py-1"
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
                      className="block w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-center font-medium transition-colors"
                    >
                      🎵 Listen on Spotify
                    </a>
                  )}
                  {album.links.appleMusic && (
                    <a
                      href={album.links.appleMusic}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-center font-medium transition-colors"
                    >
                      🎵 Listen on Apple Music
                    </a>
                  )}
                  {album.links.website && (
                    <a
                      href={album.links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 px-4 bg-irish-green hover:bg-green-700 text-white rounded-lg text-center font-medium transition-colors"
                    >
                      🌐 Visit Website
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Album Details */}
            <div>
              <h2 className="text-3xl font-bold mb-2 font-serif text-slate-900">
                {album.title}
              </h2>

              {/* Artists */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-500 mb-2">Artists</h3>
                <div className="flex flex-wrap gap-2">
                  {album.artists.map((artist, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleFilterAndClose('artist', artist)}
                      className="badge bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                    >
                      {artist}
                    </button>
                  ))}
                </div>
              </div>

              {/* Publisher & Year */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Publisher</h3>
                  <button
                    onClick={() => handleFilterAndClose('publisher', album.publisher)}
                    className="text-slate-900 hover:text-irish-green hover:underline"
                  >
                    {album.publisher}
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Year</h3>
                  <button
                    onClick={() => handleFilterAndClose('year', album.year)}
                    className="text-slate-900 hover:text-irish-green hover:underline"
                  >
                    {album.year}
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-500 mb-2">Description</h3>
                <p className="text-slate-700 leading-relaxed">
                  {album.description}
                </p>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                {album.tracks && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Tracks</h3>
                    <p className="text-slate-900">{album.tracks}</p>
                  </div>
                )}
                {album.runtime && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Runtime</h3>
                    <p className="text-slate-900">{album.runtime}</p>
                  </div>
                )}
                {album.catalogNumber && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Catalog #</h3>
                    <p className="text-slate-900 text-xs">{album.catalogNumber}</p>
                  </div>
                )}
                {album.format && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Format</h3>
                    <p className="text-slate-900">{album.format}</p>
                  </div>
                )}
                {album.discs && album.discs > 1 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Discs</h3>
                    <p className="text-slate-900">{album.discs}</p>
                  </div>
                )}
              </div>

              {/* Genres */}
              {album.genre.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {album.genre.map(genre => (
                      <button
                        key={genre}
                        onClick={() => handleFilterAndClose('genre', genre)}
                        className="badge bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
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
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Instruments</h3>
                  <div className="flex flex-wrap gap-2">
                    {album.instruments.map(instrument => (
                      <button
                        key={instrument}
                        onClick={() => handleFilterAndClose('instrument', instrument)}
                        className="badge bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer"
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
