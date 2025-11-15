import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { drugs } from "@/db/schema";
import { like, or } from "drizzle-orm";

/**
 * GET /api/drugs?search=paracetamol
 * Search for drugs by name or generic name
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get("search");

        if (search && search.length >= 2) {
            // Search drugs by name or generic name
            const searchPattern = `%${search}%`;
            const results = await db
                .select()
                .from(drugs)
                .where(
                    or(
                        like(drugs.name, searchPattern),
                        like(drugs.genericName, searchPattern)
                    )
                )
                .limit(20);

            return NextResponse.json({
                success: true,
                data: results,
            });
        }

        // Return all active drugs if no search query
        const allDrugs = await db
            .select()
            .from(drugs)
            .limit(50);

        return NextResponse.json({
            success: true,
            data: allDrugs,
        });
    } catch (error) {
        console.error("Drug search error:", error);
        return NextResponse.json(
            { error: "Failed to search drugs" },
            { status: 500 }
        );
    }
}
