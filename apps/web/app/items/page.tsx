'use client'

import Link from 'next/link'
import { useItems, useDeleteItem } from '@/hooks/use-items'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function ItemsPage() {
  const { data, isLoading, error } = useItems()
  const deleteItem = useDeleteItem()

  if (isLoading) return <p>Loading...</p>
  if (error) return <p className="text-red-500">Error: {error.message}</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Items</h1>
        <Button asChild>
          <Link href="/items/new">New Item</Link>
        </Button>
      </div>

      {data?.data.length === 0 && <p className="text-muted-foreground">No items yet. Create your first one!</p>}

      <ul className="space-y-3">
        {data?.data.map((item) => (
          <li key={item.id}>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <Link href={`/items/${item.id}`} className="flex-1">
                  <h2 className="font-semibold">{item.title}</h2>
                  {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                </Link>
                <div className="ml-4 flex gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/items/${item.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      deleteItem.mutate(item.id, {
                        onSuccess: () => toast.success('Item deleted'),
                        onError: (err) => toast.error(err.message),
                      })
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
