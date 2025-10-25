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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import placeholderImages from '@/lib/placeholder-images.json';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/performance', label: 'Performance', icon: BarChart2 },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/ideas', label: 'Ideas', icon: Lightbulb },
  { href: '/inspiration', label: 'Inspiration', icon: Sparkles },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/strategy', label: 'Strategy', icon: FileText },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const mobileNav = (
    <nav className="grid gap-2 text-lg font-medium mt-6">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground transition-colors',
            pathname === href && 'bg-muted text-foreground'
          )}
        >
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        {/* Desktop Navigation */}
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link href="/" className="flex items-center gap-2 lg:mr-4 font-semibold">
            <Sparkles className="h-6 w-6 text-primary glow-icon" />
            <span className="text-lg">SocialFlow</span>
          </Link>
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'transition-colors text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md',
                pathname === href && 'text-foreground font-medium bg-muted'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        
        {/* Mobile Header */}
        <div className="flex items-center gap-4 md:hidden">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-6 w-6 text-primary glow-icon" />
                <span className="text-lg">SocialFlow</span>
            </Link>
        </div>

        <div className="flex items-center gap-2">
            <Link href="/settings">
                <Button variant="ghost" size="icon" className="shrink-0">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                </Button>
            </Link>
            <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                <div className="flex flex-col h-full">
                    <div className='p-4 border-b'>
                        <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <Sparkles className="h-6 w-6 text-primary glow-icon" />
                            <span className="font-bold">SocialFlow</span>
                        </Link>
                        <div className="flex items-center gap-3 mt-4">
                            <Avatar>
                                <AvatarImage src={placeholderImages.creators[4].src} alt="User Avatar" />
                                <AvatarFallback>V</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">Valter</p>
                                <p className="text-sm text-muted-foreground">valter@email.com</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {mobileNav}
                    </div>
                    <div className="p-4 mt-auto border-t">
                         <Link
                            href="/settings"
                            className={cn(
                                'flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground transition-colors text-lg font-medium',
                                pathname === '/settings' && 'bg-muted text-foreground'
                            )}
                            >
                            <User className="h-5 w-5" />
                            Settings
                        </Link>
                    </div>
                </div>
            </SheetContent>
            </Sheet>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}
