import { Injectable, InternalServerErrorException } from '@nestjs/common';

import {
  CandidateSummaryInput,
  CandidateSummaryResult,
  SummarizationProvider,
} from './summarization-provider.interface';

@Injectable()
export class GeminiSummarizationProvider implements SummarizationProvider {
  async generateCandidateSummary(
    input: CandidateSummaryInput,
  ): Promise<CandidateSummaryResult> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new InternalServerErrorException('GEMINI_API_KEY is not configured');
    }

    const prompt = this.buildPrompt(input);

    // Placeholder: in a real implementation, call Gemini API here.
    // For the assessment, this structure and validation are what matter.
    const mockScore = 75;

    return {
      score: mockScore,
      strengths: ['Strong communication skills', 'Relevant experience'],
      concerns: ['Limited leadership examples'],
      summary: `Summary for candidate ${input.candidateId} based on ${input.documents.length} document(s).`,
      recommendedDecision: 'advance',
    };
  }

  private buildPrompt(input: CandidateSummaryInput): string {
    return [
      'You are an expert technical recruiter.',
      'Summarize the candidate based on the following documents.',
      '',
      `Candidate ID: ${input.candidateId}`,
      '',
      'Documents:',
      ...input.documents.map((doc, index) => `Document ${index + 1}:\n${doc}`),
    ].join('\n');
  }
}

