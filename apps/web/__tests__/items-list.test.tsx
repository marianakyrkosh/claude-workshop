import { describe, it, expect } from 'vitest'
import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'
import ItemsPage from '@/app/[locale]/items/page'
import messages from '@/locales/en/items.json'

function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <NextIntlClientProvider locale="en" messages={{ items: messages }}>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </NextIntlClientProvider>,
  )
}

describe('ItemsPage', () => {
  it('renders loading state', () => {
    renderWithProviders(<ItemsPage />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
