/**
 * Laboratory & Radiology Service Layer
 * Business logic for lab operations
 */

import { alias } from "drizzle-orm/pg-core"
import { and, eq, desc, or, ilike, inArray } from "drizzle-orm"
import { db } from "@/db"
import {
  labTests,
  labTestPanels,
  labOrders,
  labResults,
  labResultParameters,
} from "@/db/schema/laboratory"
import { patients } from "@/db/schema/patients"
import { user } from "@/db/schema/auth"
import type {
  CreateLabOrderInput,
  UpdateLabOrderStatusInput,
  LabTestFilters,
  LabTest,
  LabOrder,
  LabOrderWithRelations,
  LabResult,
  OrderStatus,
} from "@/types/lab"
import {
  generateLabOrderNumber,
  isValidStatusTransition,
  canAcceptResults,
  hasAnyCriticalValue,
} from "./utils"
import {
  CreateLabResultInput,
  CreateLabTestInput,
  LabOrderFilters,
  ParameterResultInput,
  UpdateLabTestInput,
} from "./validation"

const enteredByUser = alias(user, "entered_by_user")
const verifiedByUser = alias(user, "verified_by_user")

// ============================================================================
// LAB TEST SERVICES
// ============================================================================

/**
 * Get list of lab tests with optional filters
 */
export async function getLabTests(filters: LabTestFilters = {}) {
  const conditions = []

  // Active filter (default to true)
  if (filters.isActive !== undefined) {
    conditions.push(eq(labTests.isActive, filters.isActive))
  } else {
    conditions.push(eq(labTests.isActive, true))
  }

  // Department filter
  if (filters.department) {
    conditions.push(eq(labTests.department, filters.department))
  }

  // Category filter
  if (filters.category) {
    conditions.push(eq(labTests.category, filters.category))
  }

  // Search filter (code or name)
  if (filters.search) {
    conditions.push(
      or(ilike(labTests.code, `%${filters.search}%`), ilike(labTests.name, `%${filters.search}%`))
    )
  }

  const result = await db
    .select({
      id: labTests.id,
      code: labTests.code,
      name: labTests.name,
      category: labTests.category,
      department: labTests.department,
      price: labTests.price,
      specimenType: labTests.specimenType,
      specimenVolume: labTests.specimenVolume,
      specimenContainer: labTests.specimenContainer,
      tatHours: labTests.tatHours,
      requiresFasting: labTests.requiresFasting,
      description: labTests.description,
      instructions: labTests.instructions,
      isActive: labTests.isActive,
    })
    .from(labTests)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(labTests.name)
    .limit(50)

  return result
}

/**
 * Get single lab test by ID
 */
export async function getLabTestById(testId: string) {
  const [test] = await db.select().from(labTests).where(eq(labTests.id, testId)).limit(1)

  return test || null
}

/**
 * Create new lab test
 */
export async function createLabTest(data: CreateLabTestInput): Promise<LabTest> {
  const [newTest] = await db
    .insert(labTests)
    .values({
      code: data.code,
      name: data.name,
      category: data.category,
      department: data.department,
      price: data.price.toString(),
      specimenType: data.specimenType,
      specimenVolume: data.specimenVolume,
      specimenContainer: data.specimenContainer,
      tatHours: data.tatHours,
      loincCode: data.loincCode,
      cptCode: data.cptCode,
      resultTemplate: data.resultTemplate,
      description: data.description,
      instructions: data.instructions,
      requiresFasting: data.requiresFasting,
      isActive: true,
    })
    .returning()

  return newTest as LabTest
}

/**
 * Update lab test
 */
export async function updateLabTest(testId: string, data: UpdateLabTestInput) {
  const updateData: UpdateLabTestInput = { ...data }

  if (data.price !== undefined) {
    updateData.price = data.price
  }

  const [updated] = await db
    .update(labTests)
    .set(updateData)
    .where(eq(labTests.id, testId))
    .returning()

  return updated
}

// ============================================================================
// LAB TEST PANEL SERVICES
// ============================================================================

/**
 * Get list of lab test panels with their tests
 */
