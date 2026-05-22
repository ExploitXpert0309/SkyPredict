export default function LoadingSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="panel p-5 lg:col-span-2">
        <div className="skeleton h-7 w-48" />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => <div key={index} className="skeleton h-24" />)}
        </div>
      </div>
      <div className="panel p-5">
        <div className="skeleton h-56" />
      </div>
    </div>
  );
}

