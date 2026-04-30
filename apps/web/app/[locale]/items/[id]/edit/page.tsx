'use client'

import { use, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useItem, useUpdateItem } from '@/hooks/use-items'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface ItemFormProps {
  id: string
  initialTitle: string
  initialSubtitle: string
  initialDescription: string
}

function EditItemForm({ id, initialTitle, initialSubtitle, initialDescription }: ItemFormProps) {
  const updateItem = useUpdateItem(id)
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [subtitle, setSubtitle] = useState(initialSubtitle)
  const [description, setDescription] = useState(initialDescription)
  const t = useTranslations('items')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    updateItem.mutate(
      { title, subtitle: subtitle || undefined, description: description || undefined },
      {
        onSuccess: () => {
          toast.success(t('toast.updated'))
          router.push(`/items/${id}`)
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('form.editTitle')}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t('form.titleLabel')}</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle">{t('form.subtitleLabel')}</Label>
          <Input
            id="subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            maxLength={200}
            placeholder={t('form.subtitlePlaceholder')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">{t('form.descriptionLabel')}</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={4}
          />
        </div>
        <Button type="submit" disabled={updateItem.isPending}>
          {updateItem.isPending ? t('pending.saving') : t('actions.save')}
        </Button>
      </form>
    </div>
  )
}

export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: item, isLoading, error } = useItem(id)
  const t = useTranslations('items')

  if (isLoading) return <p>{t('loading')}</p>
  if (error) return <p className="text-destructive">{t('error', { message: error.message })}</p>
  if (!item) return <p>{t('notFound')}</p>

  return (
    <EditItemForm
      id={id}
      initialTitle={item.title}
      initialSubtitle={item.subtitle ?? ''}
      initialDescription={item.description || ''}
    />
  )
}
