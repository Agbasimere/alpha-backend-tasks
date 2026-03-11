import { randomUUID } from 'crypto';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CandidateSummary } from '../entities/candidate-summary.entity';
import { SampleCandidate } from '../entities/sample-candidate.entity';

export interface CompletedSummaryData {
  score: number;
  strengths: string[];
  concerns: string[];
  summary: string;
  recommendedDecision: string;
  provider: string;
  promptVersion: number;
}

@Injectable()
export class CandidateSummariesService {
  constructor(
    @InjectRepository(SampleCandidate)
    private readonly candidateRepository: Repository<SampleCandidate>,
    @InjectRepository(CandidateSummary)
    private readonly summaryRepository: Repository<CandidateSummary>,
  ) {}

  async createPendingSummary(candidateId: string): Promise<CandidateSummary> {
    const summary = this.summaryRepository.create({
      id: randomUUID(),
      candidateId,
      status: 'pending',
      score: null,
      strengths: null,
      concerns: null,
      summary: null,
      recommendedDecision: null,
      provider: 'unknown',
      promptVersion: 1,
      errorMessage: null,
    });

    return this.summaryRepository.save(summary);
  }

  async markCompleted(summaryId: string, data: CompletedSummaryData): Promise<void> {
    const summary = await this.summaryRepository.findOne({ where: { id: summaryId } });

    if (!summary) {
      throw new NotFoundException('Summary not found');
    }

    summary.status = 'completed';
    summary.score = data.score;
    summary.strengths = data.strengths.join('\n');
    summary.concerns = data.concerns.join('\n');
    summary.summary = data.summary;
    summary.recommendedDecision = data.recommendedDecision;
    summary.provider = data.provider;
    summary.promptVersion = data.promptVersion;
    summary.errorMessage = null;

    await this.summaryRepository.save(summary);
  }

  async markFailed(summaryId: string, errorMessage: string): Promise<void> {
    const summary = await this.summaryRepository.findOne({ where: { id: summaryId } });

    if (!summary) {
      throw new NotFoundException('Summary not found');
    }

    summary.status = 'failed';
    summary.errorMessage = errorMessage;

    await this.summaryRepository.save(summary);
  }

  async listSummaries(candidateId: string, workspaceId: string): Promise<CandidateSummary[]> {
    await this.ensureCandidateAccess(candidateId, workspaceId);

    return this.summaryRepository.find({
      where: { candidateId },
      order: { createdAt: 'DESC' },
    });
  }

  async getSummary(
    candidateId: string,
    summaryId: string,
    workspaceId: string,
  ): Promise<CandidateSummary> {
    await this.ensureCandidateAccess(candidateId, workspaceId);

    const summary = await this.summaryRepository.findOne({
      where: { id: summaryId, candidateId },
    });

    if (!summary) {
      throw new NotFoundException('Summary not found');
    }

    return summary;
  }

  async ensureCandidateAccess(candidateId: string, workspaceId: string): Promise<void> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, workspaceId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }
  }
}

