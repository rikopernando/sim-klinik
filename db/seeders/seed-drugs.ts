/**
 * Drug Seeder
 * Seeds the drugs table with common medications
 */

import { db } from "@/db"
import { drugs } from "@/db/schema"

const COMMON_DRUGS = [
  // Analgesics & Antipyretics (Obat Pereda Nyeri & Penurun Panas)
  {
    name: "Paracetamol 500mg",
    genericName: "Paracetamol",
    category: "Analgesics",
    unit: "tablet",
    price: "500.00",
    minimumStock: 100,
    description: "Obat pereda nyeri dan penurun panas",
    isActive: true,
  },
  {
    name: "Ibuprofen 400mg",
    genericName: "Ibuprofen",
    category: "Analgesics",
    unit: "tablet",
    price: "1500.00",
    minimumStock: 50,
    description: "Obat anti-inflamasi, pereda nyeri dan penurun panas",
    isActive: true,
  },
  {
    name: "Asam Mefenamat 500mg",
    genericName: "Mefenamic Acid",
    category: "Analgesics",
    unit: "tablet",
    price: "1200.00",
    minimumStock: 50,
    description: "Obat pereda nyeri, terutama untuk nyeri haid",
    isActive: true,
  },

  // Antibiotics (Antibiotik)
  {
    name: "Amoxicillin 500mg",
    genericName: "Amoxicillin",
    category: "Antibiotics",
    unit: "kapsul",
    price: "2000.00",
    minimumStock: 100,
    description: "Antibiotik spektrum luas untuk infeksi bakteri",
    isActive: true,
  },
  {
    name: "Ciprofloxacin 500mg",
    genericName: "Ciprofloxacin",
    category: "Antibiotics",
    unit: "tablet",
    price: "3500.00",
    minimumStock: 30,
    description: "Antibiotik untuk infeksi saluran kemih dan infeksi bakteri lainnya",
    isActive: true,
  },
  {
    name: "Azithromycin 500mg",
    genericName: "Azithromycin",
    category: "Antibiotics",
    unit: "tablet",
    price: "5000.00",
    minimumStock: 30,
    description: "Antibiotik untuk infeksi saluran pernapasan",
    isActive: true,
  },
  {
    name: "Cefadroxil 500mg",
    genericName: "Cefadroxil",
    category: "Antibiotics",
    unit: "kapsul",
    price: "2500.00",
    minimumStock: 50,
    description: "Antibiotik golongan sefalosporin",
    isActive: true,
  },

  // Antihistamines (Antihistamin)
  {
    name: "Cetirizine 10mg",
    genericName: "Cetirizine",
    category: "Antihistamines",
    unit: "tablet",
    price: "1000.00",
    minimumStock: 50,
    description: "Obat alergi, anti histamin",
    isActive: true,
  },
  {
    name: "Loratadine 10mg",
    genericName: "Loratadine",
    category: "Antihistamines",
    unit: "tablet",
    price: "1500.00",
    minimumStock: 50,
    description: "Obat alergi yang tidak menyebabkan kantuk",
    isActive: true,
  },
  {
    name: "Chlorpheniramine Maleate 4mg",
    genericName: "CTM",
    category: "Antihistamines",
    unit: "tablet",
    price: "300.00",
    minimumStock: 100,
    description: "Obat alergi, dapat menyebabkan kantuk",
    isActive: true,
  },

  // Gastrointestinal (Obat Pencernaan)
  {
    name: "Omeprazole 20mg",
    genericName: "Omeprazole",
    category: "Gastrointestinal",
    unit: "kapsul",
    price: "3000.00",
    minimumStock: 50,
    description: "Obat maag, mengurangi produksi asam lambung",
    isActive: true,
  },
  {
    name: "Antasida DOEN",
    genericName: "Antacid",
    category: "Gastrointestinal",
    unit: "tablet",
    price: "500.00",
    minimumStock: 100,
    description: "Obat maag, menetralkan asam lambung",
    isActive: true,
  },
  {
    name: "Domperidone 10mg",
    genericName: "Domperidone",
    category: "Gastrointestinal",
    unit: "tablet",
    price: "1500.00",
    minimumStock: 50,
    description: "Obat mual dan muntah",
    isActive: true,
  },
  {
    name: "Loperamide 2mg",
    genericName: "Loperamide",
    category: "Gastrointestinal",
    unit: "kapsul",
    price: "2000.00",
    minimumStock: 30,
    description: "Obat diare",
    isActive: true,
  },

  // Vitamins & Supplements (Vitamin & Suplemen)
  {
    name: "Vitamin B Complex",
    genericName: "B Complex",
    category: "Vitamins",
    unit: "tablet",
    price: "1000.00",
    minimumStock: 100,
    description: "Suplemen vitamin B kompleks",
    isActive: true,
  },
  {
    name: "Vitamin C 500mg",
    genericName: "Ascorbic Acid",
    category: "Vitamins",
    unit: "tablet",
    price: "800.00",
    minimumStock: 100,
    description: "Suplemen vitamin C untuk daya tahan tubuh",
    isActive: true,
  },
  {
    name: "Multivitamin",
    genericName: "Multivitamin",
    category: "Vitamins",
    unit: "tablet",
    price: "2500.00",
    minimumStock: 50,
    description: "Suplemen multivitamin dan mineral",
    isActive: true,
  },

  // Cough & Cold (Obat Batuk & Flu)
  {
    name: "Ambroxol 30mg",
    genericName: "Ambroxol",
    category: "Cough & Cold",
    unit: "tablet",
    price: "1200.00",
    minimumStock: 50,
    description: "Obat batuk berdahak, pengencer dahak",
    isActive: true,
  },
  {
    name: "Dextromethorphan Sirup 100ml",
    genericName: "DMP",
    category: "Cough & Cold",
    unit: "botol",
    price: "15000.00",
    minimumStock: 20,
    description: "Obat batuk kering",
    isActive: true,
  },
  {
    name: "Pseudoephedrine 60mg",
    genericName: "Pseudoephedrine",
    category: "Cough & Cold",
    unit: "tablet",
    price: "2000.00",
    minimumStock: 30,
    description: "Dekongestan, untuk hidung tersumbat",
    isActive: true,
  },

  // Cardiovascular (Obat Jantung & Pembuluh Darah)
  {
    name: "Amlodipine 5mg",
    genericName: "Amlodipine",
    category: "Cardiovascular",
    unit: "tablet",
    price: "2000.00",
    minimumStock: 50,
    description: "Obat hipertensi (darah tinggi)",
    isActive: true,
  },
  {
    name: "Captopril 25mg",
    genericName: "Captopril",
    category: "Cardiovascular",
    unit: "tablet",
    price: "1500.00",
    minimumStock: 50,
    description: "Obat hipertensi (darah tinggi)",
    isActive: true,
  },
  {
    name: "Simvastatin 20mg",
    genericName: "Simvastatin",
    category: "Cardiovascular",
    unit: "tablet",
    price: "3000.00",
    minimumStock: 30,
    description: "Obat kolesterol tinggi",
    isActive: true,
  },

  // Diabetes (Obat Diabetes)
  {
    name: "Metformin 500mg",
    genericName: "Metformin",
    category: "Diabetes",
    unit: "tablet",
    price: "1500.00",
    minimumStock: 100,
    description: "Obat diabetes tipe 2",
    isActive: true,
  },
  {
    name: "Glimepiride 2mg",
    genericName: "Glimepiride",
    category: "Diabetes",
    unit: "tablet",
    price: "2500.00",
    minimumStock: 50,
    description: "Obat diabetes tipe 2",
    isActive: true,
  },

  // Topical (Obat Luar)
  {
    name: "Betadine Solution 60ml",
    genericName: "Povidone Iodine",
    category: "Topical",
    unit: "botol",
    price: "15000.00",
    minimumStock: 30,
    description: "Antiseptik untuk luka",
    isActive: true,
  },
  {
    name: "Hydrocortisone Cream 2.5% 5g",
    genericName: "Hydrocortisone",
    category: "Topical",
    unit: "tube",
    price: "12000.00",
    minimumStock: 20,
    description: "Krim anti inflamasi untuk kulit",
    isActive: true,
  },
  {
    name: "Ketoconazole Cream 2% 15g",
    genericName: "Ketoconazole",
    category: "Topical",
    unit: "tube",
    price: "18000.00",
    minimumStock: 20,
    description: "Krim anti jamur",
    isActive: true,
  },

  // Eye & Ear Drops (Obat Tetes Mata & Telinga)
  {
    name: "Chloramphenicol Eye Drops 0.5% 5ml",
    genericName: "Chloramphenicol",
    category: "Eye Drops",
    unit: "botol",
    price: "8000.00",
    minimumStock: 20,
    description: "Obat tetes mata untuk infeksi",
    isActive: true,
  },
  {
    name: "Otopain Ear Drops 15ml",
    genericName: "Phenazone + Lidocaine",
    category: "Ear Drops",
    unit: "botol",
    price: "25000.00",
    minimumStock: 10,
    description: "Obat tetes telinga untuk nyeri",
    isActive: true,
  },

  // Injections (Obat Suntik)
  {
    name: "Dexamethasone Injection 5mg/ml",
    genericName: "Dexamethasone",
    category: "Injections",
    unit: "ampul",
    price: "5000.00",
    minimumStock: 50,
    description: "Obat anti inflamasi, kortikosteroid",
    isActive: true,
  },
  {
    name: "Vitamin B12 Injection 1000mcg",
    genericName: "Cyanocobalamin",
    category: "Injections",
    unit: "ampul",
    price: "8000.00",
    minimumStock: 30,
    description: "Vitamin B12 injeksi",
    isActive: true,
  },
]

async function seedDrugs() {
  try {
    console.log("🌱 Starting drug seeding...")

    // Check if drugs already exist
    const existingDrugs = await db.select().from(drugs).limit(1)

    if (existingDrugs.length > 0) {
      console.log("⚠️  Drugs already exist in database. Skipping seed.")
      console.log("💡 If you want to reseed, delete existing drugs first.")
      return
    }

    // Insert all drugs
    const inserted = await db.insert(drugs).values(COMMON_DRUGS).returning()

    console.log(`✅ Successfully seeded ${inserted.length} drugs!`)
    console.log("\n📊 Summary by category:")

    // Count by category
    const categories = COMMON_DRUGS.reduce(
      (acc, drug) => {
        acc[drug.category] = (acc[drug.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} drugs`)
    })

    console.log("\n🎉 Drug seeding completed!")
  } catch (error) {
    console.error("❌ Error seeding drugs:", error)
    throw error
  }
}

// Run the seeder if called directly
if (require.main === module) {
  seedDrugs()
    .then(() => {
      console.log("\n✨ Seeding finished successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n💥 Seeding failed:", error)
      process.exit(1)
    })
}

export { seedDrugs }
