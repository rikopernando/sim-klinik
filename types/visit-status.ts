/**
 * Visit Status Types and State Machine
 * Defines valid visit statuses and allowed transitions
 */

/**
 * All possible visit statuses
 */
export type VisitStatus =
    | "registered"        // Patient just registered, waiting for queue
    | "waiting"          // In queue, waiting to be called
    | "in_examination"   // Currently being examined by doctor
    | "examined"         // Examination completed, medical record created
    | "ready_for_billing" // Medical record locked, ready for billing
    | "billed"           // Billing has been created
    | "paid"             // Payment completed
    | "completed"        // Visit fully completed (for outpatient after payment, for inpatient after discharge)
    | "cancelled";       // Visit cancelled

/**
 * Visit Status Display Information
 */
export const VISIT_STATUS_INFO: Record<VisitStatus, {
    label: string;
    labelId: string;
    description: string;
    color: string;
    bgColor: string;
}> = {
    registered: {
        label: "Terdaftar",
        labelId: "Registered",
        description: "Pasien baru saja terdaftar",
        color: "text-blue-700",
        bgColor: "bg-blue-100",
    },
    waiting: {
        label: "Menunggu",
        labelId: "Waiting",
        description: "Menunggu di antrian",
        color: "text-yellow-700",
        bgColor: "bg-yellow-100",
    },
    in_examination: {
        label: "Dalam Pemeriksaan",
        labelId: "In Examination",
        description: "Sedang diperiksa oleh dokter",
        color: "text-purple-700",
        bgColor: "bg-purple-100",
    },
    examined: {
        label: "Sudah Diperiksa",
        labelId: "Examined",
        description: "Pemeriksaan selesai, rekam medis dibuat",
        color: "text-indigo-700",
        bgColor: "bg-indigo-100",
    },
    ready_for_billing: {
        label: "Siap Billing",
        labelId: "Ready for Billing",
        description: "Rekam medis dikunci, siap untuk billing",
        color: "text-cyan-700",
        bgColor: "bg-cyan-100",
    },
    billed: {
        label: "Sudah di-Billing",
        labelId: "Billed",
        description: "Billing telah dibuat",
        color: "text-teal-700",
        bgColor: "bg-teal-100",
    },
    paid: {
        label: "Sudah Dibayar",
        labelId: "Paid",
        description: "Pembayaran selesai",
        color: "text-green-700",
        bgColor: "bg-green-100",
    },
    completed: {
        label: "Selesai",
        labelId: "Completed",
        description: "Kunjungan sepenuhnya selesai",
        color: "text-gray-700",
        bgColor: "bg-gray-100",
    },
    cancelled: {
        label: "Dibatalkan",
        labelId: "Cancelled",
        description: "Kunjungan dibatalkan",
        color: "text-red-700",
        bgColor: "bg-red-100",
    },
};

/**
 * State Machine: Valid status transitions
 * Maps current status to allowed next statuses
 */
export const VISIT_STATUS_TRANSITIONS: Record<VisitStatus, VisitStatus[]> = {
    registered: ["waiting", "cancelled"],
    waiting: ["in_examination", "cancelled"],
    in_examination: ["examined", "waiting", "cancelled"], // Can go back to waiting if doctor is not available
    examined: ["ready_for_billing", "in_examination", "cancelled"], // Can go back to examination if needed
    ready_for_billing: ["billed", "cancelled"],
    billed: ["paid", "cancelled"],
    paid: ["completed"],
    completed: [], // Terminal state - no further transitions
    cancelled: [], // Terminal state - no further transitions
};

/**
 * Validate if a status transition is allowed
 */
export function isValidStatusTransition(
    currentStatus: VisitStatus,
    newStatus: VisitStatus
): boolean {
    const allowedTransitions = VISIT_STATUS_TRANSITIONS[currentStatus];
    return allowedTransitions.includes(newStatus);
}

/**
 * Get allowed next statuses for a given current status
 */
export function getAllowedNextStatuses(currentStatus: VisitStatus): VisitStatus[] {
    return VISIT_STATUS_TRANSITIONS[currentStatus];
}

/**
 * Check if status is terminal (no further transitions allowed)
 */
export function isTerminalStatus(status: VisitStatus): boolean {
    return VISIT_STATUS_TRANSITIONS[status].length === 0;
}

/**
 * Get status transition error message
 */
export function getStatusTransitionError(
    currentStatus: VisitStatus,
    attemptedStatus: VisitStatus
): string {
    if (currentStatus === attemptedStatus) {
        return `Visit is already in status: ${VISIT_STATUS_INFO[currentStatus].label}`;
    }

    if (isTerminalStatus(currentStatus)) {
        return `Cannot change status from terminal state: ${VISIT_STATUS_INFO[currentStatus].label}`;
    }

    const allowed = getAllowedNextStatuses(currentStatus);
    const allowedLabels = allowed.map(s => VISIT_STATUS_INFO[s].label).join(", ");

    return `Invalid status transition from "${VISIT_STATUS_INFO[currentStatus].label}" to "${VISIT_STATUS_INFO[attemptedStatus].label}". Allowed transitions: ${allowedLabels}`;
}

/**
 * Visit type specific initial status
 */
export function getInitialVisitStatus(visitType: "outpatient" | "inpatient" | "emergency"): VisitStatus {
    switch (visitType) {
        case "emergency":
            // Emergency patients go straight to examination after triage
            return "registered";
        case "outpatient":
        case "inpatient":
        default:
            return "registered";
    }
}

/**
 * Check if visit can be billed (for billing module)
 */
export function canCreateBilling(status: VisitStatus): boolean {
    return status === "ready_for_billing" || status === "billed";
}

/**
 * Check if visit can be completed/discharged
 */
export function canCompleteVisit(status: VisitStatus): boolean {
    return status === "paid";
}

/**
 * Check if medical record can be created
 */
export function canCreateMedicalRecord(status: VisitStatus): boolean {
    // Can create medical record when patient is being examined
    return status === "in_examination" || status === "examined";
}

/**
 * Check if medical record can be locked
 */
export function canLockMedicalRecord(status: VisitStatus): boolean {
    // Can lock when examined but not yet ready for billing
    return status === "examined";
}
