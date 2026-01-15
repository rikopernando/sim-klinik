ALTER TABLE "icd10_codes" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
CREATE INDEX "patients_mr_number_idx" ON "patients" USING btree ("mr_number");--> statement-breakpoint
CREATE INDEX "patients_nik_idx" ON "patients" USING btree ("nik");--> statement-breakpoint
CREATE INDEX "patients_name_idx" ON "patients" USING btree ("name");--> statement-breakpoint
CREATE INDEX "patients_name_created_at_idx" ON "patients" USING btree ("name","created_at");