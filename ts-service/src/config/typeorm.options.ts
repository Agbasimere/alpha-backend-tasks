import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

import { SampleCandidate } from '../entities/sample-candidate.entity';
import { SampleWorkspace } from '../entities/sample-workspace.entity';
import { CandidateDocument } from '../entities/candidate-document.entity';
import { CandidateSummary } from '../entities/candidate-summary.entity';

export const getTypeOrmOptions = (): TypeOrmModuleOptions & DataSourceOptions => ({
  type: 'sqlite',
  database: 'db.sqlite',
  entities: [SampleWorkspace, SampleCandidate, CandidateDocument, CandidateSummary],
  synchronize: true,
  logging: true,
});
