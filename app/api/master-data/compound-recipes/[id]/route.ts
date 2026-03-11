/**
 * Compound Recipes API Route - Single Item Operations
 * GET /api/master-data/compound-recipes/[id] - Get a compound recipe by ID
 * PATCH /api/master-data/compound-recipes/[id] - Update a compound recipe
 * DELETE /api/master-data/compound-recipes/[id] - Delete a compound recipe
 */

import { z } from "zod"
import { eq, ilike, and, ne } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { compoundRecipes } from "@/db/schema/inventory"
import { user } from "@/db/schema/auth"
import { updateCompoundRecipeSchema } from "@/lib/validations/compound-recipe"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { withRBAC } from "@/lib/rbac/middleware"
import type { CompoundRecipeWithCreator } from "@/types/compound-recipe"

type Params = {
  id: string
}

/**
 * Get a compound recipe by ID
 */
export const GET = withRBAC<Params>(
  async (_req: NextRequest, { params }) => {
    try {
      const { id } = params

      // Fetch recipe with creator info
      const [recipe] = await db
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
        .where(eq(compoundRecipes.id, id))
        .limit(1)

      if (!recipe) {
        const response: ResponseError<null> = {
          error: null,
          message: "Obat racik tidak ditemukan",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.NOT_FOUND,
        })
      }

      // Transform to include creator object
      const transformedRecipe: CompoundRecipeWithCreator = {
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
      }

      const response: ResponseApi<CompoundRecipeWithCreator> = {
        message: "Compound recipe fetched successfully",
        data: transformedRecipe,
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching compound recipe:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to fetch compound recipe",
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
 * Update a compound recipe
 */
export const PATCH = withRBAC<Params>(
  async (req: NextRequest, { params }) => {
    try {
      const { id } = params
      const body = await req.json()

      // Validate request body
      const validated = updateCompoundRecipeSchema.parse(body)

      // Check if recipe exists
      const [existingRecipe] = await db
        .select()
        .from(compoundRecipes)
        .where(eq(compoundRecipes.id, id))
        .limit(1)

      if (!existingRecipe) {
        const response: ResponseError<null> = {
          error: null,
          message: "Obat racik tidak ditemukan",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.NOT_FOUND,
        })
      }

      // Check if code is being updated and already exists
      if (validated.code && validated.code !== existingRecipe.code) {
        const codeExists = await db
          .select()
          .from(compoundRecipes)
          .where(and(ilike(compoundRecipes.code, validated.code), ne(compoundRecipes.id, id)))
          .limit(1)

        if (codeExists.length > 0) {
          const response: ResponseError<null> = {
            error: null,
            message: "Kode obat racik sudah digunakan",
            status: HTTP_STATUS_CODES.CONFLICT,
          }
          return NextResponse.json(response, {
            status: HTTP_STATUS_CODES.CONFLICT,
          })
        }
      }

      // Check if name is being updated and already exists
      if (validated.name && validated.name !== existingRecipe.name) {
        const nameExists = await db
          .select()
          .from(compoundRecipes)
          .where(and(ilike(compoundRecipes.name, validated.name), ne(compoundRecipes.id, id)))
          .limit(1)

        if (nameExists.length > 0) {
          const response: ResponseError<null> = {
            error: null,
            message: "Nama obat racik sudah digunakan",
            status: HTTP_STATUS_CODES.CONFLICT,
          }
          return NextResponse.json(response, {
            status: HTTP_STATUS_CODES.CONFLICT,
          })
        }
      }

      // Build update object
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      }

      if (validated.code !== undefined) updateData.code = validated.code
      if (validated.name !== undefined) updateData.name = validated.name
      if (validated.description !== undefined) updateData.description = validated.description
      if (validated.composition !== undefined) updateData.composition = validated.composition
      if (validated.defaultInstructions !== undefined)
        updateData.defaultInstructions = validated.defaultInstructions
      if (validated.defaultFrequency !== undefined)
        updateData.defaultFrequency = validated.defaultFrequency
      if (validated.price !== undefined)
        updateData.price = validated.price !== null ? validated.price.toString() : null
      if (validated.isActive !== undefined) updateData.isActive = validated.isActive

      // Update recipe
      const [updatedRecipe] = await db
        .update(compoundRecipes)
        .set(updateData)
        .where(eq(compoundRecipes.id, id))
        .returning()

      const response: ResponseApi<typeof updatedRecipe> = {
        message: "Obat racik berhasil diperbarui",
        data: updatedRecipe,
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
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

      console.error("Error updating compound recipe:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Gagal memperbarui obat racik",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["pharmacy:manage_inventory"] }
)

/**
 * Delete a compound recipe (soft delete by setting isActive to false)
 */
export const DELETE = withRBAC<Params>(
  async (_req: NextRequest, { params }) => {
    try {
      const { id } = params

      // Check if recipe exists
      const [existingRecipe] = await db
        .select()
        .from(compoundRecipes)
        .where(eq(compoundRecipes.id, id))
        .limit(1)

      if (!existingRecipe) {
        const response: ResponseError<null> = {
          error: null,
          message: "Obat racik tidak ditemukan",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.NOT_FOUND,
        })
      }

      // Soft delete: set isActive to false
      await db
        .update(compoundRecipes)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(compoundRecipes.id, id))

      const response: ResponseApi<null> = {
        message: "Obat racik berhasil dihapus",
        data: null,
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error deleting compound recipe:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Gagal menghapus obat racik",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["pharmacy:manage_inventory"] }
)
