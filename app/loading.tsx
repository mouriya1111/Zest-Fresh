export default function Loading() {
  return (
    <main className="min-h-screen bg-zestBg px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-16 rounded-3xl bg-white" />
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="h-8 w-48 rounded-full bg-red-100" />
            <div className="h-20 rounded-3xl bg-white" />
            <div className="h-20 rounded-3xl bg-white" />
            <div className="h-12 w-56 rounded-full bg-red-200" />
          </div>
          <div className="h-[420px] rounded-[2rem] bg-white" />
        </div>
      </div>
    </main>
  );
}
