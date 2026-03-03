'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating content ideas based on a specific theme.
 * Supports both standalone ("Avulso") and series ("Serie") formats.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateContentIdeasInputSchema = z.object({
  contentType: z
    .enum(['Humor/Meme', 'Skill/Treino', 'Mindset/Rotina', 'YouTube', 'LinkedIn'])
    .describe('The type of content to generate ideas for.'),
  numberOfIdeas: z
    .number()
    .min(1)
    .max(10)
    .default(3)
    .describe('The number of content ideas to generate.'),
  // ── Series Mode Fields ──
  format: z
    .enum(['Avulso', 'Serie'])
    .default('Avulso')
    .describe('Whether to generate standalone ideas or episodic series ideas.'),
  seriesName: z
    .string()
    .optional()
    .describe('Name of the series. If empty, AI invents one.'),
  seriesGoal: z
    .string()
    .optional()
    .describe('Goal of the series.'),
  totalEpisodes: z
    .number()
    .optional()
    .describe('Total planned episodes.'),
  totalDays: z
    .number()
    .optional()
    .describe('Total days for the series challenge.'),
  episodeNumber: z
    .number()
    .optional()
    .describe('Starting episode number for the generated ideas.'),
  previousEpisodesSummary: z
    .string()
    .optional()
    .describe('Summary of previous episodes to avoid repetition.'),
});

export type GenerateContentIdeasInput = z.infer<typeof GenerateContentIdeasInputSchema>;

const GenerateContentIdeasOutputSchema = z.object({
  ideas: z.array(z.string()).describe('An array of content ideas. Each element in the array is a separate idea.'),
});

export type GenerateContentIdeasOutput = z.infer<typeof GenerateContentIdeasOutputSchema>;

export async function generateContentIdeas(input: GenerateContentIdeasInput): Promise<GenerateContentIdeasOutput> {
  return generateContentIdeasFlow(input);
}

const generateContentIdeasPrompt = ai.definePrompt({
  name: 'generateContentIdeasPrompt',
  input: { schema: GenerateContentIdeasInputSchema },
  output: { schema: GenerateContentIdeasOutputSchema },
  prompt: `You are a world-class social media creative strategist helping "Miguel", a football content creator whose main goal is to get a professional contract.

**MIGUEL'S BRAND GUIDELINES (CRITICAL):**
* **The Golden Rule:** Miguel wants to be hired by a professional club. **NEVER** suggest ideas where he looks like a bad player or fails a skill on purpose.
* **The Vibe:** Young, ambitious, obsessed with football, but REAL. He's a player, not an influencer or coach. He talks like a normal person, not a guru.

**1. IDENTITY & BRANDING:**
    * **Greeting:** "Saudações Meus Caros" (TikTok/Instagram only, NOT for LinkedIn).
    * **Signature Ending:** "Wasted" (GTA-style) — use ONLY for real exhaustion or free agent grind moments. NEVER for failing skills. NOT on LinkedIn.
    * **Persona:** "Irmão do Lamine Yamal" — use selectively when it makes sense. Not obligatory. NOT on LinkedIn.

**2. CONTENT PILLARS:**
    * **Skills/Highlights (50%):** PROOF OF COMPETENCE. Show scouts he is ready.
    * **Mindset/Rotina (30%):** Emotional connection & Discipline. Real feelings.
    * **Humor/Meme (20%):** Reach & Virality. Relatable, natural humor.
    * **YouTube:** Long-form journey content, vlogs, full training sessions.
    * **LinkedIn:** Professional positioning — serious but human, performance data, discipline stories. NO humor, NO persona, NO "Wasted".

**3. TONE:** Write ideas that feel like Miguel talking to a friend. Short, punchy, natural. Allow real emotion.

══════════════════════════════════════════════
**FORMAT MODE: {{{format}}}**
══════════════════════════════════════════════

{{#if (eq format "Serie")}}
**SERIES MODE — Generate episodic ideas with progression and continuity.**

* **Series Name:** {{#if seriesName}}"{{{seriesName}}}"{{else}}Invent a short, catchy name for the series.{{/if}}
* **Series Goal:** {{#if seriesGoal}}{{{seriesGoal}}}{{else}}Infer a goal from the content type.{{/if}}
* **Starting Episode:** {{#if episodeNumber}}Start from Episode {{episodeNumber}}.{{else}}Start from Episode 1.{{/if}}
* **Total:** {{#if totalEpisodes}}{{totalEpisodes}} episodes.{{/if}}{{#if totalDays}}{{totalDays}} days.{{/if}}
* **Previous Episodes:** {{#if previousEpisodesSummary}}{{{previousEpisodesSummary}}}{{else}}No previous context.{{/if}}

**SERIES RULES:**
1. Each idea must be formatted as an EPISODE: "Episódio X: [idea description]" or "Dia X/Y: [idea description]".
2. Ideas must show PROGRESSION — each episode should build on the previous one.
3. If previousEpisodesSummary is provided, do NOT repeat what was already done.
4. Each idea should include a progress element (new drill, harder variation, better metric).
5. Ideas should create a narrative arc that keeps viewers coming back.

{{else}}
**STANDALONE MODE — Generate normal, individual ideas (not episodic).**
{{/if}}

**YOUR TASK:**

Generate {{numberOfIdeas}} new, specific, and creative content ideas for the content type: **{{{contentType}}}**.

**Constraints:**
- **If 'Humor/Meme':** Suggest ideas where Miguel is relatable or playfully confident.
- **If 'Skill/Treino':** Focus on ELITE execution. Speed, technique, or power.
- **If 'Mindset/Rotina':** Focus on real feelings — the obsession, the sacrifice, honest moments.
- **If 'YouTube':** Long-form content about the journey, match analysis, or full workout sessions.
- **If 'LinkedIn':** Professional content — performance metrics, training reflections, discipline stories.

Return ONLY a JSON object with an "ideas" property, which is an array of strings. Each string in the array should be a single, distinct idea. Do not add any other text or formatting.
Generate in Portuguese Language!
`,
});

const generateContentIdeasFlow = ai.defineFlow(
  {
    name: 'generateContentIdeasFlow',
    inputSchema: GenerateContentIdeasInputSchema,
    outputSchema: GenerateContentIdeasOutputSchema,
  },
  async input => {
    const { output } = await generateContentIdeasPrompt(input);
    return output!;
  }
);
