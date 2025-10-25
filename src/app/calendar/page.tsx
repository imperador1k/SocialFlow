'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PlusCircle, Instagram, Youtube } from 'lucide-react';
import type { CalendarEvent, ContentType } from '@/lib/types';
import { add, format, isSameDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const initialEvents: CalendarEvent[] = [
  {
    id: 1,
    title: 'New Reel: "My Morning Routine"',
    date: new Date(),
    platform: 'Instagram',
    contentType: 'Mindset/Rotina',
  },
  {
    id: 2,
    title: 'Shorts: "3 Tips for Better Aim"',
    date: new Date(),
    platform: 'YouTube',
    contentType: 'Skill/Treino',
  },
  {
    id: 3,
    title: 'TikTok: Funny gaming moment',
    date: add(new Date(), { days: 2 }),
    platform: 'TikTok',
    contentType: 'Humor/Meme',
  },
  {
    id: 4,
    title: 'Long-form Video: "How I grew my channel"',
    date: add(new Date(), { days: 4 }),
    platform: 'YouTube',
    contentType: 'YouTube',
  },
];

const platformIcons = {
  Instagram: <Instagram className="h-4 w-4" />,
  TikTok: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.63-1.1-6-3.02-1.25-1.78-1.9-4.08-1.98-6.32a24.52 24.52 0 01.04-4.74c.12-2.11 1.1-4.1 2.52-5.59 1.84-1.95 4.33-2.98 6.78-2.93z" />
    </svg>
  ),
  YouTube: <Youtube className="h-4 w-4" />,
};

const contentTypeColors: Record<ContentType, string> = {
    "Humor/Meme": "bg-chart-1/20 text-chart-1",
    "Skill/Treino": "bg-chart-2/20 text-chart-2",
    "Mindset/Rotina": "bg-chart-3/20 text-chart-3",
    "YouTube": "bg-destructive/20 text-destructive",
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const selectedDayEvents = events.filter((event) => date && isSameDay(event.date, date)).sort((a,b) => a.date.getTime() - b.date.getTime());
  const eventDates = events.map((event) => event.date);

  const handleAddEvent = (eventData: Omit<CalendarEvent, 'id' | 'date'>) => {
    if (!date) return;
    const newEvent: CalendarEvent = {
      id: Date.now(),
      date: date,
      ...eventData,
    };
    setEvents([...events, newEvent]);
    setIsDialogOpen(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Content Calendar</CardTitle>
          <CardDescription>Plan and visualize your content schedule.</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border p-0"
            modifiers={{ scheduled: eventDates }}
            modifiersClassNames={{
                scheduled: 'relative before:absolute before:bottom-1 before:left-1/2 before:-translate-x-1/2 before:w-1.5 before:h-1.5 before:bg-primary before:rounded-full',
                selected: 'bg-primary/90 text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground'
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Schedule for <span className="text-primary">{date ? format(date, 'MMMM do') : '...'}</span>
          </CardTitle>
          <CardDescription>
            {selectedDayEvents.length} post{selectedDayEvents.length !== 1 ? 's' : ''} scheduled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                   <div className="p-2 bg-muted rounded-full text-muted-foreground">{platformIcons[event.platform]}</div>
                   <div className="flex-grow">
                        <p className="font-medium text-sm">{event.title}</p>
                        <Badge variant="outline" className={`text-xs ${contentTypeColors[event.contentType]}`}>
                            {event.contentType}
                        </Badge>
                   </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No posts scheduled for this day.</p>
              </div>
            )}
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" disabled={!date}>
                <PlusCircle className="mr-2" /> Add Post
              </Button>
            </DialogTrigger>
            <AddEventDialog onAddEvent={handleAddEvent} />
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

function AddEventDialog({ onAddEvent }: { onAddEvent: (event: Omit<CalendarEvent, 'id' | 'date'>) => void }) {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<'Instagram' | 'TikTok' | 'YouTube'>();
  const [contentType, setContentType] = useState<ContentType>();

  const handleSubmit = () => {
    if (title && platform && contentType) {
      onAddEvent({ title, platform, contentType });
      setTitle('');
      setPlatform(undefined);
      setContentType(undefined);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Schedule a New Post</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">Post Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. New video about..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="platform">Platform</Label>
          <Select onValueChange={(v) => setPlatform(v as any)}>
            <SelectTrigger id="platform">
              <SelectValue placeholder="Select a platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="TikTok">TikTok</SelectItem>
              <SelectItem value="YouTube">YouTube</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contentType">Content Type</Label>
          <Select onValueChange={(v) => setContentType(v as any)}>
            <SelectTrigger id="contentType">
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Humor/Meme">Humor/Meme</SelectItem>
              <SelectItem value="Skill/Treino">Skill/Treino</SelectItem>
              <SelectItem value="Mindset/Rotina">Mindset/Rotina</SelectItem>
              <SelectItem value="YouTube">YouTube</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={handleSubmit} disabled={!title || !platform || !contentType}>
          Schedule Post
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
