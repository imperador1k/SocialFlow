import { generateInspirationalQuote } from "@/ai/flows/generate-inspirational-quote";
import { Activity, Users } from "lucide-react";
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';
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

async function InspirationalQuoteCard() {
    let quoteData;
    try {
        quoteData = await generateInspirationalQuote({});
    } catch (error) {
        console.error("Failed to generate inspirational quote:", error);
        quoteData = {
            quote: "Mais vale morrer de pé do que viver uma vida ajoelhado.",
            imageUrl: placeholderImages.inspirational_quote_fallback.src,
        };
    }

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 relative overflow-hidden flex flex-col md:flex-row shadow-lg shadow-primary/10">
            <div className="relative w-full md:w-1/2 h-64 md:h-auto min-h-[300px]">
                <Image
                    src={quoteData.imageUrl}
                    alt="Inspirational image"
                    fill
                    className="object-cover"
                    data-ai-hint={placeholderImages.inspirational_quote_fallback.hint}
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r"></div>
            </div>
            <div className="relative flex flex-col justify-center p-8 md:p-12 md:w-1/2">
                <blockquote className="text-2xl lg:text-3xl font-semibold text-white z-10">
                    "{quoteData.quote}"
                </blockquote>
            </div>
        </Card>
    );
}

export default function DashboardPage() {
    return (
        <div className="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <InspirationalQuoteCard />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">45,231</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">5.2%</div>
                    <p className="text-xs text-muted-foreground">+0.5% from last month</p>
                </CardContent>
            </Card>
            
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
        </div>
    );
}
