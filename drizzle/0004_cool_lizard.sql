CREATE TABLE "icd10_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(10) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "icd10_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE INDEX "icd10_code_idx" ON "icd10_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "icd10_description_idx" ON "icd10_codes" USING btree ("description");