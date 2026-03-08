export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white text-2xl font-bold shadow-lg mb-2">
            A
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Alzapp</h1>
          <p className="text-slate-500 text-sm">Safety & location tracking for loved ones</p>
        </div>

        {/* Navigation cards */}
        <div className="space-y-4">
          <a
            href="/demo-user"
            className="group block w-full rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                👤
              </div>
              <div>
                <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">User Mode</p>
                <p className="text-sm text-slate-500">Set up tracking & safe zones</p>
              </div>
              <svg className="ml-auto w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </a>

          <a
            href="/demo-caretaker"
            className="group block w-full rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-200 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                🩺
              </div>
              <div>
                <p className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">Caretaker</p>
                <p className="text-sm text-slate-500">Look up patient info & location</p>
              </div>
              <svg className="ml-auto w-5 h-5 text-slate-300 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
