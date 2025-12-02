/**
 * Services Seeder
 * Seeds the services table with common clinic services
 */

import { db } from "@/db";
import { services } from "@/db/schema/billing";

const COMMON_SERVICES = [
    // ========================================
    // ADMINISTRATION SERVICES
    // ========================================
    {
        code: "ADM-001",
        name: "Biaya Administrasi Pendaftaran",
        serviceType: "administration",
        price: "10000.00",
        description: "Biaya administrasi pendaftaran pasien baru atau lama",
        category: "Administration",
        isActive: true,
    },

    // ========================================
    // CONSULTATION SERVICES
    // ========================================
    {
        code: "CONS-001",
        name: "Konsultasi Dokter Umum",
        serviceType: "consultation",
        price: "50000.00",
        description: "Konsultasi dengan dokter umum (rawat jalan)",
        category: "Consultation",
        isActive: true,
    },
    {
        code: "CONS-002",
        name: "Konsultasi Dokter Spesialis",
        serviceType: "consultation",
        price: "150000.00",
        description: "Konsultasi dengan dokter spesialis",
        category: "Consultation",
        isActive: true,
    },
    {
        code: "CONS-003",
        name: "Konsultasi Gigi",
        serviceType: "consultation",
        price: "75000.00",
        description: "Konsultasi dengan dokter gigi",
        category: "Consultation",
        isActive: true,
    },

    // ========================================
    // MEDICAL PROCEDURES (with ICD-9 codes where applicable)
    // ========================================

    // Minor Procedures
    {
        code: "86.04",
        name: "Incision and Drainage of Skin and Subcutaneous Tissue",
        serviceType: "procedure",
        price: "100000.00",
        description: "Insisi dan drainase abses kulit",
        category: "Minor Surgery",
        isActive: true,
    },
    {
        code: "86.3",
        name: "Other Local Excision or Destruction of Lesion",
        serviceType: "procedure",
        price: "150000.00",
        description: "Eksisi lesi kulit kecil",
        category: "Minor Surgery",
        isActive: true,
    },
    {
        code: "86.59",
        name: "Suture of Skin and Subcutaneous Tissue",
        serviceType: "procedure",
        price: "75000.00",
        description: "Jahit luka sederhana (< 5 cm)",
        category: "Minor Surgery",
        isActive: true,
    },
    {
        code: "PROC-001",
        name: "Jahit Luka Kompleks",
        serviceType: "procedure",
        price: "200000.00",
        description: "Jahit luka kompleks atau > 5 cm",
        category: "Minor Surgery",
        isActive: true,
    },

    // Wound Care
    {
        code: "93.56",
        name: "Debridement of Wound",
        serviceType: "procedure",
        price: "80000.00",
        description: "Pembersihan dan debridement luka",
        category: "Wound Care",
        isActive: true,
    },
    {
        code: "97.16",
        name: "Removal of Sutures",
        serviceType: "procedure",
        price: "30000.00",
        description: "Pelepasan jahitan",
        category: "Wound Care",
        isActive: true,
    },
    {
        code: "PROC-002",
        name: "Ganti Balutan",
        serviceType: "procedure",
        price: "25000.00",
        description: "Penggantian balutan luka",
        category: "Wound Care",
        isActive: true,
    },

    // Injections & Infusions
    {
        code: "99.22",
        name: "Injection of Antibiotic",
        serviceType: "procedure",
        price: "35000.00",
        description: "Suntikan antibiotik (IM/IV)",
        category: "Injection",
        isActive: true,
    },
    {
        code: "99.18",
        name: "Injection of Electrolytes",
        serviceType: "procedure",
        price: "30000.00",
        description: "Suntikan vitamin/elektrolit",
        category: "Injection",
        isActive: true,
    },
    {
        code: "99.29",
        name: "Injection of Other Therapeutic Substance",
        serviceType: "procedure",
        price: "40000.00",
        description: "Suntikan obat lainnya",
        category: "Injection",
        isActive: true,
    },
    {
        code: "PROC-003",
        name: "Infus/IV Drip",
        serviceType: "procedure",
        price: "100000.00",
        description: "Pemasangan infus dan cairan (tidak termasuk biaya cairan)",
        category: "Infusion",
        isActive: true,
    },

    // Emergency Procedures
    {
        code: "93.93",
        name: "Nonmechanical Methods of Resuscitation",
        serviceType: "procedure",
        price: "500000.00",
        description: "Resusitasi jantung paru (CPR)",
        category: "Emergency",
        isActive: true,
    },
    {
        code: "96.04",
        name: "Insertion of Endotracheal Tube",
        serviceType: "procedure",
        price: "300000.00",
        description: "Intubasi endotrakeal",
        category: "Emergency",
        isActive: true,
    },
    {
        code: "34.04",
        name: "Insertion of Intercostal Catheter for Drainage",
        serviceType: "procedure",
        price: "400000.00",
        description: "Pemasangan WSD (Water Sealed Drainage)",
        category: "Emergency",
        isActive: true,
    },
    {
        code: "96.06",
        name: "Insertion of Nasogastric Tube",
        serviceType: "procedure",
        price: "50000.00",
        description: "Pemasangan NGT (Nasogastric Tube)",
        category: "Emergency",
        isActive: true,
    },
    {
        code: "57.94",
        name: "Insertion of Indwelling Urinary Catheter",
        serviceType: "procedure",
        price: "75000.00",
        description: "Pemasangan kateter urin/DC (Dower Catheter)",
        category: "Emergency",
        isActive: true,
    },

    // Dental Procedures
    {
        code: "23.09",
        name: "Extraction of Tooth",
        serviceType: "procedure",
        price: "150000.00",
        description: "Pencabutan gigi sederhana",
        category: "Dental",
        isActive: true,
    },
    {
        code: "23.2",
        name: "Restoration of Tooth",
        serviceType: "procedure",
        price: "100000.00",
        description: "Penambalan gigi (filling)",
        category: "Dental",
        isActive: true,
    },
    {
        code: "96.54",
        name: "Dental Scaling and Polishing",
        serviceType: "procedure",
        price: "200000.00",
        description: "Scaling dan pembersihan karang gigi",
        category: "Dental",
        isActive: true,
    },

    // Circumcision
    {
        code: "64.0",
        name: "Circumcision",
        serviceType: "procedure",
        price: "500000.00",
        description: "Sunat/sirkumsisi",
        category: "Minor Surgery",
        isActive: true,
    },

    // ========================================
    // LABORATORY SERVICES
    // ========================================
    {
        code: "LAB-001",
        name: "Pemeriksaan Darah Lengkap (CBC)",
        serviceType: "laboratory",
        price: "75000.00",
        description: "Complete Blood Count (Hb, Leukosit, Trombosit, dll)",
        category: "Laboratory",
        isActive: true,
    },
    {
        code: "LAB-002",
        name: "Pemeriksaan Gula Darah Sewaktu (GDS)",
        serviceType: "laboratory",
        price: "25000.00",
        description: "Random Blood Sugar",
        category: "Laboratory",
        isActive: true,
    },
    {
        code: "LAB-003",
        name: "Pemeriksaan Gula Darah Puasa (GDP)",
        serviceType: "laboratory",
        price: "30000.00",
        description: "Fasting Blood Sugar",
        category: "Laboratory",
        isActive: true,
    },
    {
        code: "LAB-004",
        name: "Pemeriksaan Kolesterol Total",
        serviceType: "laboratory",
        price: "35000.00",
        description: "Total Cholesterol",
        category: "Laboratory",
        isActive: true,
    },
    {
        code: "LAB-005",
        name: "Pemeriksaan Asam Urat",
        serviceType: "laboratory",
        price: "30000.00",
        description: "Uric Acid Test",
        category: "Laboratory",
        isActive: true,
    },
    {
        code: "LAB-006",
        name: "Urinalisis",
        serviceType: "laboratory",
        price: "50000.00",
        description: "Pemeriksaan urin lengkap",
        category: "Laboratory",
        isActive: true,
    },
    {
        code: "LAB-007",
        name: "Rapid Test COVID-19",
        serviceType: "laboratory",
        price: "100000.00",
        description: "Rapid Antigen Test COVID-19",
        category: "Laboratory",
        isActive: true,
    },

    // ========================================
    // ROOM/BED CHARGES (per day)
    // ========================================
    {
        code: "ROOM-001",
        name: "Rawat Inap Kelas 3",
        serviceType: "room",
        price: "150000.00",
        description: "Biaya kamar rawat inap kelas 3 per hari",
        category: "Inpatient",
        isActive: true,
    },
    {
        code: "ROOM-002",
        name: "Rawat Inap Kelas 2",
        serviceType: "room",
        price: "250000.00",
        description: "Biaya kamar rawat inap kelas 2 per hari",
        category: "Inpatient",
        isActive: true,
    },
    {
        code: "ROOM-003",
        name: "Rawat Inap Kelas 1",
        serviceType: "room",
        price: "400000.00",
        description: "Biaya kamar rawat inap kelas 1 per hari",
        category: "Inpatient",
        isActive: true,
    },
    {
        code: "ROOM-004",
        name: "Rawat Inap VIP",
        serviceType: "room",
        price: "750000.00",
        description: "Biaya kamar rawat inap VIP per hari",
        category: "Inpatient",
        isActive: true,
    },
    {
        code: "ROOM-005",
        name: "ICU (Intensive Care Unit)",
        serviceType: "room",
        price: "1500000.00",
        description: "Biaya ICU per hari",
        category: "Inpatient",
        isActive: true,
    },
];

async function seedServices() {
    try {
        console.log("🌱 Starting services seeding...");

        // Check if services already exist
        const existingServices = await db.select().from(services).limit(1);

        if (existingServices.length > 0) {
            console.log("⚠️  Services already exist in database. Skipping seed.");
            console.log("💡 If you want to reseed, delete existing services first.");
            return;
        }

        // Insert all services
        const inserted = await db.insert(services).values(COMMON_SERVICES).returning();

        console.log(`✅ Successfully seeded ${inserted.length} services!`);
        console.log("\n📊 Summary by service type:");

        // Count by service type
        const serviceTypes = COMMON_SERVICES.reduce(
            (acc, service) => {
                acc[service.serviceType] = (acc[service.serviceType] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        Object.entries(serviceTypes).forEach(([type, count]) => {
            console.log(`   - ${type}: ${count} services`);
        });

        console.log("\n🎉 Services seeding completed!");
    } catch (error) {
        console.error("❌ Error seeding services:", error);
        throw error;
    }
}

// Run the seeder if called directly
if (require.main === module) {
    seedServices()
        .then(() => {
            console.log("\n✨ Seeding finished successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("\n💥 Seeding failed:", error);
            process.exit(1);
        });
}

export { seedServices };
