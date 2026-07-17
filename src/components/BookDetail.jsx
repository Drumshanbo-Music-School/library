import { useEffect, useState } from 'react';
import { getImageUrl } from '../lib/storage';

export default function BookDetail({ book, onClose, onFilterClick, onEdit }) {
  const [imageError, setImageError] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFilterAndClose = (filterType, filterValue) => {
    onFilterClick(filterType, filterValue);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 sm:flex sm:items-center sm:justify-center sm:p-4 sm:bg-black/50 sm:backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="relative h-full w-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-xl sm:shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        {/* Floating buttons */}
        <div className="fixed sm:absolute top-4 right-4 flex gap-2 z-10 drop-shadow-lg">
          {onEdit && (
            <button
              onClick={onEdit}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-text-inverse)' }}
              title="Edit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-colors"
            style={{ backgroundColor: 'var(--color-neutral-light)', color: 'var(--color-text-muted)' }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="h-full sm:max-h-[90vh] overflow-y-auto p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Book Cover */}
            <div>
              <div className="aspect-[3/4] bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg overflow-hidden shadow-lg mb-6">
                {!imageError && book.image ? (
                  <img
                    src={getImageUrl(book.image, book.imageUpdatedAt)}
                    alt={book.title}
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-300">
                    <div className="text-center">
                      <div className="text-6xl mb-2">📚</div>
                      <div className="text-sm text-amber-700">No cover available</div>
                    </div>
                  </div>
                )}
              </div>

              {/* External Links */}
              {book.links && (Object.keys(book.links).length > 0) && (
                <div className="space-y-2">
                  {book.links.goodreads && (
                    <a
                      href={book.links.goodreads}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-center font-medium transition-colors"
                    >
                      📖 View on Goodreads
                    </a>
                  )}
                  {book.links.worldcat && (
                    <a
                      href={book.links.worldcat}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center font-medium transition-colors"
                    >
                      🌍 Find in WorldCat
                    </a>
                  )}
                  {book.links.publisher && (
                    <a
                      href={book.links.publisher}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-center font-medium transition-colors"
                    >
                      🏢 Publisher Website
                    </a>
                  )}
                  {book.links.archive && (
                    <a
                      href={book.links.archive}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-center font-medium transition-colors"
                    >
                      📚 Internet Archive
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Book Details */}
            <div>
              <h2
                className="text-2xl sm:text-3xl font-bold mb-2 font-serif"
                style={{ color: 'var(--color-text)' }}
              >
                {book.title}
              </h2>

              {/* Authors */}
              {book.authors && book.authors.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Authors</h3>
                  <div className="flex flex-wrap gap-2">
                    {book.authors.map((author, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleFilterAndClose('author', author)}
                        className="badge bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        {author}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Publication Info */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <h3 className="text-xs font-medium text-slate-500 mb-1">Publisher</h3>
                  <p className="text-slate-900">{book.publisher}</p>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-slate-500 mb-1">Year</h3>
                  <p className="text-slate-900">{book.year || 'Unknown'}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-500 mb-2">Description</h3>
                <p className="text-slate-700 leading-relaxed">{book.description}</p>
              </div>

              {/* Book-Specific Metadata */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                {book.isbn && (
                  <div>
                    <h3 className="text-xs font-medium text-slate-500 mb-1">ISBN-13</h3>
                    <p className="text-slate-900 font-mono text-xs">{book.isbn}</p>
                  </div>
                )}
                {book.pageCount && (
                  <div>
                    <h3 className="text-xs font-medium text-slate-500 mb-1">Pages</h3>
                    <p className="text-slate-900">{book.pageCount}</p>
                  </div>
                )}
                {book.format && (
                  <div>
                    <h3 className="text-xs font-medium text-slate-500 mb-1">Format</h3>
                    <p className="text-slate-900">{book.format}</p>
                  </div>
                )}
                {book.edition && (
                  <div>
                    <h3 className="text-xs font-medium text-slate-500 mb-1">Edition</h3>
                    <p className="text-slate-900">{book.edition}</p>
                  </div>
                )}
                {book.tuneCount && (
                  <div>
                    <h3 className="text-xs font-medium text-slate-500 mb-1">Tunes</h3>
                    <p className="text-slate-900">{book.tuneCount}</p>
                  </div>
                )}
                {book.language && book.language !== 'English' && (
                  <div>
                    <h3 className="text-xs font-medium text-slate-500 mb-1">Language</h3>
                    <p className="text-slate-900">{book.language}</p>
                  </div>
                )}
              </div>

              {/* Subjects */}
              {book.subjects && book.subjects.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Subjects</h3>
                  <div className="flex flex-wrap gap-2">
                    {book.subjects.map((subject) => (
                      <button
                        key={subject}
                        onClick={() => handleFilterAndClose('subject', subject)}
                        className="badge bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {book.categories && book.categories.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {book.categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleFilterAndClose('category', category)}
                        className="badge bg-purple-100 text-purple-800 hover:bg-purple-200"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Types */}
              {book.contentType && book.contentType.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Content Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {book.contentType.map((type) => (
                      <span key={type} className="badge bg-green-100 text-green-700 text-xs">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
