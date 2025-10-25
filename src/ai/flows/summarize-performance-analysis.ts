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
  prompt: `You are an expert social media analyst. Please summarize the following performance metrics into a concise and understandable overview, highlighting key trends and areas for improvement.\n\nMetrics: {{{metrics}}}`,
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
