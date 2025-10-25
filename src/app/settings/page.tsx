'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Bell, Palette, Lock, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import placeholderImages from '@/lib/placeholder-images.json';

const settingsNav = [
  { name: 'Profile', icon: User },
  { name: 'Notifications', icon: Bell },
  { name: 'Appearance', icon: Palette },
  { name: 'Security', icon: Lock },
];

const mockUser = {
  name: 'Valter',
  email: 'valter@email.com',
  avatar: placeholderImages.creators[4].src,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Profile');

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <nav className="flex flex-row overflow-x-auto lg:flex-col gap-1 lg:col-span-1">
          {settingsNav.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              onClick={() => setActiveTab(item.name)}
              className={cn(
                'justify-start w-full whitespace-nowrap',
                activeTab === item.name && 'bg-muted text-foreground font-semibold'
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Button>
          ))}
        </nav>
        <div className="lg:col-span-4">
          {activeTab === 'Profile' && <ProfileSettings />}
          {activeTab !== 'Profile' && <PlaceholderSection title={activeTab} />}
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>This is how others will see you on the site.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                    <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                    <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                        <Button>Change Photo</Button>
                        <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue={mockUser.name} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={mockUser.email} />
                </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                <Button>Save Changes</Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Log out</CardTitle>
                    <CardDescription>Log out of your account on this device.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

function PlaceholderSection({ title }: { title: string }) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Settings for {title.toLowerCase()} will be available here soon.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex h-[200px] w-full items-center justify-center rounded-md border-2 border-dashed">
                <p className="text-muted-foreground">Coming Soon</p>
            </div>
        </CardContent>
      </Card>
    );
  }
