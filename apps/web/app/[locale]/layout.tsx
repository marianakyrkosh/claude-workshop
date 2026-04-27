import { Geist, Geist_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { locales, type Locale } from '@/i18n/config'
import { Providers } from '../providers'
import '../globals.css'

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()
  const t = await getTranslations('common')

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <header className="border-b">
              <nav className="mx-auto flex max-w-4xl items-center gap-6 py-4">
                <Link href="/" className="text-lg font-semibold">
                  {t('nav.home')}
                </Link>
                <Link href="/items" className="text-sm text-muted-foreground hover:text-foreground">
                  {t('nav.items')}
                </Link>
              </nav>
            </header>
            <main className="mx-auto w-full max-w-4xl flex-1 py-8">{children}</main>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
