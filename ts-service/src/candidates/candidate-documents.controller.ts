import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/auth-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { FakeAuthGuard } from '../auth/fake-auth.guard';
import { CreateCandidateDocumentDto } from './dto/create-candidate-document.dto';
import { CandidateDocumentsService } from './candidate-documents.service';

@Controller('candidates')
@UseGuards(FakeAuthGuard)
export class CandidateDocumentsController {
  constructor(private readonly documentsService: CandidateDocumentsService) {}

  @Post(':candidateId/documents')
  async uploadDocument(
    @CurrentUser() user: AuthUser,
    @Param('candidateId') candidateId: string,
    @Body() dto: CreateCandidateDocumentDto,
  ) {
    return this.documentsService.createDocument(user, candidateId, dto);
  }
}