export async function getLabTestPanels(filters: { isActive?: boolean } = {}) {
  const conditions = []

  // Active filter (default to true)
  if (filters.isActive !== undefined) {
    conditions.push(eq(labTestPanels.isActive, filters.isActive))
  } else {
    conditions.push(eq(labTestPanels.isActive, true))
  }

  // Fetch panels
  const panels = await db
    .select()
    .from(labTestPanels)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(labTestPanels.name)

  return panels
}

/**
 * Get single lab test panel with its included tests
 */
export async function getLabTestPanelById(panelId: string) {
  // Get panel
  const [panel] = await db
    .select()
    .from(labTestPanels)
    .where(eq(labTestPanels.id, panelId))
    .limit(1)

  if (!panel) {
    return null
  }

  // Get panel items with test details
  const { labTestPanelItems } = await import("@/db/schema/laboratory")

  const panelItems = await db
    .select({
      test: labTests,
    })
    .from(labTestPanelItems)
    .innerJoin(labTests, eq(labTestPanelItems.testId, labTests.id))
    .where(eq(labTestPanelItems.panelId, panelId))

  const tests = panelItems.map((item) => item.test)

  return {
    ...panel,
    tests,
  }
}

/**
 * Get all panels with their included tests
 */
export async function getLabTestPanelsWithTests(filters: { isActive?: boolean } = {}) {
  // Get panels
  const panels = await getLabTestPanels(filters)

  // Fetch tests for each panel
  const { labTestPanelItems } = await import("@/db/schema/laboratory")

  const panelsWithTests = await Promise.all(
    panels.map(async (panel) => {
      const panelItems = await db
        .select({
          test: labTests,
        })
        .from(labTestPanelItems)
        .innerJoin(labTests, eq(labTestPanelItems.testId, labTests.id))
        .where(eq(labTestPanelItems.panelId, panel.id))

      const tests = panelItems.map((item) => item.test)

      return {
        ...panel,
        tests,
      }
    })
  )

  return panelsWithTests
}

// ============================================================================
// LAB ORDER SERVICES
// ============================================================================

/**
 * Get list of lab orders with filters and relations
 */
