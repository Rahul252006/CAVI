'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ControlRoomSlugPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
        <h2 className="text-lg font-bold">Loading CAVI Control Room...</h2>
        <p className="text-xs text-slate-500">Redirecting to Admin Management Console</p>
      </div>
    </div>
  );
}
