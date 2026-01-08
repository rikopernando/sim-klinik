/**
 * Lab Tests Seeder
 * Seeds the lab_tests table with common laboratory and radiology tests
 */

import { db } from "@/db"
import { labTests } from "@/db/schema/laboratory"

const COMMON_LAB_TESTS = [
  // ========================================
  // HEMATOLOGY TESTS
  // ========================================
  {
    code: "CBC",
    name: "Complete Blood Count (Darah Lengkap)",
    category: "Hematology",
    department: "LAB",
    price: "75000.00",
    specimenType: "Whole Blood",
    specimenVolume: "3 mL",
    specimenContainer: "EDTA tube (purple cap)",
    tatHours: 4,
    loincCode: "58410-2",
    resultTemplate: {
      type: "multi_parameter",
      parameters: [
        { name: "Hemoglobin", unit: "g/dL", referenceRange: { min: 12, max: 16 } },
        { name: "Hematocrit", unit: "%", referenceRange: { min: 37, max: 47 } },
        { name: "RBC", unit: "10^6/uL", referenceRange: { min: 4.2, max: 5.4 } },
        { name: "WBC", unit: "10^3/uL", referenceRange: { min: 4.5, max: 11 } },
        { name: "Platelet", unit: "10^3/uL", referenceRange: { min: 150, max: 400 } },
      ],
    },
    description:
      "Pemeriksaan darah lengkap meliputi hemoglobin, hematokrit, eritrosit, leukosit, dan trombosit",
    instructions: "Tidak perlu puasa. Datang pagi hari untuk hasil lebih cepat.",
    requiresFasting: false,
    isActive: true,
  },
  {
    code: "HGB",
    name: "Hemoglobin (Hb)",
    category: "Hematology",
    department: "LAB",
    price: "25000.00",
    specimenType: "Whole Blood",
    specimenVolume: "2 mL",
    specimenContainer: "EDTA tube (purple cap)",
    tatHours: 2,
    loincCode: "718-7",
    resultTemplate: {
      type: "numeric",
      unit: "g/dL",
      referenceRange: { min: 12, max: 16 },
    },
    description: "Pemeriksaan kadar hemoglobin dalam darah",
    instructions: "Tidak perlu puasa",
    requiresFasting: false,
    isActive: true,
  },
  {
    code: "LED",
    name: "Laju Endap Darah (ESR)",
    category: "Hematology",
    department: "LAB",
    price: "30000.00",
    specimenType: "Whole Blood",
    specimenVolume: "2 mL",
    specimenContainer: "EDTA tube (purple cap)",
    tatHours: 2,
    loincCode: "30341-2",
    resultTemplate: {
      type: "numeric",
      unit: "mm/jam",
      referenceRange: { min: 0, max: 20 },
    },
    description: "Pemeriksaan laju endap darah untuk deteksi inflamasi",
    instructions: "Tidak perlu puasa",
    requiresFasting: false,
    isActive: true,
  },

  // ========================================
  // CHEMISTRY TESTS - GLUCOSE
  // ========================================
  {
    code: "GDS",
    name: "Gula Darah Sewaktu (Random Blood Sugar)",
    category: "Chemistry",
    department: "LAB",
    price: "25000.00",
    specimenType: "Serum",
    specimenVolume: "2 mL",
    specimenContainer: "Plain tube (red cap)",
    tatHours: 2,
    loincCode: "2345-7",
    resultTemplate: {
      type: "numeric",
      unit: "mg/dL",
      referenceRange: { min: 70, max: 140 },
    },
    description: "Pemeriksaan kadar gula darah tanpa puasa",
    instructions: "Tidak perlu puasa, dapat dilakukan kapan saja",
    requiresFasting: false,
    isActive: true,
  },
  {
    code: "GDP",
    name: "Gula Darah Puasa (Fasting Blood Sugar)",
    category: "Chemistry",
    department: "LAB",
    price: "30000.00",
    specimenType: "Serum",
    specimenVolume: "2 mL",
    specimenContainer: "Plain tube (red cap)",
    tatHours: 2,
    loincCode: "1558-6",
    resultTemplate: {
      type: "numeric",
      unit: "mg/dL",
      referenceRange: { min: 70, max: 100 },
    },
    description: "Pemeriksaan kadar gula darah setelah puasa 8-12 jam",
    instructions: "Puasa 8-12 jam sebelum pemeriksaan. Boleh minum air putih.",
    requiresFasting: true,
    isActive: true,
  },
  {
    code: "GD2PP",
    name: "Gula Darah 2 Jam Post Prandial",
    category: "Chemistry",
    department: "LAB",
    price: "30000.00",
    specimenType: "Serum",
    specimenVolume: "2 mL",
    specimenContainer: "Plain tube (red cap)",
    tatHours: 2,
    loincCode: "1521-4",
    resultTemplate: {
      type: "numeric",
      unit: "mg/dL",
      referenceRange: { min: 70, max: 140 },
    },
    description: "Pemeriksaan kadar gula darah 2 jam setelah makan",
    instructions: "Dilakukan 2 jam setelah makan normal",
    requiresFasting: false,
    isActive: true,
  },
  {
    code: "HBA1C",
    name: "HbA1c (Glycated Hemoglobin)",
    category: "Chemistry",
    department: "LAB",
    price: "150000.00",
    specimenType: "Whole Blood",
    specimenVolume: "2 mL",
    specimenContainer: "EDTA tube (purple cap)",
    tatHours: 24,
    loincCode: "4548-4",
    resultTemplate: {
      type: "numeric",
      unit: "%",
      referenceRange: { min: 4, max: 5.6 },
    },
    description: "Pemeriksaan rata-rata kadar gula darah 2-3 bulan terakhir",
    instructions: "Tidak perlu puasa",
    requiresFasting: false,
    isActive: true,
  },

  // ========================================
  // CHEMISTRY TESTS - LIPID PROFILE
  // ========================================
  {
    code: "CHOL",
    name: "Kolesterol Total",
    category: "Chemistry",
    department: "LAB",
    price: "35000.00",
    specimenType: "Serum",
    specimenVolume: "2 mL",
    specimenContainer: "Plain tube (red cap)",
    tatHours: 4,
    loincCode: "2093-3",
    resultTemplate: {
      type: "numeric",
      unit: "mg/dL",
      referenceRange: { min: 0, max: 200 },
    },
    description: "Pemeriksaan kadar kolesterol total dalam darah",
    instructions: "Puasa 10-12 jam sebelum pemeriksaan",
    requiresFasting: true,
    isActive: true,
  },
  {
    code: "TRIG",
    name: "Trigliserida",
    category: "Chemistry",
    department: "LAB",
    price: "40000.00",
    specimenType: "Serum",
    specimenVolume: "2 mL",
    specimenContainer: "Plain tube (red cap)",
    tatHours: 4,
    loincCode: "2571-8",
    resultTemplate: {
      type: "numeric",
      unit: "mg/dL",
      referenceRange: { min: 0, max: 150 },
    },
    description: "Pemeriksaan kadar trigliserida dalam darah",
    instructions: "Puasa 10-12 jam sebelum pemeriksaan",
    requiresFasting: true,
    isActive: true,
  },
  {
    code: "HDL",
    name: "HDL Cholesterol (Kolesterol Baik)",
    category: "Chemistry",
    department: "LAB",
    price: "45000.00",
    specimenType: "Serum",
    specimenVolume: "2 mL",
    specimenContainer: "Plain tube (red cap)",
    tatHours: 4,
    loincCode: "2085-9",
    resultTemplate: {
      type: "numeric",
      unit: "mg/dL",
      referenceRange: { min: 40, max: 60 },
    },
    description: "Pemeriksaan kadar HDL cholesterol (kolesterol baik)",
    instructions: "Puasa 10-12 jam sebelum pemeriksaan",
    requiresFasting: true,
    isActive: true,
  },
  {
    code: "LDL",
    name: "LDL Cholesterol (Kolesterol Jahat)",
    category: "Chemistry",
    department: "LAB",
    price: "45000.00",
    specimenType: "Serum",
    specimenVolume: "2 mL",
    specimenContainer: "Plain tube (red cap)",
    tatHours: 4,
    loincCode: "2089-1",
    resultTemplate: {
      type: "numeric",
      unit: "mg/dL",
      referenceRange: { min: 0, max: 130 },
    },
    description: "Pemeriksaan kadar LDL cholesterol (kolesterol jahat)",
    instructions: "Puasa 10-12 jam sebelum pemeriksaan",
    requiresFasting: true,
    isActive: true,
  },
  {
    code: "LIPID-PANEL",
    name: "Profil Lipid Lengkap",
    category: "Chemistry",
    department: "LAB",
    price: "140000.00",
    specimenType: "Serum",
    specimenVolume: "3 mL",
    specimenContainer: "Plain tube (red cap)",
    tatHours: 6,
    resultTemplate: {
      type: "multi_parameter",
      parameters: [
        { name: "Total Cholesterol", unit: "mg/dL", referenceRange: { min: 0, max: 200 } },
        { name: "Triglycerides", unit: "mg/dL", referenceRange: { min: 0, max: 150 } },
        { name: "HDL Cholesterol", unit: "mg/dL", referenceRange: { min: 40, max: 60 } },
        { name: "LDL Cholesterol", unit: "mg/dL", referenceRange: { min: 0, max: 130 } },
      ],
    },
    description: "Paket pemeriksaan profil lipid lengkap (Kolesterol, Trigliserida, HDL, LDL)",
    instructions: "Puasa 10-12 jam sebelum pemeriksaan",
    requiresFasting: true,
    isActive: true,
  },

  // ========================================
  // CHEMISTRY TESTS - LIVER FUNCTION
  // ========================================
  {
    code: "SGOT",
    name: "SGOT (AST)",
    category: "Chemistry",
    department: "LAB",
    price: "35000.00",
    specimenType: "Serum",
    specimenVolume: "2 mL",
    specimenContainer: "Plain tube (red cap)",
    tatHours: 6,
    loincCode: "1920-8",
    resultTemplate: {
      type: "numeric",
      unit: "U/L",
      referenceRange: { min: 0, max: 40 },
    },
    description: "Pemeriksaan enzim SGOT untuk fungsi hati",
    instructions: "Tidak perlu puasa",
    requiresFasting: false,
    isActive: true,
  },
  {
    code: "SGPT",
    name: "SGPT (ALT)",
    category: "Chemistry",
    department: "LAB",
    price: "35000.00",
    specimenType: "Serum",
    specimenVolume: "2 mL",
    specimenContainer: "Plain tube (red cap)",
    tatHours: 6,
    loincCode: "1742-6",
    resultTemplate: {
      type: "numeric",
      unit: "U/L",
      referenceRange: { min: 0, max: 41 },
    },
    description: "Pemeriksaan enzim SGPT untuk fungsi hati",
    instructions: "Tidak perlu puasa",
    requiresFasting: false,
    isActive: true,
  },
  {
    code: "BILIRUBIN",
    name: "Bilirubin Total",
    category: "Chemistry",
    department: "LAB",
    price: "40000.00",
    specimenType: "Serum",
    specimenVolume: "2 mL",
    specimenContainer: "Plain tube (red cap)",
    tatHours: 6,
    loincCode: "1975-2",
    resultTemplate: {
      type: "numeric",
      unit: "mg/dL",
      referenceRange: { min: 0.1, max: 1.2 },
    },
    description: "Pemeriksaan kadar bilirubin total untuk fungsi hati",
    instructions: "Puasa 4 jam sebelum pemeriksaan",
    requiresFasting: true,
    isActive: true,
  },

  // ========================================
  // CHEMISTRY TESTS - KIDNEY FUNCTION
  // ========================================
  {
    code: "UREUM",
    name: "Ureum (BUN)",
    category: "Chemistry",
    department: "LAB",
    price: "30000.00",
    specimenType: "Serum",
    specimenVolume: "2 mL",
    specimenContainer: "Plain tube (red cap)",
    tatHours: 6,
    loincCode: "3094-0",
    resultTemplate: {
      type: "numeric",
      unit: "mg/dL",
      referenceRange: { min: 10, max: 50 },
    },
    description: "Pemeriksaan kadar ureum untuk fungsi ginjal",
    instructions: "Tidak perlu puasa",
    requiresFasting: false,
    isActive: true,
  },
  {
    code: "CREAT",
    name: "Kreatinin",
    category: "Chemistry",
    department: "LAB",
    price: "30000.00",
    specimenType: "Serum",
    specimenVolume: "2 mL",
    specimenContainer: "Plain tube (red cap)",
    tatHours: 6,
    loincCode: "2160-0",
    resultTemplate: {
      type: "numeric",
      unit: "mg/dL",
      referenceRange: { min: 0.6, max: 1.2 },
    },
    description: "Pemeriksaan kadar kreatinin untuk fungsi ginjal",
    instructions: "Tidak perlu puasa",
    requiresFasting: false,
    isActive: true,
  },
  {
    code: "URIC",
    name: "Asam Urat",
    category: "Chemistry",
    department: "LAB",
    price: "30000.00",
    specimenType: "Serum",
    specimenVolume: "2 mL",
    specimenContainer: "Plain tube (red cap)",
    tatHours: 4,
    loincCode: "3084-1",
    resultTemplate: {
      type: "numeric",
      unit: "mg/dL",
      referenceRange: { min: 3.5, max: 7.2 },
    },
    description: "Pemeriksaan kadar asam urat dalam darah",
    instructions: "Tidak perlu puasa. Hindari makanan tinggi purin 24 jam sebelumnya.",
    requiresFasting: false,
    isActive: true,
  },

  // ========================================
  // URINALYSIS
  // ========================================
  {
    code: "URIN",
    name: "Urinalisis Lengkap",
    category: "Urinalysis",
    department: "LAB",
    price: "50000.00",
    specimenType: "Urine",
    specimenVolume: "50 mL",
    specimenContainer: "Urine container (sterile)",
    tatHours: 4,
    loincCode: "24357-6",
    resultTemplate: {
      type: "multi_parameter",
      parameters: [
        { name: "Color", unit: "", referenceRange: { min: 0, max: 0 } },
        { name: "Clarity", unit: "", referenceRange: { min: 0, max: 0 } },
        { name: "pH", unit: "", referenceRange: { min: 4.5, max: 8 } },
        { name: "Protein", unit: "mg/dL", referenceRange: { min: 0, max: 10 } },
        { name: "Glucose", unit: "mg/dL", referenceRange: { min: 0, max: 0 } },
        { name: "WBC", unit: "/LPB", referenceRange: { min: 0, max: 5 } },
        { name: "RBC", unit: "/LPB", referenceRange: { min: 0, max: 3 } },
      ],
    },
    description:
      "Pemeriksaan urin lengkap meliputi makroskopis, kimia, dan mikroskopis untuk deteksi kelainan saluran kemih",
    instructions: "Gunakan urin tengah (midstream). Wadah harus bersih dan kering.",
    requiresFasting: false,
    isActive: true,
  },

  // ========================================
  // IMMUNOLOGY TESTS
  // ========================================
  {
    code: "WIDAL",
    name: "Widal Test (Typhoid)",
    category: "Immunology",
    department: "LAB",
    price: "60000.00",
    specimenType: "Serum",
    specimenVolume: "2 mL",
    specimenContainer: "Plain tube (red cap)",
    tatHours: 8,
    resultTemplate: {
      type: "multi_parameter",
      parameters: [
        { name: "Salmonella typhi O", unit: "titer", referenceRange: { min: 0, max: 160 } },
        { name: "Salmonella typhi H", unit: "titer", referenceRange: { min: 0, max: 160 } },
        { name: "Salmonella paratyphi AO", unit: "titer", referenceRange: { min: 0, max: 160 } },
        { name: "Salmonella paratyphi BO", unit: "titer", referenceRange: { min: 0, max: 160 } },
      ],
    },
    description: "Pemeriksaan antibodi untuk diagnosis demam tifoid",
    instructions: "Tidak perlu puasa. Sebaiknya dilakukan setelah demam 5-7 hari.",
    requiresFasting: false,
    isActive: true,
  },
  {
    code: "DENGUE-NS1",
    name: "Dengue NS1 Antigen",
    category: "Immunology",
    department: "LAB",
    price: "120000.00",
    specimenType: "Serum",
    specimenVolume: "2 mL",
    specimenContainer: "Plain tube (red cap)",
    tatHours: 2,
    resultTemplate: {
      type: "descriptive",
      fields: ["result", "interpretation"],
    },
    description: "Pemeriksaan antigen NS1 untuk deteksi dini infeksi dengue (hari 1-5)",
    instructions: "Tidak perlu puasa. Optimal dilakukan hari 1-5 demam.",
    requiresFasting: false,
    isActive: true,
  },
  {
    code: "COVID-RAPID",
    name: "Rapid Test Antigen COVID-19",
    category: "Immunology",
    department: "LAB",
    price: "100000.00",
    specimenType: "Nasopharyngeal Swab",
    specimenVolume: "1 swab",
    specimenContainer: "Viral transport medium",
    tatHours: 1,
    resultTemplate: {
      type: "descriptive",
      fields: ["result", "interpretation"],
    },
    description: "Pemeriksaan rapid antigen untuk deteksi virus SARS-CoV-2",
    instructions:
      "Tidak perlu puasa. Hindari makan, minum, merokok 30 menit sebelum swab. Hasil dalam 15-30 menit.",
    requiresFasting: false,
    isActive: true,
  },

  // ========================================
  // RADIOLOGY TESTS - X-RAY
  // ========================================
  {
    code: "XRAY-CHEST-AP",
    name: "Rontgen Thorax (Chest X-Ray) AP",
    category: "X-Ray",
    department: "RAD",
    price: "150000.00",
    specimenType: null,
    specimenVolume: null,
    specimenContainer: null,
    tatHours: 4,
    cptCode: "71045",
    resultTemplate: {
      type: "descriptive",
      fields: ["findings", "impression"],
    },
    description:
      "Pemeriksaan radiologi dada tampak depan (AP) untuk evaluasi paru, jantung, dan mediastinum",
    instructions: "Lepaskan benda logam dari dada. Tidak perlu puasa.",
    requiresFasting: false,
    isActive: true,
  },
  {
    code: "XRAY-CHEST-PA",
    name: "Rontgen Thorax (Chest X-Ray) PA",
    category: "X-Ray",
    department: "RAD",
    price: "150000.00",
    specimenType: null,
    specimenVolume: null,
    specimenContainer: null,
    tatHours: 4,
    cptCode: "71046",
    resultTemplate: {
      type: "descriptive",
      fields: ["findings", "impression"],
    },
    description:
      "Pemeriksaan radiologi dada tampak belakang (PA) untuk evaluasi paru, jantung, dan mediastinum",
    instructions: "Lepaskan benda logam dari dada. Tidak perlu puasa.",
    requiresFasting: false,
    isActive: true,
  },
  {
    code: "XRAY-ABDOMEN",
    name: "Rontgen Abdomen (BNO)",
    category: "X-Ray",
    department: "RAD",
    price: "175000.00",
    specimenType: null,
    specimenVolume: null,
    specimenContainer: null,
    tatHours: 4,
    cptCode: "74018",
    resultTemplate: {
      type: "descriptive",
      fields: ["findings", "impression"],
    },
    description: "Pemeriksaan radiologi perut untuk evaluasi organ dalam dan saluran pencernaan",
    instructions: "Puasa 6 jam sebelum pemeriksaan untuk hasil optimal.",
    requiresFasting: true,
    isActive: true,
  },

  // ========================================
  // RADIOLOGY TESTS - ULTRASOUND
  // ========================================
  {
    code: "USG-ABDOMEN",
    name: "USG Abdomen (Upper Abdomen)",
    category: "Ultrasound",
    department: "RAD",
    price: "250000.00",
    specimenType: null,
    specimenVolume: null,
    specimenContainer: null,
    tatHours: 6,
    cptCode: "76700",
    resultTemplate: {
      type: "descriptive",
      fields: ["findings", "impression"],
    },
    description:
      "Pemeriksaan ultrasonografi abdomen atas (hati, kandung empedu, pankreas, limpa, ginjal)",
    instructions:
      "Puasa 6-8 jam sebelum pemeriksaan. Minum air putih 3-4 gelas 1 jam sebelum pemeriksaan.",
    requiresFasting: true,
    isActive: true,
  },
  {
    code: "USG-OBSTETRI",
    name: "USG Obstetri (Kehamilan)",
    category: "Ultrasound",
    department: "RAD",
    price: "200000.00",
    specimenType: null,
    specimenVolume: null,
    specimenContainer: null,
    tatHours: 6,
    cptCode: "76805",
    resultTemplate: {
      type: "descriptive",
      fields: ["findings", "impression"],
    },
    description: "Pemeriksaan ultrasonografi untuk evaluasi kehamilan dan janin",
    instructions: "Minum air putih 3-4 gelas 1 jam sebelum pemeriksaan. Tahan kencing.",
    requiresFasting: false,
    isActive: true,
  },
]

