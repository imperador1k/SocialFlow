'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// Este componente interno garante que os hooks só são chamados no cliente.
function FirebaseInitializer({ children }: { children: ReactNode }) {
  const firebaseServices = useMemo(() => {
    // Inicializa o Firebase no lado do cliente, uma vez por montagem do componente.
    return initializeFirebase();
  }, []); // O array de dependências vazio garante que isto só corre uma vez.

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  return <FirebaseInitializer>{children}</FirebaseInitializer>;
}
