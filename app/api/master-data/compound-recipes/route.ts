/**
 * Compound Recipes API Route
 * GET /api/master-data/compound-recipes - Get all compound recipes
 * POST /api/master-data/compound-recipes - Create a new compound recipe
 */

import { z } from "zod"
import { eq, and, or, ilike, count, desc, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { compoundRecipes } from "@/db/schema/inventory"
import { user } from "@/db/schema/auth"
import { createCompoundRecipeSchema } from "@/lib/validations/compound-recipe"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { withRBAC } from "@/lib/rbac/middleware"
import type { CompoundRecipeWithCreator } from "@/types/compound-recipe"

/**
 * Generate next compound recipe code (CR-001, CR-002, etc.)
 */
async function generateNextCode(): Promise<string> {
  const [lastRecipe] = await db
    .select({ code: compoundRecipes.code })
    .from(compoundRecipes)
    .where(sql`${compoundRecipes.code} LIKE 'CR-%'`)
    .orderBy(desc(compoundRecipes.code))
    .limit(1)

  if (!lastRecipe) {
    return "CR-001"
  }

  // Extract number from code (e.g., "CR-001" → 1)
  const match = lastRecipe.code.match(/CR-(\d+)/)
  const nextNumber = match ? parseInt(match[1], 10) + 1 : 1
  return `CR-${nextNumber.toString().padStart(3, "0")}`
}

/**
 * Get all compound recipes with pagination, search, and filters
 */
export const GET = withRBAC(
  async (req: NextRequest) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)))
      const offset = (page - 1) * limit
      const search = searchParams.get("search") || ""
      const isActiveParam = searchParams.get("isActive")

      // Build conditions
      const conditions = []

      // Filter by isActive
      if (isActiveParam === "true") {
        conditions.push(eq(compoundRecipes.isActive, true))
      } else if (isActiveParam === "false") {
        conditions.push(eq(compoundRecipes.isActive, false))
      }

      // Search by name or code
      if (search) {
        const q = `%${search}%`
        conditions.push(or(ilike(compoundRecipes.name, q), ilike(compoundRecipes.code, q)))
      }

      const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

      // Get total count
      const [{ count: total }] = await db
        .select({ count: count() })
        .from(compoundRecipes)
        .where(whereCondition)

      // Fetch paginated recipes with creator info
      const recipes = await db
        .select({
          id: compoundRecipes.id,
          code: compoundRecipes.code,
          name: compoundRecipes.name,
          description: compoundRecipes.description,
          composition: compoundRecipes.composition,
          defaultInstructions: compoundRecipes.defaultInstructions,
          defaultFrequency: compoundRecipes.defaultFrequency,
          price: compoundRecipes.price,
          isActive: compoundRecipes.isActive,
          createdBy: compoundRecipes.createdBy,
          createdAt: compoundRecipes.createdAt,
          updatedAt: compoundRecipes.updatedAt,
          creatorId: user.id,
          creatorName: user.name,
        })
        .from(compoundRecipes)
        .leftJoin(user, eq(compoundRecipes.createdBy, user.id))
        .where(whereCondition)
        .orderBy(desc(compoundRecipes.createdAt))
        .limit(limit)
        .offset(offset)

      // Transform to include creator object
      const transformedRecipes: CompoundRecipeWithCreator[] = recipes.map((recipe) => ({
        id: recipe.id,
        code: recipe.code,
        name: recipe.name,
        description: recipe.description,
        composition: recipe.composition,
        defaultInstructions: recipe.defaultInstructions,
        defaultFrequency: recipe.defaultFrequency,
        price: recipe.price,
        isActive: recipe.isActive,
        createdBy: recipe.createdBy,
        createdAt: recipe.createdAt,
        updatedAt: recipe.updatedAt,
        creator: recipe.creatorId
          ? {
              id: recipe.creatorId,
              name: recipe.creatorName || "",
            }
          : null,
      }))

      const response: ResponseApi<CompoundRecipeWithCreator[]> = {
        message: "Compound recipes fetched successfully",
        data: transformedRecipes,
        status: HTTP_STATUS_CODES.OK,
        meta: {
          page,
          limit,
          total,
          hasMore: total > page * limit,
        },
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching compound recipes:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to fetch compound recipes",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["pharmacy:read"] }
)

/**
 * Create a new compound recipe
 */
export const POST = withRBAC(
  async (req: NextRequest, { user: currentUser }) => {
    try {
      const body = await req.json()

      // Validate request body
      const validated = createCompoundRecipeSchema.parse(body)

      // Check if name already exists
      const existingName = await db
        .select()
        .from(compoundRecipes)
        .where(ilike(compoundRecipes.name, validated.name))
        .limit(1)

      if (existingName.length > 0) {
        const response: ResponseError<null> = {
          error: null,
          message: "Nama obat racik sudah digunakan",
          status: HTTP_STATUS_CODES.CONFLICT,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.CONFLICT,
        })
      }

      // Auto-generate code
      const generatedCode = await generateNextCode()

      // Create new compound recipe
      const [newRecipe] = await db
        .insert(compoundRecipes)
        .values({
          code: generatedCode,
          name: validated.name,
          description: validated.description,
          composition: validated.composition,
          defaultInstructions: validated.defaultInstructions,
          defaultFrequency: validated.defaultFrequency,
          price: validated.price?.toString(),
          createdBy: currentUser.id,
        })
        .returning()

      const response: ResponseApi<typeof newRecipe> = {
        message: "Obat racik berhasil ditambahkan",
        data: newRecipe,
        status: HTTP_STATUS_CODES.CREATED,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ResponseError<typeof error.issues> = {
          error: error.issues,
          message: "Validasi gagal",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      console.error("Error creating compound recipe:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Gagal menambahkan obat racik",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["pharmacy:manage_inventory"] }
)
