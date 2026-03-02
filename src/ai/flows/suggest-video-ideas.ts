'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting video content ideas based on a content strategy.
 *
 * It includes:
 * - `suggestVideoIdeas`: The main function to suggest video ideas.
 * - `SuggestVideoIdeasInput`: The input type for the `suggestVideoIdeas` function.
 * - `SuggestVideoIdeasOutput`: The output type for the `suggestVideoIdeas` function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestVideoIdeasInputSchema = z.object({
  contentType: z
    .enum(['Humor/Meme', 'Skill/Treino', 'Mindset/Rotina', 'YouTube'])
    .describe('The type of content to generate video ideas for.'),
  numberOfIdeas: z
    .number()
    .min(1)
    .max(10)
    .default(3)
    .describe('The number of video ideas to generate.'),
});

export type SuggestVideoIdeasInput = z.infer<typeof SuggestVideoIdeasInputSchema>;

const SuggestVideoIdeasOutputSchema = z.object({
  ideas: z.array(z.string()).describe('A list of video content ideas.'),
});

export type SuggestVideoIdeasOutput = z.infer<typeof SuggestVideoIdeasOutputSchema>;

export async function suggestVideoIdeas(input: SuggestVideoIdeasInput): Promise<SuggestVideoIdeasOutput> {
  return suggestVideoIdeasFlow(input);
}

const suggestVideoIdeasPrompt = ai.definePrompt({
  name: 'suggestVideoIdeasPrompt',
  input: { schema: SuggestVideoIdeasInputSchema },
  output: { schema: SuggestVideoIdeasOutputSchema },
  prompt: `You are a creative video content strategist focused on producing highly VIRAL content. Generate {{numberOfIdeas}} video content ideas for {{{contentType}}} content. The ideas should be specific, actionable, and designed to capture massive attention and views.

**Principles for Viral Hooks & Ideas:**
1. Leave them wanting more: The concept must make the viewer desperately want to know what comes next.
2. Hit a nerve: Talk about something that secretly bothers or frustrates people.
3. Universal language: The hook must use simple language that everyone understands, regardless of their niche.
4. Make them question themselves: (e.g., instead of "3 dicas de produtividade", use "Porque acordar cedo está te atrasando").

Return the video ideas as a numbered list.
Generate in Portuguese Language!
`,
});

const suggestVideoIdeasFlow = ai.defineFlow(
  {
    name: 'suggestVideoIdeasFlow',
    inputSchema: SuggestVideoIdeasInputSchema,
    outputSchema: SuggestVideoIdeasOutputSchema,
  },
  async input => {
    const { output } = await suggestVideoIdeasPrompt(input);
    return output!;
  }
);
