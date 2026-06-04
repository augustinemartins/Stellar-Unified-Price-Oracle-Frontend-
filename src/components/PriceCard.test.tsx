import { describe, it, expect, vi, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PriceCard } from './PriceCard'

afterEach(cleanup)

const mockPrice = {
  assetPair: 'BTC/USD',
  price: 50000.1234,
  timestamp: Date.now(),
  confidence: 0.9876,
  sources: ['chainlink', 'redstone'],
}

describe('PriceCard', () => {
  it('renders asset pair and price', () => {
    render(<PriceCard price={mockPrice} />)
    expect(screen.getByText('BTC/USD')).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('50,000.12'))).toBeInTheDocument()
  })

  it('renders confidence percentage', () => {
    render(<PriceCard price={mockPrice} />)
    expect(screen.getByText((content) => content.includes('98.8'))).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('% confidence'))).toBeInTheDocument()
  })

  it('renders source badges', () => {
    render(<PriceCard price={mockPrice} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(1)
    expect(screen.getByText('chainlink')).toBeInTheDocument()
    expect(screen.getByText('redstone')).toBeInTheDocument()
  })

  it('shows live indicator when isLive is true', () => {
    const { container } = render(<PriceCard price={mockPrice} isLive />)
    expect(container.querySelector('.bg-green-500')).toBeInTheDocument()
  })

  it('does not show live indicator when isLive is false', () => {
    const { container } = render(<PriceCard price={mockPrice} isLive={false} />)
    expect(container.querySelector('.bg-green-500')).not.toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<PriceCard price={mockPrice} onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('has accessible aria-label', () => {
    render(<PriceCard price={mockPrice} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'View details for BTC/USD')
  })
})
