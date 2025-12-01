/**
 * Database Seeding Script
 * Run with: npm run db:seed
 */

import { runAllSeeders } from "@/lib/seeders";

async function main() {
    console.log("=" .repeat(50));
    console.log("  Klinik Bumi Andalas - Database Seeder");
    console.log("=" .repeat(50));
    console.log("");

    await runAllSeeders();

    console.log("");
    console.log("=" .repeat(50));
    process.exit(0);
}

main().catch((error) => {
    console.error("Fatal error during seeding:", error);
    process.exit(1);
});
