import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { or, like, sql } from "drizzle-orm";

/**
 * GET /api/patients/search
 * Search for patients by NIK, MR Number, or Name
 * Query params: q (search query)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("q");

        if (!query || query.trim().length < 2) {
            return NextResponse.json(
                { error: "Search query must be at least 2 characters" },
                { status: 400 }
            );
        }

        const searchTerm = `%${query.trim()}%`;

        // Search by NIK, MR Number, or Name
        const results = await db
            .select({
                id: patients.id,
                mrNumber: patients.mrNumber,
                nik: patients.nik,
                name: patients.name,
                dateOfBirth: patients.dateOfBirth,
                gender: patients.gender,
                phone: patients.phone,
                address: patients.address,
                insuranceType: patients.insuranceType,
            })
            .from(patients)
            .where(
                or(
                    like(patients.nik, searchTerm),
                    like(patients.mrNumber, searchTerm),
                    sql`LOWER(${patients.name}) LIKE LOWER(${searchTerm})`
                )
            )
            .limit(20) // Limit results for performance
            .orderBy(patients.name);

        return NextResponse.json({
            success: true,
            data: results,
            count: results.length,
        });
    } catch (error) {
        console.error("Patient search error:", error);
        return NextResponse.json(
            { error: "Failed to search patients" },
            { status: 500 }
        );
    }
}
