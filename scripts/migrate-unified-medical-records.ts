/**
 * Migration Script: Unify CPPT into Medical Records
 * Purpose: Merge cppt table into medical_records for unified clinical documentation
 * Date: 2026-01-04
 *
 * Run with: npx tsx scripts/migrate-unified-medical-records.ts
 */

import { db } from "../db"
import { sql } from "drizzle-orm"

async function runMigration() {
  console.log("🏥 Starting Medical Records Unification Migration...\n")

  try {
    // Use Drizzle's transaction API
    await db.transaction(async (tx) => {
      console.log("📊 Step 1: Adding new columns to medical_records table...")

      // Add authorRole column
      await tx.execute(sql`
        ALTER TABLE medical_records
        ADD COLUMN IF NOT EXISTS author_role VARCHAR(20)
      `)

      // Add recordType column
      await tx.execute(sql`
        ALTER TABLE medical_records
        ADD COLUMN IF NOT EXISTS record_type VARCHAR(30) DEFAULT 'initial_consultation'
      `)

      // Add progressNote column
      await tx.execute(sql`
        ALTER TABLE medical_records
        ADD COLUMN IF NOT EXISTS progress_note TEXT
      `)

      // Add instructions column
      await tx.execute(sql`
        ALTER TABLE medical_records
        ADD COLUMN IF NOT EXISTS instructions TEXT
      `)

      console.log("✅ New columns added")

      console.log("📊 Step 2: Renaming doctor_id to author_id...")

      // Rename doctorId to authorId if it exists
      await tx.execute(sql`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'medical_records'
                AND column_name = 'doctor_id'
            ) THEN
                ALTER TABLE medical_records RENAME COLUMN doctor_id TO author_id;
            END IF;
        END $$
      `)

      console.log("✅ Column renamed")

      console.log("📊 Step 3: Removing UNIQUE constraint from visit_id...")

      // Drop unique constraint from visitId
      await tx.execute(sql`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.table_constraints
                WHERE table_name = 'medical_records'
                AND constraint_type = 'UNIQUE'
                AND constraint_name LIKE '%visit_id%'
            ) THEN
                ALTER TABLE medical_records DROP CONSTRAINT medical_records_visit_id_unique;
            END IF;
        END $$
      `)

      console.log("✅ UNIQUE constraint removed (allowing multiple records per visit)")

      console.log("📊 Step 4: Setting author_role for existing records...")

      // Update existing records to have authorRole = 'doctor'
      await tx.execute(sql`
        UPDATE medical_records
        SET author_role = 'doctor'
        WHERE author_role IS NULL
      `)

      // Make authorRole NOT NULL
      await tx.execute(sql`
        ALTER TABLE medical_records
        ALTER COLUMN author_role SET NOT NULL
      `)

      console.log("✅ Existing records updated with author_role='doctor'")

      console.log("📊 Step 5: Migrating CPPT records to medical_records...")

      // Check if cppt table exists
      const cpptExists = await tx.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'cppt'
        )
      `)

      const tableExists = (cpptExists as any)[0]?.exists || false

      if (tableExists) {
        // Migrate CPPT records
        const result = await tx.execute(sql`
          INSERT INTO medical_records (
            id,
            visit_id,
            author_id,
            author_role,
            record_type,
            soap_subjective,
            soap_objective,
            soap_assessment,
            soap_plan,
            progress_note,
            instructions,
            is_locked,
            is_draft,
            created_at,
            updated_at
          )
          SELECT
            id,
            visit_id,
            author_id,
            author_role,
            'progress_note',
            subjective,
            objective,
            assessment,
            plan,
            progress_note,
            instructions,
            false,
            false,
            created_at,
            created_at
          FROM cppt
          ON CONFLICT (id) DO NOTHING
        `)

        console.log(`✅ Migrated ${result.rowCount || 0} CPPT records to medical_records`)

        console.log("📊 Step 6: Updating procedures table...")

        // Update procedures that reference cppt_id
        await tx.execute(sql`
          UPDATE procedures
          SET medical_record_id = cppt_id
          WHERE cppt_id IS NOT NULL
            AND medical_record_id IS NULL
        `)

        // Drop cppt_id column from procedures
        await tx.execute(sql`
          ALTER TABLE procedures
          DROP COLUMN IF EXISTS cppt_id
        `)

        console.log("✅ Procedures table updated")

        console.log("📊 Step 7: Updating prescriptions table...")

        // Update prescriptions that reference cppt_id
        await tx.execute(sql`
          UPDATE prescriptions
          SET medical_record_id = cppt_id
          WHERE cppt_id IS NOT NULL
            AND medical_record_id IS NULL
        `)

        // Drop cppt_id column from prescriptions
        await tx.execute(sql`
          ALTER TABLE prescriptions
          DROP COLUMN IF EXISTS cppt_id
        `)

        console.log("✅ Prescriptions table updated")

        console.log("📊 Step 8: Dropping cppt table...")

        // Drop the cppt table
        await tx.execute(sql`DROP TABLE IF EXISTS cppt CASCADE`)

        console.log("✅ CPPT table dropped")
      } else {
        console.log("ℹ️  CPPT table doesn't exist - skipping CPPT migration")
      }
    })

    // Transaction committed automatically

    console.log("\n📊 Step 9: Verifying migration...")

    // Count records by type (outside transaction)
    const stats = await db.execute(sql`
      SELECT
        COUNT(*) as total_records,
        COUNT(CASE WHEN record_type = 'progress_note' THEN 1 END) as progress_notes,
        COUNT(CASE WHEN record_type = 'initial_consultation' THEN 1 END) as consultations
      FROM medical_records
    `)

    const { total_records, progress_notes, consultations } = (stats as any)[0]

    console.log("\n✅ Migration Complete!")
    console.log("📋 Summary:")
    console.log(`  - Total medical records: ${total_records}`)
    console.log(`  - Progress notes (from CPPT): ${progress_notes}`)
    console.log(`  - Consultations (original): ${consultations}`)
    console.log("")
    console.log("🎯 Next steps:")
    console.log("  1. Update validation schemas")
    console.log("  2. Update API endpoints")
    console.log("  3. Update service layer")
    console.log("  4. Update frontend components")
    console.log("  5. Test the changes")

    process.exit(0)
  } catch (error) {
    console.error("\n❌ Migration failed:", error)
    console.log("⏪ Transaction automatically rolled back")
    process.exit(1)
  }
}

// Run migration
runMigration()
