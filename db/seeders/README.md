# Database Seeders

This directory contains database seeder scripts to populate the database with sample/test data.

## Available Seeders

### 1. Drug Seeder (`seed-drugs.ts`)

Seeds the `drugs` table with 32 common medications used in Indonesian clinics.

**Categories included:**

- Analgesics (Pereda Nyeri) - 3 drugs
- Antibiotics (Antibiotik) - 4 drugs
- Antihistamines (Antihistamin) - 3 drugs
- Gastrointestinal (Obat Pencernaan) - 4 drugs
- Vitamins & Supplements - 3 drugs
- Cough & Cold (Obat Batuk & Flu) - 3 drugs
- Cardiovascular (Obat Jantung) - 3 drugs
- Diabetes (Obat Diabetes) - 2 drugs
- Topical (Obat Luar) - 3 drugs
- Eye Drops (Obat Tetes Mata) - 1 drug
- Ear Drops (Obat Tetes Telinga) - 1 drug
- Injections (Obat Suntik) - 2 drugs

**Total: 32 drugs**

#### Usage

```bash
# Run the drug seeder
npm run db:seed:drugs
```

#### Features

- ✅ Automatic duplicate check (won't seed if drugs already exist)
- ✅ Indonesian drug names and categories
- ✅ Realistic pricing
- ✅ Minimum stock levels
- ✅ Comprehensive descriptions
- ✅ Transaction-safe (all or nothing)

#### Sample Data

Examples of seeded drugs:

- Paracetamol 500mg
- Amoxicillin 500mg
- Omeprazole 20mg
- Vitamin B Complex
- Betadine Solution 60ml
- And 27 more...

## How to Create New Seeders

1. Create a new file in `db/seeders/` (e.g., `seed-patients.ts`)
2. Import required schema and database connection:
   ```typescript
   import { db } from "@/db"
   import { patients } from "@/db/schema"
   ```
3. Create an async function to perform the seeding
4. Export the function
5. Add a script to `package.json`:
   ```json
   "db:seed:patients": "tsx db/seeders/seed-patients.ts"
   ```

## Best Practices

1. **Check for existing data** before seeding to avoid duplicates
2. **Use transactions** for multiple related inserts
3. **Provide clear console output** showing progress and results
4. **Handle errors gracefully** with try-catch blocks
5. **Make seeders idempotent** (safe to run multiple times)
6. **Use realistic data** that represents actual use cases

## Running All Seeders

To run all seeders at once (when you have multiple):

```bash
npm run db:seed:drugs
# Add more seeders as needed
```

## Resetting Data

If you need to reset the database and re-seed:

```bash
# WARNING: This will delete all data!
npm run db:reset
npm run db:seed:drugs
```

## Notes

- Seeders are meant for development and testing only
- Never run seeders on production databases without careful review
- Keep seeder scripts in version control for team collaboration
- Update seeders when schema changes
