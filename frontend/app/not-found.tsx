'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center text-white">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl max-w-md w-full">
        <h2 className="text-3xl font-extrabold text-white mb-2">Page Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 text-center"
          >
            Return Home
          </Link>
          <Link
            href="/admin"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 text-center"
          >
            Go to Control Room
          </Link>
        </div>
      </div>
    </div>
  );
}
