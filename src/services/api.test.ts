import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

const mockGetSession = vi.fn()

vi.mock('@/integrations/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
    },
  },
}))

const { api, ApiError } = await import('./api')

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('api client', () => {
  const cabinPayload = {
    id: 1,
    name: '001',
    maxCapacity: 2,
    regularPrice: 25000,
    discount: 0,
    description: 'x',
    image: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  }

  beforeEach(() => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends the bearer token and unwraps the data envelope', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => jsonResponse({ data: [cabinPayload] }))
    vi.stubGlobal('fetch', fetchMock)

    const cabins = await api.getCabins()

    expect(cabins).toEqual([
      { ...cabinPayload, regularPrice: 250, discount: 0 },
    ])
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/api/admin/cabins')
    expect(init.headers.Authorization).toBe('Bearer test-token')
  })

  it('converts cabin prices from cents to currency units', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          data: [
            {
              id: 1,
              name: '001',
              maxCapacity: 2,
              regularPrice: 25000,
              discount: 5000,
              description: 'x',
              image: null,
              isActive: true,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
        }),
      ),
    )

    const [cabin] = await api.getCabins()
    expect(cabin.regularPrice).toBe(250)
    expect(cabin.discount).toBe(50)
  })

  it('converts prices back to cents when writing', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({
          data: {
            id: 1,
            name: '001',
            maxCapacity: 2,
            regularPrice: 30000,
            discount: 0,
            description: 'x',
            image: null,
            isActive: true,
            createdAt: '2026-01-01T00:00:00Z',
          },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    await api.createCabin({
      name: '009',
      maxCapacity: 2,
      regularPrice: 300,
      discount: 0,
      description: 'x',
      image: '',
    })

    const [, init] = fetchMock.mock.calls[0]
    expect(JSON.parse(init.body).regularPrice).toBe(30000)
  })

  it('throws an ApiError with the server error code', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockImplementation(() =>
          jsonResponse(
            { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
            403,
          ),
        ),
    )

    await expect(api.getCabins()).rejects.toThrow(ApiError)
    await expect(api.getCabins()).rejects.toMatchObject({
      code: 'FORBIDDEN',
      status: 403,
      message: 'Admin access required',
    })
  })

  it('attaches the image file as multipart form data', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({
          data: {
            id: 1,
            name: '001',
            maxCapacity: 2,
            regularPrice: 25000,
            discount: 0,
            description: 'x',
            image: 'https://example.com/cabin.jpg',
            isActive: true,
            createdAt: '2026-01-01T00:00:00Z',
          },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const file = new File(['binary'], 'cabin.jpg', { type: 'image/jpeg' })
    await api.uploadCabinImage(1, file)

    const [, init] = fetchMock.mock.calls[0]
    expect(init.body).toBeInstanceOf(FormData)
    expect(init.body.get('image')).toBe(file)
    expect(init.headers.Authorization).toBe('Bearer test-token')
  })
})
