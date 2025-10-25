'use client';
import { useState } from 'react';
import type { Creator, ContentType } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Link as LinkIcon, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { summarizeInspirationContent } from '@/ai/flows/summarize-inspiration-content';
import { useToast } from '@/hooks/use-toast';
import placeholderImages from '@/lib/placeholder-images.json';
import Image from 'next/image';

const initialCreators: Creator[] = [
  {
    id: 1,
    name: 'Ninja',
    photoUrl: placeholderImages.creators[0].src,
    category: 'Skill/Treino',
    socialLink: 'https://twitch.tv/ninja',
  },
  {
    id: 2,
    name: 'PewDiePie',
    photoUrl: placeholderImages.creators[1].src,
    category: 'Humor/Meme',
    socialLink: 'https://youtube.com/pewdiepie',
  },
  {
    id: 3,
    name: 'Pokimane',
    photoUrl: placeholderImages.creators[2].src,
    category: 'Mindset/Rotina',
    socialLink: 'https://twitch.tv/pokimane',
  },
  {
    id: 4,
    name: 'MrBeast',
    photoUrl: placeholderImages.creators[3].src,
    category: 'YouTube',
    socialLink: 'https://youtube.com/mrbeast',
  },
];

const contentTypes: ContentType[] = ['Humor/Meme', 'Skill/Treino', 'Mindset/Rotina', 'YouTube'];

export default function InspirationPage() {
    const [creators, setCreators] = useState<Creator[]>(initialCreators);
    const [filter, setFilter] = useState<ContentType | 'All'>('All');
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);

    const addCreator = (newCreator: Omit<Creator, 'id'>) => {
        setCreators([{...newCreator, id: Date.now()}, ...creators]);
        setAddDialogOpen(false);
    }
    const deleteCreator = (id: number) => {
        setCreators(creators.filter(c => c.id !== id));
    }

    const filteredCreators = creators.filter(creator => filter === 'All' || creator.category === filter);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Creator Inspiration</h1>
                    <p className="text-muted-foreground">Manage your list of inspiring creators.</p>
                </div>
                 <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" /> Add Creator
                        </Button>
                    </DialogTrigger>
                    <AddCreatorDialog onAddCreator={addCreator} />
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
                        <TabsList>
                            <TabsTrigger value="All">All</TabsTrigger>
                            {contentTypes.map((type) => (
                                <TabsTrigger key={type} value={type}>{type.split('/')[0]}</TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent>
                     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredCreators.length > 0 ? (
                            filteredCreators.map((creator) => (
                                <CreatorCard key={creator.id} creator={creator} onDelete={deleteCreator}/>
                            ))
                        ) : (
                             <div className="text-center py-12 text-muted-foreground col-span-full">
                                <p>No creators found for this category.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function CreatorCard({ creator, onDelete }: { creator: Creator, onDelete: (id: number) => void }) {
    const hint = placeholderImages.creators.find(p => p.src === creator.photoUrl)?.hint || 'person portrait';
    return (
        <Card className="group relative">
            <CardContent className="p-0">
                <a href={creator.socialLink} target="_blank" rel="noopener noreferrer">
                    <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg">
                        <Image src={creator.photoUrl} alt={creator.name} fill className="object-cover transition-transform group-hover:scale-105" data-ai-hint={hint} />
                    </div>
                </a>
            </CardContent>
            <CardHeader className="p-4">
                <CardTitle className="text-lg">{creator.name}</CardTitle>
                <CardDescription>{creator.category}</CardDescription>
            </CardHeader>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-destructive/70 hover:text-destructive bg-card/50 hover:bg-card/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onDelete(creator.id)}>
                <Trash2 className="h-4 w-4"/>
                <span className="sr-only">Delete creator</span>
            </Button>
        </Card>
    );
}

function AddCreatorDialog({ onAddCreator }: { onAddCreator: (creator: Omit<Creator, 'id'>) => void }) {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [socialLink, setSocialLink] = useState('');
    const [category, setCategory] = useState<ContentType | ''>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        if(!socialLink) {
            toast({ variant: 'destructive', title: "Please enter a social link."});
            return;
        }
        setIsAnalyzing(true);
        try {
            const result = await summarizeInspirationContent({ creatorLink: socialLink });
            const matchedCategory = contentTypes.find(c => result.category.includes(c));
            if (matchedCategory) {
                setCategory(matchedCategory);
                toast({ title: "Analysis complete!", description: `Suggested category: ${matchedCategory}`});
            } else {
                toast({ variant: 'destructive', title: "Could not determine category", description: "Please select one manually." });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Analysis failed", description: "Could not analyze the link. Please try again." });
        }
        setIsAnalyzing(false);
    }
    
    const handleSubmit = () => {
        if (name && photoUrl && socialLink && category) {
            onAddCreator({ name, photoUrl, socialLink, category });
            setName('');
            setPhotoUrl('');
            setSocialLink('');
            setCategory('');
        }
    }

    return (
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Creator</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="socialLink">Social Link</Label>
                    <div className="flex gap-2">
                        <Input id="socialLink" value={socialLink} onChange={e => setSocialLink(e.target.value)} placeholder="https://youtube.com/..." />
                        <Button variant="outline" onClick={handleAnalyze} disabled={isAnalyzing}>
                            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4"/>}
                        </Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Creator's name" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="photoUrl">Photo URL</Label>
                    <Input id="photoUrl" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://images.unsplash.com/..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Content Category</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as ContentType)}>
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
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
                <Button onClick={handleSubmit} disabled={!name || !photoUrl || !socialLink || !category}>Add Creator</Button>
            </DialogFooter>
        </DialogContent>
    );
}
