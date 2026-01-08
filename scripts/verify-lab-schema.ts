/**
 * Verify Laboratory Schema and Data
 */

import { db } from "@/db"
import {
  labTests,
  labTestPanels,
  labOrders,
  labResults,
  labResultParameters,
  labNotifications,
} from "@/db/schema/laboratory"
import { sql } from "drizzle-orm"

async function verifyLabSchema() {
  console.log("🔍 Verifying Laboratory Schema...\n")

  try {
    // Check lab_tests table
    console.log("📋 Lab Tests:")
    const tests = await db.select().from(labTests).limit(5)
    console.log(`   ✅ Found ${tests.length} tests (showing first 5)`)
    tests.forEach((test) => {
      console.log(`      - ${test.code}: ${test.name} (${test.department})`)
    })

    // Count total tests
    const totalTests = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(labTests)
    console.log(`   📊 Total tests in database: ${totalTests[0].count}`)

    // Check by department
    const labCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(labTests)
      .where(sql`${labTests.department} = 'LAB'`)
    const radCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(labTests)
      .where(sql`${labTests.department} = 'RAD'`)

    console.log(`   📊 By Department:`)
    console.log(`      - Laboratory: ${labCount[0].count} tests`)
    console.log(`      - Radiology: ${radCount[0].count} tests`)

    // Check lab_test_panels table
    console.log("\n📋 Lab Test Panels:")
    const panels = await db.select().from(labTestPanels).limit(3)
    console.log(`   ✅ Table exists, ${panels.length} panels found`)

    // Check lab_orders table
    console.log("\n📋 Lab Orders:")
    const orders = await db.select().from(labOrders).limit(1)
    console.log(`   ✅ Table exists, ${orders.length} orders found`)

    // Check lab_results table
    console.log("\n📋 Lab Results:")
    const results = await db.select().from(labResults).limit(1)
    console.log(`   ✅ Table exists, ${results.length} results found`)

    // Check lab_result_parameters table
    console.log("\n📋 Lab Result Parameters:")
    const parameters = await db.select().from(labResultParameters).limit(1)
    console.log(`   ✅ Table exists, ${parameters.length} parameters found`)

    // Check lab_notifications table
    console.log("\n📋 Lab Notifications:")
    const notifications = await db.select().from(labNotifications).limit(1)
    console.log(`   ✅ Table exists, ${notifications.length} notifications found`)

    console.log("\n✅ All laboratory tables verified successfully!")
    console.log("\n🎉 Laboratory module schema is ready!")
  } catch (error) {
    console.error("❌ Error verifying schema:", error)
    throw error
  }
}

verifyLabSchema()
  .then(() => {
    console.log("\n✨ Verification completed")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n💥 Verification failed:", error)
    process.exit(1)
  })
