import {MigrationInterface, QueryRunner} from "typeorm";

export class DeleteUser1641671430534 implements MigrationInterface {
    name = 'DeleteUser1641671430534'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users_to_be_deleted" ("userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_1f88ec09e6eb6d221ad761fd5a" UNIQUE ("userId"), CONSTRAINT "PK_1f88ec09e6eb6d221ad761fd5a1" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD "deleted" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "feed" ALTER COLUMN "lastSuccessfulUpd" SET DEFAULT '"1970-01-01T00:00:00.000Z"'`);
        await queryRunner.query(`ALTER TABLE "feed" ALTER COLUMN "lastUpdAttempt" SET DEFAULT '"1970-01-01T00:00:00.000Z"'`);
        await queryRunner.query(`ALTER TABLE "users_to_be_deleted" ADD CONSTRAINT "FK_1f88ec09e6eb6d221ad761fd5a1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_to_be_deleted" DROP CONSTRAINT "FK_1f88ec09e6eb6d221ad761fd5a1"`);
        await queryRunner.query(`ALTER TABLE "feed" ALTER COLUMN "lastUpdAttempt" SET DEFAULT '1970-01-01 00:00:00'`);
        await queryRunner.query(`ALTER TABLE "feed" ALTER COLUMN "lastSuccessfulUpd" SET DEFAULT '1970-01-01 00:00:00'`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted"`);
        await queryRunner.query(`DROP TABLE "users_to_be_deleted"`);
    }

}
