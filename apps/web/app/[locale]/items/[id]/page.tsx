'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useItem, useDeleteItem } from '@/hooks/use-items'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: item, isLoading, error } = useItem(id)
  const deleteItem = useDeleteItem()
  const router = useRouter()
  const t = useTranslations('items')

  if (isLoading) return <p>{t('loading')}</p>
  if (error) return <p className="text-red-500">{t('error', { message: error.message })}</p>
  if (!item) return <p>{t('notFound')}</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{item.title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/items/${id}/edit`}>{t('actions.edit')}</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() =>
              deleteItem.mutate(id, {
                onSuccess: () => {
                  toast.success(t('toast.deleted'))
                  router.push('/items')
                },
                onError: (err) => toast.error(err.message),
              })
            }
          >
            {t('actions.delete')}
          </Button>
        </div>
      </div>
      {item.description && <p className="text-muted-foreground">{item.description}</p>}
      <p className="text-sm text-muted-foreground">{t('created', { date: new Date(item.createdAt).toLocaleDateString() })}</p>
      <Button variant="link" className="px-0" asChild>
        <Link href="/items">&larr; {t('backToItems')}</Link>
      </Button>
    </div>
  )
}
