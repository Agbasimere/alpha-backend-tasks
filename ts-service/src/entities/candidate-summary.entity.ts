import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { SampleCandidate } from './sample-candidate.entity';

export type CandidateSummaryStatus = 'pending' | 'completed' | 'failed';

@Entity({ name: 'candidate_summaries' })
export class CandidateSummary {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id!: string;

  @Column({ name: 'candidate_id', type: 'varchar', length: 64 })
  candidateId!: string;

  @Column({ type: 'varchar', length: 16 })
  status!: CandidateSummaryStatus;

  @Column({ type: 'real', nullable: true })
  score!: number | null;

  @Column({ type: 'text', nullable: true })
  strengths!: string | null;

  @Column({ type: 'text', nullable: true })
  concerns!: string | null;

  @Column({ type: 'text', nullable: true })
  summary!: string | null;

  @Column({ name: 'recommended_decision', type: 'text', nullable: true })
  recommendedDecision!: string | null;

  @Column({ type: 'varchar', length: 64 })
  provider!: string;

  @Column({ name: 'prompt_version', type: 'integer' })
  promptVersion!: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => SampleCandidate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate!: SampleCandidate;
}