export async function getLabOrders(
  filters: LabOrderFilters = {}
): Promise<LabOrderWithRelations[]> {
  const conditions = []

  if (filters.visitId) {
    conditions.push(eq(labOrders.visitId, filters.visitId))
  }

  if (filters.patientId) {
    conditions.push(eq(labOrders.patientId, filters.patientId))
  }

  if (filters.status) {
    const statuses = filters.status.split(",")
    if (statuses.length > 1) {
      conditions.push(inArray(labOrders.status, statuses))
    } else {
      conditions.push(eq(labOrders.status, filters.status))
    }
  }

  const result = await db
    .select({
      id: labOrders.id,
      visitId: labOrders.visitId,
      patientId: labOrders.patientId,
      testId: labOrders.testId,
      panelId: labOrders.panelId,
      orderNumber: labOrders.orderNumber,
      urgency: labOrders.urgency,
      clinicalIndication: labOrders.clinicalIndication,
      status: labOrders.status,
      price: labOrders.price,
      orderedBy: labOrders.orderedBy,
      orderedAt: labOrders.orderedAt,
      specimenCollectedBy: labOrders.specimenCollectedBy,
      specimenCollectedAt: labOrders.specimenCollectedAt,
      specimenNotes: labOrders.specimenNotes,
      processedBy: labOrders.processedBy,
      startedAt: labOrders.startedAt,
      verifiedBy: labOrders.verifiedBy,
      verifiedAt: labOrders.verifiedAt,
      completedAt: labOrders.completedAt,
      cancelledReason: labOrders.cancelledReason,
      isBilled: labOrders.isBilled,
      billingItemId: labOrders.billingItemId,
      notes: labOrders.notes,
      createdAt: labOrders.createdAt,
      updatedAt: labOrders.updatedAt,
      // Relations
      test: {
        id: labTests.id,
        code: labTests.code,
        name: labTests.name,
        category: labTests.category,
        department: labTests.department,
        resultTemplate: labTests.resultTemplate,
      },
      patient: {
        id: patients.id,
        name: patients.name,
        mrNumber: patients.mrNumber,
      },
      orderedByUser: {
        id: user.id,
        name: user.name,
      },
      result: {
        id: labResults.id,
        resultData: labResults.resultData,
        attachmentUrl: labResults.attachmentUrl,
        attachmentType: labResults.attachmentType,
        resultNotes: labResults.resultNotes,
        criticalValue: labResults.criticalValue,
        isVerified: labResults.isVerified,
        verifiedBy: labResults.verifiedBy,
        verifiedAt: labResults.verifiedAt,
        enteredBy: labResults.enteredBy,
        enteredAt: labResults.enteredAt,
      },
    })
    .from(labOrders)
    .leftJoin(labTests, eq(labOrders.testId, labTests.id))
    .leftJoin(patients, eq(labOrders.patientId, patients.id))
    .leftJoin(user, eq(labOrders.orderedBy, user.id))
    .leftJoin(labResults, eq(labOrders.id, labResults.orderId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(labOrders.orderedAt))
    .limit(100)

  // Filter by department if specified (after join)
  let filteredResult = result
  if (filters.department) {
    filteredResult = result.filter((order) => order.test?.department === filters.department)
  }

  // Fetch parameters for all results that have them
  const resultIds = filteredResult
    .map((order) => order.result?.id)
    .filter((id): id is string => id !== null && id !== undefined)

  let parametersMap: Record<string, (typeof labResultParameters.$inferSelect)[]> = {}
  if (resultIds.length > 0) {
    const allParameters = await db
      .select()
      .from(labResultParameters)
      .where(inArray(labResultParameters.resultId, resultIds))

    // Group parameters by resultId
    parametersMap = allParameters.reduce(
      (acc, param) => {
        if (!acc[param.resultId]) {
          acc[param.resultId] = []
        }
        acc[param.resultId].push(param)
        return acc
      },
      {} as Record<string, (typeof labResultParameters.$inferSelect)[]>
    )
  }

  // Map results with parameters and convert null to undefined for optional relations
  const ordersWithResults = filteredResult.map((order) => {
    const mappedOrder = {
      ...order,
      test: order.test?.id ? (order.test as LabTest) : undefined,
      result: order.result?.id
        ? ({
            ...order.result,
            parameters: parametersMap[order.result.id]?.length
              ? parametersMap[order.result.id]
              : undefined,
          } as LabResult & { parameters?: (typeof labResultParameters.$inferSelect)[] })
        : undefined,
    }
    return mappedOrder
  })

  return ordersWithResults as LabOrderWithRelations[]
}

/**
 * Get single lab order by ID with full details
 */
export async function getLabOrderById(orderId: string) {
  const orderResult = await db
    .select({
      id: labOrders.id,
      visitId: labOrders.visitId,
      patientId: labOrders.patientId,
      testId: labOrders.testId,
      panelId: labOrders.panelId,
      orderNumber: labOrders.orderNumber,
      urgency: labOrders.urgency,
      clinicalIndication: labOrders.clinicalIndication,
      status: labOrders.status,
      price: labOrders.price,
      orderedBy: labOrders.orderedBy,
      orderedAt: labOrders.orderedAt,
      specimenCollectedBy: labOrders.specimenCollectedBy,
      specimenCollectedAt: labOrders.specimenCollectedAt,
      specimenNotes: labOrders.specimenNotes,
      processedBy: labOrders.processedBy,
      startedAt: labOrders.startedAt,
      verifiedBy: labOrders.verifiedBy,
      verifiedAt: labOrders.verifiedAt,
      completedAt: labOrders.completedAt,
      notes: labOrders.notes,
      cancelledReason: labOrders.cancelledReason,
      isBilled: labOrders.isBilled,
      createdAt: labOrders.createdAt,
      updatedAt: labOrders.updatedAt,
      // Relations
      test: {
        id: labTests.id,
        code: labTests.code,
        name: labTests.name,
        category: labTests.category,
        department: labTests.department,
        specimenType: labTests.specimenType,
        specimenVolume: labTests.specimenVolume,
        specimenContainer: labTests.specimenContainer,
        resultTemplate: labTests.resultTemplate,
      },
      patient: {
        id: patients.id,
        name: patients.name,
        mrNumber: patients.mrNumber,
        dateOfBirth: patients.dateOfBirth,
      },
      orderedByUser: {
        id: user.id,
        name: user.name,
      },
    })
    .from(labOrders)
    .leftJoin(labTests, eq(labOrders.testId, labTests.id))
    .leftJoin(patients, eq(labOrders.patientId, patients.id))
    .leftJoin(user, eq(labOrders.orderedBy, user.id))
    .where(eq(labOrders.id, orderId))
    .limit(1)

  if (orderResult.length === 0) {
    return null
  }

  const order = orderResult[0]

  // Get results if available
  const resultsQuery = await db
    .select({
      id: labResults.id,
      resultData: labResults.resultData,
      attachmentUrl: labResults.attachmentUrl,
      attachmentType: labResults.attachmentType,
      resultNotes: labResults.resultNotes,
      criticalValue: labResults.criticalValue,
      isVerified: labResults.isVerified,
      verifiedAt: labResults.verifiedAt,
      enteredAt: labResults.enteredAt,
      verifiedByUser: {
        id: verifiedByUser.id,
        name: verifiedByUser.name,
      },
      enteredByUser: {
        id: enteredByUser.id,
        name: enteredByUser.name,
      },
    })
    .from(labResults)
    .leftJoin(verifiedByUser, eq(labResults.enteredBy, verifiedByUser.id))
    .leftJoin(enteredByUser, eq(labResults.enteredBy, enteredByUser.id))
    .where(eq(labResults.orderId, orderId))
    .limit(1)

  let result = null
  if (resultsQuery.length > 0) {
    result = resultsQuery[0]

    // Get parameters if it's a multi-parameter test
    const parameters = await db
      .select()
      .from(labResultParameters)
      .where(eq(labResultParameters.resultId, result.id))

    result = {
      ...result,
      parameters: parameters.length > 0 ? parameters : undefined,
    }
  }

  return {
    ...order,
    result,
  }
}

/**
 * Create new lab order
 */
export async function createLabOrder(data: CreateLabOrderInput, userId: string): Promise<LabOrder> {
  // Get test or panel price
  let price = "0"
  if (data.testId) {
    const test = await getLabTestById(data.testId)
    if (!test) {
      throw new Error("Lab test not found")
    }
    price = test.price
  } else if (data.panelId) {
    const [panel] = await db
      .select()
      .from(labTestPanels)
      .where(eq(labTestPanels.id, data.panelId))
      .limit(1)
    if (!panel) {
      throw new Error("Lab test panel not found")
    }
    price = panel.price
  }

  // Generate order number
  const orderNumber = await generateLabOrderNumber()

  // Insert order
  const [newOrder] = await db
    .insert(labOrders)
    .values({
      visitId: data.visitId,
      patientId: data.patientId,
      testId: data.testId,
      panelId: data.panelId,
      orderNumber,
      urgency: data.urgency || "routine",
      clinicalIndication: data.clinicalIndication,
      notes: data.notes,
      orderedBy: userId,
      price,
      status: "ordered",
    })
    .returning()

  return newOrder as LabOrder
}

/**
 * Update lab order status
 */
export async function updateLabOrderStatus(
  orderId: string,
  data: UpdateLabOrderStatusInput,
  userId: string
): Promise<LabOrder> {
  // Get current order
  const [currentOrder] = await db.select().from(labOrders).where(eq(labOrders.id, orderId)).limit(1)

  if (!currentOrder) {
    throw new Error("Lab order not found")
  }

  // Validate status transition
  if (
    currentOrder.status &&
    !isValidStatusTransition(currentOrder.status as OrderStatus, data.status)
  ) {
    throw new Error(`Cannot transition from ${currentOrder.status} to ${data.status}`)
  }

  // Prepare update data
  const updateData: Record<string, string | Date> = {
    status: data.status,
    updatedAt: new Date(),
  }

  if (data.notes) {
    updateData.notes = data.notes
  }

  if (data.cancelledReason) {
    updateData.cancelledReason = data.cancelledReason
  }

  // Set timestamps and user IDs based on status
  switch (data.status) {
    case "specimen_collected":
      updateData.specimenCollectedBy = userId
      updateData.specimenCollectedAt = new Date()
      break
    case "in_progress":
      updateData.processedBy = userId
      updateData.startedAt = new Date()
      break
    case "completed":
      updateData.completedAt = new Date()
      break
    case "verified":
      updateData.verifiedBy = userId
      updateData.verifiedAt = new Date()
      break
  }

  // Update order
  const [updatedOrder] = await db
    .update(labOrders)
    .set(updateData)
    .where(eq(labOrders.id, orderId))
    .returning()

  return updatedOrder as LabOrder
}

// ============================================================================
// LAB RESULT SERVICES
// ============================================================================

/**
 * Get results for an order
 */
export async function getLabResultsByOrderId(orderId: string) {
  const results = await db.select().from(labResults).where(eq(labResults.orderId, orderId))

  // Get parameters for each result
  const resultsWithParameters = await Promise.all(
    results.map(async (result) => {
      const parameters = await db
        .select()
        .from(labResultParameters)
        .where(eq(labResultParameters.resultId, result.id))

      return {
        ...result,
        parameters: parameters.length > 0 ? parameters : undefined,
      }
    })
  )

  return resultsWithParameters
}

/**
 * Create lab result
 */
export async function createLabResult(
  data: CreateLabResultInput,
  userId: string
): Promise<LabResult> {
  // Check if order exists and is in correct status
  const [order] = await db.select().from(labOrders).where(eq(labOrders.id, data.orderId)).limit(1)

  if (!order) {
    throw new Error("Lab order not found")
  }

  if (!canAcceptResults(order.status as OrderStatus)) {
    throw new Error(`Cannot add results to order with status: ${order.status}`)
  }

  // Check for critical values
  const isCritical = data.criticalValue || hasAnyCriticalValue(data.resultData)

  // Insert result
  const [newResult] = await db
    .insert(labResults)
    .values({
      orderId: data.orderId,
      resultData: data.resultData,
      attachmentUrl: data.attachmentUrl,
      attachmentType: data.attachmentType,
      resultNotes: data.resultNotes,
      criticalValue: isCritical,
      isVerified: false,
      enteredBy: userId,
    })
    .returning()

  // Insert parameters if provided
  // resultData can be labParameterSchema which contains parameters
  if (
    "parameters" in data.resultData &&
    data.resultData.parameters &&
    Array.isArray(data.resultData.parameters)
  ) {
    const params = data.resultData.parameters
    if (params.length > 0) {
      await db.insert(labResultParameters).values(
        params.map((param: ParameterResultInput) => ({
          resultId: newResult.id,
          parameterName: param.name,
          parameterValue: param.value,
          unit: param.unit,
          referenceValue: param.referenceValue,
          referenceMin: param.referenceRange?.min?.toString(),
          referenceMax: param.referenceRange?.max?.toString(),
          flag: param.flag,
        }))
      )
    }
  }

  // Update order status to completed
  await db
    .update(labOrders)
    .set({
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(labOrders.id, data.orderId))

  // TODO: Create notification for ordering doctor
  // TODO: Auto-create billing item if not already billed

  return newResult as LabResult
}

/**
 * Verify lab result
 */
export async function verifyLabResult(
  resultId: string,
  userId: string,
  notes?: string
): Promise<LabResult> {
  // Get result
  const [result] = await db.select().from(labResults).where(eq(labResults.id, resultId)).limit(1)

  if (!result) {
    throw new Error("Lab result not found")
  }

  if (result.isVerified) {
    throw new Error("This result has already been verified")
  }

  // Update result as verified
  const [verifiedResult] = await db
    .update(labResults)
    .set({
      isVerified: true,
      verifiedBy: userId,
      verifiedAt: new Date(),
      resultNotes: notes || result.resultNotes,
      updatedAt: new Date(),
    })
    .where(eq(labResults.id, resultId))
    .returning()

  // Update order status to verified
  await db
    .update(labOrders)
    .set({
      status: "verified",
      verifiedBy: userId,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(labOrders.id, result.orderId))

  // TODO: Create notification for ordering doctor
  // TODO: If critical value, send urgent notification

  return verifiedResult as LabResult
}
