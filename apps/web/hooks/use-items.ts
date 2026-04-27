import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { env } from '@/config/env'
import type { PaginatedResponse } from '@repo/types'

interface Item {
  id: string
  title: string
  description: string | null
  createdAt: string
  updatedAt: string
}

const API = env.API_URL

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Request failed with status ${res.status}`)
  }
  return res.json()
}

export function useItems(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['items', page, limit],
    queryFn: () => fetchJson<PaginatedResponse<Item>>(`${API}/items?page=${page}&limit=${limit}`),
  })
}

export function useItem(id: string) {
  return useQuery({
    queryKey: ['items', id],
    queryFn: () => fetchJson<Item>(`${API}/items/${id}`),
    enabled: !!id,
  })
}

export function useCreateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; description?: string }) =>
      fetchJson<Item>(`${API}/items`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  })
}

export function useUpdateItem(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { title?: string; description?: string }) =>
      fetchJson<Item>(`${API}/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: ['items', id] })
    },
  })
}

export function useDeleteItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchJson<Item>(`${API}/items/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  })
}
