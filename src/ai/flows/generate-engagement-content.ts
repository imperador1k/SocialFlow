'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating engagement content (Hooks or CTAs).
 *
 * It includes:
 * - `generateEngagementContent`: The main function to generate content.
 * - `GenerateEngagementContentInput`: The input type for the `generateEngagementContent` function.
 * - `GenerateEngagementContentOutput`: The output type for the `generateEngagementContent` function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateEngagementContentInputSchema = z.object({
  contentType: z.enum(['Hook', 'CTA']).describe("The type of engagement content to generate, either a 'Hook' or a 'CTA' (Call to Action)."),
});

export type GenerateEngagementContentInput = z.infer<typeof GenerateEngagementContentInputSchema>;

const GenerateEngagementContentOutputSchema = z.object({
  content: z.array(z.string()).describe('A list of generated content strings.'),
});

export type GenerateEngagementContentOutput = z.infer<typeof GenerateEngagementContentOutputSchema>;

export async function generateEngagementContent(
  input: GenerateEngagementContentInput
): Promise<GenerateEngagementContentOutput> {
  return generateEngagementContentFlow(input);
}

const generateEngagementContentPrompt = ai.definePrompt({
  name: 'generateEngagementContentPrompt',
  input: { schema: GenerateEngagementContentInputSchema },
  output: { schema: GenerateEngagementContentOutputSchema },
  prompt: `You are a social media expert specializing in audience engagement.
Generate 5 creative and effective examples for the following content type: {{{contentType}}}.
The examples should be tailored for a gaming content creator.

- If the contentType is 'Hook', provide 5 short, catchy opening lines for videos.
- If the contentType is 'CTA', provide 5 clear and compelling calls to action to use at the end of videos.
`,
});

const generateEngagementContentFlow = ai.defineFlow(
  {
    name: 'generateEngagementContentFlow',
    inputSchema: GenerateEngagementContentInputSchema,
    outputSchema: GenerateEngagementContentOutputSchema,
  },
  async (input) => {
    const { output } = await generateEngagementContentPrompt(input);
    return output!;
  }
);
