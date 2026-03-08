/**
 * Additional Lab Tests Seeder
 * Seeds additional lab tests: Golongan Darah, EKG, Cek Lengkap
 */

import { db } from "@/db"
import { labTests } from "@/db/schema/laboratory"

const ADDITIONAL_LAB_TESTS = [
  // ========================================
  // BLOOD TYPE TEST
  // ========================================
  {
    code: "GOL-DARAH",
    name: "Cek Golongan Darah (Blood Type)",
    category: "Hematology",
    department: "LAB",
    price: "50000.00",
    specimenType: "Whole Blood",
    specimenVolume: "2 mL",
    specimenContainer: "EDTA tube (purple cap)",
    tatHours: 2,
    loincCode: "882-1",
    resultTemplate: {
      type: "descriptive",
      fields: ["abo_type", "rhesus_factor", "interpretation"],
    },
    description:
      "Pemeriksaan golongan darah ABO dan Rhesus untuk keperluan transfusi atau identifikasi",
    instructions: "Tidak perlu puasa. Hasil dapat diambil dalam 1-2 jam.",
    requiresFasting: false,
    isActive: true,
  },

  // ========================================
  // EKG (ELECTROCARDIOGRAM)
  // ========================================
  {
    code: "EKG",
    name: "EKG (Elektrokardiogram)",
    category: "Cardiology",
    department: "EKG",
    price: "100000.00",
    specimenType: null,
    specimenVolume: null,
    specimenContainer: null,
    tatHours: 1,
    cptCode: "93000",
    resultTemplate: {
      type: "multi_parameter",
      parameters: [
        { name: "Heart Rate", unit: "bpm", referenceRange: { min: 60, max: 100 } },
        { name: "Rhythm", unit: "", referenceRange: { min: 0, max: 0 } },
        { name: "PR Interval", unit: "ms", referenceRange: { min: 120, max: 200 } },
        { name: "QRS Duration", unit: "ms", referenceRange: { min: 80, max: 120 } },
        { name: "QT/QTc", unit: "ms", referenceRange: { min: 350, max: 450 } },
      ],
    },
    description:
      "Pemeriksaan aktivitas listrik jantung untuk mendeteksi gangguan irama, iskemia, atau kelainan jantung lainnya",
    instructions:
      "Tidak perlu puasa. Hindari olahraga berat 2 jam sebelum pemeriksaan. Lepaskan perhiasan logam.",
    requiresFasting: false,
    isActive: true,
  },

  // ========================================
  // CEK LENGKAP (COMPLETE CHECK - GLUCOSE, URIC ACID, CHOLESTEROL)
  // ========================================
  {
    code: "CEK-LENGKAP",
    name: "Cek Lengkap (Glucose, Asam Urat, Cholesterol)",
    category: "Chemistry",
    department: "LAB",
    price: "60000.00",
    specimenType: "Serum",
    specimenVolume: "3 mL",
    specimenContainer: "Plain tube (red cap)",
    tatHours: 4,
    resultTemplate: {
      type: "multi_parameter",
      parameters: [
        { name: "Glucose", unit: "mg/dL", referenceRange: { min: 0, max: 200 } },
        { name: "Asam Urat", unit: "mg/dL", referenceRange: { min: 3.5, max: 7.2 } },
        { name: "Cholesterol", unit: "mg/dL", referenceRange: { min: 0, max: 200 } },
      ],
    },
    description:
      "Paket pemeriksaan lengkap meliputi gula darah, asam urat, dan kolesterol total untuk screening kesehatan umum",
    instructions:
      "Puasa 10-12 jam sebelum pemeriksaan. Boleh minum air putih. Hindari makanan tinggi purin 24 jam sebelumnya.",
    requiresFasting: true,
    isActive: true,
  },
]

async function seedAdditionalLabTests() {
  try {
    console.log("🧪 Starting additional lab tests seeding...")

    // Insert all additional lab tests
    const inserted = await db.insert(labTests).values(ADDITIONAL_LAB_TESTS).returning()

    console.log(`✅ Successfully seeded ${inserted.length} additional lab tests!`)
    console.log("\n📊 Added tests:")

    ADDITIONAL_LAB_TESTS.forEach((test) => {
      console.log(`   - ${test.code}: ${test.name}`)
    })

    console.log("\n🎉 Additional lab tests seeding completed!")
  } catch (error) {
    console.error("❌ Error seeding additional lab tests:", error)
    throw error
  }
}

// Run the seeder if called directly
if (require.main === module) {
  seedAdditionalLabTests()
    .then(() => {
      console.log("\n✨ Seeding finished successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n💥 Seeding failed:", error)
      process.exit(1)
    })
}

export { seedAdditionalLabTests }
