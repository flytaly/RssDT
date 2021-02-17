import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1613520876770 implements MigrationInterface {
    name = 'Initial1613520876770'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "options_themedefault_enum" AS ENUM('default', 'text')`);
        await queryRunner.query(`CREATE TABLE "options" ("userId" integer NOT NULL, "dailyDigestHour" integer NOT NULL DEFAULT '18', "withContentTableDefault" boolean NOT NULL DEFAULT false, "itemBodyDefault" boolean NOT NULL DEFAULT true, "attachmentsDefault" boolean NOT NULL DEFAULT true, "themeDefault" "options_themedefault_enum" NOT NULL DEFAULT 'default', "customSubject" character varying(150), "shareEnable" boolean NOT NULL DEFAULT true, "shareList" character varying array DEFAULT '{}', CONSTRAINT "REL_54ac67a573667d2e37a8752e89" UNIQUE ("userId"), CONSTRAINT "PK_54ac67a573667d2e37a8752e89d" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "emailVerified" boolean NOT NULL DEFAULT false, "role" character varying NOT NULL DEFAULT 'USER', "locale" character varying(200) NOT NULL DEFAULT 'en-US', "timeZone" character varying(100) NOT NULL DEFAULT 'UTC', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "password" character varying DEFAULT null, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "user_feed_schedule_enum" AS ENUM('realtime', 'everyhour', 'every2hours', 'every3hours', 'every6hours', 'every12hours', 'daily', 'disable')`);
        await queryRunner.query(`CREATE TYPE "user_feed_withcontenttable_enum" AS ENUM('enable', 'disable', 'default')`);
        await queryRunner.query(`CREATE TYPE "user_feed_itembody_enum" AS ENUM('enable', 'disable', 'default')`);
        await queryRunner.query(`CREATE TYPE "user_feed_attachments_enum" AS ENUM('enable', 'disable', 'default')`);
        await queryRunner.query(`CREATE TYPE "user_feed_theme_enum" AS ENUM('default', 'text')`);
        await queryRunner.query(`CREATE TABLE "user_feed" ("id" SERIAL NOT NULL, "activated" boolean NOT NULL DEFAULT false, "schedule" "user_feed_schedule_enum" NOT NULL DEFAULT 'disable', "withContentTable" "user_feed_withcontenttable_enum" NOT NULL DEFAULT 'default', "itemBody" "user_feed_itembody_enum" NOT NULL DEFAULT 'default', "attachments" "user_feed_attachments_enum" NOT NULL DEFAULT 'default', "theme" "user_feed_theme_enum" NOT NULL DEFAULT 'default', "filter" character varying(250), "lastDigestSentAt" TIMESTAMP, "lastViewedItemDate" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "wasFilteredAt" TIMESTAMP, "userId" integer NOT NULL, "feedId" integer NOT NULL, "unsubscribeToken" character varying, CONSTRAINT "UQ_367072adcd0adf4fd3990fc3303" UNIQUE ("unsubscribeToken"), CONSTRAINT "PK_75099a104c0806d680c2f07c5e1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "feed" ("id" SERIAL NOT NULL, "url" character varying(2000) NOT NULL, "link" character varying(2000), "title" character varying DEFAULT '', "description" text DEFAULT '', "language" character varying, "favicon" character varying, "imageUrl" character varying, "imageTitle" character varying DEFAULT '', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "lastSuccessfulUpd" TIMESTAMP NOT NULL DEFAULT '"1970-01-01T00:00:00.000Z"', "activated" boolean NOT NULL DEFAULT false, "lastUpdAttempt" TIMESTAMP NOT NULL DEFAULT '"1970-01-01T00:00:00.000Z"', "throttled" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_8b50ee8dd27f84bebd722d64a7c" UNIQUE ("url"), CONSTRAINT "PK_8a8dfd1ff306ccdf65f0b5d04b2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "item" ("id" SERIAL NOT NULL, "guid" character varying, "pubdate" TIMESTAMP, "link" character varying, "title" text DEFAULT '', "description" text DEFAULT '', "summary" text DEFAULT '', "imageUrl" character varying DEFAULT '', "feedId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d3c0c71f23e7adcf952a1d13423" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "enclosure" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "length" character varying, "type" character varying, "itemId" integer, CONSTRAINT "PK_950760fa1b5a7072b80b9f22cb1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "options" ADD CONSTRAINT "FK_54ac67a573667d2e37a8752e89d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_feed" ADD CONSTRAINT "FK_0021f4ccb06709332ad8d7b234a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_feed" ADD CONSTRAINT "FK_17a59ca657fe2edc39e523b7a63" FOREIGN KEY ("feedId") REFERENCES "feed"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "item" ADD CONSTRAINT "FK_400d419e53b4cc8083508591a89" FOREIGN KEY ("feedId") REFERENCES "feed"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enclosure" ADD CONSTRAINT "FK_3e63f37d8a06b34ae6856efdef3" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "enclosure" DROP CONSTRAINT "FK_3e63f37d8a06b34ae6856efdef3"`);
        await queryRunner.query(`ALTER TABLE "item" DROP CONSTRAINT "FK_400d419e53b4cc8083508591a89"`);
        await queryRunner.query(`ALTER TABLE "user_feed" DROP CONSTRAINT "FK_17a59ca657fe2edc39e523b7a63"`);
        await queryRunner.query(`ALTER TABLE "user_feed" DROP CONSTRAINT "FK_0021f4ccb06709332ad8d7b234a"`);
        await queryRunner.query(`ALTER TABLE "options" DROP CONSTRAINT "FK_54ac67a573667d2e37a8752e89d"`);
        await queryRunner.query(`DROP TABLE "enclosure"`);
        await queryRunner.query(`DROP TABLE "item"`);
        await queryRunner.query(`DROP TABLE "feed"`);
        await queryRunner.query(`DROP TABLE "user_feed"`);
        await queryRunner.query(`DROP TYPE "user_feed_theme_enum"`);
        await queryRunner.query(`DROP TYPE "user_feed_attachments_enum"`);
        await queryRunner.query(`DROP TYPE "user_feed_itembody_enum"`);
        await queryRunner.query(`DROP TYPE "user_feed_withcontenttable_enum"`);
        await queryRunner.query(`DROP TYPE "user_feed_schedule_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "options"`);
        await queryRunner.query(`DROP TYPE "options_themedefault_enum"`);
    }

}
