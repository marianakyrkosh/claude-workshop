import type { PaginationMeta, PaginatedResponse } from '@repo/types'
import { PaginationDto } from './pagination.dto'

export type { PaginationMeta, PaginatedResponse }

export async function paginate<T>(
  delegate: { count: (args?: any) => Promise<number>; findMany: (args?: any) => Promise<T[]> },
  args: Record<string, any>,
  pagination: PaginationDto,
): Promise<PaginatedResponse<T>> {
  const { page, limit } = pagination
  const skip = (page - 1) * limit

  const [total, data] = await Promise.all([
    delegate.count({ where: args.where }),
    delegate.findMany({ ...args, skip, take: limit }),
  ])

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}
