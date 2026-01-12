/**
 * Lab Test Panels Seeder
 * Seeds the lab_test_panels and lab_test_panel_items tables
 */

import { db } from "@/db"
import { labTests, labTestPanels, labTestPanelItems } from "@/db/schema/laboratory"
import { eq, inArray } from "drizzle-orm"

/**
 * Panel definitions with test codes
 */
const COMMON_LAB_PANELS = [
  {
    code: "DIABETES-PANEL",
    name: "Panel Diabetes",
    description: "Paket pemeriksaan lengkap untuk skrining dan monitoring diabetes mellitus",
    price: "225000.00", // Regular: GDP (30k) + GD2PP (30k) + HBA1C (150k) + CHOL (35k) + TRIG (40k) = 285k. Save 60k (21%)
    testCodes: ["GDP", "GD2PP", "HBA1C", "CHOL", "TRIG"],
  },
  {
    code: "LIPID-PANEL",
    name: "Panel Profil Lipid",
    description: "Paket pemeriksaan lengkap untuk evaluasi risiko kardiovaskular",
    price: "140000.00", // Regular: CHOL (35k) + TRIG (40k) + HDL (45k) + LDL (45k) = 165k. Save 25k (15%)
    testCodes: ["CHOL", "TRIG", "HDL", "LDL"],
  },
  {
    code: "BASIC-CHECKUP",
    name: "Medical Check-Up Dasar",
    description: "Paket pemeriksaan kesehatan rutin dasar untuk deteksi dini penyakit",
    price: "200000.00", // Regular: CBC (75k) + GDP (30k) + URIC (30k) + UREUM (30k) + CREAT (30k) + URIN (50k) = 245k. Save 45k (18%)
    testCodes: ["CBC", "GDP", "URIC", "UREUM", "CREAT", "URIN"],
  },
  {
    code: "LIVER-PANEL",
    name: "Panel Fungsi Hati",
    description: "Paket pemeriksaan fungsi hati lengkap",
    price: "95000.00", // Regular: SGOT (35k) + SGPT (35k) + BILIRUBIN (40k) = 110k. Save 15k (14%)
    testCodes: ["SGOT", "SGPT", "BILIRUBIN"],
  },
  {
    code: "KIDNEY-PANEL",
    name: "Panel Fungsi Ginjal",
    description: "Paket pemeriksaan fungsi ginjal lengkap",
    price: "80000.00", // Regular: UREUM (30k) + CREAT (30k) + URIC (30k) = 90k. Save 10k (11%)
    testCodes: ["UREUM", "CREAT", "URIC"],
  },
  {
    code: "PREMARITAL-PANEL",
    name: "Panel Pra-Nikah",
    description: "Paket pemeriksaan kesehatan untuk calon pengantin",
    price: "450000.00", // Comprehensive panel
    testCodes: ["CBC", "GDP", "URIN", "SGOT", "SGPT", "HBA1C", "XRAY-CHEST-PA"],
  },
]

async function seedLabPanels() {
  try {
    console.log("📦 Starting lab test panels seeding...")

    // Check if panels already exist
    const existingPanels = await db.select().from(labTestPanels).limit(1)

    if (existingPanels.length > 0) {
      console.log("⚠️  Lab test panels already exist in database. Skipping seed.")
      console.log("💡 If you want to reseed, delete existing panels first.")
      return
    }

    // Get all test codes we'll need
    const allTestCodes = Array.from(new Set(COMMON_LAB_PANELS.flatMap((panel) => panel.testCodes)))

    // Fetch all tests by code
    const tests = await db.select().from(labTests).where(inArray(labTests.code, allTestCodes))

    // Create a map of test code to test ID
    const testCodeToId = new Map(tests.map((test) => [test.code, test.id]))

    // Verify all test codes exist
    const missingCodes = allTestCodes.filter((code) => !testCodeToId.has(code))
    if (missingCodes.length > 0) {
      console.error(`❌ Missing test codes in database: ${missingCodes.join(", ")}`)
      console.error("💡 Please run seed-lab-tests.ts first to create the lab tests.")
      throw new Error("Missing required lab tests for panel creation")
    }

    console.log(`✅ Found all ${tests.length} required lab tests`)

    let totalPanelsCreated = 0
    let totalItemsCreated = 0

    // Insert each panel with its tests
    for (const panelData of COMMON_LAB_PANELS) {
      const { testCodes, ...panelInfo } = panelData

      // Insert panel
      const [panel] = await db
        .insert(labTestPanels)
        .values({
          ...panelInfo,
          isActive: true,
        })
        .returning()

      console.log(`  ✓ Created panel: ${panel.name}`)
      totalPanelsCreated++

      // Insert panel items
      const panelItems = testCodes.map((testCode) => ({
        panelId: panel.id,
        testId: testCodeToId.get(testCode)!,
      }))

      await db.insert(labTestPanelItems).values(panelItems)
      totalItemsCreated += panelItems.length

      console.log(`    - Added ${panelItems.length} tests to panel`)
    }

    console.log(`\n✅ Successfully seeded ${totalPanelsCreated} lab test panels!`)
    console.log(`✅ Created ${totalItemsCreated} panel-test relationships`)

    console.log("\n📊 Panel Summary:")
    for (const panelData of COMMON_LAB_PANELS) {
      console.log(`\n  ${panelData.name}:`)
      console.log(`   - Code: ${panelData.code}`)
      console.log(`   - Price: Rp ${parseInt(panelData.price).toLocaleString("id-ID")}`)
      console.log(`   - Tests: ${panelData.testCodes.length}`)
      console.log(`   - Includes: ${panelData.testCodes.join(", ")}`)
    }

    console.log("\n🎉 Lab test panels seeding completed!")
  } catch (error) {
    console.error("❌ Error seeding lab test panels:", error)
    throw error
  }
}

// Run the seeder if called directly
if (require.main === module) {
  seedLabPanels()
    .then(() => {
      console.log("\n✨ Seeding finished successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n💥 Seeding failed:", error)
      process.exit(1)
    })
}

export { seedLabPanels }
