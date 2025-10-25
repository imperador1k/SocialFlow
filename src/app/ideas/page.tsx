'use client';

import { useState } from 'react';
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
  CheckCircle2,
  ExternalLink,
  Lightbulb,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { generateContentIdeas } from '@/ai/flows/generate-content-ideas';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const initialIdeas: ContentIdea[] = [
  {
    id: 1,
    description: 'A funny compilation of gaming fails from the past week.',
    videoLink: 'https://youtube.com/example1',
    contentType: 'Humor/Meme',
    isFavorite: true,
    isCompleted: false,
  },
  {
    id: 2,
    description: 'Tutorial on how to master a difficult combo in the new fighting game.',
    videoLink: '',
    contentType: 'Skill/Treino',
    isFavorite: false,
    isCompleted: false,
  },
  {
    id: 3,
    description: 'A day in my life as a full-time content creator.',
    videoLink: 'https://tiktok.com/example2',
    contentType: 'Mindset/Rotina',
    isFavorite: false,
    isCompleted: true,
  },
];

const contentTypes: ContentType[] = ['Humor/Meme', 'Skill/Treino', 'Mindset/Rotina', 'YouTube'];

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<ContentIdea[]>(initialIdeas);
  const [filter, setFilter] = useState<ContentType | 'All'>('All');
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);

  const toggleFavorite = (id: number) => {
    setIdeas(ideas.map((idea) => (idea.id === id ? { ...idea, isFavorite: !idea.isFavorite } : idea)));
  };

  const toggleCompleted = (id: number) => {
    setIdeas(ideas.map((idea) => (idea.id === id ? { ...idea, isCompleted: !idea.isCompleted } : idea)));
  };

  const deleteIdea = (id: number) => {
    setIdeas(ideas.filter((idea) => idea.id !== id));
  };

  const addIdea = (newIdea: Omit<ContentIdea, 'id'>) => {
    setIdeas([...ideas, { ...newIdea, id: Date.now() }]);
    setAddDialogOpen(false);
  };
  
  const filteredIdeas = ideas.filter(idea => filter === 'All' || idea.contentType === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Ideas</h1>
          <p className="text-muted-foreground">Manage and brainstorm your next viral video.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Idea
                </Button>
            </DialogTrigger>
            <AddIdeaDialog onAddIdea={addIdea} />
        </Dialog>
      </div>

      <AIBrainstormCard addIdea={addIdea} />

      <Card>
        <CardHeader>
          <CardTitle>Your Idea List</CardTitle>
          <CardDescription>
            Here are all your content ideas. Filter them by category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="All">All</TabsTrigger>
              {contentTypes.map((type) => (
                <TabsTrigger key={type} value={type}>{type.split('/')[0]}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredIdeas.length > 0 ? (
                filteredIdeas.map((idea) => (
                    <IdeaCard 
                        key={idea.id} 
                        idea={idea} 
                        onToggleFavorite={toggleFavorite} 
                        onToggleCompleted={toggleCompleted}
                        onDelete={deleteIdea}
                    />
                ))
            ) : (
                <div className="text-center py-12 text-muted-foreground col-span-full">
                    <p>No ideas found for this category. Time to brainstorm!</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function IdeaCard({ idea, onToggleFavorite, onToggleCompleted, onDelete }: {
    idea: ContentIdea,
    onToggleFavorite: (id: number) => void,
    onToggleCompleted: (id: number) => void,
    onDelete: (id: number) => void,
}) {
    return (
        <Card className={`flex flex-col transition-all ${idea.isCompleted ? 'bg-muted/30' : 'bg-card'}`}>
            <CardHeader>
                <CardTitle className="text-lg flex justify-between items-start">
                    <div>
                        <Badge variant="secondary">{idea.contentType}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onToggleFavorite(idea.id)}>
                        <Star className={`h-5 w-5 ${idea.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                    </Button>
                </CardTitle>
                <CardDescription className={`flex-grow min-h-[40px] ${idea.isCompleted ? 'line-through' : ''}`}>
                    {idea.description}
                </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between items-center mt-auto pt-4 border-t">
                <div className="flex items-center space-x-2">
                    <Switch id={`completed-${idea.id}`} checked={idea.isCompleted} onCheckedChange={() => onToggleCompleted(idea.id)} />
                    <Label htmlFor={`completed-${idea.id}`} className="text-sm">Done</Label>
                </div>
                <div className='flex items-center gap-1'>
                    {idea.videoLink && (
                        <a href={idea.videoLink} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon" className="h-8 w-8">
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </a>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/80 hover:text-destructive" onClick={() => onDelete(idea.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

function AddIdeaDialog({ onAddIdea }: { onAddIdea: (idea: Omit<ContentIdea, 'id'>) => void }) {
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
        }
    }

    return (
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Add a New Content Idea</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="description">Idea Description</Label>
                    <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your brilliant idea..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="videoLink">Inspiration Link (Optional)</Label>
                    <Input id="videoLink" value={videoLink} onChange={e => setVideoLink(e.target.value)} placeholder="https://youtube.com/..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="contentType">Content Type</Label>
                    <Select onValueChange={(v) => setContentType(v as ContentType)}>
                        <SelectTrigger id="contentType">
                            <SelectValue placeholder="Select a content type" />
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
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleSubmit} disabled={!description || !contentType}>Add Idea</Button>
            </DialogFooter>
        </DialogContent>
    );
}


function AIBrainstormCard({ addIdea }: { addIdea: (idea: Omit<ContentIdea, 'id'>) => void }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [contentType, setContentType] = useState<ContentType>('Humor/Meme');

    const handleGenerateIdeas = async () => {
        setIsLoading(true);
        try {
            const result = await generateContentIdeas({ theme: 'gaming and streaming', contentType, numberOfIdeas: 3 });
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
                title: "Ideas generated!",
                description: "3 new ideas have been added to your list.",
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to generate ideas. Please try again.",
            });
        }
        setIsLoading(false);
    };

    return (
        <Card className="bg-gradient-to-br from-card to-secondary">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lightbulb className="text-primary glow-icon" /> AI Brainstorm Assistant</CardTitle>
                <CardDescription>Feeling stuck? Let AI generate some ideas for you.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="w-full sm:w-auto flex-grow space-y-2">
                    <Label htmlFor="ai-contentType">Select a Content Type</Label>
                     <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                        <SelectTrigger id="ai-contentType">
                            <SelectValue placeholder="Select a content type" />
                        </SelectTrigger>
                        <SelectContent>
                            {contentTypes.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-full sm:w-auto self-end">
                    <Button onClick={handleGenerateIdeas} disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Generate Ideas
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
