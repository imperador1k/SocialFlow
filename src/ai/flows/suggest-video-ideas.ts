'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting video content ideas based on a content strategy.
 *
 * It includes:
 * - `suggestVideoIdeas`: The main function to suggest video ideas.
 * - `SuggestVideoIdeasInput`: The input type for the `suggestVideoIdeas` function.
 * - `SuggestVideoIdeasOutput`: The output type for the `suggestVideoIdeas` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  input: {schema: SuggestVideoIdeasInputSchema},
  output: {schema: SuggestVideoIdeasOutputSchema},
  prompt: `You are a creative video content strategist. Generate {{numberOfIdeas}} video content ideas for {{{contentType}}} content. The ideas should be specific and actionable.

Return the video ideas as a numbered list.
`,
});

const suggestVideoIdeasFlow = ai.defineFlow(
  {
    name: 'suggestVideoIdeasFlow',
    inputSchema: SuggestVideoIdeasInputSchema,
    outputSchema: SuggestVideoIdeasOutputSchema,
  },
  async input => {
    const {output} = await suggestVideoIdeasPrompt(input);
    return output!;
  }
);
