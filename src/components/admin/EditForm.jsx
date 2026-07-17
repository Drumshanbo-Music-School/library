import { useState, useEffect } from 'react'
import { useAdmin } from '../../lib/hooks/useAdmin'
import { getImageUrl } from '../../lib/storage'
import toast from 'react-hot-toast'

/**
 * Edit form for CD or Book items
 * @param {Object} props
 * @param {Object} props.item - The item to edit (null for new item)
 * @param {string} props.type - 'CD' or 'Book'
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onSave - Called after successful save with the saved item
 * @param {Function} props.onDelete - Called after successful delete
 */
export default function EditForm({ item, type = 'CD', onClose, onSave, onDelete }) {
  const { updateItem, createItem, deleteItem, uploadImage, getNextId } = useAdmin()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    publisher: '',
    year: '',
    image: '',
    // CD fields
    artists: [],
    catalogNumber: '',
    tracks: '',
    trackList: [],
    runtime: '',
    discs: '',
    format: '',
    instruments: [],
    genre: [],
    // Book fields
    authors: [],
    isbn: '',
    isbn10: '',
    edition: '',
    pageCount: '',
    language: 'English',
    subjects: [],
    categories: [],
    tuneCount: '',
    contentType: [],
    // Links
    links: {}
  })

  // Array field input states (for adding new items)
  const [newArtist, setNewArtist] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newGenre, setNewGenre] = useState('')
  const [newInstrument, setNewInstrument] = useState('')
  const [newTrack, setNewTrack] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newContentType, setNewContentType] = useState('')

  // Initialize form with item data or generate new ID
  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        tracks: item.tracks?.toString() || '',
        discs: item.discs?.toString() || '',
        pageCount: item.pageCount?.toString() || '',
        tuneCount: item.tuneCount?.toString() || '',
        artists: item.artists || [],
        authors: item.authors || [],
        genre: item.genre || [],
        instruments: item.instruments || [],
        trackList: item.trackList || [],
        subjects: item.subjects || [],
        categories: item.categories || [],
        contentType: item.contentType || [],
        links: item.links || {}
      })
      if (item.image) {
        setImagePreview(getImageUrl(item.image))
      }
    } else {
      // New item - get next ID
      getNextId(type).then(nextId => {
        setFormData(prev => ({ ...prev, id: nextId, image: `${nextId}.jpg` }))
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, type])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLinkChange = (linkType, value) => {
    setFormData(prev => ({
      ...prev,
      links: { ...prev.links, [linkType]: value }
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // Array field handlers
  const addToArray = (field, value, setter) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }))
      setter('')
    }
  }

  const removeFromArray = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const reorderArray = (field, newItems) => {
    setFormData(prev => ({
      ...prev,
      [field]: newItems
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Upload image if changed
      let imageName = formData.image
      let imageUpdatedAt = formData.imageUpdatedAt
      if (imageFile) {
        imageName = `${formData.id}.jpg`
        imageUpdatedAt = Date.now()
        await uploadImage(imageFile, imageName)
      }

      // Prepare base data that's common to both types
      const baseData = {
        id: formData.id,
        title: formData.title,
        description: formData.description,
        publisher: formData.publisher,
        year: formData.year,
        image: imageName,
        imageUpdatedAt,
        format: formData.format,
        links: Object.fromEntries(
          Object.entries(formData.links).filter(([_, v]) => v)
        )
      }

      // Add type-specific fields
      let dataToSave
      if (type === 'CD') {
        dataToSave = {
          ...baseData,
          artists: formData.artists,
          catalogNumber: formData.catalogNumber,
          tracks: formData.tracks ? parseInt(formData.tracks, 10) : null,
          trackList: formData.trackList,
          runtime: formData.runtime,
          discs: formData.discs ? parseInt(formData.discs, 10) : null,
          instruments: formData.instruments,
          genre: formData.genre
        }
      } else {
        // Book
        dataToSave = {
          ...baseData,
          authors: formData.authors,
          isbn: formData.isbn,
          isbn10: formData.isbn10,
          edition: formData.edition,
          pageCount: formData.pageCount ? parseInt(formData.pageCount, 10) : null,
          language: formData.language,
          subjects: formData.subjects,
          categories: formData.categories,
          tuneCount: formData.tuneCount ? parseInt(formData.tuneCount, 10) : null,
          contentType: formData.contentType
        }
      }

      let savedItem
      if (item) {
        // Update existing
        savedItem = await updateItem(formData.id, dataToSave, type)
        toast.success('Item updated successfully')
      } else {
        // Create new
        savedItem = await createItem(dataToSave, type)
        toast.success('Item created successfully')
      }

      onSave?.(savedItem)
      onClose()
    } catch (error) {
      console.error('Save error:', error)
      toast.error(error.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteItem(item.id, type)
      toast.success('Item deleted successfully')
      onDelete?.()
      onClose()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error.message || 'Failed to delete')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const isCD = type === 'CD'

  return (
    <div className="fixed inset-0 z-50 sm:flex sm:items-center sm:justify-center sm:p-4 sm:bg-black/60">
      <div className="relative h-full w-full sm:h-auto sm:max-h-[90vh] sm:max-w-3xl bg-white sm:rounded-lg sm:shadow-xl overflow-hidden">
        {/* Floating close button */}
        <div className="fixed sm:absolute top-4 right-4 z-10 drop-shadow-lg">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-colors"
            style={{ backgroundColor: 'var(--color-neutral-light)', color: 'var(--color-text-muted)' }}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="h-full sm:max-h-[90vh] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {/* Header - scrolls with content */}
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">
                {item ? 'Edit' : 'New'} {type}
              </h2>
            </div>

            <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ID</label>
              <input
                type="text"
                value={formData.id}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-slate-100 text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                placeholder="2024"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
            />
          </div>

          {/* Artists - shown for CDs, placed right below Title */}
          {isCD && (
            <DraggableArrayField
              label="Artists"
              items={formData.artists}
              newValue={newArtist}
              onNewValueChange={setNewArtist}
              onAdd={() => addToArray('artists', newArtist, setNewArtist)}
              onRemove={(i) => removeFromArray('artists', i)}
              onReorder={(newItems) => reorderArray('artists', newItems)}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Publisher</label>
            <input
              type="text"
              value={formData.publisher}
              onChange={(e) => handleInputChange('publisher', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image</label>
            <div className="flex items-start gap-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
              )}
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageChange}
                className="flex-1"
              />
            </div>
          </div>

          {/* CD-specific fields */}
          {isCD && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tracks</label>
                  <input
                    type="number"
                    value={formData.tracks}
                    onChange={(e) => handleInputChange('tracks', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Runtime</label>
                  <input
                    type="text"
                    value={formData.runtime}
                    onChange={(e) => handleInputChange('runtime', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                    placeholder="45:30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Discs</label>
                  <input
                    type="number"
                    value={formData.discs}
                    onChange={(e) => handleInputChange('discs', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Catalog Number</label>
                  <input
                    type="text"
                    value={formData.catalogNumber}
                    onChange={(e) => handleInputChange('catalogNumber', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Format</label>
                  <input
                    type="text"
                    value={formData.format}
                    onChange={(e) => handleInputChange('format', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                    placeholder="CD, CD+DVD, etc."
                  />
                </div>
              </div>

              {/* Genre */}
              <DraggableArrayField
                label="Genre"
                items={formData.genre}
                newValue={newGenre}
                onNewValueChange={setNewGenre}
                onAdd={() => addToArray('genre', newGenre, setNewGenre)}
                onRemove={(i) => removeFromArray('genre', i)}
                onReorder={(newItems) => reorderArray('genre', newItems)}
              />

              {/* Instruments */}
              <DraggableArrayField
                label="Instruments"
                items={formData.instruments}
                newValue={newInstrument}
                onNewValueChange={setNewInstrument}
                onAdd={() => addToArray('instruments', newInstrument, setNewInstrument)}
                onRemove={(i) => removeFromArray('instruments', i)}
                onReorder={(newItems) => reorderArray('instruments', newItems)}
              />

              {/* Track List */}
              <DraggableArrayField
                label="Track List"
                items={formData.trackList}
                newValue={newTrack}
                onNewValueChange={setNewTrack}
                onAdd={() => addToArray('trackList', newTrack, setNewTrack)}
                onRemove={(i) => removeFromArray('trackList', i)}
                onReorder={(newItems) => reorderArray('trackList', newItems)}
                numbered
              />

              {/* Links */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Links</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={formData.links.spotify || ''}
                    onChange={(e) => handleLinkChange('spotify', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                    placeholder="Spotify URL"
                  />
                  <input
                    type="url"
                    value={formData.links.appleMusic || ''}
                    onChange={(e) => handleLinkChange('appleMusic', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                    placeholder="Apple Music URL"
                  />
                  <input
                    type="url"
                    value={formData.links.bandcamp || ''}
                    onChange={(e) => handleLinkChange('bandcamp', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                    placeholder="Bandcamp URL"
                  />
                  <input
                    type="url"
                    value={formData.links.website || ''}
                    onChange={(e) => handleLinkChange('website', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                    placeholder="Website URL"
                  />
                </div>
              </div>
            </>
          )}

          {/* Book-specific fields */}
          {!isCD && (
            <>
              {/* Authors */}
              <ArrayField
                label="Authors"
                items={formData.authors}
                newValue={newAuthor}
                onNewValueChange={setNewAuthor}
                onAdd={() => addToArray('authors', newAuthor, setNewAuthor)}
                onRemove={(i) => removeFromArray('authors', i)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ISBN</label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => handleInputChange('isbn', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ISBN-10</label>
                  <input
                    type="text"
                    value={formData.isbn10}
                    onChange={(e) => handleInputChange('isbn10', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Page Count</label>
                  <input
                    type="number"
                    value={formData.pageCount}
                    onChange={(e) => handleInputChange('pageCount', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Edition</label>
                  <input
                    type="text"
                    value={formData.edition}
                    onChange={(e) => handleInputChange('edition', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Format</label>
                  <input
                    type="text"
                    value={formData.format}
                    onChange={(e) => handleInputChange('format', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                    placeholder="Hardcover, Paperback"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tune Count</label>
                  <input
                    type="number"
                    value={formData.tuneCount}
                    onChange={(e) => handleInputChange('tuneCount', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                  />
                </div>
              </div>

              {/* Subjects */}
              <ArrayField
                label="Subjects"
                items={formData.subjects}
                newValue={newSubject}
                onNewValueChange={setNewSubject}
                onAdd={() => addToArray('subjects', newSubject, setNewSubject)}
                onRemove={(i) => removeFromArray('subjects', i)}
              />

              {/* Categories */}
              <ArrayField
                label="Categories"
                items={formData.categories}
                newValue={newCategory}
                onNewValueChange={setNewCategory}
                onAdd={() => addToArray('categories', newCategory, setNewCategory)}
                onRemove={(i) => removeFromArray('categories', i)}
              />

              {/* Content Type */}
              <ArrayField
                label="Content Type"
                items={formData.contentType}
                newValue={newContentType}
                onNewValueChange={setNewContentType}
                onAdd={() => addToArray('contentType', newContentType, setNewContentType)}
                onRemove={(i) => removeFromArray('contentType', i)}
              />

              {/* Links */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Links</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={formData.links.goodreads || ''}
                    onChange={(e) => handleLinkChange('goodreads', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                    placeholder="Goodreads URL"
                  />
                  <input
                    type="url"
                    value={formData.links.worldcat || ''}
                    onChange={(e) => handleLinkChange('worldcat', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                    placeholder="WorldCat URL"
                  />
                  <input
                    type="url"
                    value={formData.links.publisher || ''}
                    onChange={(e) => handleLinkChange('publisher', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                    placeholder="Publisher URL"
                  />
                  <input
                    type="url"
                    value={formData.links.website || ''}
                    onChange={(e) => handleLinkChange('website', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
                    placeholder="Website URL"
                  />
                </div>
              </div>
            </>
          )}
            </div>
          </div>

          <div className="flex justify-between items-center p-4 border-t bg-slate-50 shrink-0">
            {/* Delete button - only show when editing existing item */}
            {item ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                Delete
              </button>
            ) : (
              <div /> // Spacer for new items
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-irish-green text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center sm:rounded-lg">
            <div className="bg-white rounded-lg p-6 m-4 max-w-sm shadow-xl">
              <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
              <p className="text-slate-600 mb-4">
                Are you sure you want to delete "{item?.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Reusable array field component with tag-style display
 */
function ArrayField({ label, items, newValue, onNewValueChange, onAdd, onRemove, numbered = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-sm"
          >
            {numbered && <span className="text-slate-400">{index + 1}.</span>}
            {item}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-slate-400 hover:text-red-500 ml-1"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newValue}
          onChange={(e) => onNewValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onAdd()
            }
          }}
          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
          placeholder={`Add ${label.toLowerCase().replace(/s$/, '')}...`}
        />
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg"
        >
          Add
        </button>
      </div>
    </div>
  )
}

/**
 * Draggable array field component with drag-to-reorder tags
 */
function DraggableArrayField({ label, items, newValue, onNewValueChange, onAdd, onRemove, onReorder, numbered = false }) {
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (index !== draggedIndex) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    const fromIndex = draggedIndex
    if (fromIndex !== null && fromIndex !== dropIndex) {
      const newItems = [...items]
      const [movedItem] = newItems.splice(fromIndex, 1)
      newItems.splice(dropIndex, 0, movedItem)
      onReorder(newItems)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((item, index) => (
          <span
            key={index}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm cursor-grab active:cursor-grabbing select-none transition-all ${
              draggedIndex === index
                ? 'opacity-50 bg-slate-200'
                : dragOverIndex === index
                ? 'bg-irish-green/20 ring-2 ring-irish-green'
                : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            {numbered && <span className="text-slate-400">{index + 1}.</span>}
            {item}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-slate-400 hover:text-red-500 ml-1"
              onMouseDown={(e) => e.stopPropagation()}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newValue}
          onChange={(e) => onNewValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onAdd()
            }
          }}
          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-irish-green outline-none"
          placeholder={`Add ${label.toLowerCase().replace(/s$/, '')}...`}
        />
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg"
        >
          Add
        </button>
      </div>
    </div>
  )
}
