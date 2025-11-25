/**
 * Seed ICD-10 Codes
 * Populate database with common ICD-10 diagnosis codes
 */

import { db } from "@/db";
import { icd10Codes } from "@/db/schema";

const commonICD10Codes = [
    // Infectious diseases
    { code: "A00", description: "Cholera", category: "Infectious" },
    { code: "A09", description: "Diarrhoea and gastroenteritis of presumed infectious origin", category: "Infectious" },
    { code: "A15.0", description: "Tuberculosis of lung, confirmed by sputum microscopy", category: "Infectious" },
    { code: "B34.9", description: "Viral infection, unspecified", category: "Infectious" },

    // Cardiovascular
    { code: "I10", description: "Essential (primary) hypertension", category: "Cardiovascular" },
    { code: "I20.0", description: "Unstable angina", category: "Cardiovascular" },
    { code: "I21.9", description: "Acute myocardial infarction, unspecified", category: "Cardiovascular" },
    { code: "I50.0", description: "Congestive heart failure", category: "Cardiovascular" },

    // Respiratory
    { code: "J00", description: "Acute nasopharyngitis (common cold)", category: "Respiratory" },
    { code: "J02.9", description: "Acute pharyngitis, unspecified", category: "Respiratory" },
    { code: "J03.9", description: "Acute tonsillitis, unspecified", category: "Respiratory" },
    { code: "J06.9", description: "Acute upper respiratory infection, unspecified", category: "Respiratory" },
    { code: "J18.9", description: "Pneumonia, unspecified", category: "Respiratory" },
    { code: "J20.9", description: "Acute bronchitis, unspecified", category: "Respiratory" },
    { code: "J45.9", description: "Asthma, unspecified", category: "Respiratory" },

    // Digestive
    { code: "K21.9", description: "Gastro-oesophageal reflux disease without oesophagitis", category: "Digestive" },
    { code: "K29.7", description: "Gastritis, unspecified", category: "Digestive" },
    { code: "K30", description: "Dyspepsia", category: "Digestive" },
    { code: "K52.9", description: "Non-infective gastroenteritis and colitis, unspecified", category: "Digestive" },
    { code: "K59.0", description: "Constipation", category: "Digestive" },

    // Endocrine
    { code: "E11.9", description: "Type 2 diabetes mellitus without complications", category: "Endocrine" },
    { code: "E78.5", description: "Hyperlipidaemia, unspecified", category: "Endocrine" },
    { code: "E66.9", description: "Obesity, unspecified", category: "Endocrine" },

    // Musculoskeletal
    { code: "M25.5", description: "Pain in joint", category: "Musculoskeletal" },
    { code: "M54.5", description: "Low back pain", category: "Musculoskeletal" },
    { code: "M79.1", description: "Myalgia", category: "Musculoskeletal" },

    // Skin
    { code: "L20.9", description: "Atopic dermatitis, unspecified", category: "Dermatology" },
    { code: "L30.9", description: "Dermatitis, unspecified", category: "Dermatology" },
    { code: "L50.9", description: "Urticaria, unspecified", category: "Dermatology" },

    // Neurological
    { code: "G43.9", description: "Migraine, unspecified", category: "Neurological" },
    { code: "G44.2", description: "Tension-type headache", category: "Neurological" },

    // Symptoms and signs
    { code: "R05", description: "Cough", category: "Symptoms" },
    { code: "R06.0", description: "Dyspnoea", category: "Symptoms" },
    { code: "R07.4", description: "Chest pain, unspecified", category: "Symptoms" },
    { code: "R10.4", description: "Other and unspecified abdominal pain", category: "Symptoms" },
    { code: "R50.9", description: "Fever, unspecified", category: "Symptoms" },
    { code: "R51", description: "Headache", category: "Symptoms" },

    // Pregnancy and childbirth
    { code: "O80", description: "Single spontaneous delivery", category: "Obstetrics" },
    { code: "O99.8", description: "Other specified diseases and conditions complicating pregnancy, childbirth and the puerperium", category: "Obstetrics" },

    // Injuries
    { code: "S06.0", description: "Concussion", category: "Injury" },
    { code: "T14.9", description: "Injury, unspecified", category: "Injury" },
    { code: "T78.4", description: "Allergy, unspecified", category: "Injury" },
];

async function seedICD10() {
    console.log("Starting ICD-10 seeding...");

    try {
        // Check if data already exists
        const existingCodes = await db.select().from(icd10Codes).limit(1);

        if (existingCodes.length > 0) {
            console.log("ICD-10 codes already exist. Skipping seed.");
            return;
        }

        // Insert ICD-10 codes
        await db.insert(icd10Codes).values(commonICD10Codes);

        console.log(`✓ Successfully seeded ${commonICD10Codes.length} ICD-10 codes`);
    } catch (error) {
        console.error("Error seeding ICD-10 codes:", error);
        throw error;
    }
}

// Run the seed function
seedICD10()
    .then(() => {
        console.log("ICD-10 seeding completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("ICD-10 seeding failed:", error);
        process.exit(1);
    });
