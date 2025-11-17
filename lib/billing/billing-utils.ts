/**
 * Billing Module Utility Functions
 * Calculations, formatting, and status helpers
 */

import type { PaymentStatus, BillingItem } from "@/types/billing";

/**
 * Format currency (IDR)
 */
export function formatCurrency(amount: string | number): string {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return `Rp ${numAmount.toLocaleString("id-ID")}`;
}

/**
 * Parse currency string to number
 */
export function parseCurrency(currencyString: string): number {
    return parseFloat(currencyString.replace(/[^0-9.-]+/g, "")) || 0;
}

/**
 * Calculate item total price (quantity * unitPrice - discount)
 */
export function calculateItemTotal(
    quantity: number,
    unitPrice: string | number,
    discount: string | number = 0
): string {
    const price = typeof unitPrice === "string" ? parseFloat(unitPrice) : unitPrice;
    const disc = typeof discount === "string" ? parseFloat(discount) : discount;
    const subtotal = quantity * price;
    const total = subtotal - disc;
    return total.toFixed(2);
}

/**
 * Calculate billing subtotal from items
 */
export function calculateSubtotal(items: BillingItem[]): string {
    const total = items.reduce((sum, item) => {
        return sum + parseFloat(item.totalPrice);
    }, 0);
    return total.toFixed(2);
}

/**
 * Calculate discount amount from percentage
 */
export function calculateDiscountFromPercentage(
    subtotal: string | number,
    percentage: string | number
): string {
    const sub = typeof subtotal === "string" ? parseFloat(subtotal) : subtotal;
    const pct = typeof percentage === "string" ? parseFloat(percentage) : percentage;
    const discount = (sub * pct) / 100;
    return discount.toFixed(2);
}

/**
 * Calculate total amount (subtotal - discount + tax)
 */
export function calculateTotalAmount(
    subtotal: string | number,
    discount: string | number = 0,
    tax: string | number = 0
): string {
    const sub = typeof subtotal === "string" ? parseFloat(subtotal) : subtotal;
    const disc = typeof discount === "string" ? parseFloat(discount) : discount;
    const t = typeof tax === "string" ? parseFloat(tax) : tax;
    const total = sub - disc + t;
    return total.toFixed(2);
}

/**
 * Calculate patient payable amount (total - insurance coverage)
 */
export function calculatePatientPayable(
    totalAmount: string | number,
    insuranceCoverage: string | number = 0
): string {
    const total = typeof totalAmount === "string" ? parseFloat(totalAmount) : totalAmount;
    const coverage =
        typeof insuranceCoverage === "string" ? parseFloat(insuranceCoverage) : insuranceCoverage;
    const payable = total - coverage;
    return payable.toFixed(2);
}

/**
 * Calculate remaining amount (patient payable - paid amount)
 */
export function calculateRemainingAmount(
    patientPayable: string | number,
    paidAmount: string | number = 0
): string {
    const payable = typeof patientPayable === "string" ? parseFloat(patientPayable) : patientPayable;
    const paid = typeof paidAmount === "string" ? parseFloat(paidAmount) : paidAmount;
    const remaining = payable - paid;
    return remaining.toFixed(2);
}

/**
 * Calculate change for cash payment
 */
export function calculateChange(
    amountReceived: string | number,
    amountDue: string | number
): string {
    const received = typeof amountReceived === "string" ? parseFloat(amountReceived) : amountReceived;
    const due = typeof amountDue === "string" ? parseFloat(amountDue) : amountDue;
    const change = received - due;
    return change >= 0 ? change.toFixed(2) : "0.00";
}

/**
 * Determine payment status based on amounts
 */
export function determinePaymentStatus(
    patientPayable: string | number,
    paidAmount: string | number
): PaymentStatus {
    const payable = typeof patientPayable === "string" ? parseFloat(patientPayable) : patientPayable;
    const paid = typeof paidAmount === "string" ? parseFloat(paidAmount) : paidAmount;

    if (paid === 0) return "pending";
    if (paid >= payable) return "paid";
    return "partial";
}

/**
 * Get payment status display info
 */
export function getPaymentStatusConfig(status: PaymentStatus): {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    badge: string;
} {
    switch (status) {
        case "paid":
            return {
                label: "LUNAS",
                color: "text-green-700",
                bgColor: "bg-green-50",
                borderColor: "border-green-500",
                badge: "bg-green-600",
            };
        case "partial":
            return {
                label: "Dibayar Sebagian",
                color: "text-yellow-700",
                bgColor: "bg-yellow-50",
                borderColor: "border-yellow-500",
                badge: "bg-yellow-600",
            };
        case "pending":
            return {
                label: "Belum Dibayar",
                color: "text-red-700",
                bgColor: "bg-red-50",
                borderColor: "border-red-500",
                badge: "bg-red-600",
            };
    }
}

/**
 * Get payment method display name
 */
export function getPaymentMethodLabel(method: string): string {
    switch (method) {
        case "cash":
            return "Tunai";
        case "transfer":
            return "Transfer Bank";
        case "card":
            return "Kartu Debit/Kredit";
        case "insurance":
            return "Asuransi";
        default:
            return method;
    }
}

/**
 * Check if billing can be discharged (billing gate)
 */
export function canDischarge(paymentStatus: PaymentStatus): boolean {
    return paymentStatus === "paid";
}

/**
 * Format date for display
 */
export function formatDate(dateString: string | null): string {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

/**
 * Format datetime for display
 */
export function formatDateTime(dateString: string | null): string {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Generate receipt number
 */
export function generateReceiptNumber(billingId: number): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const id = String(billingId).padStart(6, "0");

    return `RCP/${year}${month}${day}/${id}`;
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(
    paymentAmount: string | number,
    remainingAmount: string | number
): { valid: boolean; message?: string } {
    const payment = typeof paymentAmount === "string" ? parseFloat(paymentAmount) : paymentAmount;
    const remaining = typeof remainingAmount === "string" ? parseFloat(remainingAmount) : remainingAmount;

    if (payment <= 0) {
        return { valid: false, message: "Jumlah pembayaran harus lebih dari 0" };
    }

    if (payment > remaining) {
        return { valid: false, message: "Jumlah pembayaran melebihi sisa tagihan" };
    }

    return { valid: true };
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, total: number): number {
    if (total === 0) return 0;
    return (part / total) * 100;
}

/**
 * Group billing items by type
 */
export function groupItemsByType(items: BillingItem[]): {
    services: BillingItem[];
    drugs: BillingItem[];
    materials: BillingItem[];
    rooms: BillingItem[];
} {
    return items.reduce(
        (groups, item) => {
            switch (item.itemType) {
                case "service":
                    groups.services.push(item);
                    break;
                case "drug":
                    groups.drugs.push(item);
                    break;
                case "material":
                    groups.materials.push(item);
                    break;
                case "room":
                    groups.rooms.push(item);
                    break;
            }
            return groups;
        },
        { services: [], drugs: [], materials: [], rooms: [] } as {
            services: BillingItem[];
            drugs: BillingItem[];
            materials: BillingItem[];
            rooms: BillingItem[];
        }
    );
}

/**
 * Calculate total by item type
 */
export function calculateTotalByType(items: BillingItem[], itemType: string): string {
    const total = items
        .filter((item) => item.itemType === itemType)
        .reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
    return total.toFixed(2);
}
