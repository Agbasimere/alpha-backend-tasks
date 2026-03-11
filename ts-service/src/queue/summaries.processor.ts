import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

import { CandidateDocumentsService } from '../candidates/candidate-documents.service';
import { CandidateSummariesService } from '../candidates/candidate-summaries.service';
import { EnqueuedJob, QueueService } from './queue.service';
import {
  CandidateSummaryInput,
  CandidateSummaryResult,
  SUMMARIZATION_PROVIDER,
  SummarizationProvider,
} from '../llm/summarization-provider.interface';
import { Inject } from '@nestjs/common';

interface SummaryJobPayload {
  candidateId: string;
  summaryId: string;
  workspaceId: string;
}

@Injectable()
export class SummariesProcessor {
  private readonly logger = new Logger(SummariesProcessor.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly documentsService: CandidateDocumentsService,
    private readonly summariesService: CandidateSummariesService,
    @Inject(SUMMARIZATION_PROVIDER)
    private readonly summarizationProvider: SummarizationProvider,
  ) {}

  @Interval(1000)
  async processQueuedSummaries(): Promise<void> {
    const jobs = this.queueService.getQueuedJobs().filter((job) => job.name === 'summaries');

    for (const job of jobs) {
      await this.handleJob(job as EnqueuedJob<SummaryJobPayload>);
    }
  }

  private async handleJob(job: EnqueuedJob<SummaryJobPayload>): Promise<void> {
    const { candidateId, summaryId } = job.payload;

    try {
      const documents = await this.loadCandidateDocuments(candidateId);

      const input: CandidateSummaryInput = {
        candidateId,
        documents,
      };

      const result = await this.summarizationProvider.generateCandidateSummary(input);
      this.validateResult(result);

      await this.summariesService.markCompleted(summaryId, {
        score: result.score,
        strengths: result.strengths,
        concerns: result.concerns,
        summary: result.summary,
        recommendedDecision: result.recommendedDecision,
        provider: 'gemini',
        promptVersion: 1,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to process summary job ${job.id}`, error as Error);
      await this.summariesService.markFailed(summaryId, message);
    }
  }

  private async loadCandidateDocuments(candidateId: string): Promise<string[]> {
    // For now we read rawText directly from the database instead of reloading from disk.
    // If needed, this can be refactored to a dedicated documents listing method.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const repo: any = (this.documentsService as any).documentRepository;
    const docs = await repo.find({ where: { candidateId } });
    return docs.map((d: { rawText: string }) => d.rawText);
  }

  private validateResult(result: CandidateSummaryResult): void {
    if (typeof result.score !== 'number' || Number.isNaN(result.score)) {
      throw new Error('Invalid score in summarization result');
    }

    if (!Array.isArray(result.strengths) || !Array.isArray(result.concerns)) {
      throw new Error('Strengths and concerns must be arrays of strings');
    }

    if (typeof result.summary !== 'string' || typeof result.recommendedDecision !== 'string') {
      throw new Error('Summary and recommendedDecision must be strings');
    }
  }
}

