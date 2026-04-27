'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('items')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createItem.mutate(
      { title, description: description || undefined },
      {
        onSuccess: () => {
          toast.success(t('toast.created'))
          router.push('/items')
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('form.createTitle')}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t('form.titleLabel')}</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            placeholder={t('form.titlePlaceholder')}
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
            placeholder={t('form.descriptionPlaceholder')}
          />
        </div>
        <Button type="submit" disabled={createItem.isPending}>
          {createItem.isPending ? t('pending.creating') : t('actions.create')}
        </Button>
      </form>
    </div>
  )
}
