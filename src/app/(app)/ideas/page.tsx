
'use client';

import { useState, useEffect } from 'react';
import type { ContentIdea, ContentType } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Star,
  Trash2,
  ExternalLink,
  Lightbulb,
  Loader2,
  Sparkles,
  Edit
} from 'lucide-react';
import { generateContentIdeas } from '@/ai/flows/generate-content-ideas';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy, updateDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const contentTypes: ContentType[] = ['Humor/Meme', 'Skill/Treino', 'Mindset/Rotina', 'YouTube'];
type FilterType = ContentType | 'All' | 'Favorites';


export default function IdeasPage() {
  const [filter, setFilter] = useState<FilterType>('All');
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);

  const firestore = useFirestore();
  const { user } = useUser();

  const ideasCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/contentIdeas`);
  }, [firestore, user]);

  const ideasQuery = useMemoFirebase(() => {
    if (!ideasCollection) return null;
    return query(ideasCollection, orderBy('createdAt', 'desc'));
  }, [ideasCollection]);

  const { data: ideas = [], isLoading } = useCollection<Omit<ContentIdea, 'id'>>(ideasQuery);

  const toggleFavorite = (id: string, isFavorite: boolean) => {
    if (!user) return;
    const ideaDoc = doc(firestore, `users/${user.uid}/contentIdeas`, id);
    updateDocumentNonBlocking(ideaDoc, { isFavorite: !isFavorite });
  };

  const toggleCompleted = (id: string, isCompleted: boolean) => {
    if (!user) return;
    const ideaDoc = doc(firestore, `users/${user.uid}/contentIdeas`, id);
    updateDocumentNonBlocking(ideaDoc, { isCompleted: !isCompleted });
  };

  const deleteIdea = (id: string) => {
    if (!user) return;
    const ideaDoc = doc(firestore, `users/${user.uid}/contentIdeas`, id);
    deleteDocumentNonBlocking(ideaDoc);
  };

  const addIdea = (newIdea: Omit<ContentIdea, 'id' | 'createdAt'>) => {
    if (ideasCollection) {
      addDocumentNonBlocking(ideasCollection, { ...newIdea, createdAt: serverTimestamp() });
      setAddDialogOpen(false);
    }
  };

  const editIdea = async (updatedData: Partial<Omit<ContentIdea, 'id' | 'createdAt'>>) => {
    if (!user || !selectedIdea) return;
    const ideaDoc = doc(firestore, `users/${user.uid}/contentIdeas`, selectedIdea.id);
    await updateDoc(ideaDoc, updatedData);
    setEditDialogOpen(false);
    setSelectedIdea(null);
  };
  
  const openEditDialog = (idea: ContentIdea) => {
    setSelectedIdea(idea);
    setEditDialogOpen(true);
  };

  const filteredIdeas = (ideas || []).filter(idea => {
    if (filter === 'All') return true;
    if (filter === 'Favorites') return idea.isFavorite;
    return idea.contentType === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ideias de Conteúdo</h1>
          <p className="text-muted-foreground">Gerencie e brainstorm suas próximas ideias de vídeo viral.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
                <Button disabled={!user}>
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Ideia
                </Button>
            </DialogTrigger>
            <AddIdeaDialog onAddIdea={addIdea} onOpenChange={setAddDialogOpen} />
        </Dialog>
      </div>

      <AIBrainstormCard addIdea={addIdea} disabled={!user} />

      <Card>
        <CardHeader>
          <CardTitle>Sua Lista de Ideias</CardTitle>
          <CardDescription>
            Aqui estão todas as suas ideias de conteúdo. Filtre-as por categoria.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="All">Todas</TabsTrigger>
              {contentTypes.map((type) => (
                <TabsTrigger key={type} value={type}>{type.split('/')[0]}</TabsTrigger>
              ))}
              <TabsTrigger value="Favorites">Favoritos</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {isLoading && <p>A carregar ideias...</p>}
            {!isLoading && filteredIdeas.length > 0 ? (
                filteredIdeas.map((idea) => (
                    <IdeaCard 
                        key={idea.id} 
                        idea={idea} 
                        onToggleFavorite={toggleFavorite} 
                        onToggleCompleted={toggleCompleted}
                        onDelete={deleteIdea}
                        onEdit={openEditDialog}
                    />
                ))
            ) : !isLoading && (
                <div className="text-center py-12 text-muted-foreground col-span-full">
                    <p>Nenhuma ideia encontrada para esta categoria. Hora de ter ideias!</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) setSelectedIdea(null); setEditDialogOpen(isOpen); }}>
        <EditIdeaDialog
          idea={selectedIdea}
          onEditIdea={editIdea}
          onOpenChange={setEditDialogOpen}
        />
      </Dialog>
    </div>
  );
}

function IdeaCard({ idea, onToggleFavorite, onToggleCompleted, onDelete, onEdit }: {
    idea: ContentIdea,
    onToggleFavorite: (id: string, isFavorite: boolean) => void,
    onToggleCompleted: (id: string, isCompleted: boolean) => void,
    onDelete: (id: string) => void,
    onEdit: (idea: ContentIdea) => void,
}) {
    return (
        <Card className={`flex flex-col transition-all ${idea.isCompleted ? 'bg-muted/30' : 'bg-card'}`}>
            <CardHeader>
                <CardTitle className="text-lg flex justify-between items-start">
                    <div>
                        <Badge variant="secondary">{idea.contentType}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onToggleFavorite(idea.id, idea.isFavorite)}>
                        <Star className={`h-5 w-5 ${idea.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                    </Button>
                </CardTitle>
                <CardDescription className={`flex-grow min-h-[40px] ${idea.isCompleted ? 'line-through' : ''}`}>
                    {idea.description}
                </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between items-center mt-auto pt-4 border-t">
                <div className="flex items-center space-x-2">
                    <Switch id={`completed-${idea.id}`} checked={idea.isCompleted} onCheckedChange={() => onToggleCompleted(idea.id, idea.isCompleted)} />
                    <Label htmlFor={`completed-${idea.id}`} className="text-sm">Feito</Label>
                </div>
                <div className='flex items-center gap-1'>
                    {idea.videoLink && (
                        <a href={idea.videoLink} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon" className="h-8 w-8">
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </a>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(idea)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/80 hover:text-destructive" onClick={() => onDelete(idea.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

function AddIdeaDialog({ onAddIdea, onOpenChange }: { onAddIdea: (idea: Omit<ContentIdea, 'id'| 'createdAt'>) => void, onOpenChange: (isOpen: boolean) => void }) {
    const [description, setDescription] = useState('');
    const [videoLink, setVideoLink] = useState('');
    const [contentType, setContentType] = useState<ContentType | ''>('');

    const handleSubmit = () => {
        if(description && contentType) {
            onAddIdea({
                description,
                videoLink,
                contentType,
                isFavorite: false,
                isCompleted: false,
            });
            setDescription('');
            setVideoLink('');
            setContentType('');
            onOpenChange(false);
        }
    }

    return (
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Adicionar Nova Ideia de Conteúdo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="description">Descrição da Ideia</Label>
                    <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descreva sua ideia brilhante..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="videoLink">Link de Inspiração (Opcional)</Label>
                    <Input id="videoLink" value={videoLink} onChange={e => setVideoLink(e.target.value)} placeholder="https://youtube.com/..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="contentType">Tipo de Conteúdo</Label>
                    <Select onValueChange={(v) => setContentType(v as ContentType)} value={contentType}>
                        <SelectTrigger id="contentType">
                            <SelectValue placeholder="Selecione um tipo de conteúdo" />
                        </SelectTrigger>
                        <SelectContent>
                            {contentTypes.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button onClick={handleSubmit} disabled={!description || !contentType}>Adicionar Ideia</Button>
            </DialogFooter>
        </DialogContent>
    );
}

function EditIdeaDialog({ idea, onEditIdea, onOpenChange }: { idea: ContentIdea | null, onEditIdea: (data: Partial<Omit<ContentIdea, 'id' | 'createdAt'>>) => void, onOpenChange: (isOpen: boolean) => void }) {
    const [description, setDescription] = useState('');
    const [videoLink, setVideoLink] = useState('');
    const [contentType, setContentType] = useState<ContentType | ''>('');

    useEffect(() => {
      if (idea) {
        setDescription(idea.description);
        setVideoLink(idea.videoLink || '');
        setContentType(idea.contentType);
      }
    }, [idea]);

    const handleSubmit = () => {
        if(description && contentType && idea) {
            onEditIdea({
                description,
                videoLink,
                contentType,
            });
            onOpenChange(false);
        }
    }

    if (!idea) return null;

    return (
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Editar Ideia de Conteúdo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-description">Descrição da Ideia</Label>
                    <Textarea id="edit-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descreva sua ideia brilhante..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-videoLink">Link de Inspiração (Opcional)</Label>
                    <Input id="edit-videoLink" value={videoLink} onChange={e => setVideoLink(e.target.value)} placeholder="https://youtube.com/..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-contentType">Tipo de Conteúdo</Label>
                    <Select onValueChange={(v) => setContentType(v as ContentType)} value={contentType}>
                        <SelectTrigger id="edit-contentType">
                            <SelectValue placeholder="Selecione um tipo de conteúdo" />
                        </SelectTrigger>
                        <SelectContent>
                            {contentTypes.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button onClick={handleSubmit} disabled={!description || !contentType}>Guardar Alterações</Button>
            </DialogFooter>
        </DialogContent>
    );
}

function AIBrainstormCard({ addIdea, disabled }: { addIdea: (idea: Omit<ContentIdea, 'id' | 'createdAt'>) => void, disabled: boolean }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [contentType, setContentType] = useState<ContentType>('Humor/Meme');

    const handleGenerateIdeas = async () => {
        setIsLoading(true);
        try {
            const result = await generateContentIdeas({ contentType, numberOfIdeas: 3 });
            result.ideas.forEach(ideaDesc => {
                addIdea({
                    description: ideaDesc,
                    videoLink: '',
                    contentType: contentType,
                    isFavorite: false,
                    isCompleted: false,
                });
            });
            toast({
                title: "Ideias geradas!",
                description: "3 novas ideias foram adicionadas à sua lista.",
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: "Erro",
                description: "Falha ao gerar ideias. Por favor, tente novamente.",
            });
        }
        setIsLoading(false);
    };

    return (
        <Card className="bg-gradient-to-br from-card to-secondary">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lightbulb className="text-primary glow-icon" /> Assistente de Brainstorm IA</CardTitle>
                <CardDescription>Está sem ideias? Deixe a IA gerar algumas com base na sua estratégia de conteúdo.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="w-full sm:w-auto flex-grow space-y-2">
                    <Label htmlFor="ai-contentType">Gerar ideias para:</Label>
                     <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)} disabled={disabled || isLoading}>
                        <SelectTrigger id="ai-contentType">
                            <SelectValue placeholder="Selecione um tipo de conteúdo" />
                        </SelectTrigger>
                        <SelectContent>
                            {contentTypes.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-full sm:w-auto self-end">
                    <Button onClick={handleGenerateIdeas} disabled={disabled || isLoading} className="w-full sm:w-auto">
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Gerar Ideias
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
