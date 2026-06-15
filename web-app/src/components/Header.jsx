export default function Header({ totalCDs = 0, totalBooks = 0, totalAlbums }) {
  // Support legacy totalAlbums prop for backwards compatibility
  const cdCount = totalAlbums !== undefined ? totalAlbums : totalCDs;
  const bookCount = totalBooks;
  const totalItems = cdCount + bookCount;

  return (
    <header className="bg-gradient-to-r from-irish-green to-green-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 font-serif">
            ♫ Drumshanbo Music Library
          </h1>
          <p className="text-green-100 text-lg">
            Irish Traditional Music Collection
          </p>
          {totalItems > 0 && (
            <p className="mt-4 text-sm text-green-100">
              {cdCount} albums • {bookCount} books • {totalItems} total items
            </p>
          )}
        </div>
      </div>
    </header>
  )
}
