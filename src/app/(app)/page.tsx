
'use client';

import { Activity, Upload, Users, Lightbulb, Loader2, Edit } from "lucide-react";
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DashboardCharts } from "@/components/dashboard-charts";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc, collection, orderBy, query, limit, DocumentReference, DocumentData, updateDoc } from 'firebase/firestore';
import type { PerformanceMetric, UserProfile } from '@/lib/types';
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import 'react-image-crop/dist/ReactCrop.css';


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


function InspirationalQuoteCard() {
    const { user, firestore } = useFirebase();
    const { toast } = useToast();

    const userProfileDoc = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid) as DocumentReference<UserProfile>;
      }, [user, firestore]);
    
      const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileDoc);

    const [isSaving, setIsSaving] = useState(false);
    const [imgSrc, setImgSrc] = useState('');
    const imgRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [crop, setCrop] = useState<Crop>();
    const [isCropModalOpen, setCropModalOpen] = useState(false);

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 16 / 9));
    }

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
          setCrop(undefined) // Makes crop preview update between images.
          const reader = new FileReader()
          reader.addEventListener('load', () =>
            setImgSrc(reader.result?.toString() || '')
          )
          reader.readAsDataURL(event.target.files[0])
          setCropModalOpen(true);
          // Clear the input value to allow re-selecting the same file
          event.target.value = '';
        }
    };

    const handleCropComplete = async () => {
        if (!imgRef.current || !crop?.width || !crop?.height || !userProfileDoc || !user) return;
        
        setIsSaving(true);
        setCropModalOpen(false);
    
        try {
            const croppedImageBase64 = await getCroppedImg(imgRef.current, crop);
            const storage = getStorage();
            const photoRef = storageRef(storage, `users/${user.uid}/motivational-photo.jpg`);
            
            await uploadString(photoRef, croppedImageBase64, 'data_url');
            const downloadURL = await getDownloadURL(photoRef);
            
            await updateDoc(userProfileDoc, { motivationalPhotoUrl: downloadURL });

            toast({
                title: "Foto Atualizada!",
                description: "A sua nova foto de motivação foi guardada.",
            });
        } catch (e) {
            console.error("Error uploading motivational photo: ", e);
            toast({
                variant: 'destructive',
                title: "Erro no Upload",
                description: "Não foi possível carregar a sua nova foto de motivação.",
            });
        } finally {
            setIsSaving(false);
        }
    }

    const motivationalPhoto = userProfile?.motivationalPhotoUrl || placeholderImages.inspirational_quote_fallback.src;
    const hint = userProfile?.motivationalPhotoUrl ? 'motivational' : placeholderImages.inspirational_quote_fallback.hint;

    return (
        <>
        <Card className="col-span-full relative overflow-hidden flex flex-col md:flex-row bg-card shadow-lg group min-h-[300px]">
             <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            <div className="relative w-full md:w-1/2 h-64 md:h-auto min-h-[300px]">
                {isProfileLoading ? <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin" /> : 
                    <Image
                        src={motivationalPhoto}
                        alt="Imagem motivacional"
                        fill
                        className="object-cover"
                        data-ai-hint={hint}
                        priority
                    />
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent md:bg-gradient-to-r"></div>
            </div>
            <div className="relative flex flex-col justify-center p-8 md:p-12 md:w-1/2">
                <blockquote className="text-2xl lg:text-3xl font-semibold text-white z-10 leading-snug">
                    "Mais vale morrer de pé do que viver uma vida ajoelhado"
                </blockquote>
            </div>

            <Button 
                variant="secondary" 
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving || !user}
            >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                Mudar Foto
            </Button>
        </Card>
        
        <Dialog open={isCropModalOpen} onOpenChange={setCropModalOpen}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Cortar a sua foto de motivação</DialogTitle>
            </DialogHeader>
            {imgSrc && (
                <div className='flex justify-center'>
                <ReactCrop
                    crop={crop}
                    onChange={c => setCrop(c)}
                    aspect={16/9}
                    className='max-h-[70vh]'
                >
                    <img ref={imgRef} alt="Crop me" src={imgSrc} onLoad={onImageLoad} />
                </ReactCrop>
                </div>
            )}
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" disabled={isSaving}>Cancelar</Button>
                </DialogClose>
                <Button onClick={handleCropComplete} disabled={isSaving}>
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2"/>}
                    Cortar e Guardar
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
}

export default function DashboardPage() {
    const { user, firestore } = useFirebase();

    const metricsCollectionRef = useMemoFirebase(() => {
        if (!user) return null;
        // Correctly reference the subcollection
        return collection(firestore, `users/${user.uid}/performanceMetrics`);
    }, [user, firestore]);
    
    // Create a query from the collection reference
    const latestMetricsQuery = useMemoFirebase(() => {
        if (!metricsCollectionRef) return null;
        return query(metricsCollectionRef, orderBy('date', 'desc'), limit(1));
    }, [metricsCollectionRef]);

    // useDoc expects a DocumentReference or null, not a Query.
    // So we can't directly use latestMetricsQuery. We need to fetch the docs and then use the first one.
    // A better approach would be a specific hook for queries that return one doc, but for now we adapt.
    // Let's use a temporary state to hold the single document reference.
    
    const [latestMetricRef, setLatestMetricRef] = useState<DocumentReference<DocumentData> | null>(null);

    // This effect will run the query and set the reference to the latest document.
    useEffect(() => {
        if(latestMetricsQuery){
            const getDocRef = async () => {
                const { getDocs } = await import('firebase/firestore');
                const snapshot = await getDocs(latestMetricsQuery);
                if(!snapshot.empty){
                    setLatestMetricRef(snapshot.docs[0].ref);
                }
            }
            getDocRef();
        }
    }, [latestMetricsQuery]);

    const { data: latestMetrics, isLoading: metricsLoading } = useDoc<PerformanceMetric>(latestMetricRef);

    
    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                <InspirationalQuoteCard />

                <Card className="xl:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Seguidores</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {metricsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                            <>
                                <div className="text-2xl font-bold">{latestMetrics?.followers?.toLocaleString() || 'N/A'}</div>
                                <p className="text-xs text-muted-foreground">Dados mais recentes</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="xl:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Engajamento</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                         {metricsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                            <>
                                <div className="text-2xl font-bold">{latestMetrics?.engagementRate ? `${latestMetrics.engagementRate.toFixed(1)}%` : 'N/A'}</div>
                                <p className="text-xs text-muted-foreground">Dados mais recentes</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                
                <DashboardCharts />
            </div>
        </div>
    );
}
