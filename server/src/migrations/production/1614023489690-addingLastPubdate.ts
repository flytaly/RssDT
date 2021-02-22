import { MigrationInterface, QueryRunner } from 'typeorm';

const lastPubdateQuery = `UPDATE feed SET "lastPubdate" = (
                    SELECT MAX(item.pubdate)
                    FROM item WHERE item."feedId" = feed.id)`;

export class addingLastPubdate1614023489690 implements MigrationInterface {
  name = 'addingLastPubdate1614023489690';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "feed" ADD "lastPubdate" TIMESTAMP`);
    await queryRunner.query(lastPubdateQuery);
    await queryRunner.query(
      `ALTER TABLE "options" DROP CONSTRAINT "FK_54ac67a573667d2e37a8752e89d"`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "options"."userId" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "options" ADD CONSTRAINT "UQ_54ac67a573667d2e37a8752e89d" UNIQUE ("userId")`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "user"."password" IS NULL`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET DEFAULT null`);
    await queryRunner.query(`COMMENT ON COLUMN "feed"."lastSuccessfulUpd" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "feed" ALTER COLUMN "lastSuccessfulUpd" SET DEFAULT '"1970-01-01T00:00:00.000Z"'`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "feed"."lastUpdAttempt" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "feed" ALTER COLUMN "lastUpdAttempt" SET DEFAULT '"1970-01-01T00:00:00.000Z"'`,
    );
    await queryRunner.query(`ALTER TABLE "item" DROP CONSTRAINT "FK_400d419e53b4cc8083508591a89"`);
    await queryRunner.query(`ALTER TABLE "item" ALTER COLUMN "feedId" SET NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "item"."feedId" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "options" ADD CONSTRAINT "FK_54ac67a573667d2e37a8752e89d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "item" ADD CONSTRAINT "FK_400d419e53b4cc8083508591a89" FOREIGN KEY ("feedId") REFERENCES "feed"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "item" DROP CONSTRAINT "FK_400d419e53b4cc8083508591a89"`);
    await queryRunner.query(
      `ALTER TABLE "options" DROP CONSTRAINT "FK_54ac67a573667d2e37a8752e89d"`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "item"."feedId" IS NULL`);
    await queryRunner.query(`ALTER TABLE "item" ALTER COLUMN "feedId" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "item" ADD CONSTRAINT "FK_400d419e53b4cc8083508591a89" FOREIGN KEY ("feedId") REFERENCES "feed"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feed" ALTER COLUMN "lastUpdAttempt" SET DEFAULT '1970-01-01 00:00:00'`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "feed"."lastUpdAttempt" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "feed" ALTER COLUMN "lastSuccessfulUpd" SET DEFAULT '1970-01-01 00:00:00'`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "feed"."lastSuccessfulUpd" IS NULL`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP DEFAULT`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."password" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "options" DROP CONSTRAINT "UQ_54ac67a573667d2e37a8752e89d"`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "options"."userId" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "options" ADD CONSTRAINT "FK_54ac67a573667d2e37a8752e89d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "feed" DROP COLUMN "lastPubdate"`);
  }
}
