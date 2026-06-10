export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="h-72 md:h-96" style={{ backgroundColor: "#003A99" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded-full w-48" />
          <div className="h-10 bg-white/10 rounded w-80" />
          <div className="h-4 bg-white/10 rounded w-96" />
          <div className="flex gap-3 pt-2">
            <div className="h-12 w-40 bg-white/10 rounded-lg" />
            <div className="h-12 w-36 bg-white/10 rounded-lg" />
          </div>
        </div>
      </div>
      {/* Courses skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-6 animate-pulse">
        <div className="h-6 bg-gray-100 rounded w-48 mx-auto" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
