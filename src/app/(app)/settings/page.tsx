

'use client';

import { useState, useRef, useEffect } from 'react';
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
import { Loader2, LogOut } from 'lucide-react';
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
import { useDoc, useFirebase, useMemoFirebase, useAuth } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from "firebase/storage";
import type { UserProfile } from '@/lib/types';
import { signOut } from 'firebase/auth';


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

  function getCroppedImg(image: HTMLImageElement, crop: Crop): Promise<string> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Ensure crop dimensions are defined
    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;

    if (cropWidth === 0 || cropHeight === 0) {
        return Promise.reject(new Error('Crop dimensions cannot be zero.'));
    }

    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return Promise.reject(new Error('Failed to get 2D context from canvas.'));
    }
  
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );
  
    return new Promise((resolve) => {
      resolve(canvas.toDataURL('image/jpeg'));
    });
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
  const { user, firestore } = useFirebase();
  const auth = useAuth();

  const userProfileDoc = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileDoc);
  
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(''); // This will hold the URL or the base64 data URI of the new avatar
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgSrc, setImgSrc] = useState(''); // Source for the cropping modal
  const [crop, setCrop] = useState<Crop>();
  const [isCropModalOpen, setCropModalOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const originalName = userProfile?.name || user?.displayName || '';
  const originalAvatar = userProfile?.avatar || user?.photoURL || '';

  const hasChanges = name !== originalName || avatar !== originalAvatar;

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || user?.displayName || '');
      setAvatar(userProfile.avatar || user?.photoURL || '');
    }
  }, [userProfile, user]);


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgSrc(reader.result as string);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
      // Clear input value to allow re-selecting the same file
      event.target.value = '';
    }
  };
  
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, 1))
  }

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  }

  const handleSaveChanges = async () => {
    if (!userProfileDoc || !user) return;
    setIsSaving(true);
    
    try {
        let finalAvatarUrl = originalAvatar;

        // If 'avatar' state is a data URI, it means a new image was cropped and needs uploading.
        if (avatar.startsWith('data:image')) {
            const storage = getStorage();
            const avatarRef = storageRef(storage, `avatars/${user.uid}/profile.jpg`);
            await uploadString(avatarRef, avatar, 'data_url');
            finalAvatarUrl = await getDownloadURL(avatarRef);
        }

        const updatedProfile = {
            name: name,
            avatar: finalAvatarUrl
        };

        await updateDoc(userProfileDoc, updatedProfile);
        
        // After saving, update local state to match the new 'original' values
        setAvatar(finalAvatarUrl);

        toast({
            title: "Perfil Atualizado",
            description: "As suas alterações foram guardadas com sucesso.",
        });
    } catch(e) {
        console.error("Error saving profile: ", e);
        toast({
            variant: 'destructive',
            title: "Erro ao Guardar",
            description: "Não foi possível guardar as alterações no seu perfil.",
        });
    } finally {
        setIsSaving(false);
    }
  }

  const handleCropComplete = async () => {
    if (imgRef.current && crop?.width && crop?.height) {
        try {
            const croppedImageBase64 = await getCroppedImg(imgRef.current, crop);
            setAvatar(croppedImageBase64); // Update avatar state with the new base64 image
        } catch (e) {
            console.error("Error cropping image:", e);
            toast({
                variant: 'destructive',
                title: "Erro ao Cortar",
                description: "Não foi possível processar a imagem.",
            });
        }
    }
    setCropModalOpen(false);
  };
  
  const handleSignOut = () => {
    signOut(auth).catch((error) => {
      console.error('Error signing out: ', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Terminar Sessão',
        description: 'Não foi possível terminar a sessão. Por favor, tente novamente.',
      });
    });
    // The layout's effect will handle the redirect.
  };

  const currentName = name || originalName;
  const currentAvatar = avatar || originalAvatar;


  if (isProfileLoading) {
    return <Card>
        <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>É assim que os outros o verão no site.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        </CardContent>
    </Card>;
  }


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
              <AvatarImage src={currentAvatar} alt={currentName} />
              <AvatarFallback>{currentName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              <Button onClick={() => fileInputRef.current?.click()}>Mudar Foto</Button>
              <p className="text-xs text-muted-foreground">JPG ou PNG. 1MB no máximo.</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={name} onChange={handleNameChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user?.email || ''} readOnly className="bg-muted/50 cursor-not-allowed" />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSaveChanges} disabled={isSaving || !hasChanges}>
            {isSaving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Guardar Alterações
            </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Terminar sessão</CardTitle>
          <CardDescription>Termine a sessão da sua conta neste dispositivo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleSignOut}>
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
            <Button onClick={handleCropComplete}>Cortar e Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
