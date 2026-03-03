
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
import { Lightbulb, Loader2, Sparkles, Layers, Crosshair, Megaphone, Target, Bot, Zap, TrendingUp, Handshake, BrainCircuit, Rocket, Film, Repeat, Swords, Wind, Award, Briefcase, CalendarClock, ListChecks, BarChart3, PlayCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateEngagementContent } from '@/ai/flows/generate-engagement-content';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

/* ══════════════════════════════════════════════
   DATA – Mix de Conteúdo (50/30/20)
   ══════════════════════════════════════════════ */
const distributionData = [
  { type: 'Skills/Highlights', value: 50, fill: 'var(--color-skills)' },
  { type: 'Mindset/Rotina', value: 30, fill: 'var(--color-mindset)' },
  { type: 'Humor/Memes', value: 20, fill: 'var(--color-humor)' },
];

const chartConfig = {
  skills: { label: 'Skills/Highlights (50%)', color: 'hsl(var(--chart-2))' },
  mindset: { label: 'Mindset/Rotina (30%)', color: 'hsl(var(--chart-3))' },
  humor: { label: 'Humor/Memes (20%)', color: 'hsl(var(--chart-1))' },
};

/* ══════════════════════════════════════════════
   DATA – Calendário de Publicação
   ══════════════════════════════════════════════ */
const publishingSchedule = [
  { platform: 'TikTok', frequency: '4-5 vídeos/dia', days: 'Terça a Domingo', recommendation: 'Manhã, almoço, fim de tarde, noite' },
  { platform: 'Instagram', frequency: '4-5 vídeos/dia', days: 'Terça a Domingo', recommendation: 'Mesmo conteúdo TikTok, adaptado' },
  { platform: 'YouTube', frequency: '1-2 vídeos/semana', days: 'Produção à Segunda', recommendation: 'Vídeos longos, documentário/vlog' },
  { platform: 'LinkedIn', frequency: '2-3 vídeos/semana', days: 'Dias úteis', recommendation: 'Tom profissional, sem humor' },
];

