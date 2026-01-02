
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
import { useToast } from "@/hooks/use-toast";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
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

async function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop,
): Promise<string> {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Calculate source dimensions
  const srcWidth = crop.width * scaleX;
  const srcHeight = crop.height * scaleY;

  // Set maximum output dimensions for optimization (1920px max width for 16:9 aspect)
  const MAX_WIDTH = 1920;
  const MAX_HEIGHT = 1080;

  let outputWidth = srcWidth;
  let outputHeight = srcHeight;

  // Scale down if larger than max dimensions
  if (outputWidth > MAX_WIDTH || outputHeight > MAX_HEIGHT) {
    const widthRatio = MAX_WIDTH / outputWidth;
    const heightRatio = MAX_HEIGHT / outputHeight;
    const ratio = Math.min(widthRatio, heightRatio);
    outputWidth = Math.round(outputWidth * ratio);
    outputHeight = Math.round(outputHeight * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Enable image smoothing for better quality when downscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    srcWidth,
    srcHeight,
    0,
    0,
    outputWidth,
    outputHeight
  );

  // Compress with 0.85 quality for much smaller file size
  return canvas.toDataURL('image/jpeg', 0.85);
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
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCropModalOpen, setCropModalOpen] = useState(false);

  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  // Cache-buster key to force image refresh after upload
  const [imageCacheBuster, setImageCacheBuster] = useState<number>(0);

  useEffect(() => {
    if (!croppedImage || !userProfileDoc || !user) {
      return;
    }

    const saveImage = async () => {
      setIsSaving(true);
      try {
        // Save base64 image directly to Firestore (no Firebase Storage needed)
        await updateDoc(userProfileDoc, { motivationalPhotoUrl: croppedImage });

        // Force React to re-render with new image
        setImageCacheBuster(Date.now());

        toast({
          title: "Foto Atualizada!",
          description: "A sua nova foto de motivação foi guardada.",
        });
      } catch (e) {
        console.error("Error saving motivational photo: ", e);
        toast({
          variant: 'destructive',
          title: "Erro ao Guardar",
          description: "Não foi possível guardar a sua nova foto de motivação.",
        });
      } finally {
        setIsSaving(false);
        setCroppedImage(null);
      }
    };

    saveImage();
  }, [croppedImage, user, userProfileDoc, toast]);


  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 16 / 9));
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setCrop(undefined)
      const reader = new FileReader()
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || '')
      )
      reader.readAsDataURL(event.target.files[0])
      setCropModalOpen(true);
      event.target.value = '';
    }
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop?.width || !completedCrop?.height) return;

    try {
      const croppedImageBase64 = await getCroppedImg(imgRef.current, completedCrop);
      setCroppedImage(croppedImageBase64);
    } catch (e) {
      console.error("Error cropping image:", e);
      toast({
        variant: 'destructive',
        title: "Erro ao Cortar",
        description: "Não foi possível processar a imagem.",
      });
    }
    setCropModalOpen(false);
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
              key={imageCacheBuster || 'initial'}
              src={motivationalPhoto}
              alt="Imagem motivacional"
              fill
              className="object-cover"
              data-ai-hint={hint}
              priority
              unoptimized={!!userProfile?.motivationalPhotoUrl}
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
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Cortar a sua foto de motivação</DialogTitle>
          </DialogHeader>
          {imgSrc && (
            <div className='flex justify-center'>
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={16 / 9}
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
            <Button onClick={handleCropComplete} disabled={isSaving || !completedCrop?.width || !completedCrop?.height}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Cortar e Confirmar
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
    return collection(firestore, `users/${user.uid}/performanceMetrics`);
  }, [user, firestore]);

  const latestMetricsQuery = useMemoFirebase(() => {
    if (!metricsCollectionRef) return null;
    return query(metricsCollectionRef, orderBy('date', 'desc'), limit(1));
  }, [metricsCollectionRef]);

  const [latestMetricRef, setLatestMetricRef] = useState<DocumentReference<DocumentData> | null>(null);

  useEffect(() => {
    if (latestMetricsQuery) {
      const getDocRef = async () => {
        const { getDocs } = await import('firebase/firestore');
        const snapshot = await getDocs(latestMetricsQuery);
        if (!snapshot.empty) {
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

