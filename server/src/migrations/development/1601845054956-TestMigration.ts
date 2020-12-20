import { MigrationInterface, QueryRunner } from 'typeorm';

export class TestMigration1601845054956 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        INSERT INTO test_entity (id, text) VALUES (0, 'hello 1');
        INSERT INTO test_entity (id, text) VALUES (1, 'hello 2');
        `);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public async down(/* queryRunner: QueryRunner */): Promise<void> {}
}
