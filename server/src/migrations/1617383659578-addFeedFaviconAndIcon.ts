import {MigrationInterface, QueryRunner} from "typeorm";

export class addFeedFaviconAndIcon1617383659578 implements MigrationInterface {
    name = 'addFeedFaviconAndIcon1617383659578'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feed" ADD "siteFavicon" character varying(1000)`);
        await queryRunner.query(`ALTER TABLE "feed" ADD "siteIcon" character varying(1000)`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."password" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET DEFAULT null`);
        await queryRunner.query(`ALTER TABLE "feed" DROP COLUMN "favicon"`);
        await queryRunner.query(`ALTER TABLE "feed" ADD "favicon" character varying(1000)`);
        await queryRunner.query(`COMMENT ON COLUMN "feed"."lastSuccessfulUpd" IS NULL`);
        await queryRunner.query(`ALTER TABLE "feed" ALTER COLUMN "lastSuccessfulUpd" SET DEFAULT '"1970-01-01T00:00:00.000Z"'`);
        await queryRunner.query(`COMMENT ON COLUMN "feed"."lastUpdAttempt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "feed" ALTER COLUMN "lastUpdAttempt" SET DEFAULT '"1970-01-01T00:00:00.000Z"'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feed" ALTER COLUMN "lastUpdAttempt" SET DEFAULT '1970-01-01 00:00:00'`);
        await queryRunner.query(`COMMENT ON COLUMN "feed"."lastUpdAttempt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "feed" ALTER COLUMN "lastSuccessfulUpd" SET DEFAULT '1970-01-01 00:00:00'`);
        await queryRunner.query(`COMMENT ON COLUMN "feed"."lastSuccessfulUpd" IS NULL`);
        await queryRunner.query(`ALTER TABLE "feed" DROP COLUMN "favicon"`);
        await queryRunner.query(`ALTER TABLE "feed" ADD "favicon" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."password" IS NULL`);
        await queryRunner.query(`ALTER TABLE "feed" DROP COLUMN "siteIcon"`);
        await queryRunner.query(`ALTER TABLE "feed" DROP COLUMN "siteFavicon"`);
    }

}
