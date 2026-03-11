import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CandidateDocument } from '../entities/candidate-document.entity';
import { CandidateSummary } from '../entities/candidate-summary.entity';
import { SampleCandidate } from '../entities/sample-candidate.entity';
import { LlmModule } from '../llm/llm.module';
import { QueueModule } from '../queue/queue.module';
import { SummariesProcessor } from '../queue/summaries.processor';
import { CandidateDocumentsController } from './candidate-documents.controller';
import { CandidateDocumentsService } from './candidate-documents.service';
import { CandidateSummariesController } from './candidate-summaries.controller';
import { CandidateSummariesService } from './candidate-summaries.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SampleCandidate, CandidateDocument, CandidateSummary]),
    QueueModule,
    LlmModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [CandidateDocumentsController, CandidateSummariesController],
  providers: [CandidateDocumentsService, CandidateSummariesService, SummariesProcessor],
})
export class CandidatesModule {}
