import { supabase } from '@/integrations/supabase'

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:3000'

export class ApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  formData?: FormData
}

async function accessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = await accessToken()
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.formData
      ? options.formData
      : options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
  })

  if (response.status === 204) return undefined as T

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      payload?.error?.message ?? `Request failed with status ${response.status}`
    throw new ApiError(message, payload?.error?.code ?? 'UNKNOWN', response.status)
  }

  return payload.data as T
}

// The shared business API returns flat rows; these adapters restore the shape
// the admin components were built against, so no component reads nested data.
// The shared business API stores money as integer cents; the admin UI works
// in whole currency units. Conversion happens only at this boundary.
function centsToUnits(cents: number): number {
  return cents / 100
}

function unitsToCents(units: number): number {
  return Math.round(units * 100)
}

function cabinFromApi(cabin: {
  id: number
  name: string
  maxCapacity: number
  regularPrice: number
  discount: number
  description: string
  image: string | null
  isActive: boolean
  createdAt: string
}): Cabin {
  return {
    ...cabin,
    regularPrice: centsToUnits(cabin.regularPrice),
    discount: centsToUnits(cabin.discount),
  }
}

function cabinToApi(cabin: Record<string, unknown>): Record<string, unknown> {
  const payload = { ...cabin }
  if (typeof payload.regularPrice === 'number') {
    payload.regularPrice = unitsToCents(payload.regularPrice)
  }
  if (typeof payload.discount === 'number') {
    payload.discount = unitsToCents(payload.discount)
  }
  return payload
}

type ApiBooking = {
  id: number
  createdAt: string
  startDate: string
  endDate: string
  numNights: number
  numGuests: number
  cabinId: number
  profileId: string | null
  cabinPrice: number
  extrasPrice: number
  totalPrice: number
  status: string
  hasBreakfast: boolean
  isPaid: boolean
  observations: string | null
  idempotencyKey: string | null
  cabinName: string | null
  guestName: string | null
  guestEmail: string | null
}

type AdminBooking = ApiBooking & {
  cabins: { name: string | null }
  guests: { fullName: string | null; email: string | null }
  created_at: string
}

function toAdminBooking(booking: ApiBooking): AdminBooking {
  return {
    ...booking,
    cabinPrice: centsToUnits(booking.cabinPrice),
    extrasPrice: centsToUnits(booking.extrasPrice),
    totalPrice: centsToUnits(booking.totalPrice),
    cabins: { name: booking.cabinName },
    guests: { fullName: booking.guestName, email: booking.guestEmail },
    created_at: booking.createdAt,
  }
}

type ApiBookingDetail = ApiBooking & {
  cabin: {
    id: number
    name: string
    maxCapacity: number
    regularPrice: number
    discount: number
    description: string
    image: string | null
    isActive: boolean
  } | null
  profile: {
    fullName: string
    email: string
    nationality: string | null
    countryFlag: string | null
  } | null
}

function toAdminBookingDetail(booking: ApiBookingDetail): AdminBooking {
  return {
    ...booking,
    cabins: { name: booking.cabin?.name ?? null },
    guests: {
      fullName: booking.profile?.fullName ?? null,
      email: booking.profile?.email ?? null,
    },
    created_at: booking.createdAt,
  }
}

