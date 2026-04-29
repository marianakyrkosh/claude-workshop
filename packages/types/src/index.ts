// Shared types — single source of truth for both apps/api and apps/web
// Add domain enums here as your app grows.

// Pagination — shared response contract between API and frontend

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// Items — domain entity. Dates are serialized as ISO 8601 strings on the wire.

export interface Item {
  id: string
  title: string
  description: string | null
  createdAt: string
  updatedAt: string
}
