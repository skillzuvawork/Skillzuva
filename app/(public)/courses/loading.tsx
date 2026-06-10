export default function Loading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8 max-w-7xl mx-auto">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm h-80 animate-pulse">
          <div className="h-44 bg-gray-100 rounded-t-xl" />
          <div className="p-5 space-y-3">
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
