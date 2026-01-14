ALTER TABLE "templates" ADD COLUMN "temperature" double precision;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "top_p" double precision;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "max_tokens" integer;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "presence_penalty" double precision;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "frequency_penalty" double precision;