/**
 * Seed Materials Only
 * Add material services if they don't exist
 */

import { db } from "@/db"
import { services } from "@/db/schema/billing"
import { eq } from "drizzle-orm"

const MATERIALS = [
  {
    code: "MAT-001",
    name: "Infus Set",
    serviceType: "material",
    price: "15000.00",
    description: "Set infus lengkap (selang + jarum)",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-002",
    name: "Cairan Infus RL 500ml",
    serviceType: "material",
    price: "25000.00",
    description: "Ringer Laktat 500ml",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-003",
    name: "Cairan Infus NaCl 0.9% 500ml",
    serviceType: "material",
    price: "20000.00",
    description: "Normal Saline 500ml",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-004",
    name: "Cairan Infus D5% 500ml",
    serviceType: "material",
    price: "22000.00",
    description: "Dextrose 5% 500ml",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-005",
    name: "Spuit 3cc",
    serviceType: "material",
    price: "2000.00",
    description: "Syringe 3ml disposable",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-006",
    name: "Spuit 5cc",
    serviceType: "material",
    price: "2500.00",
    description: "Syringe 5ml disposable",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-007",
    name: "Spuit 10cc",
    serviceType: "material",
    price: "3500.00",
    description: "Syringe 10ml disposable",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-008",
    name: "Jarum Suntik 23G",
    serviceType: "material",
    price: "1000.00",
    description: "Disposable needle 23G",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-009",
    name: "Jarum Suntik 25G",
    serviceType: "material",
    price: "1000.00",
    description: "Disposable needle 25G",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-010",
    name: "Handscoen Steril",
    serviceType: "material",
    price: "5000.00",
    description: "Sarung tangan steril (per pasang)",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-011",
    name: "Handscoen Non-Steril",
    serviceType: "material",
    price: "2000.00",
    description: "Sarung tangan non-steril (per pasang)",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-012",
    name: "Kasa Steril 16x16cm",
    serviceType: "material",
    price: "3000.00",
    description: "Kasa steril ukuran 16x16cm (per lembar)",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-013",
    name: "Plester/Hypafix 10cm",
    serviceType: "material",
    price: "8000.00",
    description: "Plester medis lebar 10cm (per meter)",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-014",
    name: "Kateter Urin/DC No. 16",
    serviceType: "material",
    price: "35000.00",
    description: "Dower Catheter ukuran 16",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-015",
    name: "NGT (Nasogastric Tube) No. 16",
    serviceType: "material",
    price: "30000.00",
    description: "Selang NGT ukuran 16",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-016",
    name: "Urine Bag",
    serviceType: "material",
    price: "20000.00",
    description: "Kantong urin disposable 2000ml",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-017",
    name: "Oksigen Nasal Kanul",
    serviceType: "material",
    price: "15000.00",
    description: "Nasal cannula untuk oksigen",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-018",
    name: "Masker Oksigen Simple",
    serviceType: "material",
    price: "20000.00",
    description: "Simple oxygen mask",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-019",
    name: "Verban Elastis 6cm",
    serviceType: "material",
    price: "12000.00",
    description: "Elastic bandage lebar 6cm (per roll)",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-020",
    name: "Alkohol Swab",
    serviceType: "material",
    price: "500.00",
    description: "Alcohol swab sachet disposable",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-021",
    name: "Betadine 60ml",
    serviceType: "material",
    price: "25000.00",
    description: "Povidone iodine antiseptik 60ml",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-022",
    name: "Benang Jahit (Suture) 3/0",
    serviceType: "material",
    price: "50000.00",
    description: "Surgical suture 3/0 (silk/nylon)",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-023",
    name: "Benang Jahit (Suture) 4/0",
    serviceType: "material",
    price: "45000.00",
    description: "Surgical suture 4/0 (silk/nylon)",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-024",
    name: "Gunting Verban",
    serviceType: "material",
    price: "15000.00",
    description: "Gunting pembalut medis disposable",
    category: "Material",
    isActive: true,
  },
  {
    code: "MAT-025",
    name: "Thermometer Digital",
    serviceType: "material",
    price: "35000.00",
    description: "Termometer digital disposable",
    category: "Material",
    isActive: true,
  },
]

async function seedMaterials() {
  try {
    console.log("🌱 Starting materials seeding...")

    // Check existing material services
    const existingMaterials = await db
      .select()
      .from(services)
      .where(eq(services.serviceType, "material"))

    console.log(`Found ${existingMaterials.length} existing material services`)

    // Filter out materials that already exist
    const existingCodes = new Set(existingMaterials.map((m) => m.code))
    const newMaterials = MATERIALS.filter((m) => !existingCodes.has(m.code))

    if (newMaterials.length === 0) {
      console.log("✅ All materials already exist in database!")
      return
    }

    console.log(`Inserting ${newMaterials.length} new material services...`)

    // Insert new materials
    const inserted = await db.insert(services).values(newMaterials).returning()

    console.log(`✅ Successfully seeded ${inserted.length} new materials!`)
    console.log("\n📋 Materials added:")
    inserted.forEach((mat, i) => {
      console.log(`   ${i + 1}. ${mat.code} - ${mat.name} (Rp ${mat.price})`)
    })

    console.log("\n🎉 Materials seeding completed!")
  } catch (error) {
    console.error("❌ Error seeding materials:", error)
    throw error
  } finally {
    process.exit(0)
  }
}

// Run the seeder
seedMaterials()
