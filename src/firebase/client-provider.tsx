'use client';

import React, { useMemo, type ReactNode, useEffect, useState } from 'react';
import { FirebaseProvider, useUser } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { AppShell } from '@/components/app-shell';
import LoginPage from '@/app/login/page';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// This internal component ensures hooks are only called on the client.
function FirebaseInitializer({ children }: { children: ReactNode }) {
  const firebaseServices = useMemo(() => {
    // Initializes Firebase on the client-side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once.

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      <AuthGate>{children}</AuthGate>
    </FirebaseProvider>
  );
}

function AuthGate({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (user && pathname === '/login') {
        router.push('/');
      } else if (!user && pathname !== '/login') {
        router.push('/login');
      }
    }
  }, [user, isUserLoading, pathname, router]);

  if (isUserLoading || (!user && pathname !== '/login') || (user && pathname === '/login')) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (pathname === '/login') {
    return <LoginPage />;
  }

  return <AppShell>{children}</AppShell>;
}


export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  return <FirebaseInitializer>{children}</FirebaseInitializer>;
}
