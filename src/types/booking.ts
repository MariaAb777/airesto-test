export type OrderStatus = 'New' | 'Bill' | 'Closed' | 'Banquet'

export type ReservationStatus =
  | 'Живая очередь'
  | 'Новая'
  | 'Заявка'
  | 'Открыт'
  | 'Закрыт'
  | 'Отменен'
  | 'Занял место'
  | 'Вызвана'

export interface Order {
  id: string
  status: OrderStatus
  start_time: string
  end_time: string
}

export interface Reservation {
  id: number
  name_for_reservation: string
  num_people: number
  phone_number: string
  status: ReservationStatus
  seating_time: string
  end_time: string
}

export interface Table {
  id: string
  capacity: number
  number: string
  zone: string
  orders: Order[]
  reservations: Reservation[]
}

export interface Restaurant {
  id: number
  timezone: string
  restaurant_name: string
  opening_time: string
  closing_time: string
}

export interface BookingResponse {
  available_days: string[]
  current_day: string
  restaurant: Restaurant
  tables: Table[]
}

export type EventKind = 'order' | 'reservation'

export interface TimelineEvent {
  id: string
  kind: EventKind
  status: OrderStatus | ReservationStatus
  startMs: number
  endMs: number
  tableId: string
  label: string
  sublabel?: string
  phone?: string
  numPeople?: number
  rawStart: string
  rawEnd: string
}

export interface LayoutEvent extends TimelineEvent {
  overlapLayer: number
  overlapTotal: number
  top: number
  height: number
  insetLeft: number
  insetWidth: number
}
