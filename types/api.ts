import { z } from "zod"

export interface Pagination {
  totalPages: number
  currentPage: number
  perPage: number
  totalItems: number
}

export interface ResponseApi<T = null> {
  message: string
  data?: T
  status: number
  pagination?: Pagination
}

export interface ResponseError<T = unknown> {
  error: T
  status: number
  message: string
}

export const paginationSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
})

export type PaginationParams = z.infer<typeof paginationSchema>