export type Cabin = {
  id: number
  name: string
  maxCapacity: number
  regularPrice: number
  discount: number
  description: string
  image: string | null
  isActive: boolean
  createdAt: string
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'all'

export const api = {
  async getCabins(): Promise<Cabin[]> {
    const cabins = await request<
      Parameters<typeof cabinFromApi>[0][]
    >('/api/admin/cabins')
    return cabins.map(cabinFromApi)
  },

  async createCabin(cabin: {
    name: string
    maxCapacity: number
    regularPrice: number
    discount: number
    description: string
    image: string
  }): Promise<Cabin> {
    const created = await request<Parameters<typeof cabinFromApi>[0]>(
      '/api/admin/cabins',
      { method: 'POST', body: cabinToApi(cabin) },
    )
    return cabinFromApi(created)
  },

  async updateCabin(
    id: number,
    cabin: Partial<{
      name: string
      maxCapacity: number
      regularPrice: number
      discount: number
      description: string
      image: string | null
      isActive: boolean
    }>,
  ): Promise<Cabin> {
    const updated = await request<Parameters<typeof cabinFromApi>[0]>(
      `/api/admin/cabins/${id}`,
      { method: 'PATCH', body: cabinToApi(cabin) },
    )
    return cabinFromApi(updated)
  },

  async deleteCabin(id: number): Promise<void> {
    await request(`/api/admin/cabins/${id}`, { method: 'DELETE' })
  },

  async uploadCabinImage(id: number, image: File): Promise<Cabin> {
    const formData = new FormData()
    formData.append('image', image)
    const updated = await request<Parameters<typeof cabinFromApi>[0]>(
      `/api/admin/cabins/${id}/image`,
      { method: 'POST', formData },
    )
    return cabinFromApi(updated)
  },

  async deleteCabinImage(id: number): Promise<Cabin> {
    const updated = await request<Parameters<typeof cabinFromApi>[0]>(
      `/api/admin/cabins/${id}/image`,
      { method: 'DELETE' },
    )
    return cabinFromApi(updated)
  },

  async getBookings(options: {
    status?: BookingStatus
    sortBy?: 'startDate' | 'created_at' | 'totalPrice'
    direction?: 'asc' | 'desc'
    page?: number
    pageSize?: number
  } = {}): Promise<{ data: AdminBooking[]; count: number; page: number; pageSize: number }> {
    const params = new URLSearchParams()
    if (options.status) params.set('status', options.status)
    if (options.sortBy) params.set('sortBy', options.sortBy)
    if (options.direction) params.set('direction', options.direction)
    if (options.page) params.set('page', String(options.page))
    if (options.pageSize) params.set('pageSize', String(options.pageSize))

    const result = await request<{
      data: ApiBooking[]
      count: number
      page: number
      pageSize: number
    }>(`/api/admin/bookings?${params.toString()}`)

    return { ...result, data: result.data.map(toAdminBooking) }
  },

  async getBooking(id: number): Promise<AdminBooking> {
    const booking = await request<ApiBookingDetail>(`/api/admin/bookings/${id}`)
    return toAdminBookingDetail(booking)
  },

  async updateBookingStatus(
    id: number,
    action: 'confirm' | 'check_in' | 'check_out' | 'cancel',
    reason?: string,
  ): Promise<AdminBooking> {
    const booking = await request<ApiBooking>(
      `/api/admin/bookings/${id}/status`,
      { method: 'PATCH', body: { action, reason } },
    )
    return toAdminBooking(booking)
  },

  async updateBooking(
    id: number,
    input: {
      numGuests?: number
      hasBreakfast?: boolean
      observations?: string
    },
  ): Promise<AdminBooking> {
    const booking = await request<ApiBooking>(
      `/api/admin/bookings/${id}/edit`,
      { method: 'PATCH', body: input },
    )
    return toAdminBooking(booking)
  },

  async getAnalytics(rangeDays: 7 | 30 | 90 = 30) {
    const analytics = await request<{
      rangeDays: number
      sales: { total: number; extras: number; count: number }
      stays: { count: number; nights: number }
      occupancy: { bookedNights: number; capacityNights: number; rate: number }
      dailySales: { date: string; total: number; extras: number; count: number }[]
      durationDistribution: { nights: number; count: number }[]
      todayActivity: (ApiBooking & {
        cabinName: string | null
        guestName: string | null
        guestEmail: string | null
        guestNationality: string | null
        guestCountryFlag: string | null
      })[]
      recentBookings: (ApiBooking & { cabinName: string | null })[]
    }>(`/api/admin/analytics?days=${rangeDays}`)

    return {
      ...analytics,
      sales: {
        ...analytics.sales,
        total: centsToUnits(analytics.sales.total),
        extras: centsToUnits(analytics.sales.extras),
      },
      dailySales: analytics.dailySales.map((day) => ({
        ...day,
        total: centsToUnits(day.total),
        extras: centsToUnits(day.extras),
      })),
    }
  },

  async getSettings() {
    const settings = await request<{
      id: number
      minBookingLength: number
      maxBookingLength: number
      maxGuestsPerBooking: number
      breakfastPrice: number
      createdAt: string
    }>('/api/admin/settings')
    return { ...settings, breakfastPrice: centsToUnits(settings.breakfastPrice) }
  },

  async updateSettings(settings: {
    minBookingLength: number
    maxBookingLength: number
    maxGuestsPerBooking: number
    breakfastPrice: number
  }) {
    const updated = await request<{
      id: number
      minBookingLength: number
      maxBookingLength: number
      maxGuestsPerBooking: number
      breakfastPrice: number
      createdAt: string
    }>('/api/admin/settings', {
      method: 'PATCH',
      body: { ...settings, breakfastPrice: unitsToCents(settings.breakfastPrice) },
    })
    return { ...updated, breakfastPrice: centsToUnits(updated.breakfastPrice) }
  },
}

export { API_BASE_URL }
