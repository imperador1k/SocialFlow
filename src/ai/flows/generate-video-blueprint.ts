'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateVideoBlueprintInputSchema = z.object({
    contentType: z
        .enum(['Humor/Meme', 'Skill/Treino', 'Mindset/Rotina', 'YouTube', 'LinkedIn'])
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
    contentType: z.enum(['Humor/Meme', 'Skill/Treino', 'Mindset/Rotina', 'YouTube', 'LinkedIn']),
    idea: z.string().describe('The core concept in 1-2 sentences.'),
    hook: z.string().describe('The first 3-4 seconds of the video. For LinkedIn: professional opening. For other platforms: starts with "Saudações meus caros...".'),
    script: z.string().describe('The full spoken text in PT-PT. Natural, casual, like talking to a friend. Must feel REAL, not scripted.'),
    shotList: z.array(z.string()).describe('5-10 simple, filmable bullet points.'),
    cta: z.string().describe('Short and natural Call to Action. For LinkedIn: professional CTA. For others: follow, like, comment, share.'),
    usePersonaLine: z.boolean().describe('Whether to use the Lamine Yamal persona line. ALWAYS false for LinkedIn.'),
    personaLine: z.string().nullable().describe('If usePersonaLine is true, provide 1 short phrase like "sou o irmão do Lamine Yamal" or variation'),
    useWasted: z.boolean().describe('Whether to use the GTA Wasted effect. ALWAYS false for LinkedIn.'),
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
* **The Vibe:** Young, ambitious, obsessed with football, but REAL. He's a PLAYER who happens to create content — NOT an influencer, NOT a coach, NOT a motivational speaker.

**1. BRAND IDENTITY & HOOK (VIRAL RULES):**
* **Greeting (TikTok/Instagram/YouTube):** The hook MUST start with "Saudações meus caros...".
* **Greeting (LinkedIn):** NO "Saudações meus caros". Use a professional, direct opening.
* **Hook Structure (First 1-3 seconds) — For TikTok/Instagram:**
  - 0.0-0.5s: "Saudações meus caros..."
  - 0.5-2.5s: Tension/curiosity phrase. Make the viewer stop scrolling.
  - 2.5-4.0s: Promise of what will be shown.
  - *Prohibited Hooks:* Generic things like "Treino de X", "3 dicas", "Hoje vou...".
  - *Preferred Patterns:* "Porque...", "A verdade sobre...", "Estás a fazer X errado...", "Ninguém fala sobre...".
* **Hook (LinkedIn):** Direct, professional. State the insight or result upfront. Example: "Sprint de 40m em 4.8s. Há 3 meses fazia em 5.3s."

**2. PERSONA: "Irmão do Lamine Yamal"**
* NOT obligatory. Use ONLY when it makes sense naturally.
* NEVER use on LinkedIn.
* NEVER use to reduce credibility as a serious player.
* Don't repeat in every single video — vary the content.
* \`usePersonaLine\` must be false for LinkedIn content.
* *When it works:*
  - Humor/Meme: As part of the gag, early in the video.
  - Skill/Treino: AFTER showing an impressive rep, as a quick punchline.
  - Mindset/Rotina: Rarely. Only if it reinforces without distracting.

**3. "WASTED" EFFECT (GTA SA)**
* Use selectively. NOT on LinkedIn.
* \`useWasted\` must be false for LinkedIn content.
* *Allowed reasons ONLY:* Real exhaustion after intense training, OR the inconvenience of the free agent grind.
* *NEVER* use for failing skills on purpose.

**4. SCRIPT RULES (MOST IMPORTANT):**
* **Write the script as if Miguel is speaking casually to a friend while holding the phone.**
* **Avoid corporate tone. Avoid overly polished motivational speech.**
* **Use short, natural sentences. Allow conversational rhythm.**
* **Make it feel REAL, not scripted. Not rehearsed.**
* **Allow natural imperfections** — small pauses, conversational transitions ("tipo...", "sabes?", "olha...").
* **Allow real emotion** — doubt, love for the game, frustration, ambition, vulnerability.
* **Do NOT sound like a guru, coach, or influencer.**
* **Miguel is a young player talking to his audience, not giving a TED talk.**
* Length: Target {{videoLengthSeconds}} seconds of speaking.
* Language: PT-PT (Portuguese from Portugal). Young, direct, natural style.
* Structure:
  1. Hook
  2. 1 sentence of context (casual, not formal).
  3. Demonstration/explanation.
  4. 1 sentence showing realness (proof/intensity/honest reflection).
  5. Short natural CTA.

**5. LINKEDIN-SPECIFIC SCRIPT RULES:**
* Tone: Serious but human. NOT corporate. NOT stiff.
* NO "Saudações meus caros".
* NO persona line ("Irmão do Lamine Yamal").
* NO "Wasted" effect.
* NO exaggerated humor.
* Focus on: performance data (sprint times, distances, loads), discipline reflections, real behind-the-scenes of training, honest learnings.
* Format: 30-60 second videos with professional description text.
* Language: Clear, mature, but still authentic Miguel — not a different person, just his professional side.
* CTA: Professional — connect, follow for the journey, engage with the topic.

**6. CTA RULES (CRITICAL):**
* **TikTok/Instagram:** Ask to follow, like, comment, share, or subscribe. Keep it natural.
* **LinkedIn:** Professional CTA — "Acompanha a minha jornada", "O que achas deste progresso?", "Segue para mais dados reais".
* **NEVER** use CTAs that sound like selling (e.g. "Manda-me mensagem", "Link na bio", "Compra").
* Keep it short, 1 sentence max. It should feel like a friend talking, not a brand.

**YOUR TASK:**
Generate {{numberOfIdeas}} complete video blueprint(s) for the content type: **{{{contentType}}}**.

**Constraints per Content Type:**
- *Humor/Meme:* Miguel relatable or playfully confident. Natural humor, not forced.
- *Skill/Treino:* ELITE execution. Highlight speed, technique, or power. The product.
- *Mindset/Rotina:* Real emotions, honest moments, the grind. NOT guru speeches.
- *YouTube:* Long-form journey, match analysis, full workouts.
- *LinkedIn:* Professional positioning. Data, metrics, discipline, reflections. Serious but authentic.

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
