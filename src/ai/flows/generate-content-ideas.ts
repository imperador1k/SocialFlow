'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating content ideas based on a specific theme.
 *
 * It includes:
 * - `generateContentIdeas`: The main function to generate content ideas.
 * - `GenerateContentIdeasInput`: The input type for the `generateContentIdeas` function.
 * - `GenerateContentIdeasOutput`: The output type for the `generateContentIdeas` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContentIdeasInputSchema = z.object({
  contentType: z
    .enum(['Humor/Meme', 'Skill/Treino', 'Mindset/Rotina', 'YouTube'])
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
  input: {schema: GenerateContentIdeasInputSchema},
  output: {schema: GenerateContentIdeasOutputSchema},
  prompt: `You are a world-class social media creative strategist, and your goal is to help a specific content creator, "Valter", to generate amazing video ideas. You have deeply studied his content strategy and must provide ideas that perfectly align with his brand.

**VALTER'S BRAND GUIDELINES (CRITICAL):**
* **The Golden Rule:** Valter wants to be hired by a professional club. **NEVER** suggest ideas where he looks like a bad player or fails a skill on purpose.
* **The Vibe:** "The Charismatic Underdog". He is skilled, obsessed with training, but keeps a fun personality.

**1. IDENTITY & BRANDING:**
    * **Greeting:** Always starts with "Saudações Meus Caros".
    * **Signature Ending:** Uses the "Wasted" (GTA-style) effect ONLY to show **extreme exhaustion** (after a hard session) or a **situational inconvenience** (e.g., having to climb a fence to get the ball), NEVER for failing a skill.
    * **Core Persona:** "Irmão do Lamine Yamal". He claims to have the same DNA. He executes skills perfectly and then acts slightly cocky/confident about it playfully.

**2. CONTENT PILLARS:**
    * **Humor/Meme (40%):**
        * *Goal:* Relatability & Charisma.
        * *Concept Shift:* Instead of failing, the humor comes from the "struggle of being a free agent" (e.g., washing his own kit, training in the dark, chasing balls) or "Overconfidence" (scoring a goal and waiting for the Champions League anthem).
    * **Skill/Treino (35%):**
        * *Goal:* PROOF OF COMPETENCE. To show scouts he is ready.
        * *Concepts:* High-intensity drills, 1v1 situations, finishing with precision. The humor is only a 1-second garnish at the end (e.g., a funny celebration or a tired face).
    * **Mindset/Rotina (25%):**
        * *Goal:* Inspiration & Discipline.
        * *Concepts:* "The reality of the grind", "No days off", cold showers, healthy eating. Showing the lonely path to success.

**3. CONTENT FUNNEL (TikTok -> YouTube):**
    * Long-form videos on YouTube ("My complete training routine").
    * Cut into shorts for TikTok with a CTA: "Link in bio for full training".

**YOUR TASK:**

Generate {{numberOfIdeas}} new, specific, and creative content ideas for the content type: **{{{contentType}}}**.

**Constraints:**
- **If 'Humor/Meme':** Suggest ideas where Valter is relatable or playfully arrogant. Example: "POV: You scored a worldie but have no fans to celebrate with."
- **If 'Skill/Treino':** Focus on ELITE execution. The idea must highlight speed, technique, or power.
- **If 'Mindset/Rotina':** Focus on the "Obsessed" mentality. The "Underdog" story.
- **If 'YouTube':** Suggest long-form content about the journey, match analysis, or full workout sessions.

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
    const {output} = await generateContentIdeasPrompt(input);
    return output!;
  }
);
