

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
import { Lightbulb, Loader2, Sparkles, Layers, Crosshair, Megaphone, Target, Bot, Zap, TrendingUp, Handshake, BrainCircuit, Rocket, Film, Repeat, Swords, Wind, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateEngagementContent } from '@/ai/flows/generate-engagement-content';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

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
  'Dá like se concordas!',
  'Comenta a tua opinião abaixo.',
  'Partilha isto com alguém que precisa de o ver.',
  'Guarda isto para mais tarde!',
  'Segue para mais conteúdo como este.',
  'Qual é a tua dica favorita? Diz-me nos comentários!',
];

const initialHookExamples = [
  'Estás a fazer [atividade] da forma errada.',
  'O maior erro que cometi em [área].',
  '3 coisas que eu gostava de saber antes de [idade/evento].',
  'Opinião impopular: [afirmação controversa].',
  'POV: Finalmente alcanças [objetivo].',
  'Este truque vai mudar a tua [tarefa].',
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

function StrategyTabContent() {
  const [hookExamples, setHookExamples] = useState(initialHookExamples);
  const [ctaExamples, setCtaExamples] = useState(initialCtaExamples);

  const addHooks = (newHooks: string[]) => {
    setHookExamples((prev) => [...new Set([...newHooks, ...prev])]);
  };

  const addCtas = (newCtas: string[]) => {
    setCtaExamples((prev) => [...new Set([...newCtas, ...prev])]);
  };

  return (
    <div className="space-y-6 mt-6">
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


function ContentPlanTab() {
  const [activeTikTokTab, setActiveTikTokTab] = useState('plano-humor');

  return (
    <div className="space-y-8 mt-6">
      
      {/* Key Strategies */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Estratégias Chave</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex-row items-start gap-4">
              <div className="bg-muted p-3 rounded-lg"><Layers /></div>
              <CardTitle className="text-lg mt-0">Funil de Conteúdo (TikTok → YouTube)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">O ciclo para converter seguidores de vídeos curtos em audiência fiel no YouTube.</p>
              <ul className="space-y-3 text-sm">
                <li><strong>1. Gravar Vídeo Longo:</strong> Produza um vídeo completo para o YouTube (ex: "A minha rotina completa de treino").</li>
                <li><strong>2. Cortar em Partes:</strong> Divida o vídeo longo em 3-4 clipes curtos (mentalidade, treino, recuperação).</li>
                <li><strong>3. Publicar no TikTok/Reels:</strong> Transforme cada clipe num vídeo curto, adicionando legendas e som viral.</li>
                <li><strong>4. Chamar para Ação (CTA):</strong> No final de cada vídeo curto, incentive a ver o vídeo completo no YouTube com um "Link na bio".</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-start gap-4">
              <div className="bg-muted p-3 rounded-lg"><Crosshair /></div>
              <CardTitle className="text-lg mt-0">Hooks & Ganchos Universais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">Frases para captar a atenção nos primeiros 3 segundos do vídeo.</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>"Ninguém fala sobre isto, mas…"</li>
                <li>"Fiz isto durante 30 dias e este foi o resultado."</li>
                <li>"Se queres ser futebolista, não ignores isto."</li>
                <li>"Quando todos dormem… eu treino."</li>
                <li>"Este treino está a mudar o meu jogo."</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-start gap-4">
              <div className="bg-muted p-3 rounded-lg"><Megaphone /></div>
              <CardTitle className="text-lg mt-0">Call to Actions (CTAs)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">O que pedir ao espectador para fazer no final do vídeo para aumentar o engajamento.</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>"Segue para veres o progresso nos próximos 90 dias."</li>
                <li>"Se isto te inspirou, comenta um 💪 e partilha com alguém que precisa."</li>
                <li>"Acompanha o meu desafio até conseguir entrar num clube."</li>
                <li>"Se quiseres o treino completo comenta ‘🔥’ que eu partilho"</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Identity Banner */}
      <Card className="bg-gradient-to-r from-primary/80 to-primary/60 text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target /> IDENTIDADE DA MINHA PÁGINA</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
            <span className="text-2xl">👋</span>
            <span className="font-medium">"Saudações meus caros" como introdução</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
            <span className="text-2xl">💀</span>
            <span className="font-medium">"Wasted" no final dos vídeos</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
            <span className="text-2xl">👨‍👦</span>
            <span className="font-medium">"Irmão do Lamine Yamal" (foto photoshop)</span>
          </div>
        </CardContent>
      </Card>

      {/* TikTok & Instagram Plan */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Plano para TikTok & Instagram Reels</h2>
        <Tabs value={activeTikTokTab} onValueChange={setActiveTikTokTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="plano-humor">🎭 Humor & Memes (40%)</TabsTrigger>
                <TabsTrigger value="plano-skills">⚽️ Skills & Highlights (35%)</TabsTrigger>
                <TabsTrigger value="plano-mindset">📈 Mindset & Rotina (25%)</TabsTrigger>
            </TabsList>

            {/* Humor Tab */}
            <TabsContent value="plano-humor">
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Rocket/> Objetivo Estratégico</CardTitle>
                        <CardDescription><strong>Viralidade, partilhas e comentários.</strong> Humor simples, universal e ligado ao futebol.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex justify-between"><span>👨‍👦 "Irmão do Lamine Yamal"</span><Badge variant="secondary">Série</Badge></CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm"><strong>🎬 Hook:</strong> "Saudações Meus Caros, eu sou o irmão do Lamine Yamal…"</p>
                                <p className="text-sm"><strong>📹 Execução:</strong> Mostras um skill, depois falhas de propósito → termina com "Wasted" ou "Missão Falhada".</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex justify-between"><span>📅 "Dia X até Y"</span><Badge variant="secondary">Viral</Badge></CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm"><strong>🎬 Hook:</strong> Texto gigante "Dia 1 a treinar como o CR7 até o Sporting me chamar"</p>
                                <p className="text-sm"><strong>📹 Execução:</strong> Cortes rápidos de treino, refeição, banho frio, abdominais → final com take cómico.</p>
                                <p className="text-sm"><strong>💬 CTA:</strong> "Dia X — marquem o Sporting 👀⚽ Mais conteúdo longo no YouTube (link na bio)."</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex justify-between"><span>💀 "Erro Épico"</span><Badge variant="secondary">Engajamento</Badge></CardTitle>
                            </CardHeader>
                            <CardContent>
                               <p className="text-sm"><strong>🎬 Exemplo:</strong> Desafio da barra → se falhas, "Missão Falhada". Se acertas, reação cómica + hype.</p>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="plano-skills">
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Award /> Objetivo Estratégico</CardTitle>
                        <CardDescription><strong>Autoridade técnica + mostrar que não és só humor, és craque.</strong></CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader><CardTitle className="text-base flex justify-between"><span>🏃‍♂️ Treino do Irmão do Yamal</span><Badge variant="secondary">Série</Badge></CardTitle></CardHeader>
                            <CardContent><p className="text-sm"><strong>📹 Execução:</strong> Circuito com cones, sprint e finalização — música hype.</p></CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle className="text-base flex justify-between"><span>🎯 Desafio da Barra</span><Badge variant="secondary">Desafio</Badge></CardTitle></CardHeader>
                            <CardContent><p className="text-sm"><strong>💬 Texto:</strong> "Se não acertar, Missão Falhada."</p></CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle className="text-base flex justify-between"><span>🦶 Evolução do Pé Fraco</span><Badge variant="secondary">Progresso</Badge></CardTitle></CardHeader>
                            <CardContent><p className="text-sm"><strong>📹 Execução:</strong> Mostras drills → com texto: "Dia 10 vs Dia 1".</p></CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle className="text-base flex justify-between"><span>🔥 Combo Perfeito</span><Badge variant="secondary">Hype</Badge></CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-sm"><strong>📹 Execução:</strong> Skill → explosão → finalização.</p>
                                <p className="text-sm"><strong>💬 Texto hype:</strong> "Isto é treino de jogador obcecado."</p>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Mindset Tab */}
            <TabsContent value="plano-mindset">
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BrainCircuit /> Objetivo Estratégico</CardTitle>
                        <CardDescription><strong>Criar ligação emocional, inspirar e mostrar disciplina.</strong></CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
                         <Card>
                            <CardHeader><CardTitle className="text-base flex justify-between"><span>🌙 Realidade de Quem Sonha</span><Badge variant="secondary">Motivação</Badge></CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-sm"><strong>💬 Texto:</strong> "Enquanto eles dormem, eu treino."</p>
                                <p className="text-sm"><strong>📹 Execução:</strong> Filmar noite ou cedo, música calma ou épica.</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle className="text-base flex justify-between"><span>🛁 Rotina do Irmão do Yamal</span><Badge variant="secondary">Lifestyle</Badge></CardTitle></CardHeader>
                            <CardContent><p className="text-sm"><strong>📹 Execução:</strong> Mostrar pequenos hábitos: banho frio, comer simples, alongar → texto motivacional.</p></CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle className="text-base flex justify-between"><span>💪 Sem Desculpas</span><Badge variant="secondary">Disciplina</Badge></CardTitle></CardHeader>
                            <CardContent><p className="text-sm"><strong>📹 Execução:</strong> Treino com chuva, cansaço, pós-trabalho → mostrar sacrifício.</p></CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="text-base flex justify-between"><span>🎥 Falar para a Câmara</span><Badge variant="secondary">Conexão</Badge></CardTitle></CardHeader>
                            <CardContent><p className="text-sm"><strong>📹 Execução:</strong> 15s de ti a dizer: "Não sou melhor que ninguém, mas não há ninguém mais obcecado do que eu."</p></CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </section>

      {/* YouTube Plan */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Plano para YouTube (Vídeos Longos)</h2>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Film /> Objetivo</CardTitle>
                <CardDescription>Mostrar a tua jornada como um filme — o sacrifício, a mentalidade, o treino e a disciplina. O foco é construir uma ligação profunda e duradoura com a audiência, que vai para além dos vídeos curtos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <h3 className="font-semibold">Pilares de Conteúdo</h3>
                <p className="text-sm text-muted-foreground">Os vídeos devem focar-se nestas categorias para criar uma marca pessoal forte e autêntica.</p>
                <div className="grid md:grid-cols-3 gap-4">
                    <Card className="bg-muted/50">
                        <CardHeader><CardTitle className="text-base">Rotina / Jornada do Herói</CardTitle></CardHeader>
                        <CardContent><p className="text-sm"><strong>Tipo de Vídeos:</strong> "Um dia na minha vida", vlogs de treino, "como me preparo para...", desabafos sobre as dificuldades e vitórias. Mostra o processo, não apenas o resultado.</p></CardContent>
                    </Card>
                    <Card className="bg-muted/50">
                        <CardHeader><CardTitle className="text-base">Educação Gratuita</CardTitle></CardHeader>
                        <CardContent><p className="text-sm"><strong>Tipo de Vídeos:</strong> Ensinar o que sabe sobre fitness, nutrição de atleta, exercícios específicos, como contar macros, etc. Posicionar-se como uma autoridade que ajuda a sua comunidade.</p></CardContent>
                    </Card>
                     <Card className="bg-muted/50">
                        <CardHeader><CardTitle className="text-base">Desenvolvimento Pessoal & Mentalidade</CardTitle></CardHeader>
                        <CardContent><p className="text-sm"><strong>Tipo de Vídeos:</strong> Falar sobre como superar a falta de motivação, a importância da disciplina, e por que é que falhar é essencial para o crescimento. Vídeos com impacto emocional e verbal.</p></CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
      </section>
    </div>
  );
}


export default function StrategyPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Content Center</h1>
                <p className="text-muted-foreground">O seu centro de comando para estratégia e planejamento de conteúdo.</p>
            </div>
            
            <Tabs defaultValue="strategy" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="strategy">Estratégia</TabsTrigger>
                    <TabsTrigger value="content">Plano de Conteúdo</TabsTrigger>
                </TabsList>
                <TabsContent value="strategy">
                    <StrategyTabContent />
                </TabsContent>
                <TabsContent value="content">
                    <ContentPlanTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}

    
