'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating content ideas based on a specific theme.
 *
 * It includes:
 * - `generateContentIdeas`: The main function to generate content ideas.
 * - `GenerateContentIdeasInput`: The input type for the `generateContentIdeas` function.
 * - `GenerateContentIdeasOutput`: The output type for the `generateContentIdeas` function.
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
    * **Skills/Highlights (50%):**
        * *Goal:* PROOF OF COMPETENCE. Show scouts he is ready.
        * *Concepts:* High-intensity drills, 1v1 situations, finishing with precision. The product.
    * **Mindset/Rotina (30%):**
        * *Goal:* Emotional connection & Discipline.
        * *Concepts:* The grind, vulnerability, honest moments, real feelings about the journey.
    * **Humor/Meme (20%):**
        * *Goal:* Reach & Virality.
        * *Concepts:* Free agent struggles, relatable football moments, playful confidence. Humor should be natural, not forced.
    * **YouTube:** Long-form journey content, vlogs, full training sessions.
    * **LinkedIn:** Professional positioning — serious but human, performance data, discipline stories, attract coaches/directors. NO humor, NO persona, NO "Wasted".

**3. TONE (ALL PLATFORMS except LinkedIn):**
    * Write ideas that feel like Miguel talking to a friend.
    * Short, punchy, natural.
    * Allow real emotion — doubt, ambition, love for the game, frustration.
    * Not corporate. Not a motivational speech.

**4. LINKEDIN TONE:**
    * Serious but human. Clear and mature.
    * Focus on metrics, real performance data, training reflections.
    * NO exaggerated humor. NO persona lines.
    * Professional language that would impress a coach or sports director.

**YOUR TASK:**

Generate {{numberOfIdeas}} new, specific, and creative content ideas for the content type: **{{{contentType}}}**.

**Constraints:**
- **If 'Humor/Meme':** Suggest ideas where Miguel is relatable or playfully confident. Example: "POV: You scored a worldie but have no fans to celebrate with."
- **If 'Skill/Treino':** Focus on ELITE execution. The idea must highlight speed, technique, or power.
- **If 'Mindset/Rotina':** Focus on real feelings — the obsession, the sacrifice, the honest moments. Not guru speeches.
- **If 'YouTube':** Suggest long-form content about the journey, match analysis, or full workout sessions.
- **If 'LinkedIn':** Suggest professional content — performance metrics, training reflections, discipline stories, learnings. Things that would impress a sports professional.

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
