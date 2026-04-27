import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Workshop Starter',
  description: 'Full-stack starter project for the Claude workshop',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>
          <header className="border-b px-6 py-4">
            <nav className="mx-auto flex max-w-4xl items-center gap-6">
              <a href="/" className="text-lg font-semibold">
                Workshop
              </a>
              <a href="/items" className="text-sm text-zinc-600 hover:text-zinc-900">
                Items
              </a>
            </nav>
          </header>
          <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
