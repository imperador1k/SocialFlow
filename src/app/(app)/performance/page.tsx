
'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Activity, Eye, BarChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { summarizePerformanceAnalysis } from '@/ai/flows/summarize-performance-analysis';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { PerformanceMetric } from '@/lib/types';
import { format } from 'date-fns';

const initialMetrics = {
    followers: 0,
    engagementRate: 0,
    reach: 0,
    impressions: 0,
};

const chartConfig = {
  reach: { label: 'Alcance', color: 'hsl(var(--chart-1))' },
};


export default function PerformancePage() {
  const { user, firestore } = useFirebase();
  const [currentMetrics, setCurrentMetrics] = useState(initialMetrics);
  const [summary, setSummary] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const metricsCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/performanceMetrics`);
  }, [user, firestore]);

  const metricsQuery = useMemoFirebase(() => {
    if (!metricsCollection) return null;
    return query(metricsCollection, orderBy('date', 'asc'));
  }, [metricsCollection]);

  const { data: historicalMetrics = [], isLoading: metricsLoading } = useCollection<PerformanceMetric>(metricsQuery);

  useEffect(() => {
    if (historicalMetrics && historicalMetrics.length > 0) {
      const latest = historicalMetrics[historicalMetrics.length - 1];
      setCurrentMetrics({
        followers: latest.followers,
        engagementRate: latest.engagementRate,
        reach: latest.reach,
        impressions: latest.impressions,
      });
    }
  }, [historicalMetrics]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentMetrics((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setSummary('');
    const metricsString = `Seguidores: ${currentMetrics.followers}, Taxa de Engajamento: ${currentMetrics.engagementRate}%, Alcance: ${currentMetrics.reach}, Impressões: ${currentMetrics.impressions}`;
    try {
      const result = await summarizePerformanceAnalysis({ metrics: metricsString });
      setSummary(result.summary);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Análise Falhou',
        description: 'Não foi possível gerar o resumo. Por favor, tente novamente.',
      });
    }
    setIsAnalyzing(false);
  };

  const handleSaveMetrics = () => {
    if (!metricsCollection) return;

    const newMetric = {
        ...currentMetrics,
        date: serverTimestamp(),
    };

    addDocumentNonBlocking(metricsCollection, newMetric);

    toast({
        title: "Métricas Salvas!",
        description: "Suas novas métricas de performance foram salvas com sucesso.",
    });

    handleAnalyze();
  };

  const chartData = (historicalMetrics || []).map(metric => ({
    date: format((metric.date as Timestamp).toDate(), 'dd/MM'),
    reach: metric.reach,
  }));

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Análise de Performance</h1>
                <p className="text-muted-foreground">Analise e entenda o crescimento das suas redes sociais.</p>
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Seguidores</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{currentMetrics.followers.toLocaleString()}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taxa de Engajamento</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{currentMetrics.engagementRate.toFixed(1)}%</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alcance</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{currentMetrics.reach.toLocaleString()}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Impressões</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{currentMetrics.impressions.toLocaleString()}</div>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Atualizar Métricas</CardTitle>
                    <CardDescription>Insira manualmente suas últimas estatísticas para obter uma análise.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="followers">Seguidores</Label>
                        <Input id="followers" name="followers" type="number" value={currentMetrics.followers} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="engagementRate">Taxa de Engajamento (%)</Label>
                        <Input id="engagementRate" name="engagementRate" type="number" step="0.1" value={currentMetrics.engagementRate} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="reach">Alcance</Label>
                        <Input id="reach" name="reach" type="number" value={currentMetrics.reach} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="impressions">Impressões</Label>
                        <Input id="impressions" name="impressions" type="number" value={currentMetrics.impressions} onChange={handleInputChange} />
                    </div>
                    <Button onClick={handleSaveMetrics} disabled={isAnalyzing || !user} className="w-full">
                        {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar e Analisar
                    </Button>
                </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Resumo via IA</CardTitle>
                        <CardDescription>Uma visão geral concisa da sua performance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isAnalyzing && (
                            <div className="flex items-center justify-center h-24">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {summary && !isAnalyzing && (
                             <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
                        )}
                         {!summary && !isAnalyzing && (
                             <div className="text-center py-8 text-muted-foreground">
                                <p>Clique em "Salvar e Analisar" para gerar um resumo.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Alcance ao Longo do Tempo</CardTitle>
                        <CardDescription>Mostra o alcance da audiência ao longo do tempo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {metricsLoading ? <div className="h-[200px] flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin"/></div> :
                         <ChartContainer config={chartConfig} className="h-[200px] w-full">
                             <AreaChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12, top: 10 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} stroke="hsl(var(--muted-foreground))" />
                                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => typeof value === 'number' ? `${value / 1000}k` : ''} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <defs>
                                    <linearGradient id="fillReach" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <Area dataKey="reach" type="natural" fill="url(#fillReach)" stroke="hsl(var(--chart-1))" stackId="a" />
                            </AreaChart>
                         </ChartContainer>
                        }
                    </CardContent>
                 </Card>
            </div>
        </div>
    </div>
  );
}
