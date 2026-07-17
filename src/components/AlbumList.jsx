import { useEffect, useRef } from 'react'
import AlbumListItem from './AlbumListItem'
import BookListItem from './BookListItem'
import Pagination from './Pagination'

export default function AlbumList({
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
  onPageChange
}) {
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

  // Choose list item component based on type
  const ItemComponent = catalogType === 'CD' ? AlbumListItem : BookListItem
  const itemPropName = catalogType === 'CD' ? 'album' : 'book'

  return (
    <div>
      {/* List container with border */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
        {items.map(item => (
          <ItemComponent
            key={item.id}
            {...{ [itemPropName]: item }}
            onClick={() => onItemClick(item)}
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-irish-green"></div>
            ) : (
              <button
                onClick={loadMore}
                className="text-irish-green hover:text-green-700 font-medium"
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
