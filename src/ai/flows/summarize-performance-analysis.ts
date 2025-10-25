'use server';

/**
 * @fileOverview Summarizes social media performance metrics into a concise overview.
 *
 * - summarizePerformanceAnalysis - A function that summarizes social media performance.
 * - SummarizePerformanceAnalysisInput - The input type for the summarizePerformanceAnalysis function.
 * - SummarizePerformanceAnalysisOutput - The return type for the summarizePerformanceAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePerformanceAnalysisInputSchema = z.object({
  metrics: z.string().describe('Social media performance metrics data.'),
});
export type SummarizePerformanceAnalysisInput = z.infer<typeof SummarizePerformanceAnalysisInputSchema>;

const SummarizePerformanceAnalysisOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the social media performance metrics.'),
});
export type SummarizePerformanceAnalysisOutput = z.infer<typeof SummarizePerformanceAnalysisOutputSchema>;

export async function summarizePerformanceAnalysis(input: SummarizePerformanceAnalysisInput): Promise<SummarizePerformanceAnalysisOutput> {
  return summarizePerformanceAnalysisFlow(input);
}

const summarizePerformanceAnalysisPrompt = ai.definePrompt({
  name: 'summarizePerformanceAnalysisPrompt',
  input: {schema: SummarizePerformanceAnalysisInputSchema},
  output: {schema: SummarizePerformanceAnalysisOutputSchema},
  prompt: `You are a world-class social media manager, mentor, and coach. Your goal is to help me achieve massive engagement and growth. I need your honest, critical, and actionable feedback.

Here are my latest performance metrics:
{{{metrics}}}

Analyze these numbers with a critical eye. Don't just summarize them. Tell me what I'm doing right, what I'm doing wrong, and give me specific, concrete steps to improve. I want to know what I should focus on to get better results. Be direct and act as a true mentor who wants to see me succeed.`,
});

const summarizePerformanceAnalysisFlow = ai.defineFlow(
  {
    name: 'summarizePerformanceAnalysisFlow',
    inputSchema: SummarizePerformanceAnalysisInputSchema,
    outputSchema: SummarizePerformanceAnalysisOutputSchema,
  },
  async input => {
    const {output} = await summarizePerformanceAnalysisPrompt(input);
    return output!;
  }
);