/* ══════════════════════════════════════════════
   DATA – Hooks & CTAs
   ══════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════
   COMPONENT – AI Engagement Booster
   ══════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════
   TAB – Estratégia
   ══════════════════════════════════════════════ */
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

      {/* ───────── Mix de Conteúdo (50/30/20) ───────── */}
      <Card>
        <CardHeader>
          <CardTitle>Estratégia de Distribuição de Conteúdo</CardTitle>
          <CardDescription>Uma abordagem equilibrada para engajar o público de forma eficaz.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col justify-center space-y-4">
            <p className="text-muted-foreground mb-1">Mix Ideal:</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]"></div>
                <span className="font-medium">{chartConfig.skills.label}</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-3))]"></div>
                <span className="font-medium">{chartConfig.mindset.label}</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]"></div>
                <span className="font-medium">{chartConfig.humor.label}</span>
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm space-y-1">
              <p><strong>⚽ Skill</strong> é o <em>produto</em> — mostra que és craque.</p>
              <p><strong>😂 Humor</strong> é o <em>alcance</em> — leva o conteúdo a novas pessoas.</p>
              <p><strong>🧠 Mindset</strong> cria <em>ligação emocional</em> — faz as pessoas ficarem.</p>
            </div>
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

      {/* ───────── Calendário de Publicação ───────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-primary" /> Calendário de Publicação
          </CardTitle>
          <CardDescription>Frequências e recomendações gerais por plataforma. Sem horários fixos — adaptar ao dia.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plataforma</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead>Dias</TableHead>
                <TableHead>Recomendação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publishingSchedule.map((item) => (
                <TableRow key={item.platform}>
                  <TableCell className="font-medium">{item.platform}</TableCell>
                  <TableCell>{item.frequency}</TableCell>
                  <TableCell>{item.days}</TableCell>
                  <TableCell className="text-muted-foreground">{item.recommendation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Segunda-feira – Nota Estratégica */}
          <Card className="border-primary/40 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-primary" /> Segunda-feira — Dia Interno de Produção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Não se publicam vídeos curtos à segunda-feira. É o dia estratégico:
              </p>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm">
                <li className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">📋 Planeamento semanal de conteúdo</li>
                <li className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">🎬 Gravação em batch (múltiplos vídeos)</li>
                <li className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">📊 Análise de métricas da semana anterior</li>
                <li className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">🎥 Gravação de vídeo longo para YouTube</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* ───────── Séries Contínuas ───────── */}
      <Card className="border-primary/50 bg-gradient-to-br from-card to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-primary" /> Séries Contínuas (Narrativa de Crescimento)
          </CardTitle>
          <CardDescription>
            Pelo menos 1 vídeo por dia deve fazer parte de uma série. Objetivo: criar retenção, expectativa e fazer o espectador voltar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex justify-between">
                  <span>📅 "Dia X até assinar contrato"</span>
                  <Badge>Skill</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Documenta a jornada diária com contagem crescente. Cada dia é um episódio — treino, progresso, sacrifício.</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex justify-between">
                  <span>🦶 "30 dias a melhorar o pé fraco"</span>
                  <Badge variant="secondary">Skill</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Série de progresso técnico com comparação visual. Mostra Dia 1 vs Dia 15 vs Dia 30.</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex justify-between">
                  <span>🏠 "Vida de free agent"</span>
                  <Badge variant="outline">Humor / Mindset</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Situações reais e cómicas de ser jogador sem clube — treinar sozinho, comer em tupperware, etc.</p>
              </CardContent>
            </Card>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-sm">
            <p className="font-medium mb-1">💡 As séries podem cruzar categorias:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>Skill:</strong> Progresso técnico visível (drills, testes físicos, evolução).</li>
              <li><strong>Mindset:</strong> Disciplina e sacrifício diário (rotina, motivação).</li>
              <li><strong>Humor:</strong> Problemas cómicos de ser free agent ou "irmão do Yamal".</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* ───────── LinkedIn – Posicionamento Profissional ───────── */}
      <Card className="border-blue-500/40 bg-gradient-to-br from-card to-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-500" /> LinkedIn — Posicionamento Profissional
          </CardTitle>
          <CardDescription>
            Atrair treinadores, dirigentes e profissionais da área. Mostrar disciplina, métricas reais e mentalidade.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Regras */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <ListChecks className="w-4 h-4" /> Regras de Conteúdo
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 p-2 bg-green-500/10 rounded-md">✅ Tom sério e profissional</li>
                <li className="flex items-center gap-2 p-2 bg-green-500/10 rounded-md">✅ Dados de performance (tempos, distâncias, cargas)</li>
                <li className="flex items-center gap-2 p-2 bg-green-500/10 rounded-md">✅ Reflexões curtas sobre disciplina</li>
                <li className="flex items-center gap-2 p-2 bg-green-500/10 rounded-md">✅ Bastidores reais de treino</li>
                <li className="flex items-center gap-2 p-2 bg-green-500/10 rounded-md">✅ Aprendizagens e evolução</li>
              </ul>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 p-2 bg-red-500/10 rounded-md">❌ Sem humor exagerado</li>
                <li className="flex items-center gap-2 p-2 bg-red-500/10 rounded-md">❌ Sem "Wasted"</li>
                <li className="flex items-center gap-2 p-2 bg-red-500/10 rounded-md">❌ Sem foco na persona "Irmão do Lamine Yamal"</li>
              </ul>
            </div>
            {/* Formato */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Formato Recomendado
              </h4>
              <div className="space-y-3">
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <p className="text-sm font-medium mb-1">📹 Vídeos curtos (30-60s)</p>
                    <p className="text-sm text-muted-foreground">Direto ao ponto. Sem edição exagerada. Foco no conteúdo real.</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <p className="text-sm font-medium mb-1">📝 Texto profissional na descrição</p>
                    <p className="text-sm text-muted-foreground">Linguagem clara, madura. Descrever o que está a ser mostrado com dados concretos.</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <p className="text-sm font-medium mb-1">🎯 Exemplo de post</p>
                    <p className="text-sm text-muted-foreground italic">"Sprint de 40m em 4.8s. Há 3 meses fazia em 5.3s. Os números não mentem — consistência é tudo."</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ───────── Viralização & Algoritmo ───────── */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="text-primary" /> Estratégia de Viralização & Algoritmo
          </CardTitle>
          <CardDescription>
            Ações essenciais para "aquecer" a conta e mostrar às plataformas que é um humano real.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Bot className="w-4 h-4" /> 1. Evitar Comportamento de Robô
            </h4>
            <p className="text-sm text-muted-foreground">
              O algoritmo favorece contas que agem como utilizadores reais. Antes e depois de postar:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li><strong>Interagir:</strong> Dar like, salvar e comentar em outros vídeos do seu nicho.</li>
              <li><strong>Assistir:</strong> Ver vídeos até ao final (sem pular) para gerar retenção real.</li>
              <li><strong>Partilhar:</strong> Clicar em partilhar e "Copiar Link" (sinal forte de interesse).</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Handshake className="w-4 h-4" /> 2. Gestão de Comunidade
            </h4>
            <p className="text-sm text-muted-foreground">
              O engajamento nos primeiros minutos é crucial.
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li><strong>Responder a Comentários:</strong> Priorize comentários com mais de 5 palavras (são mais valiosos).</li>
              <li><strong>Gerar Conversa:</strong> Responda com perguntas para incentivar mais respostas.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* ───────── AI Engagement Booster ───────── */}
      <AIEngagementBoosterCard onHooksGenerated={addHooks} onCtasGenerated={addCtas} />

      {/* ───────── Kit de Ferramentas de Engajamento ───────── */}
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


