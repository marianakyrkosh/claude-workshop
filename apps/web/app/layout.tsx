import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Workshop Starter',
  description: 'Full-stack starter project for the Claude workshop',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
