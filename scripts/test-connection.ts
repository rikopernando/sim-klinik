import { db } from "../db"

async function testConnection() {
  try {
    // Try to connect and run a simple query
    console.log("Testing database connection...")

    // Run a simple query to test the connection
    const result = await db.execute("SELECT 1 as test;")
    console.log("Connection successful!", result)
  } catch (error) {
    console.error("Connection failed:", error)
  }
}

testConnection()
