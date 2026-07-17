import { useState } from 'react'
import { getImageUrl } from '../lib/storage'

export default function AlbumListItem({ album, onClick, onFilterClick }) {
  const [imageError, setImageError] = useState(false)

  const handleArtistClick = (e, artist) => {
    e.stopPropagation()
    onFilterClick('artist', artist)
  }

  const handleGenreClick = (e, genre) => {
    e.stopPropagation()
    onFilterClick('genre', genre)
  }

  return (
    <div
      onClick={onClick}
      className="list-item-row"
    >
      {/* Cover Image */}
      <div className="list-cover-md">
        {!imageError ? (
          <img
            src={getImageUrl(album.image)}
            alt={album.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <span className="text-2xl">💿</span>
          </div>
        )}
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center">
        {/* Title & Metadata (4 cols on desktop) */}
        <div className="md:col-span-4 min-w-0">
          <h3 className="font-semibold text-sm md:text-base text-slate-900 truncate">
            {album.title}
          </h3>
          <p className="text-xs text-slate-500 truncate">{album.publisher}</p>
          <p className="text-xs text-slate-400">
            {album.trackCount && `${album.trackCount} tracks`}
            {album.trackCount && album.runtime && ' • '}
            {album.runtime}
          </p>
        </div>

        {/* Artists (3 cols on desktop, hidden on mobile) */}
        <div className="hidden md:block md:col-span-3 min-w-0">
          <div className="text-sm text-slate-600 truncate">
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
        </div>

        {/* Year (1 col on desktop, hidden on tablet/mobile) */}
        <div className="hidden lg:block lg:col-span-1 text-sm text-slate-600">
          {album.year}
        </div>

        {/* Tags (3 cols on desktop) */}
        <div className="md:col-span-3 flex flex-wrap gap-1">
          {album.genre.slice(0, 2).map(genre => (
            <button
              key={genre}
              onClick={(e) => handleGenreClick(e, genre)}
              className="badge text-xs hover:opacity-80"
              style={{ backgroundColor: 'var(--color-neutral-light)', color: 'var(--color-secondary)' }}
            >
              {genre}
            </button>
          ))}
          {album.instruments.slice(0, 1).map(inst => (
            <span
              key={inst}
              className="badge text-xs"
              style={{ backgroundColor: 'var(--color-highlight-light)', color: 'var(--color-highlight)' }}
            >
              {inst}
            </span>
          ))}
        </div>

        {/* Links (1 col on desktop) */}
        <div className="md:col-span-1 flex gap-2 justify-end">
          {album.links?.spotify && (
            <a
              href={album.links.spotify}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-green-600 hover:text-green-700"
              title="Listen on Spotify"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </a>
          )}
          {album.links?.appleMusic && (
            <a
              href={album.links.appleMusic}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-slate-600 hover:text-slate-700"
              title="Listen on Apple Music"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.132c-.317-1.213-1.051-2.237-2.067-2.88-1.176-.744-2.456-.85-3.82-.52a10.054 10.054 0 00-1.913.686c-.85.346-1.674.733-2.511 1.092-.812.348-1.635.668-2.485.956-.888.3-1.789.524-2.716.671-.954.152-1.913.216-2.88.125-.893-.084-1.764-.293-2.613-.6-.82-.297-1.598-.673-2.343-1.13-.644-.395-1.233-.86-1.756-1.408-.58-.605-1.048-1.29-1.377-2.07-.29-.686-.454-1.408-.49-2.156-.028-.57.038-1.14.176-1.7.138-.56.356-1.098.635-1.606.258-.468.57-.905.928-1.308.402-.454.85-.866 1.34-1.23.564-.418 1.176-.762 1.835-1.02 1.09-.426 2.247-.616 3.416-.572.893.033 1.777.193 2.635.483 1.118.377 2.16.904 3.12 1.567.844.583 1.627 1.244 2.33 1.984.735.772 1.4 1.61 1.996 2.512.653.993 1.216 2.043 1.669 3.148.423 1.03.74 2.098.943 3.196.184.992.314 1.99.383 2.993.07 1.006.086 2.015.046 3.025-.04 1.007-.143 2.01-.307 3.006-.164.996-.396 1.98-.697 2.95-.301.97-.672 1.917-1.113 2.832-.442.916-.958 1.798-1.546 2.643-.588.845-1.248 1.65-1.977 2.414-.73.764-1.529 1.486-2.397 2.161a18.54 18.54 0 01-2.85 1.79c-.992.505-2.03.932-3.112 1.275-1.082.343-2.194.594-3.33.749-1.137.155-2.286.213-3.442.17-1.155-.043-2.306-.188-3.44-.436-1.134-.248-2.248-.597-3.33-1.045-1.082-.448-2.13-.99-3.133-1.628-.988-.625-1.927-1.347-2.815-2.164-.887-.817-1.72-1.727-2.495-2.728-.775-1-1.492-2.088-2.147-3.26-.655-1.172-1.248-2.426-1.776-3.76-.527-1.333-.99-2.745-1.385-4.232-.395-1.487-.722-3.048-.976-4.68-.254-1.633-.435-3.334-.543-5.1-.107-1.767-.139-3.597-.095-5.488.043-1.89.188-3.84.433-5.847.245-2.007.59-4.07 1.034-6.184.443-2.115.985-4.28 1.625-6.491.64-2.211 1.377-4.468 2.21-6.766.833-2.298 1.762-4.637 2.787-7.013 1.025-2.376 2.145-4.79 3.358-7.238 1.213-2.448 2.519-4.93 3.917-7.442 1.398-2.512 2.888-5.054 4.47-7.622 1.582-2.568 3.254-5.161 5.017-7.775 1.763-2.614 3.616-5.25 5.558-7.905 1.942-2.655 3.973-5.328 6.093-8.018 2.12-2.69 4.328-5.396 6.623-8.117 2.295-2.721 4.677-5.456 7.146-8.204 2.469-2.748 5.024-5.509 7.665-8.281 2.641-2.772 5.368-5.555 8.18-8.348 2.812-2.793 5.709-5.595 8.69-8.406 2.981-2.811 6.046-5.63 9.195-8.457 3.149-2.827 6.381-5.661 9.696-8.502 3.315-2.841 6.713-5.688 10.193-8.541 3.48-2.853 7.042-5.712 10.685-8.576 3.643-2.864 7.367-5.733 11.172-8.607z"/>
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
