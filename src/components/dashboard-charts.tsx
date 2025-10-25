"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts"
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import type { PerformanceMetric } from '@/lib/types';
import { format } from 'date-fns';
import { Loader2 } from "lucide-react";

const chartConfig = {
    engagementRate: {
        label: "Engajamento",
        color: "hsl(var(--chart-1))",
    },
    followers: {
        label: "Seguidores",
        color: "hsl(var(--chart-2))",
    },
}

export function DashboardCharts() {
    const { user, firestore } = useFirebase();

    const metricsCollection = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, `users/${user.uid}/performanceMetrics`);
    }, [user, firestore]);

    const metricsQuery = useMemoFirebase(() => {
        if (!metricsCollection) return null;
        // Fetch last 6 entries for the charts
        return query(metricsCollection, orderBy('date', 'desc'), );
    }, [metricsCollection]);

    const { data: metrics = [], isLoading } = useCollection<PerformanceMetric>(metricsQuery);

    const chartData = (metrics || [])
        .map(metric => ({
            month: format((metric.date as Timestamp).toDate(), 'MMM'),
            engagement: metric.engagementRate, // Changed to engagementRate
            followers: metric.followers,
        }))
        .slice(0, 6)
        .reverse();

    if (isLoading) {
        return (
            <>
                <Card className="md:col-span-2 flex justify-center items-center min-h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </Card>
                 <Card className="md:col-span-2 flex justify-center items-center min-h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </Card>
            </>
        )
    }

    return (
        <>
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Engajamento de Conteúdo</CardTitle>
                    <CardDescription>Últimos meses</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <BarChart accessibilityLayer data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                stroke="hsl(var(--muted-foreground))"
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `${value}%`} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar dataKey="engagement" fill="var(--color-engagementRate)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
             <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Crescimento de Seguidores</CardTitle>
                    <CardDescription>Tendência de crescimento.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <LineChart
                            accessibilityLayer
                            data={chartData}
                            margin={{ left: 12, right: 12 }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                stroke="hsl(var(--muted-foreground))"
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                             <YAxis stroke="hsl(var(--muted-foreground))" domain={['dataMin - 100', 'dataMax + 100']} tickFormatter={(value) => typeof value === 'number' ? `${value / 1000}k` : ''}/>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Line
                                dataKey="followers"
                                type="natural"
                                stroke="var(--color-followers)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </>
    )
}
