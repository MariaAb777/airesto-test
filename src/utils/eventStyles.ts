import type { OrderStatus, ReservationStatus } from '@/types/booking'

export type BadgeVariant = 'blue' | 'green' | 'red' | 'default'

export interface EventStyle {
  bg: string
  accent: string
  text: string
  hoverBg: string
}

export interface StatusBadgeInfo {
  text: string
  variant: BadgeVariant
}

const ORDER_STYLES: Record<OrderStatus, EventStyle> = {
  New: {
    bg: 'var(--event-order-new-bg)',
    accent: 'var(--event-order-new-accent)',
    text: 'var(--event-order-new-text)',
    hoverBg: 'var(--event-order-new-hover)',
  },
  Bill: {
    bg: 'var(--event-order-bill-bg)',
    accent: 'var(--event-order-bill-accent)',
    text: 'var(--event-order-bill-text)',
    hoverBg: 'var(--event-order-bill-hover)',
  },
  Closed: {
    bg: 'var(--event-order-closed-bg)',
    accent: 'var(--event-order-closed-accent)',
    text: 'var(--event-order-closed-text)',
    hoverBg: 'var(--event-order-closed-hover)',
  },
  Banquet: {
    bg: 'var(--event-order-banquet-bg)',
    accent: 'var(--event-order-banquet-accent)',
    text: 'var(--event-order-banquet-text)',
    hoverBg: 'var(--event-order-banquet-hover)',
  },
}

const RESERVATION_BASE: EventStyle = {
  bg: 'var(--event-res-booking-bg)',
  accent: 'var(--event-res-booking-accent)',
  text: 'var(--event-res-booking-text)',
  hoverBg: 'var(--event-res-booking-hover)',
}

const RESERVATION_STYLES: Record<ReservationStatus, EventStyle> = {
  'Живая очередь': {
    bg: 'var(--event-res-live-bg)',
    accent: 'var(--event-res-live-accent)',
    text: 'var(--event-res-live-text)',
    hoverBg: 'var(--event-res-live-hover)',
  },
  Новая: { ...RESERVATION_BASE },
  Заявка: { ...RESERVATION_BASE },
  Открыт: { ...RESERVATION_BASE },
  Закрыт: { ...RESERVATION_BASE },
  Отменен: { ...RESERVATION_BASE },
  'Занял место': { ...RESERVATION_BASE },
  Вызвана: { ...RESERVATION_BASE },
}

const FALLBACK_STYLE: EventStyle = {
  bg: 'var(--event-fallback-bg)',
  accent: 'var(--event-fallback-accent)',
  text: 'var(--event-fallback-text)',
  hoverBg: 'var(--event-fallback-hover)',
}

export function getEventStyle(
  kind: 'order' | 'reservation',
  status: string,
): EventStyle {
  if (kind === 'order') {
    return ORDER_STYLES[status as OrderStatus] ?? FALLBACK_STYLE
  }
  return RESERVATION_STYLES[status as ReservationStatus] ?? FALLBACK_STYLE
}

export function getEventTypeLabel(kind: 'order' | 'reservation', status: string): string {
  if (kind === 'order') {
    if (status === 'Banquet') return 'Банкет'
    return 'Заказ'
  }
  return ''
}

export function getOrderStatusLabel(status: string): string | null {
  const labels: Record<OrderStatus, string> = {
    New: 'Новый',
    Bill: 'Пречек',
    Closed: 'Закрытый',
    Banquet: '',
  }
  return labels[status as OrderStatus] || null
}

export function getStatusBadge(
  kind: 'order' | 'reservation',
  status: string,
): StatusBadgeInfo | null {
  if (kind === 'reservation') {
    const map: Record<string, StatusBadgeInfo> = {
      'Живая очередь': { text: 'Живая очередь', variant: 'blue' },
      Новая: { text: 'Ожидаем', variant: 'blue' },
      Заявка: { text: 'Ожидаем', variant: 'blue' },
      Открыт: { text: 'В зале', variant: 'green' },
      Закрыт: { text: 'Отменен', variant: 'red' },
      Отменен: { text: 'Отменен', variant: 'red' },
      Вызвана: { text: 'Вызван', variant: 'blue' },
    }
    return map[status] ?? null
  }
  return null
}

export function formatPhoneShort(phone?: string): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  return digits.slice(-4)
}

export function formatGuestsLine(name: string, numPeople?: number): string {
  if (numPeople == null) return name
  return `${name}; ${numPeople}чел`
}
