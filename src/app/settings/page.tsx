
'use client';

import { useState, useRef } from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';

const initialUser = {
  name: 'Valter',
  email: 'valter@email.com',
  avatar: placeholderImages.creators[4].src,
};

function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number
  ) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    )
  }

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Definições</h1>
        <p className="text-muted-foreground">Gerencie as definições e preferências da sua conta.</p>
      </div>
      <div className="grid grid-cols-1 gap-8 items-start">
        <ProfileSettings />
      </div>
    </div>
  );
}

function ProfileSettings() {
  const { toast } = useToast();
  const [user, setUser] = useState(initialUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [isCropModalOpen, setCropModalOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgSrc(reader.result as string);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };
  
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, 1))
  }

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUser(prev => ({ ...prev, name: event.target.value }));
  }

  const handleSaveChanges = () => {
    // Here you would typically send the data to a server
    console.log("Saving data:", user);
    toast({
      title: "Perfil Atualizado",
      description: "As suas alterações foram guardadas com sucesso.",
    });
  }

  const handleCropComplete = () => {
    if (imgRef.current && crop?.width && crop?.height) {
        const canvas = document.createElement('canvas');
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(
                imgRef.current,
                crop.x * scaleX,
                crop.y * scaleY,
                crop.width * scaleX,
                crop.height * scaleY,
                0,
                0,
                crop.width,
                crop.height
            );
            const base64Image = canvas.toDataURL('image/jpeg');
            setUser(prev => ({ ...prev, avatar: base64Image }));
        }
    }
    setCropModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>É assim que os outros o verão no site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              <Button onClick={() => fileInputRef.current?.click()}>Mudar Foto</Button>
              <p className="text-xs text-muted-foreground">JPG, GIF ou PNG. 1MB no máximo.</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={user.name} onChange={handleNameChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user.email} readOnly className="bg-muted/50 cursor-not-allowed" />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSaveChanges}>Guardar Alterações</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Terminar sessão</CardTitle>
          <CardDescription>Termine a sessão da sua conta neste dispositivo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Terminar sessão
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isCropModalOpen} onOpenChange={setCropModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cortar a sua nova foto de perfil</DialogTitle>
          </DialogHeader>
          {imgSrc && (
            <div className='flex justify-center'>
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                aspect={1}
                className='max-h-[70vh]'
              >
                <img ref={imgRef} alt="Crop me" src={imgSrc} onLoad={onImageLoad} />
              </ReactCrop>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleCropComplete}>Cortar e Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
