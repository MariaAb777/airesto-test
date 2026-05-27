import type { BookingResponse } from '@/types/booking'
import { API_URL } from '@/config/env'

export async function fetchBookingData(signal?: AbortSignal): Promise<BookingResponse> {
  const response = await fetch(API_URL, { signal })
  if (!response.ok) {
    throw new Error(`Не удалось загрузить данные (${response.status})`)
  }
  return response.json() as Promise<BookingResponse>
}
