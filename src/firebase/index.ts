'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Auth, getAuth, connectAuthEmulator } from 'firebase/auth';
import { Firestore, getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

function getEmulatorHost(service: 'auth' | 'firestore'): string | undefined {
    // This is a browser-only function, so we can safely use window.
    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        // Don't use emulators in production or when the host is the default App Hosting domain.
        if (process.env.NODE_ENV === 'production' || host.endsWith('web.app')) {
            return undefined;
        }
        
        // Use a common host for emulators based on the current window host.
        // This is flexible for different local development setups.
        if (service === 'auth') return `http://${host}:9099`;
        if (service === 'firestore') return `http://${host}:8080`;
    }
    return undefined;
}


// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase(): { firebaseApp: FirebaseApp, auth: Auth, firestore: Firestore } {
    const isInitialized = getApps().length > 0;
    const firebaseApp = isInitialized ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);

    if (!isInitialized) {
        const authHost = getEmulatorHost('auth');
        const firestoreHost = getEmulatorHost('firestore');

        if (authHost) {
            connectAuthEmulator(auth, authHost, { disableWarnings: true });
        }
        if (firestoreHost) {
            // Firestore's connect function needs host and port separately.
            const url = new URL(firestoreHost);
            connectFirestoreEmulator(firestore, url.hostname, parseInt(url.port, 10));
        }
    }

    return { firebaseApp, auth, firestore };
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
