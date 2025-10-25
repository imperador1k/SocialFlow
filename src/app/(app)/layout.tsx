'use client';

import { AppShell } from '@/components/app-shell';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading, userError } = useUser();
    const router = useRouter();

    useEffect(() => {
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
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-background">
              <p className="text-destructive">Ocorreu um erro de autenticação. Por favor, tente novamente.</p>
            </div>
        )
    }

    if (user) {
        return <AppShell>{children}</AppShell>;
    }

    // While redirecting or if user is null before redirect effect runs
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
}
