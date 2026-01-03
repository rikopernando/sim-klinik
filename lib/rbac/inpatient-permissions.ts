/**
 * Inpatient Module - RBAC Permission Mapping
 *
 * This file documents the permission requirements for all inpatient-related API routes.
 * Based on Sprint 3: RBAC Implementation
 *
 * Permission Types Used:
 * - inpatient:read - View inpatient data (nurse, doctor, admin, super_admin)
 * - inpatient:write - Create/update inpatient records (nurse, doctor, super_admin)
 * - inpatient:manage_beds - Bed assignment/transfer (nurse, super_admin)
 * - prescriptions:write - Create/delete prescriptions (doctor, super_admin)
 * - discharge:write - Complete discharge process (doctor, super_admin)
 */

import type { Permission } from "@/types/rbac"

/**
 * Permission mapping for inpatient routes
 * Use this as reference when applying withRBAC to routes
 */
export const INPATIENT_ROUTE_PERMISSIONS = {
  // ============================================================================
  // BED MANAGEMENT
  // ============================================================================

  /**
   * POST /api/inpatient/assign-bed
   * Assign a bed to a patient
   */
  ASSIGN_BED: ["inpatient:manage_beds"] as Permission[],

  /**
   * GET /api/inpatient/available-rooms
   * Get list of available rooms
   */
  GET_AVAILABLE_ROOMS: ["inpatient:read"] as Permission[],

  /**
   * GET /api/inpatient/search-unassigned-patients
   * Search patients without bed assignment
   */
  SEARCH_UNASSIGNED_PATIENTS: ["inpatient:read"] as Permission[],

  /**
   * GET /api/rooms
   * Get all rooms
   */
  GET_ROOMS: ["inpatient:read"] as Permission[],

  /**
   * POST /api/rooms
   * Create a new room
   */
  CREATE_ROOM: ["inpatient:manage_beds"] as Permission[],

  /**
   * PATCH /api/rooms
   * Update room information
   */
  UPDATE_ROOM: ["inpatient:manage_beds"] as Permission[],

  // ============================================================================
  // VITALS MANAGEMENT
  // ============================================================================

  /**
   * GET /api/inpatient/vitals
   * Get vitals history for a visit
   */
  GET_VITALS: ["inpatient:read"] as Permission[],

  /**
   * POST /api/inpatient/vitals
   * Record new vital signs
   */
  RECORD_VITALS: ["inpatient:write"] as Permission[],

  /**
   * DELETE /api/inpatient/vitals/[id]
   * Delete a vital signs record
   */
  DELETE_VITALS: ["inpatient:write"] as Permission[],

  // ============================================================================
  // CPPT (Catatan Perkembangan Pasien Terintegrasi)
  // ============================================================================

  /**
   * GET /api/inpatient/cppt
   * Get CPPT entries for a visit
   */
  GET_CPPT: ["inpatient:read"] as Permission[],

  /**
   * POST /api/inpatient/cppt
   * Create new CPPT entry
   */
  CREATE_CPPT: ["inpatient:write"] as Permission[],

  /**
   * PATCH /api/inpatient/cppt/[id]
   * Update CPPT entry
   */
  UPDATE_CPPT: ["inpatient:write"] as Permission[],

  /**
   * DELETE /api/inpatient/cppt/[id]
   * Delete CPPT entry
   */
  DELETE_CPPT: ["inpatient:write"] as Permission[],

  // ============================================================================
  // PATIENT MANAGEMENT
  // ============================================================================

  /**
   * GET /api/inpatient/patients
   * Get list of inpatients
   */
  GET_INPATIENTS: ["inpatient:read"] as Permission[],

  /**
   * GET /api/inpatient/patients/[visitId]
   * Get detailed inpatient information
   */
  GET_INPATIENT_DETAIL: ["inpatient:read"] as Permission[],

  // ============================================================================
  // PRESCRIPTIONS
  // ============================================================================

  /**
   * POST /api/inpatient/prescriptions
   * Create new prescription for inpatient
   */
  CREATE_PRESCRIPTION: ["prescriptions:write"] as Permission[],

  /**
   * DELETE /api/inpatient/prescriptions/[id]
   * Delete a prescription
   */
  DELETE_PRESCRIPTION: ["prescriptions:write"] as Permission[],

  /**
   * POST /api/inpatient/prescriptions/administer
   * Record medication administration (nurse administering to patient)
   */
  ADMINISTER_MEDICATION: ["inpatient:write"] as Permission[],

  // ============================================================================
  // PROCEDURES
  // ============================================================================

  /**
   * POST /api/inpatient/procedures
   * Create new procedure record
   */
  CREATE_PROCEDURE: ["inpatient:write"] as Permission[],

  /**
   * DELETE /api/inpatient/procedures/[id]
   * Delete a procedure
   */
  DELETE_PROCEDURE: ["inpatient:write"] as Permission[],

  /**
   * PATCH /api/inpatient/procedures/status
   * Update procedure status (e.g., scheduled -> completed)
   */
  UPDATE_PROCEDURE_STATUS: ["inpatient:write"] as Permission[],

  // ============================================================================
  // MATERIALS
  // ============================================================================

  /**
   * GET /api/materials
   * Get material usage records
   */
  GET_MATERIALS: ["inpatient:read"] as Permission[],

  /**
   * POST /api/materials
   * Record material usage
   */
  RECORD_MATERIAL: ["inpatient:write"] as Permission[],

  /**
   * DELETE /api/materials/[id]
   * Delete material usage record
   */
  DELETE_MATERIAL: ["inpatient:write"] as Permission[],

  // ============================================================================
  // DISCHARGE
  // ============================================================================

  /**
   * POST /api/inpatient/complete-discharge
   * Complete inpatient discharge process
   * Creates billing and updates visit status
   */
  COMPLETE_DISCHARGE: ["discharge:write"] as Permission[],
} as const

/**
 * Role access summary for inpatient module:
 *
 * NURSE:
 * - Can read all inpatient data
 * - Can write vitals, CPPT, materials, procedures
 * - Can manage beds (assign, transfer)
 * - Can administer medications
 * - Cannot create/delete prescriptions (doctor only)
 * - Cannot complete discharge (doctor only)
 *
 * DOCTOR:
 * - Can read all inpatient data
 * - Can write vitals, CPPT, materials, procedures
 * - Can create/delete prescriptions
 * - Can complete discharge
 * - Cannot manage beds directly (nurse responsibility)
 *
 * ADMIN:
 * - Can read all inpatient data
 * - Cannot write/modify (read-only access for reporting)
 *
 * SUPER_ADMIN:
 * - Full access to all inpatient operations
 */
