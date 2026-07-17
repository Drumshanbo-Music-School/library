import { useEffect, useRef } from 'react'
import AlbumCard from './AlbumCard'
import BookCard from './BookCard'
import Pagination from './Pagination'

export default function AlbumGrid({
  items,
  onItemClick,
  onFilterClick,
  catalogType,
  hasMore,
  loadMore,
  loadingMore,
  scrollMode = 'continuous',
  currentPage,
  totalPages,
  onPageChange,
  // Legacy props for backwards compatibility
  albums,
  onAlbumClick
}) {
  // Handle both new and legacy prop names
  const itemsToDisplay = items || albums
  const handleClick = onItemClick || onAlbumClick
  const type = catalogType || 'CD'

  // Infinite scroll observer
  const observerRef = useRef(null)
  const loadMoreRef = useRef(null)

  useEffect(() => {
    // Only set up infinite scroll in continuous mode
    if (scrollMode !== 'continuous' || !hasMore || !loadMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    observerRef.current = observer

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [scrollMode, hasMore, loadMore, loadingMore])

  // Choose card component based on type
  const CardComponent = type === 'CD' ? AlbumCard : BookCard
  const itemPropName = type === 'CD' ? 'album' : 'book'

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {itemsToDisplay.map(item => (
          <CardComponent
            key={item.id}
            {...{ [itemPropName]: item }}
            onClick={() => handleClick(item)}
            onFilterClick={onFilterClick}
          />
        ))}
      </div>

      {/* Infinite scroll trigger or pagination */}
      {scrollMode === 'continuous' ? (
        hasMore && (
          <div
            ref={loadMoreRef}
            className="flex justify-center items-center py-8"
          >
            {loadingMore ? (
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2"
                style={{ borderColor: 'var(--color-secondary)' }}
              ></div>
            ) : (
              <button
                onClick={loadMore}
                className="font-medium transition-colors"
                style={{ color: 'var(--color-secondary)' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--color-secondary)'}
              >
                Load more
              </button>
            )}
          </div>
        )
      ) : (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
