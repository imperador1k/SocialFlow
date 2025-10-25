'use server';

/**
 * @fileOverview Summarizes the content of a creator from a given link and determines the content category.
 *
 * - summarizeInspirationContent - A function that summarizes creator content and determines its category.
 * - SummarizeInspirationContentInput - The input type for the summarizeInspirationContent function.
 * - SummarizeInspirationContentOutput - The return type for the summarizeInspirationContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeInspirationContentInputSchema = z.object({
  creatorLink: z.string().describe('A link to the content of the creator.'),
});
export type SummarizeInspirationContentInput = z.infer<typeof SummarizeInspirationContentInputSchema>;

const SummarizeInspirationContentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the creator content.'),
  category: z.string().describe('The content category of the creator (e.g., Humor/Meme, Skill/Treino, Mindset/Rotina, YouTube).'),
});
export type SummarizeInspirationContentOutput = z.infer<typeof SummarizeInspirationContentOutputSchema>;

export async function summarizeInspirationContent(input: SummarizeInspirationContentInput): Promise<SummarizeInspirationContentOutput> {
  return summarizeInspirationContentFlow(input);
}

const summarizeInspirationContentPrompt = ai.definePrompt({
  name: 'summarizeInspirationContentPrompt',
  input: {schema: SummarizeInspirationContentInputSchema},
  output: {schema: SummarizeInspirationContentOutputSchema},
  prompt: `You are a content analysis expert. Please summarize the content from the following link and determine the most appropriate content category. The content categories are: Humor/Meme, Skill/Treino, Mindset/Rotina, YouTube.\n\nLink: {{{creatorLink}}}\n\nSummary: {{summary}}\nCategory: {{category}}`,
  system: `Analyze the content from the provided link and provide a concise summary and the most relevant content category. The output should be structured with a summary and a distinct category.`, // Added system prompt
});

const summarizeInspirationContentFlow = ai.defineFlow(
  {
    name: 'summarizeInspirationContentFlow',
    inputSchema: SummarizeInspirationContentInputSchema,
    outputSchema: SummarizeInspirationContentOutputSchema,
  },
  async input => {
    const response = await ai.generate({
      prompt: `Summarize the content from this link: ${input.creatorLink} and determine its content category (Humor/Meme, Skill/Treino, Mindset/Rotina, YouTube).`,
    });

    const {output} = await summarizeInspirationContentPrompt({
      ...input,
      summary: response.text,
      category: '', // The prompt will determine the category
    });

    return output!;
  }
);
