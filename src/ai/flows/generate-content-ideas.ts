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
  theme: z.string().describe('The theme for generating content ideas.'),
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
  ideas: z.array(z.string()).describe('A list of content ideas.'),
});

export type GenerateContentIdeasOutput = z.infer<typeof GenerateContentIdeasOutputSchema>;

export async function generateContentIdeas(input: GenerateContentIdeasInput): Promise<GenerateContentIdeasOutput> {
  return generateContentIdeasFlow(input);
}

const generateContentIdeasPrompt = ai.definePrompt({
  name: 'generateContentIdeasPrompt',
  input: {schema: GenerateContentIdeasInputSchema},
  output: {schema: GenerateContentIdeasOutputSchema},
  prompt: `You are a social media expert. Generate {{numberOfIdeas}} content ideas based on the theme: {{{theme}}}, for the content type: {{{contentType}}}.  The ideas should be creative and engaging.

Return the content ideas as a numbered list.
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
