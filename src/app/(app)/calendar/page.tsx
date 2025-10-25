
'use client';

import { useState, useEffect } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PlusCircle, Instagram, Youtube, Edit, Trash2 } from 'lucide-react';
import type { CalendarEvent, ContentType } from '@/lib/types';
import { format, isSameDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';


const platformIcons: Record<CalendarEvent['platform'], React.ReactNode> = {
  Instagram: <Instagram className="h-4 w-4" />,
  TikTok: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.63-1.1-6-3.02-1.25-1.78-1.9-4.08-1.98-6.32a24.52 24.52 0 01.04-4.74c.12-2.11 1.1-4.1 2.52-5.59 1.84-1.95 4.33-2.98 6.78-2.93z" />
    </svg>
  ),
  YouTube: <Youtube className="h-4 w-4" />,
};

const contentTypeColors: Record<ContentType, string> = {
    "Humor/Meme": "bg-chart-1/20 text-chart-1 border-chart-1/30",
    "Skill/Treino": "bg-chart-2/20 text-chart-2 border-chart-2/30",
    "Mindset/Rotina": "bg-chart-3/20 text-chart-3 border-chart-3/30",
    "YouTube": "bg-destructive/20 text-destructive border-destructive/30",
};

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const firestore = useFirestore();
  const { user } = useUser();

  const eventsCollectionRef = useMemoFirebase(() => {
    if(!user) return null;
    return collection(firestore, `users/${user.uid}/calendarEvents`);
  }, [firestore, user]);
  
  const { data: events = [] } = useCollection<CalendarEvent>(eventsCollectionRef);

  const eventsWithDateObjects = (events || []).map(event => ({
    ...event,
    date: (event.date as Timestamp).toDate(),
  }))


  const selectedDayEvents = eventsWithDateObjects.filter((event) => date && isSameDay(event.date, date)).sort((a,b) => a.date.getTime() - b.date.getTime());
  const eventDates = eventsWithDateObjects.map((event) => event.date);

  const handleAddEvent = (eventData: Omit<CalendarEvent, 'id' | 'date'>) => {
    if (!date || !eventsCollectionRef) return;
    const newEvent = {
      ...eventData,
      date: Timestamp.fromDate(date),
    };
    addDocumentNonBlocking(eventsCollectionRef, newEvent);
    setAddDialogOpen(false);
  };
  
  const handleEditEvent = async (eventData: Omit<CalendarEvent, 'id' | 'date'>) => {
    if (!selectedEvent || !user) return;
    const eventDoc = doc(firestore, `users/${user.uid}/calendarEvents`, selectedEvent.id);
    // Keep the original date, as we are not editing it in this dialog
    const updatedData = { 
      ...eventData,
      date: selectedEvent.date
    };
    await updateDoc(eventDoc, updatedData);
    setEditDialogOpen(false);
    setSelectedEvent(null);
  }

  const handleDeleteEvent = () => {
    if (!selectedEvent || !user) return;
    const eventDoc = doc(firestore, `users/${user.uid}/calendarEvents`, selectedEvent.id);
    deleteDocumentNonBlocking(eventDoc);
    setDeleteDialogOpen(false);
    setSelectedEvent(null);
  }
  
  const openEditDialog = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
      <Card className="xl:col-span-2">
        <CardContent className="p-1">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="p-0"
            classNames={{
                root: 'w-full',
                months: 'w-full',
                month: 'w-full',
                table: 'w-full',
                head_row: 'grid grid-cols-7',
                row: 'grid grid-cols-7',
                cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                day: 'h-14 w-full p-1 font-normal aria-selected:opacity-100',
                day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md',
                day_today: 'bg-accent text-accent-foreground rounded-md',
                day_outside: 'text-muted-foreground opacity-50',
                day_disabled: 'text-muted-foreground opacity-50',
                day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
                day_hidden: 'invisible',
                ...{
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                }
            }}
            modifiers={{ scheduled: eventDates }}
            modifiersClassNames={{
                scheduled: 'relative before:absolute before:bottom-2 before:left-1/2 before:-translate-x-1/2 before:w-1.5 before:h-1.5 before:bg-primary before:rounded-full',
            }}
            components={{
                DayContent: ({ date, ...props }) => (
                    <div className="flex flex-col items-center justify-center h-full">
                        <span>{format(date, 'd')}</span>
                    </div>
                ),
            }}
          />
        </CardContent>
      </Card>

      <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Agenda para <span className="text-primary">{date ? format(date, 'd \'de\' MMMM') : '...'}</span>
              </CardTitle>
              <CardDescription>
                {selectedDayEvents.length} post{selectedDayEvents.length !== 1 ? 's' : ''} agendado{selectedDayEvents.length !== 1 ? 's' : ''}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 group relative">
                       <div className="p-2 bg-muted rounded-full text-muted-foreground mt-1">{platformIcons[event.platform]}</div>
                       <div className="flex-grow">
                            <p className="font-medium text-sm leading-tight">{event.title}</p>
                            <Badge variant="outline" className={`mt-1 text-xs ${contentTypeColors[event.contentType]}`}>
                                {event.contentType}
                            </Badge>
                       </div>
                       <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(event)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/80 hover:text-destructive" onClick={() => openDeleteDialog(event)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Nenhum post agendado para este dia.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" disabled={!date || !user}>
                <PlusCircle className="mr-2" /> Adicionar Post
              </Button>
            </DialogTrigger>
            <EventDialog title="Agendar um Novo Post" buttonText="Agendar Post" onConfirm={handleAddEvent} onOpenChange={setAddDialogOpen} />
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => { setEditDialogOpen(isOpen); if (!isOpen) setSelectedEvent(null); }}>
            <EventDialog 
              title="Editar Post Agendado" 
              buttonText="Guardar Alterações" 
              onConfirm={handleEditEvent} 
              event={selectedEvent} 
              onOpenChange={setEditDialogOpen}
            />
          </Dialog>

          {/* Delete Alert Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={(isOpen) => { setDeleteDialogOpen(isOpen); if (!isOpen) setSelectedEvent(null); }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isto irá apagar permanentemente o post agendado.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Apagar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      </div>
    </div>
  );
}

function EventDialog({ 
    title, 
    buttonText, 
    onConfirm, 
    event,
    onOpenChange,
}: { 
    title: string, 
    buttonText: string,
    onConfirm: (event: Omit<CalendarEvent, 'id' | 'date'>) => void,
    event?: CalendarEvent | null,
    onOpenChange: (isOpen: boolean) => void,
}) {
  const [postTitle, setPostTitle] = useState('');
  const [platform, setPlatform] = useState<'Instagram' | 'TikTok' | 'YouTube' | undefined>();
  const [contentType, setContentType] = useState<ContentType | undefined>();

  useEffect(() => {
    if (event) {
      setPostTitle(event.title);
      setPlatform(event.platform);
      setContentType(event.contentType);
    } else {
      // Reset for new event
      setPostTitle('');
      setPlatform(undefined);
      setContentType(undefined);
    }
  }, [event]);


  const handleSubmit = () => {
    if (postTitle && platform && contentType) {
      onConfirm({ title: postTitle, platform, contentType });
      onOpenChange(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título do Post</Label>
          <Input id="title" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="ex: Novo vídeo sobre..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Plataforma</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as any)}>
              <SelectTrigger id="platform">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="TikTok">TikTok</SelectItem>
                <SelectItem value="YouTube">YouTube</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contentType">Tipo de Conteúdo</Label>
            <Select value={contentType} onValueChange={(v) => setContentType(v as any)}>
              <SelectTrigger id="contentType">
                <SelectValue placeholder="Selecione..." />
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
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={!postTitle || !platform || !contentType}>
            {buttonText}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
