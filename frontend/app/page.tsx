export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="rounded-xl bg-white shadow p-8 space-y-4 text-center">
        <p className="text-sm uppercase tracking-wide text-slate-500">Codex POS</p>
        <h1 className="text-2xl font-semibold">Welcome</h1>
        <p className="text-slate-600">Please sign in to access the dashboard.</p>
        <a href="/login" className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800">
          Go to Login
        </a>
      </div>
    </main>
  );
}
