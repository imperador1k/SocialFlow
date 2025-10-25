
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
import { DashboardCharts } from "@/components/dashboard-charts";


function InspirationalQuoteCard() {
    const quoteData = {
        quote: "Mais vale morrer de pé do que viver uma vida ajoelhado",
        imageUrl: placeholderImages.inspirational_quote_fallback.src,
    };

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 relative overflow-hidden flex flex-col md:flex-row bg-card shadow-lg">
            <div className="relative w-full md:w-1/2 h-64 md:h-auto min-h-[300px]">
                <Image
                    src={quoteData.imageUrl}
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
                    "{quoteData.quote}"
                </blockquote>
            </div>
        </Card>
    );
}

export default function DashboardPage() {
    return (
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            
            <DashboardCharts />
        </div>
    );
}
