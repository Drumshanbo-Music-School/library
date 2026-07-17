import { useState } from 'react'
import { getImageUrl } from '../lib/storage'

export default function AlbumCard({ album, onClick, onFilterClick }) {
  const [imageError, setImageError] = useState(false)

  const formatArtists = (artists) => {
    if (artists.length === 0) return 'Unknown Artist'
    if (artists.length === 1) return artists[0]
    if (artists.length === 2) return artists.join(' & ')
    return artists.slice(0, -1).join(', ') + ' & ' + artists[artists.length - 1]
  }

  const handleArtistClick = (e, artist) => {
    e.stopPropagation()
    onFilterClick('artist', artist)
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden card-hover cursor-pointer"
    >
      {/* Album Cover */}
      <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 relative overflow-hidden">
        {!imageError && album.image ? (
          <img
            src={getImageUrl(album.image, album.imageUpdatedAt)}
            alt={album.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
              </svg>
              <div className="text-sm px-4">No cover available</div>
            </div>
          </div>
        )}
        {album.year && (
          <div
            className="absolute top-2 right-2 badge text-white text-xs px-2 py-1 rounded"
            style={{ backgroundColor: 'var(--color-highlight)' }}
          >
            {album.year}
          </div>
        )}
      </div>

      {/* Album Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2 text-slate-900">
          {album.title}
        </h3>
        <div className="text-sm text-slate-600 mb-3 line-clamp-1">
          {album.artists.map((artist, idx) => (
            <span key={idx}>
              <button
                onClick={(e) => handleArtistClick(e, artist)}
                className="hover:text-irish-green hover:underline"
              >
                {artist}
              </button>
              {idx < album.artists.length - 1 && ', '}
            </span>
          ))}
        </div>

        <div className="text-xs text-slate-500 mb-3">
          {album.publisher}
        </div>

        {/* Genres & Instruments */}
        <div className="flex flex-wrap gap-1 mt-2">
          {album.genre.slice(0, 2).map(genre => (
            <span
              key={genre}
              className="badge text-xs"
              style={{ backgroundColor: 'var(--color-neutral-light)', color: 'var(--color-secondary)' }}
            >
              {genre}
            </span>
          ))}
          {album.instruments.slice(0, 2).map(inst => (
            <span
              key={inst}
              className="badge text-xs"
              style={{ backgroundColor: 'var(--color-highlight-light)', color: 'var(--color-highlight)' }}
            >
              {inst}
            </span>
          ))}
        </div>

        {/* Links */}
        {(album.links?.spotify || album.links?.appleMusic) && (
          <div className="mt-3 flex gap-2">
            {album.links.spotify && (
              <a
                href={album.links.spotify}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-green-600 hover:text-green-700"
                title="Listen on Spotify"
              >
                🎵 Spotify
              </a>
            )}
            {album.links.appleMusic && (
              <a
                href={album.links.appleMusic}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-slate-600 hover:text-slate-700"
                title="Listen on Apple Music"
              >
                🎵 Apple Music
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
