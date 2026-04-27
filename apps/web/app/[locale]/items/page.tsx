'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useItems, useDeleteItem } from '@/hooks/use-items'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function ItemsPage() {
  const { data, isLoading, error } = useItems()
  const deleteItem = useDeleteItem()
  const t = useTranslations('items')

  if (isLoading) return <p>{t('loading')}</p>
  if (error) return <p className="text-red-500">{t('error', { message: error.message })}</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button asChild>
          <Link href="/items/new">{t('newItem')}</Link>
        </Button>
      </div>

      {data?.data.length === 0 && <p className="text-muted-foreground">{t('empty')}</p>}

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
                    <Link href={`/items/${item.id}/edit`}>{t('actions.edit')}</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      deleteItem.mutate(item.id, {
                        onSuccess: () => toast.success(t('toast.deleted')),
                        onError: (err) => toast.error(err.message),
                      })
                    }}
                  >
                    {t('actions.delete')}
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
