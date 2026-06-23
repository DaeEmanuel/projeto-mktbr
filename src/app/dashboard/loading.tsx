export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#f4f8f3] px-4 py-8 text-[#061421] sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-5">
        <div className="h-36 animate-pulse rounded-[1.5rem] bg-[#05281f]/90" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-28 animate-pulse rounded-[1.25rem] bg-white shadow-sm" />
          <div className="h-28 animate-pulse rounded-[1.25rem] bg-white shadow-sm" />
          <div className="h-28 animate-pulse rounded-[1.25rem] bg-white shadow-sm" />
        </div>
      </section>
    </main>
  );
}
