'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeIdeaInputSchema = z.object({
    description: z.string().describe('The idea description provided by the user.'),
    contentType: z
        .enum(['Humor/Meme', 'Skill/Treino', 'Mindset/Rotina', 'YouTube'])
        .describe('The content type of the idea.'),
});

export type AnalyzeIdeaInput = z.infer<typeof AnalyzeIdeaInputSchema>;

const AnalyzeIdeaOutputSchema = z.object({
    score: z.number().min(1).max(10).describe('Overall potential score from 1-10.'),
    verdict: z.enum(['Excelente', 'Boa', 'Pode Melhorar', 'Reformular']).describe('Quick verdict.'),
    strengths: z.array(z.string()).describe('What is good about this idea (1-3 points).'),
    improvements: z.array(z.string()).describe('Suggestions to make it better (1-3 points).'),
    brandFit: z.string().describe('How well it fits Miguel brand and niche. 1-2 sentences.'),
    suggestedHook: z.string().describe('A suggested hook starting with "Saudações meus caros..." if the idea has potential.'),
});

export type AnalyzeIdeaOutput = z.infer<typeof AnalyzeIdeaOutputSchema>;

export async function analyzeIdea(input: AnalyzeIdeaInput): Promise<AnalyzeIdeaOutput> {
    return analyzeIdeaFlow(input);
}

const analyzeIdeaPrompt = ai.definePrompt({
    name: 'analyzeIdeaPrompt',
    input: { schema: AnalyzeIdeaInputSchema },
    output: { schema: AnalyzeIdeaOutputSchema, format: 'json' },
    prompt: `You are a social media content strategist specialized in football/soccer content. You are evaluating an idea submitted by MIGUEL, a football content creator.

**MIGUEL'S BRAND:**
* **Name:** MIGUEL.
* **Goal:** Get hired by a professional club. He must ALWAYS look like a serious, skilled player.
* **Vibe:** "The Charismatic Underdog". Skilled, obsessed with training, fun personality.
* **Greeting:** "Saudações meus caros..." (always starts with this).
* **Persona:** "Irmão do Lamine Yamal" (used selectively for humor).
* **Content Pillars:**
  - Humor/Meme (40%): Relatability & Charisma. Humor from the free agent struggle, NOT from failing skills.
  - Skill/Treino (35%): Proof of competence for scouts. Elite execution.
  - Mindset/Rotina (25%): Inspiration & Discipline. The grind.
  - YouTube: Long-form journey content.

**THE IDEA TO ANALYZE:**
* **Content Type:** {{{contentType}}}
* **Description:** {{{description}}}

**YOUR ANALYSIS:**
Evaluate this idea honestly:
1. **Score (1-10):** How viral/effective is this idea for Miguel's goals?
2. **Verdict:** "Excelente", "Boa", "Pode Melhorar", or "Reformular".
3. **Strengths:** What works well (1-3 bullet points).
4. **Improvements:** What could be better (1-3 bullet points). Be specific and actionable.
5. **Brand Fit:** Does it align with Miguel's brand? Would a scout see this positively?
6. **Suggested Hook:** Write a hook starting with "Saudações meus caros..." that could work for this idea.

Respond in Portuguese (PT-PT). Be direct, honest, and constructive.
Return ONLY a JSON object.
`
});

const analyzeIdeaFlow = ai.defineFlow(
    {
        name: 'analyzeIdeaFlow',
        inputSchema: AnalyzeIdeaInputSchema,
        outputSchema: AnalyzeIdeaOutputSchema,
    },
    async input => {
        try {
            const { output } = await analyzeIdeaPrompt(input);
            if (!output) throw new Error("Output is undefined from Genkit");
            return output;
        } catch (error) {
            console.warn('First attempt failed, retrying...', error);
            const { output } = await analyzeIdeaPrompt(input);
            if (!output) throw new Error("Output is undefined on retry");
            return output;
        }
    }
);
