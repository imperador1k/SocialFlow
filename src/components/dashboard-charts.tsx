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
    { month: "January", engagement: 186, followers: 800 },
    { month: "February", engagement: 305, followers: 950 },
    { month: "March", engagement: 237, followers: 1100 },
    { month: "April", engagement: 273, followers: 1300 },
    { month: "May", engagement: 209, followers: 1550 },
    { month: "June", engagement: 214, followers: 1700 },
]

const chartConfig = {
    engagement: {
        label: "Engagement",
        color: "hsl(var(--chart-1))",
    },
    followers: {
        label: "Followers",
        color: "hsl(var(--chart-2))",
    },
}

export function DashboardCharts() {
    return (
        <>
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Content Engagement</CardTitle>
                    <CardDescription>January - June 2024</CardDescription>
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
                    <CardTitle>Follower Growth</CardTitle>
                    <CardDescription>Weekly growth trend.</CardDescription>
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
