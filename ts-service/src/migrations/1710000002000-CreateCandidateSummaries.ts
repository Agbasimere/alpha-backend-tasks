import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateCandidateSummaries1710000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'candidate_summaries',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '64',
            isPrimary: true,
          },
          {
            name: 'candidate_id',
            type: 'varchar',
            length: '64',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '16',
            isNullable: false,
          },
          {
            name: 'score',
            type: 'real',
            isNullable: true,
          },
          {
            name: 'strengths',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'concerns',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'summary',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'recommended_decision',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'provider',
            type: 'varchar',
            length: '64',
            isNullable: false,
          },
          {
            name: 'prompt_version',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            isNullable: false,
            default: "datetime('now')",
          },
          {
            name: 'updated_at',
            type: 'datetime',
            isNullable: false,
            default: "datetime('now')",
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'candidate_summaries',
      new TableForeignKey({
        name: 'fk_candidate_summaries_candidate_id',
        columnNames: ['candidate_id'],
        referencedTableName: 'sample_candidates',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'candidate_summaries',
      new TableIndex({
        name: 'idx_candidate_summaries_candidate_id',
        columnNames: ['candidate_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('candidate_summaries', 'idx_candidate_summaries_candidate_id');
    await queryRunner.dropForeignKey(
      'candidate_summaries',
      'fk_candidate_summaries_candidate_id',
    );
    await queryRunner.dropTable('candidate_summaries');
  }
}

