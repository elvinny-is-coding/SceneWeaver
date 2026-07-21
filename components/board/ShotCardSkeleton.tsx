export function ShotCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-3 w-1/3 rounded bg-gray-200" />
        <div className="h-3 w-2/3 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
      </div>
    </div>
  )
}
