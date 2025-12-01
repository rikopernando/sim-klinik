/**
 * Billing Details Hook
 * Fetches billing details for a specific visit
 */

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface BillingItem {
    id: number;
    itemType: string;
    itemId: number | null;
    itemName: string;
    itemCode: string | null;
    quantity: number;
    unitPrice: string;
    subtotal: string;
    discount: string;
    totalPrice: string;
    description: string | null;
}

interface Payment {
    id: number;
    amount: string;
    paymentMethod: string;
    paymentReference: string | null;
    amountReceived: string | null;
    changeGiven: string | null;
    receivedBy: string;
    receivedAt: Date;
    notes: string | null;
}

interface Billing {
    id: number;
    visitId: number;
    subtotal: string;
    discount: string;
    discountPercentage: string | null;
    tax: string;
    totalAmount: string;
    insuranceCoverage: string;
    patientPayable: string;
    paymentStatus: string;
    paidAmount: string;
    remainingAmount: string;
    paymentMethod: string | null;
    paymentReference: string | null;
    processedBy: string | null;
    processedAt: Date | null;
    notes: string | null;
}

interface BillingDetails {
    billing: Billing;
    items: BillingItem[];
    payments: Payment[];
}

export function useBillingDetails(visitId: number | null) {
    const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBillingDetails = useCallback(async () => {
        if (!visitId) {
            setBillingDetails(null);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await axios.get(`/api/billing/${visitId}`);

            if (response.data.success) {
                setBillingDetails(response.data.data);
            } else {
                setError(response.data.error || "Failed to fetch billing details");
            }
        } catch (err) {
            console.error("Billing details fetch error:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch billing details");
        } finally {
            setIsLoading(false);
        }
    }, [visitId]);

    useEffect(() => {
        fetchBillingDetails();
    }, [fetchBillingDetails]);

    const refresh = useCallback(() => {
        fetchBillingDetails();
    }, [fetchBillingDetails]);

    return {
        billingDetails,
        isLoading,
        error,
        refresh,
    };
}
