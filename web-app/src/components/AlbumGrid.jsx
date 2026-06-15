import AlbumCard from './AlbumCard'
import BookCard from './BookCard'

export default function AlbumGrid({
  items,
  onItemClick,
  onFilterClick,
  catalogType,
  // Legacy props for backwards compatibility
  albums,
  onAlbumClick
}) {
  // Handle both new and legacy prop names
  const itemsToDisplay = items || albums
  const handleClick = onItemClick || onAlbumClick
  const type = catalogType || 'CD'

  // Choose card component based on type
  const CardComponent = type === 'CD' ? AlbumCard : BookCard
  const itemPropName = type === 'CD' ? 'album' : 'book'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {itemsToDisplay.map(item => (
        <CardComponent
          key={item.id}
          {...{ [itemPropName]: item }}
          onClick={() => handleClick(item)}
          onFilterClick={onFilterClick}
        />
      ))}
    </div>
  )
}
