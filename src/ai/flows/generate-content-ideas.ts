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

**VALTER'S CONTENT STRATEGY:**

1.  **Identity & Branding:**
    *   **Greeting:** He always starts videos with "Saudações Meus Caros".
    *   **Signature Ending:** He often uses a "Wasted" (GTA-style) or "Missão Falhada" screen effect when he fails a challenge in a funny way.
    *   **Core Persona:** A running joke/series is "Irmão do Lamine Yamal" (Lamine Yamal's brother), where he tries to replicate skills but often fails comically.

2.  **Content Pillars (TikTok/Reels):**
    *   **Humor/Meme (40%):** Goal is virality and shares.
        *   *Concepts:* "Irmão do Lamine Yamal" series, "Day X of training until Y" challenges, "Epic Fail" compilations.
    *   **Skill/Treino (35%):** Goal is to show technical ability and that he's a serious athlete, not just a comedian.
        *   *Concepts:* "Brother of Yamal's Training", "Crossbar Challenge", "Weak Foot Evolution", "Perfect Combo" (skill -> explosion -> finish).
    *   **Mindset/Rotina (25%):** Goal is to create an emotional connection and inspire discipline.
        *   *Concepts:* "The reality of a dreamer" (training late at night), "Brother of Yamal's Routine" (cold showers, simple meals), "No Excuses" (training in bad weather), speaking directly to the camera with motivational messages.

3.  **Content Funnel (TikTok -> YouTube):**
    *   Long-form videos are created for YouTube (e.g., "My complete training routine").
    *   These are cut into 3-4 short clips for TikTok/Reels.
    *   Each short clip has a Call to Action (CTA) to watch the full video on YouTube ("Link in bio").

4.  **Universal Hooks & CTAs:**
    *   **Hooks:** "No one talks about this, but...", "I did this for 30 days and here's the result.", "If you want to be a footballer, don't ignore this."
    *   **CTAs:** "Follow to see the progress in the next 90 days.", "If this inspired you, comment a 💪 and share."

**YOUR TASK:**

Generate {{numberOfIdeas}} new, specific, and creative content ideas for the content type: **{{{contentType}}}**.

The ideas must be deeply integrated with Valter's identity and strategy. Be bold and "absurdly incredible".

**Instructions:**
- If the type is 'Humor/Meme', the idea should be funny and viral-focused, likely using the "Irmão do Lamine Yamal" persona.
- If the type is 'Skill/Treino', the idea should showcase genuine football skill or a challenging drill.
- If the type is 'Mindset/Rotina', the idea should be inspirational and show discipline or behind-the-scenes reality.
- If the type is 'YouTube', suggest a long-form video idea based on his pillars (Journey, Free Education, Personal Development).

Return ONLY a JSON object with an "ideas" property, which is an array of strings. Each string in the array should be a single, distinct idea. Do not add any other text or formatting.
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
