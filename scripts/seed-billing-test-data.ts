/**
 * Seed Billing Test Data
 * Creates test data for testing the billing/cashier module
 */

import { db } from "@/db"
import { patients } from "@/db/schema/patients"
import { visits } from "@/db/schema/visits"
import { medicalRecords } from "@/db/schema/medical-records"
import { prescriptions } from "@/db/schema/pharmacy"
import { drugs } from "@/db/schema/pharmacy"
import { services } from "@/db/schema/billing"
import { polis } from "@/db/schema/polis"
import { eq } from "drizzle-orm"

async function seedBillingTestData() {
  console.log("🌱 Seeding billing test data...\n")

  try {
    // 1. Create Services (Master Data)
    console.log("1. Creating services...")
    const existingServices = await db.select().from(services).limit(1)

    if (existingServices.length === 0) {
      await db.insert(services).values([
        {
          code: "ADM001",
          name: "Biaya Administrasi",
          price: "50000",
          serviceType: "administration",
          description: "Biaya administrasi pendaftaran",
        },
        {
          code: "CONS001",
          name: "Konsultasi Dokter Umum",
          price: "100000",
          serviceType: "consultation",
          description: "Biaya konsultasi dokter umum",
        },
        {
          code: "CONS002",
          name: "Konsultasi Dokter Spesialis",
          price: "200000",
          serviceType: "consultation",
          description: "Biaya konsultasi dokter spesialis",
        },
        {
          code: "ROOM001",
          name: "Rawat Inap Kelas 3",
          price: "300000",
          serviceType: "room",
          description: "Biaya rawat inap kelas 3 per hari",
        },
      ])
      console.log("   ✅ Created 4 services")
    } else {
      console.log("   ⏭️  Services already exist, skipping")
    }

    // 2. Create Drugs (Master Data)
    console.log("\n2. Creating drugs...")
    const existingDrugs = await db.select().from(drugs).limit(1)

    if (existingDrugs.length === 0) {
      await db.insert(drugs).values([
        {
          name: "Paracetamol 500mg",
          unit: "tablet",
          price: "5000",
          description: "Obat penurun panas dan pereda nyeri",
        },
        {
          name: "Amoxicillin 500mg",
          unit: "kapsul",
          price: "8000",
          description: "Antibiotik",
        },
        {
          name: "Vitamin C 500mg",
          unit: "tablet",
          price: "3000",
          description: "Suplemen vitamin C",
        },
      ])
      console.log("   ✅ Created 3 drugs")
    } else {
      console.log("   ⏭️  Drugs already exist, skipping")
    }

    // 3. Create Poli (if not exists)
    console.log("\n3. Creating poli...")
    let poliGeneral = await db.select().from(polis).where(eq(polis.name, "Poli Umum")).limit(1)

    if (poliGeneral.length === 0) {
      const inserted = await db
        .insert(polis)
        .values({
          name: "Poli Umum",
          description: "Poliklinik Umum",
        })
        .returning()
      poliGeneral = inserted
      console.log("   ✅ Created Poli Umum")
    } else {
      console.log("   ⏭️  Poli already exists, skipping")
    }

    // 4. Create Test Patient
    console.log("\n4. Creating test patient...")
    const existingPatient = await db
      .select()
      .from(patients)
      .where(eq(patients.mrNumber, "MR999001"))
      .limit(1)

    let testPatient
    if (existingPatient.length === 0) {
      const inserted = await db
        .insert(patients)
        .values({
          mrNumber: "MR999001",
          nik: "3201010101990001",
          name: "Test Patient Billing",
          birthDate: new Date("1990-01-01"),
          gender: "male",
          address: "Jl. Test No. 123, Jakarta",
          phone: "081234567890",
          email: "testpatient@example.com",
        })
        .returning()
      testPatient = inserted[0]
      console.log("   ✅ Created test patient: MR999001")
    } else {
      testPatient = existingPatient[0]
      console.log("   ⏭️  Test patient already exists: MR999001")
    }

    // 5. Create Test Visit
    console.log("\n5. Creating test visit...")
    const visitNumber = `V${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}999`
    const existingVisit = await db
      .select()
      .from(visits)
      .where(eq(visits.visitNumber, visitNumber))
      .limit(1)

    let testVisit
    if (existingVisit.length === 0) {
      const inserted = await db
        .insert(visits)
        .values({
          patientId: testPatient.id,
          visitNumber: visitNumber,
          visitType: "outpatient",
          visitDate: new Date(),
          poliId: poliGeneral[0].id,
          status: "completed",
          chiefComplaint: "Demam dan batuk",
        })
        .returning()
      testVisit = inserted[0]
      console.log(`   ✅ Created test visit: ${visitNumber}`)
    } else {
      testVisit = existingVisit[0]
      console.log(`   ⏭️  Test visit already exists: ${visitNumber}`)
    }

    // 6. Create Medical Record
    console.log("\n6. Creating medical record...")
    const existingMedicalRecord = await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.visitId, testVisit.id))
      .limit(1)

    let testMedicalRecord
    if (existingMedicalRecord.length === 0) {
      const inserted = await db
        .insert(medicalRecords)
        .values({
          visitId: testVisit.id,
          soapSubjective: "Pasien mengeluh demam sejak 2 hari yang lalu, disertai batuk",
          soapObjective: "Suhu: 38.5°C, Tekanan Darah: 120/80 mmHg, Nadi: 88 x/menit",
          soapAssessment: "Suspek ISPA (Infeksi Saluran Pernapasan Akut)",
          soapPlan: "Berikan obat penurun panas dan antibiotik, istirahat cukup",
          isLocked: true, // IMPORTANT: Lock the record so it appears in billing queue
        })
        .returning()
      testMedicalRecord = inserted[0]
      console.log("   ✅ Created locked medical record")
    } else {
      testMedicalRecord = existingMedicalRecord[0]

      // Ensure it's locked
      if (!testMedicalRecord.isLocked) {
        await db
          .update(medicalRecords)
          .set({ isLocked: true })
          .where(eq(medicalRecords.id, testMedicalRecord.id))
        console.log("   ✅ Locked existing medical record")
      } else {
        console.log("   ⏭️  Medical record already exists and is locked")
      }
    }

    // 7. Create Prescriptions
    console.log("\n7. Creating prescriptions...")
    const drugList = await db.select().from(drugs).limit(3)

    const existingPrescriptions = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.medicalRecordId, testMedicalRecord.id))
      .limit(1)

    if (existingPrescriptions.length === 0 && drugList.length > 0) {
      await db.insert(prescriptions).values([
        {
          medicalRecordId: testMedicalRecord.id,
          drugId: drugList[0].id,
          dosage: "500mg",
          frequency: "3x sehari",
          duration: 5,
          quantity: 15,
          instructions: "Diminum sesudah makan",
          isFulfilled: false,
        },
        {
          medicalRecordId: testMedicalRecord.id,
          drugId: drugList[1].id,
          dosage: "500mg",
          frequency: "3x sehari",
          duration: 7,
          quantity: 21,
          instructions: "Diminum sesudah makan",
          isFulfilled: false,
        },
      ])
      console.log("   ✅ Created 2 prescriptions")
    } else {
      console.log("   ⏭️  Prescriptions already exist or no drugs available")
    }

    console.log("\n✨ Billing test data seeded successfully!\n")
    console.log("📋 Test Data Summary:")
    console.log(`   - Patient MR: MR999001`)
    console.log(`   - Visit Number: ${visitNumber}`)
    console.log(`   - Medical Record: Locked (ready for billing)`)
    console.log(`   - Prescriptions: 2 medications`)
    console.log(`   - Services: 4 types (admin, consultation, etc.)`)
    console.log("\n🧪 How to test:")
    console.log("   1. Run: npm run dev")
    console.log("   2. Navigate to: http://localhost:3000/dashboard/cashier")
    console.log("   3. You should see the test visit in the billing queue")
    console.log("   4. Click 'Pilih' to select the visit")
    console.log("   5. Review billing items and process payment")
    console.log("\n   Or test via API:")
    console.log(`   curl http://localhost:3000/api/billing/queue`)
    console.log(`   curl -X POST http://localhost:3000/api/billing/${testVisit.id}/calculate \\`)
    console.log(`     -H "Content-Type: application/json" \\`)
    console.log(`     -d '{"discount": 0, "discountPercentage": 0, "insuranceCoverage": 0}'`)
  } catch (error) {
    console.error("❌ Error seeding billing test data:", error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  seedBillingTestData()
    .then(() => {
      console.log("\n✅ Done!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n❌ Failed:", error)
      process.exit(1)
    })
}

export { seedBillingTestData }
