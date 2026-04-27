'use client'

import Link from 'next/link'
import { useItems, useDeleteItem } from '@/hooks/use-items'
import { toast } from 'sonner'

export default function ItemsPage() {
  const { data, isLoading, error } = useItems()
  const deleteItem = useDeleteItem()

  if (isLoading) return <p>Loading...</p>
  if (error) return <p className="text-red-500">Error: {error.message}</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Items</h1>
        <Link href="/items/new" className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          New Item
        </Link>
      </div>

      {data?.data.length === 0 && <p className="text-zinc-500">No items yet. Create your first one!</p>}

      <ul className="space-y-3">
        {data?.data.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-lg border p-4">
            <Link href={`/items/${item.id}`} className="flex-1">
              <h2 className="font-semibold">{item.title}</h2>
              {item.description && <p className="text-sm text-zinc-500">{item.description}</p>}
            </Link>
            <button
              onClick={() => {
                deleteItem.mutate(item.id, {
                  onSuccess: () => toast.success('Item deleted'),
                  onError: (err) => toast.error(err.message),
                })
              }}
              className="ml-4 text-sm text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
