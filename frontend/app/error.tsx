'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center text-white">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl max-w-md w-full">
        <h2 className="text-3xl font-extrabold text-white mb-2">Something Went Wrong</h2>
        <p className="text-slate-400 text-sm mb-6">
          We encountered an unexpected error. You can try refreshing the view or navigating home.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 text-center"
          >
            Try Again
          </button>
          <a
            href="/"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 text-center"
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}
