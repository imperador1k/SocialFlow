'use client';
import { useState } from 'react';
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

const initialMetrics = {
    followers: 45231,
    engagementRate: 5.2,
    reach: 120543,
    impressions: 250123,
};

const chartData = [
  { date: 'Wk 1', value: 1200 },
  { date: 'Wk 2', value: 1800 },
  { date: 'Wk 3', value: 1500 },
  { date: 'Wk 4', value: 2200 },
  { date: 'Wk 5', value: 2500 },
  { date: 'Wk 6', value: 3200 },
];
const chartConfig = {
  value: { label: 'Reach', color: 'hsl(var(--chart-1))' },
};


export default function PerformancePage() {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [summary, setSummary] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMetrics((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setSummary('');
    const metricsString = `Followers: ${metrics.followers}, Engagement Rate: ${metrics.engagementRate}%, Reach: ${metrics.reach}, Impressions: ${metrics.impressions}`;
    try {
      const result = await summarizePerformanceAnalysis({ metrics: metricsString });
      setSummary(result.summary);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not generate summary. Please try again.',
      });
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Performance Analysis</h1>
                <p className="text-muted-foreground">Analyze and understand your social media growth.</p>
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Followers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.followers.toLocaleString()}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.engagementRate.toFixed(1)}%</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reach</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.reach.toLocaleString()}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.impressions.toLocaleString()}</div>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Update Metrics</CardTitle>
                    <CardDescription>Manually enter your latest stats to get an analysis.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="followers">Followers</Label>
                        <Input id="followers" name="followers" type="number" value={metrics.followers} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="engagementRate">Engagement Rate (%)</Label>
                        <Input id="engagementRate" name="engagementRate" type="number" step="0.1" value={metrics.engagementRate} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="reach">Reach</Label>
                        <Input id="reach" name="reach" type="number" value={metrics.reach} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="impressions">Impressions</Label>
                        <Input id="impressions" name="impressions" type="number" value={metrics.impressions} onChange={handleInputChange} />
                    </div>
                    <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
                        {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Analyze Performance
                    </Button>
                </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>AI-Powered Summary</CardTitle>
                        <CardDescription>A concise overview of your performance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isAnalyzing && (
                            <div className="flex items-center justify-center h-24">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {summary && !isAnalyzing && (
                             <p className="text-sm text-muted-foreground">{summary}</p>
                        )}
                         {!summary && !isAnalyzing && (
                             <div className="text-center py-8 text-muted-foreground">
                                <p>Click "Analyze Performance" to generate a summary.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Reach Over Time</CardTitle>
                        <CardDescription>Shows weekly audience reach.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={chartConfig} className="h-[200px] w-full">
                             <AreaChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12, top: 10 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} stroke="hsl(var(--muted-foreground))" />
                                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `${Number(value) / 1000}k`} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <defs>
                                    <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <Area dataKey="value" type="natural" fill="url(#fillValue)" stroke="hsl(var(--chart-1))" stackId="a" />
                            </AreaChart>
                         </ChartContainer>
                    </CardContent>
                 </Card>
            </div>
        </div>
    </div>
  );
}
