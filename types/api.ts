import { z } from "zod"

export interface Meta {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ResponseApi<T = null> {
  message: string
  data?: T
  status: number
  meta?: Meta
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
