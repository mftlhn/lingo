export default function LearningLoading() {
  return (
    <div aria-label="Memuat halaman" className="space-y-7">
      <div className="space-y-3">
        <div className="skeleton h-4 w-36" />
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="soft-card rounded-2xl p-5"><div className="skeleton size-9 rounded-xl" /><div className="skeleton mt-5 h-7 w-16" /><div className="skeleton mt-2 h-4 w-28" /></div>)}
      </div>
      <div className="soft-card rounded-2xl p-6"><div className="skeleton h-5 w-40" /><div className="skeleton mt-6 h-48 w-full" /></div>
    </div>
  );
}
