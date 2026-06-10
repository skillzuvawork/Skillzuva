"use client";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-gray-500 mb-6">There was a problem loading this page.</p>
      <button
        onClick={reset}
        className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
        style={{ backgroundColor: "#003A99" }}
      >
        Try again
      </button>
    </div>
  );
}
