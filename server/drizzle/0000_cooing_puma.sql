DO $$ BEGIN
 CREATE TYPE "public"."digestSchedule" AS ENUM('realtime', 'everyhour', 'every2hours', 'every3hours', 'every6hours', 'every12hours', 'daily', 'disable');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."ternaryState" AS ENUM('enable', 'disable', 'default');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."theme" AS ENUM('default', 'text');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enclosure" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" varchar(2048),
	"length" varchar(100),
	"type" varchar(20),
	"itemId" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feed" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" varchar(2048) NOT NULL,
	"link" varchar(2048),
	"title" varchar(2000) DEFAULT '',
	"description" text DEFAULT '',
	"language" varchar(50),
	"favicon" varchar(2048),
	"siteFavicon" varchar(2048),
	"siteIcon" varchar(2048),
	"imageUrl" varchar(2048),
	"imageTitle" varchar(1000),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSuccessfulUpd" timestamp with time zone DEFAULT '1970-01-01T00:00:00.000Z' NOT NULL,
	"lastPubdate" timestamp with time zone DEFAULT '1970-01-01T00:00:00.000Z',
	"activated" boolean DEFAULT false,
	"lastUpdAttempt" timestamp with time zone DEFAULT '1970-01-01T00:00:00.000Z' NOT NULL,
	"throttled" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "feed_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "item" (
	"id" serial PRIMARY KEY NOT NULL,
	"feedId" integer,
	"guid" varchar(2048),
	"pubdate" timestamp with time zone,
	"link" varchar(2048),
	"title" varchar(2048),
	"description" text,
	"summary" text DEFAULT '',
	"imageUrl" varchar(2048),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "options" (
	"userId" integer PRIMARY KEY NOT NULL,
	"dailyDigestHour" integer DEFAULT 18 NOT NULL,
	"withContentTableDefault" boolean DEFAULT false NOT NULL,
	"itemBodyDefault" boolean DEFAULT true NOT NULL,
	"attachmentsDefault" boolean DEFAULT true NOT NULL,
	"themeDefault" "theme" DEFAULT 'default' NOT NULL,
	"customSubject" varchar(150),
	"shareEnable" boolean DEFAULT true NOT NULL,
	"shareList" varchar(25)[]
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_feed" (
	"id" serial PRIMARY KEY NOT NULL,
	"activated" boolean DEFAULT false NOT NULL,
	"title" varchar(50),
	"schedule" "digestSchedule" DEFAULT 'disable' NOT NULL,
	"withContentTable" "ternaryState" DEFAULT 'default' NOT NULL,
	"itemBody" "ternaryState" DEFAULT 'default' NOT NULL,
	"attachments" "ternaryState" DEFAULT 'default' NOT NULL,
	"theme" "theme" DEFAULT 'default' NOT NULL,
	"filter" varchar(250),
	"lastDigestSentAt" timestamp with time zone,
	"lastViewedItemDate" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"userId" integer NOT NULL,
	"feedId" integer NOT NULL,
	"wasFilteredAt" timestamp with time zone,
	"unsubscribeToken" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(256) NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"role" text DEFAULT 'USER' NOT NULL,
	"locale" varchar(200) DEFAULT 'en-US' NOT NULL,
	"timeZone" varchar(100) DEFAULT 'UTC' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"password" varchar(256),
	"deleted" boolean,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_to_be_deleted" (
	"userId" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enclosure" ADD CONSTRAINT "enclosure_itemId_item_id_fk" FOREIGN KEY ("itemId") REFERENCES "public"."item"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "item" ADD CONSTRAINT "item_feedId_feed_id_fk" FOREIGN KEY ("feedId") REFERENCES "public"."feed"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "options" ADD CONSTRAINT "options_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_feed" ADD CONSTRAINT "user_feed_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_feed" ADD CONSTRAINT "user_feed_feedId_feed_id_fk" FOREIGN KEY ("feedId") REFERENCES "public"."feed"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_to_be_deleted" ADD CONSTRAINT "users_to_be_deleted_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
