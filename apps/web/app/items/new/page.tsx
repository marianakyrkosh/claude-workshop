'use client'

import { useRouter } from 'next/navigation'
import { useCreateItem } from '@/hooks/use-items'
import { toast } from 'sonner'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function NewItemPage() {
  const router = useRouter()
  const createItem = useCreateItem()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createItem.mutate(
      { title, description: description || undefined },
      {
        onSuccess: () => {
          toast.success('Item created')
          router.push('/items')
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Item</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            placeholder="Enter item title"
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
            placeholder="Enter item description (optional)"
          />
        </div>
        <Button type="submit" disabled={createItem.isPending}>
          {createItem.isPending ? 'Creating...' : 'Create'}
        </Button>
      </form>
    </div>
  )
}
