'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useItem, useDeleteItem } from '@/hooks/use-items'
import { toast } from 'sonner'

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: item, isLoading, error } = useItem(id)
  const deleteItem = useDeleteItem()
  const router = useRouter()

  if (isLoading) return <p>Loading...</p>
  if (error) return <p className="text-red-500">Error: {error.message}</p>
  if (!item) return <p>Item not found</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{item.title}</h1>
        <div className="flex gap-2">
          <Link href={`/items/${id}/edit`} className="rounded-lg border px-3 py-1 hover:bg-zinc-50">
            Edit
          </Link>
          <button
            onClick={() =>
              deleteItem.mutate(id, {
                onSuccess: () => {
                  toast.success('Item deleted')
                  router.push('/items')
                },
              })
            }
            className="rounded-lg border border-red-200 px-3 py-1 text-red-500 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
      {item.description && <p className="text-zinc-600">{item.description}</p>}
      <p className="text-sm text-zinc-400">Created: {new Date(item.createdAt).toLocaleDateString()}</p>
      <Link href="/items" className="text-blue-600 hover:underline">
        &larr; Back to items
      </Link>
    </div>
  )
}