async function seedLabTests() {
  try {
    console.log("🧪 Starting lab tests seeding...")

    // Check if lab tests already exist
    const existingTests = await db.select().from(labTests).limit(1)

    if (existingTests.length > 0) {
      console.log("⚠️  Lab tests already exist in database. Skipping seed.")
      console.log("💡 If you want to reseed, delete existing lab tests first.")
      return
    }

    // Insert all lab tests
    const inserted = await db.insert(labTests).values(COMMON_LAB_TESTS).returning()

    console.log(`✅ Successfully seeded ${inserted.length} lab tests!`)
    console.log("\n📊 Summary by department and category:")

    // Count by department
    const departments = COMMON_LAB_TESTS.reduce(
      (acc, test) => {
        acc[test.department] = (acc[test.department] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    console.log("\n  By Department:")
    Object.entries(departments).forEach(([dept, count]) => {
      console.log(`   - ${dept}: ${count} tests`)
    })

    // Count by category
    const categories = COMMON_LAB_TESTS.reduce(
      (acc, test) => {
        acc[test.category] = (acc[test.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    console.log("\n  By Category:")
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count} tests`)
    })

    // Count tests requiring fasting
    const fastingTests = COMMON_LAB_TESTS.filter((t) => t.requiresFasting).length
    console.log(`\n  Requiring Fasting: ${fastingTests} tests`)

    console.log("\n🎉 Lab tests seeding completed!")
  } catch (error) {
    console.error("❌ Error seeding lab tests:", error)
    throw error
  }
}

// Run the seeder if called directly
if (require.main === module) {
  seedLabTests()
    .then(() => {
      console.log("\n✨ Seeding finished successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n💥 Seeding failed:", error)
      process.exit(1)
    })
}

export { seedLabTests }