/* ══════════════════════════════════════════════
   TAB – Plano de Conteúdo
   ══════════════════════════════════════════════ */
function ContentPlanTab() {
  const [activeTikTokTab, setActiveTikTokTab] = useState('plano-skills');

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
                <li>"Se quiseres o treino completo comenta '🔥' que eu partilho"</li>
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
            <TabsTrigger value="plano-skills">⚽️ Skills/Highlights (50%)</TabsTrigger>
            <TabsTrigger value="plano-mindset">📈 Mindset/Rotina (30%)</TabsTrigger>
            <TabsTrigger value="plano-humor">🎭 Humor/Memes (20%)</TabsTrigger>
          </TabsList>

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
                  <CardHeader><CardTitle className="text-base flex justify-between"><span>🎯 Mostrar Resultados</span><Badge variant="secondary">Desafio</Badge></CardTitle></CardHeader>
                  <CardContent><p className="text-sm"><strong>💬 Execução:</strong> Filma-te a fazer testes físicos. Qual é o teu tempo nos 100m? Quantos km corres num jogo?</p></CardContent>
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

          {/* Humor Tab */}
          <TabsContent value="plano-humor">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Rocket /> Objetivo Estratégico</CardTitle>
                <CardDescription><strong>Viralidade, partilhas e comentários.</strong> Humor simples, universal e ligado ao futebol.</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex justify-between"><span>👨‍👦 "Irmão do Lamine Yamal"</span><Badge variant="secondary">Série</Badge></CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm"><strong>🎬 Hook:</strong> "Saudações Meus Caros, eu sou o irmão do Lamine Yamal…"</p>
                    <p className="text-sm"><strong>📹 Execução:</strong> O Humor deve ser "Relatable": Coisas que só quem joga entende (ex: a dor de levar uma bolada na coxa num dia de frio, o tipo que nunca passa a bola) → termina com "Wasted" ou "Missão Falhada".</p>
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
                    <p className="text-sm"><strong>🎬 Exemplo:</strong> POV: You scored a worldie but have no fans to celebrate with.</p>
                  </CardContent>
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


/* ══════════════════════════════════════════════
   PAGE – Strategy
   ══════════════════════════════════════════════ */
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
