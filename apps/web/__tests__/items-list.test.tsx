import { describe, it, expect } from 'vitest'
import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'
import ItemsPage from '@/app/[locale]/items/page'
import messages from '@/locales/en/items.json'

function renderWithProviders(ui: ReactElement, queryClient?: QueryClient) {
  const client =
    queryClient ?? new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <NextIntlClientProvider locale="en" messages={{ items: messages }}>
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </NextIntlClientProvider>,
  )
}

describe('ItemsPage', () => {
  it('renders loading state', () => {
    renderWithProviders(<ItemsPage />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders subtitle when present and omits it otherwise', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    queryClient.setQueryData(['items', 1, 20], {
      data: [
        {
          id: 'a',
          title: 'With subtitle',
          subtitle: 'A neat tagline',
          description: 'Body A',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'b',
          title: 'No subtitle',
          subtitle: null,
          description: 'Body B',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
    })

    renderWithProviders(<ItemsPage />, queryClient)

    expect(screen.getByText('With subtitle')).toBeInTheDocument()
    expect(screen.getByText('No subtitle')).toBeInTheDocument()
    expect(screen.getAllByText('A neat tagline')).toHaveLength(1)
    expect(screen.getByText('Body B')).toBeInTheDocument()
  })
})
