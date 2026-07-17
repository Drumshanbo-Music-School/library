export default function CatalogToggle({ activeCatalog, onCatalogChange, cdCount, bookCount }) {
  return (
    <div className="flex justify-center mb-8">
      <div className="inline-flex rounded-lg border border-slate-300 p-1 bg-white shadow-sm">
        <button
          onClick={() => onCatalogChange('CD')}
          className={`px-6 py-2 rounded-md font-medium transition-all ${
            activeCatalog === 'CD'
              ? 'bg-irish-green text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          💿 CDs <span className="text-sm ml-1">({cdCount})</span>
        </button>
        <button
          onClick={() => onCatalogChange('Book')}
          className={`px-6 py-2 rounded-md font-medium transition-all ${
            activeCatalog === 'Book'
              ? 'bg-irish-green text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📚 Books <span className="text-sm ml-1">({bookCount})</span>
        </button>
      </div>
    </div>
  );
}
