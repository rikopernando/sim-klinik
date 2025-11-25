/**
 * ICD-10 Search API
 * Search ICD-10 codes by code or description
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { icd10Codes } from "@/db/schema";
import { ilike, or, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("q");
        const limit = parseInt(searchParams.get("limit") || "10", 10);

        if (!query || query.trim().length < 2) {
            return NextResponse.json({
                data: [],
                message: "Query must be at least 2 characters",
            });
        }

        // Search by code or description (case-insensitive)
        const searchPattern = `%${query}%`;

        const results = await db
            .select({
                id: icd10Codes.id,
                code: icd10Codes.code,
                description: icd10Codes.description,
                category: icd10Codes.category,
            })
            .from(icd10Codes)
            .where(
                or(
                    ilike(icd10Codes.code, searchPattern),
                    ilike(icd10Codes.description, searchPattern)
                )
            )
            .limit(Math.min(limit, 50)) // Max 50 results
            .orderBy(
                sql`
                    CASE
                        WHEN ${icd10Codes.code} ILIKE ${query + '%'} THEN 1
                        WHEN ${icd10Codes.code} ILIKE ${searchPattern} THEN 2
                        WHEN ${icd10Codes.description} ILIKE ${query + '%'} THEN 3
                        ELSE 4
                    END
                `
            );

        return NextResponse.json({
            data: results,
            count: results.length,
        });
    } catch (error) {
        console.error("ICD-10 search error:", error);
        return NextResponse.json(
            { error: "Failed to search ICD-10 codes" },
            { status: 500 }
        );
    }
}
