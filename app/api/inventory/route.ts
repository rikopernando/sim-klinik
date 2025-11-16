/**
 * Drug Inventory Management API
 * Handles stock in/out, batch tracking, and expiry management
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { drugInventorySchema, stockAdjustmentSchema } from "@/lib/pharmacy/validation";
import {
    getAllDrugInventory,
    getDrugInventoryByDrugId,
    addDrugInventory,
    adjustStock,
    getStockMovements,
} from "@/lib/pharmacy/api-service";
import { APIResponse } from "@/types/pharmacy";

/**
 * GET /api/inventory
 * Get all drug inventory or filter by drug ID
 * Query params:
 * - drugId: number (optional) - filter by specific drug
 * - movements: number (optional) - get stock movements for specific inventory
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const drugId = searchParams.get("drugId");
        const movementsId = searchParams.get("movements");

        // Get stock movements for specific inventory
        if (movementsId) {
            const inventoryId = parseInt(movementsId);
            if (isNaN(inventoryId)) {
                const response: APIResponse = {
                    success: false,
                    error: "Invalid inventory ID",
                };
                return NextResponse.json(response, { status: 400 });
            }

            const movements = await getStockMovements(inventoryId);

            const response: APIResponse = {
                success: true,
                data: movements,
                count: movements.length,
            };
            return NextResponse.json(response);
        }

        // Get inventory by drug ID
        if (drugId) {
            const id = parseInt(drugId);
            if (isNaN(id)) {
                const response: APIResponse = {
                    success: false,
                    error: "Invalid drug ID",
                };
                return NextResponse.json(response, { status: 400 });
            }

            const inventories = await getDrugInventoryByDrugId(id);

            const response: APIResponse = {
                success: true,
                data: inventories,
                count: inventories.length,
            };
            return NextResponse.json(response);
        }

        // Get all inventory
        const allInventory = await getAllDrugInventory();

        const response: APIResponse = {
            success: true,
            data: allInventory,
            count: allInventory.length,
        };
        return NextResponse.json(response);
    } catch (error) {
        console.error("Inventory fetch error:", error);

        const response: APIResponse = {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch inventory",
        };
        return NextResponse.json(response, { status: 500 });
    }
}

/**
 * POST /api/inventory
 * Add new drug inventory (stock in)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = drugInventorySchema.parse(body);

        // Add inventory
        const newInventory = await addDrugInventory(validatedData);

        const response: APIResponse = {
            success: true,
            message: "Stock added successfully",
            data: newInventory,
        };
        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const response: APIResponse = {
                success: false,
                error: "Validation error",
                details: error.issues,
            };
            return NextResponse.json(response, { status: 400 });
        }

        console.error("Inventory creation error:", error);

        const response: APIResponse = {
            success: false,
            error: error instanceof Error ? error.message : "Failed to add inventory",
        };
        return NextResponse.json(response, { status: 500 });
    }
}

/**
 * PATCH /api/inventory
 * Adjust stock quantity (manual adjustment)
 */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = stockAdjustmentSchema.parse(body);

        // Adjust stock
        const result = await adjustStock(validatedData);

        const response: APIResponse = {
            success: true,
            message: "Stock adjusted successfully",
            data: result,
        };
        return NextResponse.json(response);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const response: APIResponse = {
                success: false,
                error: "Validation error",
                details: error.issues,
            };
            return NextResponse.json(response, { status: 400 });
        }

        console.error("Stock adjustment error:", error);

        const response: APIResponse = {
            success: false,
            error: error instanceof Error ? error.message : "Failed to adjust stock",
        };
        return NextResponse.json(
            response,
            {
                status:
                    error instanceof Error &&
                    (error.message === "Inventory not found" ||
                        error.message === "Stock cannot be negative")
                        ? 400
                        : 500,
            }
        );
    }
}
