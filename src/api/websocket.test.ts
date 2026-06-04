import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WebSocketClient } from './websocket'

class MockWebSocket {
  static OPEN = 1
  static CONNECTING = 0
  static CLOSING = 2
  static CLOSED = 3
  onopen: (() => void) | null = null
  onclose: (() => void) | null = null
  onmessage: ((e: { data: string }) => void) | null = null
  onerror: (() => void) | null = null
  readyState = 0
  send = vi.fn()
  close = vi.fn()
}

let mockWs: MockWebSocket

beforeEach(() => {
  mockWs = new MockWebSocket()
  vi.stubGlobal('WebSocket', vi.fn(() => mockWs))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('WebSocketClient', () => {
  it('connects and sets status to connecting', () => {
    const client = new WebSocketClient()
    const onStatus = vi.fn()
    client.onStatusChange(onStatus)
    client.connect()
    expect(onStatus).toHaveBeenCalledWith('connecting')
  })

  it('sets connected status on open', () => {
    const client = new WebSocketClient()
    const onStatus = vi.fn()
    client.onStatusChange(onStatus)
    client.connect()
    mockWs.onopen!()
    expect(onStatus).toHaveBeenCalledWith('connected')
  })

  it('re-subscribes on reconnect', () => {
    const client = new WebSocketClient()
    client.connect()
    client.subscribe('BTC/USD')
    mockWs.readyState = WebSocket.OPEN
    mockWs.send.mockClear()
    mockWs.onopen!()
    expect(mockWs.send.mock.calls[0][0]).toBe(
      JSON.stringify({ action: 'subscribe', assetPairs: ['BTC/USD'] }),
    )
  })

  it('calls message handlers on incoming messages', () => {
    const client = new WebSocketClient()
    const handler = vi.fn()
    client.onMessage(handler)
    client.connect()
    const msg = { type: 'price_update', assetPair: 'BTC/USD', price: 50000, timestamp: Date.now(), confidence: 0.99, sources: ['chainlink'] }
    mockWs.onmessage!({ data: JSON.stringify(msg) })
    expect(handler).toHaveBeenCalledWith(msg)
  })

  it('ignores malformed messages', () => {
    const client = new WebSocketClient()
    const handler = vi.fn()
    client.onMessage(handler)
    client.connect()
    mockWs.onmessage!({ data: 'not json' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('disconnect cleans up and sets disconnected', () => {
    const client = new WebSocketClient()
    const onStatus = vi.fn()
    client.onStatusChange(onStatus)
    client.connect()
    client.disconnect()
    expect(onStatus).toHaveBeenCalledWith('disconnected')
    expect(mockWs.close).toHaveBeenCalled()
  })

  it('subscribe sends subscribe message', () => {
    const client = new WebSocketClient()
    client.connect()
    mockWs.readyState = WebSocket.OPEN
    client.subscribe('BTC/USD')
    expect(mockWs.send.mock.calls[0][0]).toBe(
      JSON.stringify({ action: 'subscribe', assetPairs: ['BTC/USD'] }),
    )
  })

  it('unsubscribe sends unsubscribe message', () => {
    const client = new WebSocketClient()
    client.connect()
    mockWs.readyState = WebSocket.OPEN
    client.subscribe('BTC/USD')
    client.unsubscribe('BTC/USD')
    const lastCall = mockWs.send.mock.calls.length - 1
    expect(mockWs.send.mock.calls[lastCall][0]).toBe(
      JSON.stringify({ action: 'unsubscribe', assetPairs: ['BTC/USD'] }),
    )
  })

  it('removes handler via returned disposer', () => {
    const client = new WebSocketClient()
    const handler = vi.fn()
    const dispose = client.onMessage(handler)
    dispose()
    client.connect()
    mockWs.onmessage!({ data: JSON.stringify({ type: 'price_update', assetPair: 'BTC/USD', price: 50000, timestamp: Date.now(), confidence: 0.99, sources: [] }) })
    expect(handler).not.toHaveBeenCalled()
  })

  it('does not reconnect after disconnect', () => {
    const client = new WebSocketClient()
    client.connect()
    client.disconnect()
    mockWs.onclose!()
    expect(mockWs.close).toHaveBeenCalledTimes(1)
  })

  it('handles error by closing', () => {
    const client = new WebSocketClient()
    client.connect()
    mockWs.onerror!()
    expect(mockWs.close).toHaveBeenCalled()
  })
})
