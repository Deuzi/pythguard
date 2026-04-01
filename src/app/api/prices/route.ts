import { NextRequest, NextResponse } from 'next/server'

const HERMES = 'https://hermes.pyth.network'

export async function GET(req: NextRequest) {
  try {
    // Forward the ids[] query params as-is to Hermes
    const incoming = req.nextUrl.searchParams
    const ids = incoming.getAll('ids[]')
    const parsed = incoming.get('parsed') ?? 'true'

    if (ids.length === 0) {
      return NextResponse.json({ error: 'No ids provided' }, { status: 400 })
    }

    // Build literal bracket query string — Hermes rejects %5B%5D encoding
    const query = ids.map(id => `ids[]=${id}`).join('&') + `&parsed=${parsed}`
    const url = `${HERMES}/v2/updates/price/latest?${query}`

    const res = await fetch(url, {
      headers: { accept: 'application/json' },
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`[/api/prices] Hermes error ${res.status}:`, text)
      return NextResponse.json(
        { error: `Hermes HTTP ${res.status}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/prices] Proxy error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}