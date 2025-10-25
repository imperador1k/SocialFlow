
'use client';

import { Activity, Upload, Users, Lightbulb, Loader2 } from "lucide-react";
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
import { doc, collection, orderBy, query, limit } from 'firebase/firestore';
import type { PerformanceMetric, UserProfile } from '@/lib/types';
import { generateInspirationalQuote } from "@/ai/flows/generate-inspirational-quote";

function InspirationalQuoteCard() {
    const [quoteData, setQuoteData] = useState<{ quote: string; imageUrl: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchQuote = async () => {
            setIsLoading(true);
            try {
                const result = await generateInspirationalQuote({});
                setQuoteData(result);
            } catch (error) {
                console.error("Failed to generate inspirational quote:", error);
                setQuoteData({
                    quote: "Mais vale morrer de pé do que viver uma vida ajoelhado",
                    imageUrl: placeholderImages.inspirational_quote_fallback.src,
                });
            }
            setIsLoading(false);
        };
        fetchQuote();
    }, []);


    if (isLoading) {
        return (
            <Card className="col-span-full relative overflow-hidden flex flex-col md:flex-row bg-card shadow-lg group min-h-[300px] justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-4 text-muted-foreground">A gerar uma citação inspiradora...</p>
            </Card>
        );
    }

    return (
        <Card className="col-span-full relative overflow-hidden flex flex-col md:flex-row bg-card shadow-lg group">
            <div className="relative w-full md:w-1/2 h-64 md:h-auto min-h-[300px]">
                <Image
                    src={quoteData?.imageUrl || placeholderImages.inspirational_quote_fallback.src}
                    alt="Inspirational image"
                    fill
                    className="object-cover"
                    data-ai-hint={placeholderImages.inspirational_quote_fallback.hint}
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent md:bg-gradient-to-r"></div>
            </div>
            <div className="relative flex flex-col justify-center p-8 md:p-12 md:w-1/2">
                <blockquote className="text-2xl lg:text-3xl font-semibold text-white z-10 leading-snug">
                    "{quoteData?.quote}"
                </blockquote>
            </div>
        </Card>
    );
}

export default function DashboardPage() {
    const { user, firestore } = useFirebase();

    const latestMetricsQuery = useMemoFirebase(() => {
        if (!user) return null;
        const metricsCollection = collection(firestore, `users/${user.uid}/performanceMetrics`);
        return query(metricsCollection, orderBy('date', 'desc'), limit(1));
    }, [user, firestore]);
    
    const { data: latestMetricsData, isLoading: metricsLoading } = useDoc<PerformanceMetric>(latestMetricsQuery ? latestMetricsQuery.docs[0] : null);

    const latestMetrics = latestMetricsData;
    
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
                                <div className="text-2xl font-bold">{latestMetrics?.followers.toLocaleString() || 'N/A'}</div>
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
                                <div className="text-2xl font-bold">{latestMetrics?.engagementRate.toFixed(1) || 'N/A'}%</div>
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
