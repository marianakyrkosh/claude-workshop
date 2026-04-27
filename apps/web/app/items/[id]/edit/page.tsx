'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useItem, useUpdateItem } from '@/hooks/use-items'
import { toast } from 'sonner'

export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: item, isLoading } = useItem(id)
  const updateItem = useUpdateItem(id)
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (item) {
      setTitle(item.title)
      setDescription(item.description || '')
    }
  }, [item])

  if (isLoading) return <p>Loading...</p>

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateItem.mutate(
      { title, description: description || undefined },
      {
        onSuccess: () => {
          toast.success('Item updated')
          router.push(`/items/${id}`)
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Item</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={4}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={updateItem.isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {updateItem.isPending ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  )
}
