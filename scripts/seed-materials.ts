/**
 * Seed medical materials into unified inventory
 * Materials are stored in "drugs" table with item_type='material'
 *
 * This replaces the old approach of storing materials in "services" table.
 * Now both drugs and materials share the same inventory system.
 */
import { db } from "@/db"
import { inventoryItems, inventoryBatches } from "@/db/schema"
import { eq, and } from "drizzle-orm"

const materials = [
  // IV Fluids & Infusion Sets
  {
    name: "Infus Set Dewasa",
    genericName: null,
    itemType: "material" as const,
    category: "IV Equipment",
    unit: "set",
    price: "15000.00",
    minimumStock: 100,
    description: "Set infus lengkap untuk dewasa (selang + jarum)",
    requiresPrescription: false,
  },
  {
    name: "Cairan Infus RL 500ml",
    genericName: null,
    itemType: "material" as const,
    category: "IV Fluids",
    unit: "bottle",
    price: "25000.00",
    minimumStock: 50,
    description: "Ringer Laktat 500ml",
    requiresPrescription: false,
  },
  {
    name: "Cairan Infus NaCl 0.9% 500ml",
    genericName: null,
    itemType: "material" as const,
    category: "IV Fluids",
    unit: "bottle",
    price: "20000.00",
    minimumStock: 50,
    description: "Normal Saline 500ml",
    requiresPrescription: false,
  },
  {
    name: "Cairan Infus D5% 500ml",
    genericName: null,
    itemType: "material" as const,
    category: "IV Fluids",
    unit: "bottle",
    price: "22000.00",
    minimumStock: 50,
    description: "Dextrose 5% 500ml",
    requiresPrescription: false,
  },
  {
    name: "Abocath 22G",
    genericName: null,
    itemType: "material" as const,
    category: "IV Equipment",
    unit: "pcs",
    price: "6000.00",
    minimumStock: 50,
    description: "IV catheter 22 gauge",
    requiresPrescription: false,
  },
  {
    name: "Abocath 24G",
    genericName: null,
    itemType: "material" as const,
    category: "IV Equipment",
    unit: "pcs",
    price: "6000.00",
    minimumStock: 50,
    description: "IV catheter 24 gauge",
    requiresPrescription: false,
  },

  // Syringes & Needles
  {
    name: "Spuit 3cc",
    genericName: null,
    itemType: "material" as const,
    category: "Syringes & Needles",
    unit: "pcs",
    price: "2000.00",
    minimumStock: 200,
    description: "Syringe 3ml disposable",
    requiresPrescription: false,
  },
  {
    name: "Spuit 5cc",
    genericName: null,
    itemType: "material" as const,
    category: "Syringes & Needles",
    unit: "pcs",
    price: "2500.00",
    minimumStock: 200,
    description: "Syringe 5ml disposable",
    requiresPrescription: false,
  },
  {
    name: "Spuit 10cc",
    genericName: null,
    itemType: "material" as const,
    category: "Syringes & Needles",
    unit: "pcs",
    price: "3500.00",
    minimumStock: 100,
    description: "Syringe 10ml disposable",
    requiresPrescription: false,
  },
  {
    name: "Jarum Suntik 23G",
    genericName: null,
    itemType: "material" as const,
    category: "Syringes & Needles",
    unit: "pcs",
    price: "1000.00",
    minimumStock: 200,
    description: "Disposable needle 23 gauge",
    requiresPrescription: false,
  },
  {
    name: "Jarum Suntik 25G",
    genericName: null,
    itemType: "material" as const,
    category: "Syringes & Needles",
    unit: "pcs",
    price: "1000.00",
    minimumStock: 200,
    description: "Disposable needle 25 gauge",
    requiresPrescription: false,
  },
  {
    name: "Wing Needle 23G",
    genericName: null,
    itemType: "material" as const,
    category: "Syringes & Needles",
    unit: "pcs",
    price: "5000.00",
    minimumStock: 50,
    description: "Butterfly needle 23 gauge",
    requiresPrescription: false,
  },

  // Gloves & PPE
  {
    name: "Handscoen Steril Size 7",
    genericName: null,
    itemType: "material" as const,
    category: "PPE",
    unit: "pair",
    price: "5000.00",
    minimumStock: 50,
    description: "Sarung tangan steril size 7 (per pasang)",
    requiresPrescription: false,
  },
  {
    name: "Handscoen Steril Size 7.5",
    genericName: null,
    itemType: "material" as const,
    category: "PPE",
    unit: "pair",
    price: "5000.00",
    minimumStock: 50,
    description: "Sarung tangan steril size 7.5 (per pasang)",
    requiresPrescription: false,
  },
  {
    name: "Handscoen Non-Steril",
    genericName: null,
    itemType: "material" as const,
    category: "PPE",
    unit: "pair",
    price: "2000.00",
    minimumStock: 100,
    description: "Sarung tangan non-steril (per pasang)",
    requiresPrescription: false,
  },
  {
    name: "Masker Bedah 3 Ply",
    genericName: null,
    itemType: "material" as const,
    category: "PPE",
    unit: "box",
    price: "35000.00",
    minimumStock: 10,
    description: "Surgical mask 3-ply (box of 50)",
    requiresPrescription: false,
  },

  // Dressings & Wound Care
  {
    name: "Kasa Steril 16x16cm",
    genericName: null,
    itemType: "material" as const,
    category: "Dressings",
    unit: "pcs",
    price: "3000.00",
    minimumStock: 200,
    description: "Sterile gauze 16x16cm (per lembar)",
    requiresPrescription: false,
  },
  {
    name: "Plester Hypafix 10cm",
    genericName: null,
    itemType: "material" as const,
    category: "Dressings",
    unit: "roll",
    price: "25000.00",
    minimumStock: 20,
    description: "Hypafix tape 10cm x 5m",
    requiresPrescription: false,
  },
  {
    name: "Plester Micropore 1 inch",
    genericName: null,
    itemType: "material" as const,
    category: "Dressings",
    unit: "roll",
    price: "8000.00",
    minimumStock: 30,
    description: "Micropore surgical tape 1 inch",
    requiresPrescription: false,
  },
  {
    name: "Verban Elastis 6cm",
    genericName: null,
    itemType: "material" as const,
    category: "Dressings",
    unit: "roll",
    price: "12000.00",
    minimumStock: 20,
    description: "Elastic bandage lebar 6cm (per roll)",
    requiresPrescription: false,
  },

  // Antiseptics & Solutions
  {
    name: "Alkohol Swab",
    genericName: null,
    itemType: "material" as const,
    category: "Antiseptics",
    unit: "pcs",
    price: "500.00",
    minimumStock: 500,
    description: "Alcohol swab sachet disposable",
    requiresPrescription: false,
  },
  {
    name: "Betadine 60ml",
    genericName: null,
    itemType: "material" as const,
    category: "Antiseptics",
    unit: "bottle",
    price: "25000.00",
    minimumStock: 20,
    description: "Povidone iodine antiseptik 60ml",
    requiresPrescription: false,
  },

  // Catheters & Tubes
  {
    name: "Kateter Urin/DC No. 16",
    genericName: null,
    itemType: "material" as const,
    category: "Catheters",
    unit: "pcs",
    price: "35000.00",
    minimumStock: 15,
    description: "Dower Catheter ukuran 16",
    requiresPrescription: false,
  },
  {
    name: "Cateter Foley 2 Way No. 16",
    genericName: null,
    itemType: "material" as const,
    category: "Catheters",
    unit: "pcs",
    price: "25000.00",
    minimumStock: 15,
    description: "Foley catheter 2-way size 16",
    requiresPrescription: false,
  },
  {
    name: "NGT (Nasogastric Tube) No. 16",
    genericName: null,
    itemType: "material" as const,
    category: "Tubes",
    unit: "pcs",
    price: "30000.00",
    minimumStock: 15,
    description: "Nasogastric tube ukuran 16",
    requiresPrescription: false,
  },
  {
    name: "Urine Bag",
    genericName: null,
    itemType: "material" as const,
    category: "Catheters",
    unit: "pcs",
    price: "20000.00",
    minimumStock: 20,
    description: "Kantong urin disposable 2000ml",
    requiresPrescription: false,
  },

  // Oxygen & Respiratory
  {
    name: "Oksigen Nasal Kanul",
    genericName: null,
    itemType: "material" as const,
    category: "Respiratory",
    unit: "pcs",
    price: "15000.00",
    minimumStock: 30,
    description: "Nasal cannula untuk oksigen",
    requiresPrescription: false,
  },
  {
    name: "Masker Oksigen Simple",
    genericName: null,
    itemType: "material" as const,
    category: "Respiratory",
    unit: "pcs",
    price: "20000.00",
    minimumStock: 20,
    description: "Simple oxygen mask",
    requiresPrescription: false,
  },

  // Surgical & Wound Closure
  {
    name: "Benang Jahit (Suture) 3/0",
    genericName: null,
    itemType: "material" as const,
    category: "Surgical",
    unit: "pack",
    price: "50000.00",
    minimumStock: 10,
    description: "Surgical suture 3/0 (silk/nylon)",
    requiresPrescription: false,
  },
  {
    name: "Benang Jahit (Suture) 4/0",
    genericName: null,
    itemType: "material" as const,
    category: "Surgical",
    unit: "pack",
    price: "45000.00",
    minimumStock: 10,
    description: "Surgical suture 4/0 (silk/nylon)",
    requiresPrescription: false,
  },

  // Other Consumables
  {
    name: "Gunting Verban",
    genericName: null,
    itemType: "material" as const,
    category: "Consumables",
    unit: "pcs",
    price: "15000.00",
    minimumStock: 15,
    description: "Gunting pembalut medis disposable",
    requiresPrescription: false,
  },
  {
    name: "Thermometer Digital",
    genericName: null,
    itemType: "material" as const,
    category: "Consumables",
    unit: "pcs",
    price: "35000.00",
    minimumStock: 20,
    description: "Termometer digital disposable",
    requiresPrescription: false,
  },
  {
    name: "Kapas 500gr",
    genericName: null,
    itemType: "material" as const,
    category: "Consumables",
    unit: "pack",
    price: "45000.00",
    minimumStock: 10,
    description: "Cotton wool 500 gram",
    requiresPrescription: false,
  },
  {
    name: "Underpad 60x90",
    genericName: null,
    itemType: "material" as const,
    category: "Consumables",
    unit: "pcs",
    price: "5000.00",
    minimumStock: 100,
    description: "Disposable underpad 60x90 cm",
    requiresPrescription: false,
  },
]

