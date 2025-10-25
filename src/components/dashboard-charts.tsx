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

const chartData = [
    { month: "Janeiro", engagement: 186, followers: 800 },
    { month: "Fevereiro", engagement: 305, followers: 950 },
    { month: "Março", engagement: 237, followers: 1100 },
    { month: "Abril", engagement: 273, followers: 1300 },
    { month: "Maio", engagement: 209, followers: 1550 },
    { month: "Junho", engagement: 214, followers: 1700 },
]

const chartConfig = {
    engagement: {
        label: "Engajamento",
        color: "hsl(var(--chart-1))",
    },
    followers: {
        label: "Seguidores",
        color: "hsl(var(--chart-2))",
    },
}

export function DashboardCharts() {
    return (
        <>
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Engajamento de Conteúdo</CardTitle>
                    <CardDescription>Janeiro - Junho 2024</CardDescription>
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
                            <YAxis stroke="hsl(var(--muted-foreground))" />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar dataKey="engagement" fill="var(--color-engagement)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
             <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Crescimento de Seguidores</CardTitle>
                    <CardDescription>Tendência de crescimento semanal.</CardDescription>
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
                             <YAxis stroke="hsl(var(--muted-foreground))" domain={['dataMin - 100', 'dataMax + 100']} />
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
