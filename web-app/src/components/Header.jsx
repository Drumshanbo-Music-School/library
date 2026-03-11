export default function Header({ totalAlbums }) {
  return (
    <header className="bg-gradient-to-r from-irish-green to-green-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 font-serif">
            ♫ Drumshanbo Music Library
          </h1>
          <p className="text-green-100 text-lg">
            Discover Irish Traditional Music
          </p>
          {totalAlbums > 0 && (
            <p className="mt-4 text-sm text-green-100">
              {totalAlbums} albums in collection
            </p>
          )}
        </div>
      </div>
    </header>
  )
}
