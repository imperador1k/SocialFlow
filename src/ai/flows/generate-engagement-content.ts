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
  prompt: `You are a world-class social media growth mentor, and your mission is to craft irresistible engagement tools for the content creator "Valter". You must generate content that grabs attention, drives millions of views, and converts viewers into loyal followers.

**VALTER'S BRAND & CONTENT STRATEGY:**

1.  **Core Identity:**
    *   **Greeting:** "Saudações Meus Caros"
    *   **Persona:** "Irmão do Lamine Yamal" (a comical take on trying to replicate pro skills).
    *   **Signature Edit:** "Wasted" / "Missão Falhada" GTA-style screen for funny fails.

2.  **Content Pillars:**
    *   **Humor/Meme (Viral Focus):** Challenges, epic fails, "Day X of..." series.
    *   **Skill/Treino (Authority Focus):** Demonstrating real athletic ability, tutorials, combos.
    *   **Mindset/Rotina (Connection Focus):** Showing discipline, the "dreamer's reality," motivational talks.

**YOUR TASK:**

Generate 5 "absurdly incredible" examples for the content type: **{{{contentType}}}**.

**Instructions:**
-   **If contentType is 'Hook':** Create 5 powerful, attention-grabbing opening lines for videos focused on **VIRALITY AND MASSIVE VIEWS**.
    *   **Core Principles:** The viewer MUST desperately want to know what comes next. Talk about something that secretly bothers or frustrates people. Use simple language everyone understands, regardless of their niche knowledge. Make the viewer question themselves!
    *   **BAD vs GOOD Examples (Follow this logic):**
        *   BAD: "3 dicas de produtividade" -> GOOD: "Porque acordar cedo está te atrasando"
        *   BAD: "Treino completo de pernas" -> GOOD: "Porque você treina todos os dias e as suas pernas não crescem"
        *   BAD: "Otimização tributária através da PJização" -> GOOD: "Como pagar menos impostos virando PJ"
    *   Apply these principles to Valter's specific pillars (Humor, Skill, Mindset).
-   **If contentType is 'CTA' (Call to Action):** Create 5 clear, compelling, and high-conversion calls to action. They should give the viewer a strong reason to follow, comment, or share, creating a sense of community and shared journey.
    *   *For Progress-based content:* Encourage following to see the journey.
    *   *For Inspirational content:* Ask for an emoji comment and a share.
    *   *For Skill content:* Offer more value in exchange for a comment.

The examples must be perfectly tailored to Valter's brand. Do not provide generic marketing phrases. Think like a fan who knows his content inside and out.

Return ONLY a JSON object with a "content" property, which is an array of 5 strings.
Generate in Portuguese Language!
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
