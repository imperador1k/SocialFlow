'use server';

/**
 * @fileOverview Generates visual aids to enhance the impact of an inspirational quote.
 *
 * - generateVisualAids - A function that generates visual aids for a quote.
 * - GenerateVisualAidsInput - The input type for the generateVisualAids function, taking the quote as input.
 * - GenerateVisualAidsOutput - The return type for the generateVisualAids function, containing the image URL.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVisualAidsInputSchema = z.object({
  quote: z.string().describe('The inspirational quote to find visual aids for.'),
});
export type GenerateVisualAidsInput = z.infer<typeof GenerateVisualAidsInputSchema>;

const GenerateVisualAidsOutputSchema = z.object({
  imageUrl: z.string().describe('URL of an image related to the inspirational quote.'),
});
export type GenerateVisualAidsOutput = z.infer<typeof GenerateVisualAidsOutputSchema>;

const getImageFromTextTool = ai.defineTool(
  {
    name: 'getImageFromText',
    description: 'Retrieves a URL of an image based on a text description.',
    inputSchema: z.object({
      text: z.string().describe('The text to search for an image for.'),
    }),
    outputSchema: z.string().describe('The URL of the image.'),
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Generate an image of ${input.text}`,
    });
    return media.url;
  }
);

export async function generateVisualAids(
  input: GenerateVisualAidsInput
): Promise<GenerateVisualAidsOutput> {
  return generateVisualAidsFlow(input);
}

const generateVisualAidsPrompt = ai.definePrompt({
  name: 'generateVisualAidsPrompt',
  input: {schema: GenerateVisualAidsInputSchema},
  output: {schema: GenerateVisualAidsOutputSchema},
  tools: [getImageFromTextTool],
  prompt: `Find an image that amplifies the inspirational message in the quote. The final result must be very inspiring.

Quote: {{{quote}}}
Image URL: {{imageUrl}}`,
  system: `Find a relevant image URL for the given quote using the getImageFromText tool.`,
});

const generateVisualAidsFlow = ai.defineFlow(
  {
    name: 'generateVisualAidsFlow',
    inputSchema: GenerateVisualAidsInputSchema,
    outputSchema: GenerateVisualAidsOutputSchema,
  },
  async input => {
    const {imageUrl} = await generateVisualAidsPrompt({
      ...input,
      imageUrl: await getImageFromTextTool({text: input.quote}),
    });

    return {
      imageUrl,
    };
  }
);
