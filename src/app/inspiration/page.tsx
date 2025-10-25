'use client';
import { useState } from 'react';
import type { Creator, ContentType } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { UserPlus, Trash2 } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';
import Image from 'next/image';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, query, orderBy, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';


const contentTypes: ContentType[] = ['Humor/Meme', 'Skill/Treino', 'Mindset/Rotina', 'YouTube'];

export default function InspirationPage() {
    const [filter, setFilter] = useState<ContentType | 'All'>('All');
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);

    const firestore = useFirestore();
    const { user } = useUser();

    const creatorsCollection = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, `users/${user.uid}/creators`);
    }, [firestore, user]);

    const creatorsQuery = useMemoFirebase(() => {
        if (!creatorsCollection) return null;
        return query(creatorsCollection, orderBy('createdAt', 'desc'));
    }, [creatorsCollection]);

    const { data: creators = [], isLoading } = useCollection<Omit<Creator, 'id'>>(creatorsQuery);


    const addCreator = (newCreator: Omit<Creator, 'id' | 'createdAt'>) => {
        if(creatorsCollection) {
            addDocumentNonBlocking(creatorsCollection, {...newCreator, createdAt: serverTimestamp()});
            setAddDialogOpen(false);
        }
    }
    const deleteCreator = (id: string) => {
        if(!user) return;
        const creatorDoc = doc(firestore, `users/${user.uid}/creators`, id);
        deleteDocumentNonBlocking(creatorDoc);
    }

    const filteredCreators = creators.filter(creator => filter === 'All' || creator.category === filter);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Inspiração de Criadores</h1>
                    <p className="text-muted-foreground">Gerencie sua lista de criadores inspiradores.</p>
                </div>
                 <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button disabled={!user}>
                            <UserPlus className="mr-2 h-4 w-4" /> Adicionar Criador
                        </Button>
                    </DialogTrigger>
                    <AddCreatorDialog onAddCreator={addCreator} />
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
                        <TabsList>
                            <TabsTrigger value="All">Todos</TabsTrigger>
                            {contentTypes.map((type) => (
                                <TabsTrigger key={type} value={type}>{type.split('/')[0]}</TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent>
                     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {isLoading && <p>A carregar criadores...</p>}
                        {!isLoading && filteredCreators.length > 0 ? (
                            filteredCreators.map((creator) => (
                                <CreatorCard key={creator.id} creator={creator} onDelete={deleteCreator}/>
                            ))
                        ) : !isLoading && (
                             <div className="text-center py-12 text-muted-foreground col-span-full">
                                <p>Nenhum criador encontrado para esta categoria.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function CreatorCard({ creator, onDelete }: { creator: Creator, onDelete: (id: string) => void }) {
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
                <span className="sr-only">Excluir criador</span>
            </Button>
        </Card>
    );
}

function AddCreatorDialog({ onAddCreator }: { onAddCreator: (creator: Omit<Creator, 'id' | 'createdAt'>) => void }) {
    const [name, setName] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [socialLink, setSocialLink] = useState('');
    const [category, setCategory] = useState<ContentType | ''>('');
    
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
                <DialogTitle>Adicionar Novo Criador</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Nome do criador" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="photoUrl">URL da Foto</Label>
                    <Input id="photoUrl" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://images.unsplash.com/..." />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="socialLink">Link Social</Label>
                    <Input id="socialLink" value={socialLink} onChange={e => setSocialLink(e.target.value)} placeholder="https://youtube.com/..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Categoria de Conteúdo</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as ContentType)}>
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Selecione uma categoria" />
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
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button onClick={handleSubmit} disabled={!name || !photoUrl || !socialLink || !category}>Adicionar Criador</Button>
            </DialogFooter>
        </DialogContent>
    );
}
