ALTER TABLE "prescriptions" ADD COLUMN "added_by_pharmacist" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "added_by_pharmacist_id" text;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "approved_by" text;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "pharmacist_note" text;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_added_by_pharmacist_id_user_id_fk" FOREIGN KEY ("added_by_pharmacist_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;