'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';
import { Lightbulb, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateEngagementContent } from '@/ai/flows/generate-engagement-content';

const distributionData = [
  { type: 'Humor/Memes', value: 40, fill: 'var(--color-humor)' },
  { type: 'Skills/Highlights', value: 35, fill: 'var(--color-skills)' },
  { type: 'Mindset/Rotina', value: 25, fill: 'var(--color-mindset)' },
];

const chartConfig = {
  humor: { label: 'Humor/Memes (40%)', color: 'hsl(var(--chart-1))' },
  skills: { label: 'Skills/Highlights (35%)', color: 'hsl(var(--chart-2))' },
  mindset: { label: 'Mindset/Rotina (25%)', color: 'hsl(var(--chart-3))' },
};

const publishingSchedule = [
  { platform: 'Instagram', frequency: '4-5x a week', times: '9am, 12pm, 5pm' },
  { platform: 'TikTok', frequency: '1-2x a day', times: '7am, 11am, 4pm, 8pm' },
  { platform: 'YouTube', frequency: '1x a week', times: 'Wednesday 3pm' },
  { platform: 'X/Twitter', frequency: '3-5x a day', times: 'Throughout the day' },
];

const initialCtaExamples = [
  'Like if you agree!',
  'Comment your thoughts below.',
  'Share this with someone who needs to see it.',
  'Save this for later!',
  'Follow for more content like this.',
  "What's your favorite tip? Let me know!",
];

const initialHookExamples = [
  "You're doing [activity] all wrong.",
  'The biggest mistake I made in [area].',
  '3 things I wish I knew before [age/event].',
  'Unpopular opinion: [controversial statement].',
  'POV: You finally achieve [goal].',
  'This one hack will change your [task].',
];

function AIEngagementBoosterCard({
  onHooksGenerated,
  onCtasGenerated,
}: {
  onHooksGenerated: (hooks: string[]) => void;
  onCtasGenerated: (ctas: string[]) => void;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [contentType, setContentType] = useState<'Hook' | 'CTA'>('Hook');

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await generateEngagementContent({ contentType });
      if (contentType === 'Hook') {
        onHooksGenerated(result.content);
        toast({
          title: 'Ganchos Gerados!',
          description: 'Novos exemplos de ganchos foram adicionados à lista.',
        });
      } else {
        onCtasGenerated(result.content);
        toast({
          title: 'CTAs Gerados!',
          description: 'Novos exemplos de CTAs foram adicionados à lista.',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao gerar conteúdo. Por favor, tente novamente.',
      });
    }
    setIsLoading(false);
  };

  return (
    <Card className="bg-gradient-to-br from-card to-secondary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="text-primary glow-icon" /> Assistente de Engajamento de IA
        </CardTitle>
        <CardDescription>Gere novos "hooks" ou "calls to action" usando a API do Gemini.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-auto flex-grow space-y-2">
          <Label htmlFor="ai-contentType">Selecione um Tipo de Conteúdo</Label>
          <Select value={contentType} onValueChange={(v) => setContentType(v as 'Hook' | 'CTA')}>
            <SelectTrigger id="ai-contentType">
              <SelectValue placeholder="Selecione um tipo de conteúdo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hook">Gancho (Hook)</SelectItem>
              <SelectItem value="CTA">Chamada para Ação (CTA)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-auto self-end">
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Gerar Conteúdo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StrategyPage() {
  const [hookExamples, setHookExamples] = useState(initialHookExamples);
  const [ctaExamples, setCtaExamples] = useState(initialCtaExamples);

  const addHooks = (newHooks: string[]) => {
    setHookExamples((prev) => [...new Set([...newHooks, ...prev])]);
  };

  const addCtas = (newCtas: string[]) => {
    setCtaExamples((prev) => [...new Set([...newCtas, ...prev])]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Estratégia de Distribuição de Conteúdo</CardTitle>
          <CardDescription>Uma abordagem equilibrada para engajar seu público de forma eficaz.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col justify-center">
            <p className="text-muted-foreground mb-2">Mix Ideal:</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]"></div>
                {chartConfig.humor.label}
              </li>
              <li className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]"></div>
                {chartConfig.skills.label}
              </li>
              <li className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-3))]"></div>
                {chartConfig.mindset.label}
              </li>
            </ul>
          </div>
          <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={distributionData} dataKey="value" nameKey="type" innerRadius={60}>
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calendário de Publicação</CardTitle>
          <CardDescription>Frequências e horários ideais para as principais plataformas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plataforma</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead>Melhores Horários (Local)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publishingSchedule.map((item) => (
                <TableRow key={item.platform}>
                  <TableCell className="font-medium">{item.platform}</TableCell>
                  <TableCell>{item.frequency}</TableCell>
                  <TableCell>{item.times}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AIEngagementBoosterCard onHooksGenerated={addHooks} onCtasGenerated={addCtas} />

      <Card>
        <CardHeader>
          <CardTitle>Kit de Ferramentas de Engajamento</CardTitle>
          <CardDescription>
            Use estes "hooks" e "calls to action" para aumentar a interação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full" defaultValue="hooks">
            <AccordionItem value="hooks">
              <AccordionTrigger>Ganchos (Hooks) Universais</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-5 space-y-1">
                  {hookExamples.map((hook) => (
                    <li key={hook}>{hook}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="cta">
              <AccordionTrigger>Chamadas para Ação (CTAs)</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-5 space-y-1">
                  {ctaExamples.map((cta) => (
                    <li key={cta}>{cta}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
