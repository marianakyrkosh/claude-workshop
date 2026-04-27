'use client'

import { use, useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useItem, useUpdateItem } from '@/hooks/use-items'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

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

  const handleSubmit = (e: FormEvent) => {
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
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={4}
          />
        </div>
        <Button type="submit" disabled={updateItem.isPending}>
          {updateItem.isPending ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </div>
  )
}
