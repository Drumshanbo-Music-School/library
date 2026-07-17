import { useState } from 'react';
import { getImageUrl } from '../lib/storage';

export default function BookCard({ book, onClick, onFilterClick }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden card-hover cursor-pointer"
    >
      {/* Book Cover - Portrait aspect ratio (3:4) */}
      <div className="aspect-[3/4] bg-gradient-to-br from-amber-50 to-amber-100 relative overflow-hidden">
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
              <div className="text-xs px-4 text-amber-700">No cover available</div>
            </div>
          </div>
        )}
        {book.year && (
          <div className="absolute top-2 right-2 badge bg-black/70 text-white text-xs px-2 py-1 rounded">
            {book.year}
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2 text-slate-900">
          {book.title}
        </h3>

        {/* Authors */}
        <div className="text-sm text-slate-600 mb-3 line-clamp-1">
          {book.authors && book.authors.length > 0 ? (
            book.authors.map((author, idx) => (
              <span key={idx}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFilterClick('author', author);
                  }}
                  className="hover:text-irish-green hover:underline"
                >
                  {author}
                </button>
                {idx < book.authors.length - 1 && ', '}
              </span>
            ))
          ) : (
            <span>Unknown Author</span>
          )}
        </div>

        <div className="text-xs text-slate-500 mb-3">
          {book.publisher}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-1 mb-2 text-xs text-slate-600">
          {book.pageCount && <span>{book.pageCount} pages</span>}
          {book.format && <span>• {book.format}</span>}
        </div>

        {/* Subjects & Categories */}
        <div className="flex flex-wrap gap-1 mt-2">
          {book.subjects && book.subjects.slice(0, 2).map((subject) => (
            <button
              key={subject}
              onClick={(e) => {
                e.stopPropagation();
                onFilterClick('subject', subject);
              }}
              className="badge bg-blue-100 text-blue-700 text-xs hover:bg-blue-200"
            >
              {subject}
            </button>
          ))}
          {book.categories && book.categories.slice(0, 1).map((cat) => (
            <button
              key={cat}
              onClick={(e) => {
                e.stopPropagation();
                onFilterClick('category', cat);
              }}
              className="badge bg-purple-100 text-purple-700 text-xs hover:bg-purple-200"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Links */}
        {book.links && book.links.goodreads && (
          <div className="mt-3">
            <a
              href={book.links.goodreads}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-amber-600 hover:text-amber-700 hover:underline"
            >
              📖 View on Goodreads
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