async function seedMaterials() {
  console.log("🌱 Starting unified inventory material seeding...")
  console.log(`📦 Preparing to insert ${materials.length} materials into "drugs" table\n`)

  try {
    let insertedCount = 0
    let skippedCount = 0
    let batchCount = 0

    for (const material of materials) {
      // Check if material already exists in drugs table
      const existing = await db
        .select()
        .from(inventoryItems)
        .where(and(eq(inventoryItems.name, material.name), eq(inventoryItems.itemType, "material")))
        .limit(1)

      if (existing.length > 0) {
        console.log(`⏭️  Skipped: ${material.name} (already exists)`)
        skippedCount++
        continue
      }

      // Insert material into drugs table with item_type='material'
      const [inserted] = await db.insert(inventoryItems).values(material).returning()

      console.log(`✅ Inserted: ${material.name} (${material.category}) - Rp ${material.price}`)
      insertedCount++

      // Create initial inventory batch for this material
      const batch = {
        drugId: inserted.id, // Using drugId column for backward compatibility
        batchNumber: `MAT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        stockQuantity: material.minimumStock * 3, // Start with 3x minimum stock
        purchasePrice: material.price,
        supplier: "Initial Stock",
        receivedDate: new Date(),
      }

      await db.insert(inventoryBatches).values(batch)
      console.log(
        `   📦 Created batch: ${batch.batchNumber} (${batch.stockQuantity} ${material.unit})`
      )
      batchCount++
    }

    console.log("\n" + "=".repeat(70))
    console.log("✅ Material seeding completed!")
    console.log("=".repeat(70))
    console.log(`📊 Summary:`)
    console.log(`   - Inserted: ${insertedCount} materials`)
    console.log(`   - Skipped: ${skippedCount} materials (already exist)`)
    console.log(`   - Created: ${batchCount} inventory batches`)

    // Verify by querying materials from unified inventory
    const totalMaterials = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.itemType, "material"))

    const totalDrugs = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.itemType, "drug"))

    console.log(`\n📈 Database Statistics:`)
    console.log(`   - Total materials: ${totalMaterials.length}`)
    console.log(`   - Total drugs: ${totalDrugs.length}`)
    console.log(`   - Total inventory items: ${totalMaterials.length + totalDrugs.length}`)

    console.log(`\n✓ Verified: Materials successfully stored in unified "drugs" table`)
    console.log(`💡 Materials are now available for recording in inpatient care`)
    console.log(`🔍 Query materials using: WHERE item_type = 'material'`)

    process.exit(0)
  } catch (error) {
    console.error("\n❌ Error during material seeding:", error)
    process.exit(1)
  }
}

seedMaterials()
