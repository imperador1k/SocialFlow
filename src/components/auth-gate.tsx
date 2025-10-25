'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading, userError } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login page.
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);
  
  if (isUserLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (userError) {
      // You could render a more specific error page here
      return (
          <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <p className="text-destructive">Ocorreu um erro de autenticação. Por favor, tente novamente.</p>
          </div>
      )
  }

  // If user is logged in, render the children (the main app).
  if (user) {
    return <>{children}</>;
  }

  // While redirecting or if user is null before redirect effect runs,
  // you can return null or a loader. A loader is better for UX.
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
