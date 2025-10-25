'use client';

import {
  BarChart2,
  Calendar,
  CheckSquare,
  FileText,
  LayoutDashboard,
  Lightbulb,
  Menu,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

// Todos os itens de navegação
const allNavItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/performance', label: 'Performance', icon: BarChart2 },
  { href: '/calendar', label: 'Calendário', icon: Calendar },
  { href: '/ideas', label: 'Ideias', icon: Lightbulb },
  { href: '/inspiration', label: 'Inspiração', icon: Sparkles },
  { href: '/tasks', label: 'Tarefas', icon: CheckSquare },
  { href: '/strategy', label: 'Estratégia', icon: FileText },
];

// Itens principais para a barra de navegação inferior
const mainBottomNavItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendar', label: 'Calendário', icon: Calendar },
  { href: '/ideas', label: 'Ideias', icon: Lightbulb },
  { href: '/tasks', label: 'Tarefas', icon: CheckSquare },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { user, firestore } = useFirebase();

  const userProfileDoc = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileDoc);

  const userAvatar = userProfile?.avatar || user?.photoURL;
  const userName = userProfile?.name || user?.displayName || 'Utilizador';
  const userEmail = userProfile?.email || user?.email || 'sem-email';
  const avatarFallback = userName?.charAt(0).toUpperCase() || 'U';

  const otherNavItems = allNavItems.filter(
    (item) => !mainBottomNavItems.find((mainItem) => mainItem.href === item.href)
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* Header para Desktop */}
      <header className="sticky top-0 z-40 hidden h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:flex md:px-6">
        <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold lg:mr-4">
            <Sparkles className="h-6 w-6 text-primary glow-icon" />
            <span className="text-lg">SocialFlow</span>
          </Link>
          {allNavItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground',
                pathname === href && 'bg-muted font-medium text-foreground'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="shrink-0">
            <User className="h-5 w-5" />
            <span className="sr-only">Definições</span>
          </Button>
        </Link>
      </header>

      {/* Header para Mobile */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:hidden">
         <Link href="/" className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-6 w-6 text-primary glow-icon" />
            <span className="text-lg">SocialFlow</span>
        </Link>
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="shrink-0">
            <User className="h-5 w-5" />
            <span className="sr-only">Definições</span>
          </Button>
        </Link>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8 md:p-8 lg:p-10 p-4">
        {children}
      </main>

      {/* Barra de Navegação Inferior para Mobile */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
        <nav className="grid h-16 grid-cols-5 items-center justify-items-center gap-1 text-xs">
          {mainBottomNavItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex h-full w-full flex-col items-center justify-center gap-1 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className={cn('truncate', isActive ? 'font-medium' : '')}>{label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setSheetOpen(true)}
            className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
            <span className="truncate">Menu</span>
          </button>
        </nav>
      </footer>

      {/* Painel lateral "Mais" para Mobile */}
      <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="h-auto rounded-r-lg p-0">
          <SheetHeader className="flex-row items-center justify-between border-b p-4">
            <SheetTitle>Menu</SheetTitle>
             <Button variant="ghost" size="icon" onClick={() => setSheetOpen(false)}>
             </Button>
          </SheetHeader>
          <div className="p-4">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={userAvatar} alt="Avatar do Utilizador" />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-medium">{userName}</p>
                    <p className="text-sm text-muted-foreground">{userEmail}</p>
                </div>
            </div>
            <nav className="grid gap-2 text-base font-medium">
              {[...otherNavItems, {href: '/settings', label: 'Definições', icon: User}].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSheetOpen(false)}
                  className={cn(
                    'flex items-center gap-4 rounded-lg px-3 py-3 text-muted-foreground hover:text-foreground transition-colors',
                    pathname === href && 'bg-muted text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
