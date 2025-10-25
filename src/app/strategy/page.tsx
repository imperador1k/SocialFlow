import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";

const distributionData = [
  { type: "Humor/Memes", value: 40, fill: "var(--color-humor)" },
  { type: "Skills/Highlights", value: 35, fill: "var(--color-skills)" },
  { type: "Mindset/Rotina", value: 25, fill: "var(--color-mindset)" },
];

const chartConfig = {
  humor: { label: "Humor/Memes (40%)", color: "hsl(var(--chart-1))" },
  skills: { label: "Skills/Highlights (35%)", color: "hsl(var(--chart-2))" },
  mindset: { label: "Mindset/Rotina (25%)", color: "hsl(var(--chart-3))" },
};

const publishingSchedule = [
  { platform: "Instagram", frequency: "4-5x a week", times: "9am, 12pm, 5pm" },
  { platform: "TikTok", frequency: "1-2x a day", times: "7am, 11am, 4pm, 8pm" },
  { platform: "YouTube", frequency: "1x a week", times: "Wednesday 3pm" },
  { platform: "X/Twitter", frequency: "3-5x a day", times: "Throughout the day" },
];

const ctaExamples = [
  "Like if you agree!",
  "Comment your thoughts below.",
  "Share this with someone who needs to see it.",
  "Save this for later!",
  "Follow for more content like this.",
  "What's your favorite tip? Let me know!",
];

const hookExamples = [
  "You're doing [activity] all wrong.",
  "The biggest mistake I made in [area].",
  "3 things I wish I knew before [age/event].",
  "Unpopular opinion: [controversial statement].",
  "POV: You finally achieve [goal].",
  "This one hack will change your [task].",
];

export default function StrategyPage() {
  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>Content Distribution Strategy</CardTitle>
          <CardDescription>
            A balanced approach to engage your audience effectively.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col justify-center">
            <p className="text-muted-foreground mb-2">Ideal Mix:</p>
            <ul className="space-y-2">
                <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]"></div>{chartConfig.humor.label}</li>
                <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]"></div>{chartConfig.skills.label}</li>
                <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-3))]"></div>{chartConfig.mindset.label}</li>
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
          <CardTitle>Publishing Schedule</CardTitle>
          <CardDescription>
            Optimal times and frequencies for major platforms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Best Times (Local)</TableHead>
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

      <Card>
        <CardHeader>
          <CardTitle>Engagement Toolkit</CardTitle>
          <CardDescription>
            Use these hooks and calls to action to boost interaction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="hooks">
              <AccordionTrigger>Universal Hooks</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-5 space-y-1">
                  {hookExamples.map((hook) => <li key={hook}>{hook}</li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="cta">
              <AccordionTrigger>Calls to Action (CTAs)</AccordionTrigger>
              <AccordionContent>
                 <ul className="list-disc pl-5 space-y-1">
                  {ctaExamples.map((cta) => <li key={cta}>{cta}</li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
