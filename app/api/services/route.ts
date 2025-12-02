/**
 * Services API
 * GET /api/services
 * Search and retrieve services (for procedure autocomplete)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema/billing";
import { ilike, and, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get("search") || "";
        const serviceType = searchParams.get("serviceType") || "procedure";

        // Build where conditions
        const conditions = [
            eq(services.isActive, true),
            eq(services.serviceType, serviceType),
        ];

        // Add search condition if query exists
        if (search) {
            conditions.push(ilike(services.name, `%${search}%`));
        }

        // Query services
        const result = await db
            .select({
                id: services.id,
                code: services.code,
                name: services.name,
                serviceType: services.serviceType,
                price: services.price,
                description: services.description,
                category: services.category,
            })
            .from(services)
            .where(and(...conditions))
            .limit(20)
            .orderBy(services.name);

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Services search error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to search services",
            },
            { status: 500 }
        );
    }
}
