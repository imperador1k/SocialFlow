'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateVideoBlueprintInputSchema = z.object({
    contentType: z
        .enum(['Humor/Meme', 'Skill/Treino', 'Mindset/Rotina', 'YouTube'])
        .describe('The type of content to generate ideas for.'),
    numberOfIdeas: z
        .number()
        .min(1)
        .max(5)
        .default(1)
        .describe('The number of video blueprints to generate.'),
    videoLengthSeconds: z
        .number()
        .min(10)
        .max(90)
        .default(35)
        .describe('Target duration of the video in seconds.'),
    objective: z
        .string()
        .default('Contrato_Profissional')
        .describe('Main goal of the content creator.'),
});

export type GenerateVideoBlueprintInput = z.infer<typeof GenerateVideoBlueprintInputSchema>;

const BlueprintSchema = z.object({
    title: z.string().describe('Internal short title for the video.'),
    contentType: z.enum(['Humor/Meme', 'Skill/Treino', 'Mindset/Rotina', 'YouTube']),
    idea: z.string().describe('The core concept in 1-2 sentences.'),
    hook: z.string().describe('The first 3-4 seconds of the video. MUST start with "Saudações meus caros..." and contain a tension/curiosity phrase.'),
    script: z.string().describe('The full spoken text in PT-PT. Short, natural. Includes hook, promise, explanation, and CTA. Make it realistic for the requested duration.'),
    shotList: z.array(z.string()).describe('5-10 simple, filmable bullet points.'),
    cta: z.string().describe('Short and natural Call to Action: ask to follow, like, comment, or share. NEVER sell anything.'),
    usePersonaLine: z.boolean().describe('Whether to use the Lamine Yamal persona line in this video.'),
    personaLine: z.string().nullable().describe('If usePersonaLine is true, provide 1 short phrase like "sou o irmão do Lamine Yamal" or variation'),
    useWasted: z.boolean().describe('Whether to use the GTA Wasted effect.'),
    wastedReason: z.string().nullable().describe('If useWasted is true, the reason for the effect (extreme exhaustion or situational inconvenience).'),
    hashtags: z.array(z.string()).optional(),
});

export type VideoBlueprint = z.infer<typeof BlueprintSchema>;

const GenerateVideoBlueprintOutputSchema = z.object({
    blueprints: z.array(BlueprintSchema),
});

export type GenerateVideoBlueprintOutput = z.infer<typeof GenerateVideoBlueprintOutputSchema>;

export async function generateVideoBlueprint(input: GenerateVideoBlueprintInput): Promise<GenerateVideoBlueprintOutput> {
    return generateVideoBlueprintFlow(input);
}

const generateVideoBlueprintPrompt = ai.definePrompt({
    name: 'generateVideoBlueprintPrompt',
    input: { schema: GenerateVideoBlueprintInputSchema },
    output: { schema: GenerateVideoBlueprintOutputSchema, format: 'json' },
    prompt: `You are a world-class social media creative strategist. Your goal is to help a specific football content creator, "MIGUEL", generate complete video blueprints.
Miguel's objective is to be hired by a professional club ({{objective}}).

**MIGUEL'S BRAND GUIDELINES (CRITICAL):**
* **Name:** MIGUEL (Never use "Valter" or other names).
* **The Golden Rule:** Miguel wants a professional contract. **NEVER** suggest ideas where he looks like a bad player or fails a skill on purpose.
* **The Vibe:** "The Charismatic Underdog". Skilled, obsessed with training, but keeps a fun personality.

**1. BRAND IDENTITY & HOOK (VIRAL RULES):**
* **Greeting:** The hook MUST ALWAYS start EXACTLY with "Saudações meus caros...".
* **Hook Structure (First 1-3 seconds):**
  - 0.0-0.5s: "Saudações meus caros..."
  - 0.5-2.5s: Tension/curiosity phrase (curiosity gap / belief breaking). Make the viewer think "is this about me?" or "am I training wrong?".
  - 2.5-4.0s: Promise of what will be shown.
  - *Prohibited Hooks:* Generic things like "Treino de X", "3 dicas", "Hoje vou...".
  - *Preferred Patterns:* "Porque...", "A verdade sobre...", "Estás a fazer X errado...", "Ninguém fala sobre...", "Se queres X, pára de fazer Y...".

**2. PERSONA: "Irmão do Lamine Yamal"**
* Use this persona line selectively (\`usePersonaLine\`). NEVER use it to reduce his credibility as a serious player.
* *When to use:*
  - Humor/Meme: Enter early as part of the gag.
  - Skill/Treino: Use AFTER showing 1 impressive repetition (as a short punchline).
  - Mindset/Rotina: Rarely, only if it reinforces the narrative without distracting.
  - YouTube: Optional.

**3. "WASTED" EFFECT (GTA SA)**
* Use selectively (\`useWasted\`).
* *Allowed reasons ONLY:* Real exhaustion after intense training, OR the inconvenience of the free agent grind (washing kits, training in the dark, chasing balls).
* *NEVER* use for failing skills on purpose.

**4. SCRIPT RULES:**
* Length: Target {{videoLengthSeconds}} seconds of speaking. Let the script flow naturally.
* Language: PT-PT (Portuguese from Portugal). Young and direct style.
* Structure:
  1. Hook ("Saudações meus caros..." + Curiosity + Promise)
  2. 1 sentence of context.
  3. Demonstration/explanation.
  4. 1 sentence reinforcing credibility (proof/intensity/repetition).
  5. Short natural CTA.

**5. CTA RULES (CRITICAL):**
* The CTA must ONLY ask the viewer to: **follow, like, comment, share, or subscribe**.
* Examples: "Segue para mais", "Deixa o like se também fazes isto", "Comenta o teu recorde", "Partilha com o teu parceiro de treino".
* **NEVER** use CTAs that sound like selling or influencer marketing (e.g. "Manda-me mensagem", "Link na bio", "Compra", "Contacta-me").
* Keep it short, 1 sentence max. It should feel like a friend talking, not a brand.

**YOUR TASK:**
Generate {{numberOfIdeas}} complete video blueprint(s) for the content type: **{{{contentType}}}**.

**Constraints per Content Type:**
- *Humor/Meme:* Miguel relatable or playfully arrogant.
- *Skill/Treino:* ELITE execution. Highlight speed, technique, or power.
- *Mindset/Rotina:* "Obsessed" mentality, underdog story.
- *YouTube:* Long-form journey, match analysis, full workouts.

Return ONLY a JSON object with a "blueprints" array containing the structured data.
`
});

const generateVideoBlueprintFlow = ai.defineFlow(
    {
        name: 'generateVideoBlueprintFlow',
        inputSchema: GenerateVideoBlueprintInputSchema,
        outputSchema: GenerateVideoBlueprintOutputSchema,
    },
    async input => {
        try {
            const { output } = await generateVideoBlueprintPrompt(input);
            if (!output) throw new Error("Output is undefined from Genkit");
            return output;
        } catch (error) {
            console.warn('First attempt failed, retrying...', error);
            // Simple fallback retry
            const { output } = await generateVideoBlueprintPrompt(input);
            if (!output) throw new Error("Output is undefined on retry");
            return output;
        }
    }
);
