import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Button } from '@/components/ui/button'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('common')

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('home.title')}</h1>
      <p className="text-muted-foreground">{t('home.description')}</p>
      <Button asChild>
        <Link href="/items">{t('home.viewItems')}</Link>
      </Button>
    </div>
  )
}
