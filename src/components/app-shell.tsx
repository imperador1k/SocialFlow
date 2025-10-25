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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/performance', label: 'Performance', icon: BarChart2 },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/ideas', label: 'Content Ideas', icon: Lightbulb },
  { href: '/inspiration', label: 'Inspiration', icon: Sparkles },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/strategy', label: 'Strategy', icon: FileText },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const sidebarNav = (
    <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:text-primary',
            pathname === href && 'bg-muted text-primary font-semibold'
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-6 w-6 text-primary glow-icon" />
              <span className="">SocialFlow</span>
            </Link>
          </div>
          <div className="flex-1 py-4">
            {sidebarNav}
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                  <Sparkles className="h-6 w-6 text-primary glow-icon" />
                  <span>SocialFlow</span>
                </Link>
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
                       pathname === href && 'bg-muted text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
           <div className="flex-1">
             <h1 className="font-semibold text-lg">{navItems.find(item => item.href === pathname)?.label}</h1>
           </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
