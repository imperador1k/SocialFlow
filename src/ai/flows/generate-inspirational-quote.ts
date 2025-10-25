'use server';

/**
 * @fileOverview Generates an inspirational quote relevant to social media content creation.
 *
 * - generateInspirationalQuote - A function that generates the inspirational quote.
 * - GenerateInspirationalQuoteInput - The input type for the generateInspirationalQuote function (currently empty).
 * - GenerateInspirationalQuoteOutput - The return type for the generateInspirationalQuote function, containing the quote and an image URL.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInspirationalQuoteInputSchema = z.object({});
export type GenerateInspirationalQuoteInput = z.infer<typeof GenerateInspirationalQuoteInputSchema>;

const GenerateInspirationalQuoteOutputSchema = z.object({
  quote: z.string().describe('An inspirational quote relevant to social media content creation.'),
  imageUrl: z.string().describe('URL of an image related to the inspirational quote.'),
});
export type GenerateInspirationalQuoteOutput = z.infer<typeof GenerateInspirationalQuoteOutputSchema>;

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

export async function generateInspirationalQuote(
  input: GenerateInspirationalQuoteInput
): Promise<GenerateInspirationalQuoteOutput> {
  return generateInspirationalQuoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInspirationalQuotePrompt',
  input: {schema: GenerateInspirationalQuoteInputSchema},
  output: {schema: GenerateInspirationalQuoteOutputSchema},
  tools: [getImageFromTextTool],
  prompt: `You are a social media motivation expert. Generate an inspirational quote that is relevant to social media content creation. Also, find an image that amplifies the inspirational message in the quote. The final result must be very inspiring to social media content creators.\n\nOutput quote: {{quote}}\nImage URL: {{imageUrl}}`,
  system: `Generate an inspirational quote relevant to social media content creation and find a relevant image URL using the getImageFromText tool.`,
});

const generateInspirationalQuoteFlow = ai.defineFlow(
  {
    name: 'generateInspirationalQuoteFlow',
    inputSchema: GenerateInspirationalQuoteInputSchema,
    outputSchema: GenerateInspirationalQuoteOutputSchema,
  },
  async input => {
    const response = await ai.generate({
      prompt: `Generate an inspirational quote that is relevant to social media content creation.`,
    });
    const quote = response.text;
    const imageUrl = await getImageFromTextTool({text: quote});
    const {output} = await prompt({
      ...input,
      quote,
      imageUrl,
    });
    return output!;
  }
);
