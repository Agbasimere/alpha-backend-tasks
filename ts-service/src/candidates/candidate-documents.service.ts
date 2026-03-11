import { mkdir, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import * as path from 'path';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthUser } from '../auth/auth.types';
import { CandidateDocument } from '../entities/candidate-document.entity';
import { SampleCandidate } from '../entities/sample-candidate.entity';
import { CreateCandidateDocumentDto } from './dto/create-candidate-document.dto';

@Injectable()
export class CandidateDocumentsService {
  constructor(
    @InjectRepository(SampleCandidate)
    private readonly candidateRepository: Repository<SampleCandidate>,
    @InjectRepository(CandidateDocument)
    private readonly documentRepository: Repository<CandidateDocument>,
  ) {}

  async createDocument(
    user: AuthUser,
    candidateId: string,
    dto: CreateCandidateDocumentDto,
  ): Promise<CandidateDocument> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, workspaceId: user.workspaceId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const safeFileName = this.toSafeFileName(dto.fileName);
    const storageFileName = `${candidateId}_${randomUUID()}_${safeFileName}.txt`;
    const storagePath = path.join(uploadsDir, storageFileName);

    await writeFile(storagePath, dto.rawText, { encoding: 'utf-8' });

    const doc = this.documentRepository.create({
      id: randomUUID(),
      candidateId,
      documentType: dto.documentType.trim(),
      fileName: dto.fileName.trim(),
      storageKey: path.relative(process.cwd(), storagePath),
      rawText: dto.rawText,
    });

    return this.documentRepository.save(doc);
  }

  private toSafeFileName(input: string): string {
    const base = input.trim().replace(/\.[^/.]+$/, '');
    const normalized = base.replace(/[^a-zA-Z0-9-_]+/g, '_');
    return normalized.slice(0, 80) || 'document';
  }
}

