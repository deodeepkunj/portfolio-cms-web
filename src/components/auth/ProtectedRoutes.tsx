'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoutes({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/signin');
      return;
    }

    if (user?.role !== 1) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, user,  router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // ⛔ Do NOT render layout for unauth users
  if (!isAuthenticated) return null;

  // ⛔ Role mismatch
  if (user?.role !== 1) return null;

  // ✅ Render protected content
  return <>{children}</>;
}
