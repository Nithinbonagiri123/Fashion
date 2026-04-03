export default function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] skeleton mb-3" />
      <div className="space-y-2 px-0.5">
        <div className="skeleton h-2.5 w-20 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-2.5 w-16 rounded" />
      </div>
    </div>
  );
}
