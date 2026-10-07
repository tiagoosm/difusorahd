import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const rpcMock = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ rpc: rpcMock }),
}))

import handler from './track.js'

function createMockReq({ method = 'POST', body = {}, headers = {} } = {}) {
  return { method, body, headers }
}

function createMockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(body) {
      this.body = body
      return this
    },
    end() {
      return this
    },
  }
}

describe('api/track — validation', () => {
  beforeEach(() => {
    rpcMock.mockReset()
    rpcMock.mockResolvedValue({ error: null })
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_ANON_KEY = 'anon-key'
  })

  it('rejects non-POST requests', async () => {
    const res = createMockRes()
    await handler(createMockReq({ method: 'GET' }), res)
    expect(res.statusCode).toBe(405)
    expect(rpcMock).not.toHaveBeenCalled()
  })

  it('rejects a request with no page', async () => {
    const res = createMockRes()
    await handler(createMockReq({ body: {} }), res)
    expect(res.statusCode).toBe(400)
    expect(rpcMock).not.toHaveBeenCalled()
  })

  it('logs a valid page view via log_analytics_event and returns 204', async () => {
    const res = createMockRes()
    await handler(createMockReq({ body: { page: '/noticia/teste', page_type: 'news' } }), res)

    expect(res.statusCode).toBe(204)
    expect(rpcMock).toHaveBeenCalledWith(
      'log_analytics_event',
      expect.objectContaining({ payload: expect.objectContaining({ page: '/noticia/teste', page_type: 'news' }) }),
    )
  })

  it('returns 500 (without crashing) when log_analytics_event fails', async () => {
    rpcMock.mockResolvedValue({ error: { message: 'db down' } })
    const res = createMockRes()
    await handler(createMockReq({ body: { page: '/' } }), res)
    expect(res.statusCode).toBe(500)
  })
})

describe('api/track — visitor_hash day boundary uses Brazil time, not UTC', () => {
  beforeEach(() => {
    rpcMock.mockReset()
    rpcMock.mockResolvedValue({ error: null })
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_ANON_KEY = 'anon-key'
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // 2026-01-01T01:00:00Z is 2025-12-31 22:00 in Brazil (UTC-3) — still
  // "yesterday" locally even though it's already "tomorrow" in UTC. The
  // visitor hash must key off the Brazil date, or the same real visitor
  // gets counted twice across that 21h-BRT/00h-UTC boundary.
  it('keys the visitor hash by the Brazil calendar date for a timestamp that has already rolled over in UTC', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T01:00:00.000Z'))

    const res = createMockRes()
    await handler(
      createMockReq({ body: { page: '/' }, headers: { 'x-forwarded-for': '1.2.3.4', 'user-agent': 'test-agent' } }),
      res,
    )

    const [, { payload }] = rpcMock.mock.calls[0]
    const expectedHash = (await import('node:crypto')).createHash('sha256').update('1.2.3.4:test-agent:2025-12-31:').digest('hex')

    expect(payload.visitor_hash).toBe(expectedHash)
  })

  it('produces a different hash for the same visitor after real Brazil midnight', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T04:00:00.000Z')) // 2026-01-01 01:00 BRT — now actually "tomorrow" locally too

    const res = createMockRes()
    await handler(
      createMockReq({ body: { page: '/' }, headers: { 'x-forwarded-for': '1.2.3.4', 'user-agent': 'test-agent' } }),
      res,
    )

    const [, { payload }] = rpcMock.mock.calls[0]
    const crypto = await import('node:crypto')
    const dec31Hash = crypto.createHash('sha256').update('1.2.3.4:test-agent:2025-12-31:').digest('hex')

    expect(payload.visitor_hash).not.toBe(dec31Hash)
  })
})
