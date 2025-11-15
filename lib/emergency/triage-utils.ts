/**
 * Triage Utility Functions
 * Centralized logic for triage handling
 */

import { TriageStatus, TriageConfig, TRIAGE_LEVELS } from "@/types/emergency";

/**
 * Triage Configuration Map
 */
export const TRIAGE_CONFIG: Record<string, TriageConfig> = {
    red: {
        status: TRIAGE_LEVELS.RED,
        label: "MERAH - Gawat Darurat",
        emoji: "🔴",
        description: "Immediate - Pasien memerlukan penanganan segera",
        color: "red",
        bgColor: "bg-red-50",
        borderColor: "border-red-600",
        textColor: "text-red-700",
        priority: 1,
    },
    yellow: {
        status: TRIAGE_LEVELS.YELLOW,
        label: "KUNING - Urgent",
        emoji: "🟡",
        description: "Urgent - Pasien memerlukan penanganan dalam waktu dekat",
        color: "yellow",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-500",
        textColor: "text-yellow-700",
        priority: 2,
    },
    green: {
        status: TRIAGE_LEVELS.GREEN,
        label: "HIJAU - Non-Urgent",
        emoji: "🟢",
        description: "Non-Urgent - Pasien dapat menunggu",
        color: "green",
        bgColor: "bg-green-50",
        borderColor: "border-green-600",
        textColor: "text-green-700",
        priority: 3,
    },
    untriaged: {
        status: null,
        label: "Belum Triage",
        emoji: "⚪",
        description: "Pasien belum dilakukan triage",
        color: "gray",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-300",
        textColor: "text-gray-600",
        priority: 4,
    },
};

/**
 * Get triage configuration by status
 */
export function getTriageConfig(status: TriageStatus | null): TriageConfig {
    if (!status) return TRIAGE_CONFIG.untriaged;
    return TRIAGE_CONFIG[status] || TRIAGE_CONFIG.untriaged;
}

/**
 * Get triage badge color classes
 */
export function getTriageBadgeColor(status: TriageStatus | null): string {
    const config = getTriageConfig(status);
    return `bg-${config.color}-600 hover:bg-${config.color}-700 text-white`;
}

/**
 * Get triage label with emoji
 */
export function getTriageLabel(status: TriageStatus | null): string {
    const config = getTriageConfig(status);
    return `${config.emoji} ${config.label}`;
}

/**
 * Get triage priority for sorting
 */
export function getTriagePriority(status: TriageStatus | null): number {
    const config = getTriageConfig(status);
    return config.priority;
}

/**
 * Get triage card classes (for highlighting queue items)
 */
export function getTriageCardClasses(status: TriageStatus | null): string {
    if (!status) return "";

    const config = getTriageConfig(status);
    return `border-l-4 ${config.borderColor} ${config.bgColor}/50`;
}

/**
 * Get triage statistics color classes
 */
export function getTriageStatColor(status: TriageStatus): {
    card: string;
    text: string;
    bg: string;
} {
    const config = getTriageConfig(status);
    return {
        card: `border-${config.color}-200 bg-${config.color}-50`,
        text: config.textColor,
        bg: config.bgColor,
    };
}

/**
 * Sort queue items by triage priority and arrival time
 */
export function sortByTriagePriority<T extends { visit: { triageStatus: TriageStatus | null; arrivalTime: string } }>(
    items: T[]
): T[] {
    return [...items].sort((a, b) => {
        // First, sort by triage priority
        const priorityDiff =
            getTriagePriority(a.visit.triageStatus) - getTriagePriority(b.visit.triageStatus);

        if (priorityDiff !== 0) return priorityDiff;

        // If same priority, sort by arrival time (earliest first)
        return (
            new Date(a.visit.arrivalTime).getTime() - new Date(b.visit.arrivalTime).getTime()
        );
    });
}

/**
 * Validate triage status
 */
export function isValidTriageStatus(status: string): status is TriageStatus {
    return status === "red" || status === "yellow" || status === "green";
}
