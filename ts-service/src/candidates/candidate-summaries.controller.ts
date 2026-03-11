import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/auth-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { FakeAuthGuard } from '../auth/fake-auth.guard';
import { QueueService } from '../queue/queue.service';
import { CandidateSummariesService } from './candidate-summaries.service';

@ApiTags('candidate-summaries')
@Controller('candidates/:candidateId/summaries')
@UseGuards(FakeAuthGuard)
export class CandidateSummariesController {
  constructor(
    private readonly summariesService: CandidateSummariesService,
    private readonly queueService: QueueService,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Request candidate summary generation' })
  async generateSummary(
    @CurrentUser() user: AuthUser,
    @Param('candidateId') candidateId: string,
  ) {
    await this.summariesService.ensureCandidateAccess(candidateId, user.workspaceId);

    const summary = await this.summariesService.createPendingSummary(candidateId);

    this.queueService.enqueue('summaries', {
      candidateId,
      summaryId: summary.id,
      workspaceId: user.workspaceId,
    });

    return {
      status: 'queued',
      summaryId: summary.id,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List summaries for a candidate' })
  async listSummaries(@CurrentUser() user: AuthUser, @Param('candidateId') candidateId: string) {
    return this.summariesService.listSummaries(candidateId, user.workspaceId);
  }

  @Get(':summaryId')
  @ApiOperation({ summary: 'Get a single candidate summary' })
  async getSummary(
    @CurrentUser() user: AuthUser,
    @Param('candidateId') candidateId: string,
    @Param('summaryId') summaryId: string,
  ) {
    return this.summariesService.getSummary(candidateId, summaryId, user.workspaceId);
  }
}

