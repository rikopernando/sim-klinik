ALTER TABLE "icd10_codes" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "procedures" ALTER COLUMN "medical_record_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "procedures" ALTER COLUMN "icd9_code" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "procedures" ALTER COLUMN "performed_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "procedures" ALTER COLUMN "performed_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "procedures" ALTER COLUMN "performed_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "procedures" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "procedures" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "prescriptions" ALTER COLUMN "medical_record_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "prescriptions" ALTER COLUMN "fulfilled_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "prescriptions" ALTER COLUMN "approved_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "prescriptions" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "prescriptions" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "prescriptions" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "prescriptions" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "bed_assignments" ALTER COLUMN "assigned_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bed_assignments" ALTER COLUMN "assigned_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "bed_assignments" ALTER COLUMN "discharged_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bed_assignments" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bed_assignments" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "material_usage" ALTER COLUMN "material_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "material_usage" ALTER COLUMN "quantity" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "material_usage" ALTER COLUMN "unit" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "material_usage" ALTER COLUMN "unit_price" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "material_usage" ALTER COLUMN "used_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "material_usage" ALTER COLUMN "used_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "material_usage" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "material_usage" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "vitals_history" ALTER COLUMN "recorded_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "vitals_history" ALTER COLUMN "recorded_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "vitals_history" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "vitals_history" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "procedures" ADD COLUMN "visit_id" text;--> statement-breakpoint
ALTER TABLE "procedures" ADD COLUMN "cppt_id" text;--> statement-breakpoint
ALTER TABLE "procedures" ADD COLUMN "ordered_by" text;--> statement-breakpoint
ALTER TABLE "procedures" ADD COLUMN "ordered_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "procedures" ADD COLUMN "scheduled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "procedures" ADD COLUMN "status" varchar(20) DEFAULT 'ordered';--> statement-breakpoint
ALTER TABLE "procedures" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "drugs" ADD COLUMN "item_type" varchar(50) DEFAULT 'drug' NOT NULL;--> statement-breakpoint
ALTER TABLE "drugs" ADD COLUMN "general_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "drugs" ADD COLUMN "requires_prescription" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "visit_id" text;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "cppt_id" text;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "is_recurring" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "start_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "end_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "administration_schedule" text;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "is_administered" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "administered_by" text;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "administered_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "material_usage" ADD COLUMN "item_id" text;--> statement-breakpoint
ALTER TABLE "material_usage" ADD COLUMN "service_id" text;--> statement-breakpoint
ALTER TABLE "material_usage" ADD COLUMN "stock_movement_id" text;--> statement-breakpoint
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_visit_id_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_cppt_id_cppt_id_fk" FOREIGN KEY ("cppt_id") REFERENCES "public"."cppt"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_ordered_by_user_id_fk" FOREIGN KEY ("ordered_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_visit_id_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_cppt_id_cppt_id_fk" FOREIGN KEY ("cppt_id") REFERENCES "public"."cppt"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_administered_by_user_id_fk" FOREIGN KEY ("administered_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_usage" ADD CONSTRAINT "material_usage_item_id_drugs_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."drugs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_usage" ADD CONSTRAINT "material_usage_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_usage" ADD CONSTRAINT "material_usage_stock_movement_id_stock_movements_id_fk" FOREIGN KEY ("stock_movement_id") REFERENCES "public"."stock_movements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "patients_mr_number_idx" ON "patients" USING btree ("mr_number");--> statement-breakpoint
CREATE INDEX "patients_nik_idx" ON "patients" USING btree ("nik");--> statement-breakpoint
CREATE INDEX "patients_name_idx" ON "patients" USING btree ("name");--> statement-breakpoint
CREATE INDEX "patients_name_created_at_idx" ON "patients" USING btree ("name","created_at");