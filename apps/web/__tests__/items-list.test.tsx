import { describe, it, expect } from 'vitest'
import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ItemsPage from '@/app/items/page'

function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('ItemsPage', () => {
  it('renders loading state', () => {
    renderWithProviders(<ItemsPage />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
