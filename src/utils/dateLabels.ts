const WEEKDAYS = [
  'воскресенье',
  'понедельник',
  'вторник',
  'среда',
  'четверг',
  'пятница',
  'суббота',
]

const MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

function parseDay(day: string): Date {
  const [y, mo, d] = day.split('-').map(Number)
  return new Date(y, mo - 1, d)
}

function dayDiff(a: string, b: string): number {
  const da = parseDay(a)
  const db = parseDay(b)
  da.setHours(0, 0, 0, 0)
  db.setHours(0, 0, 0, 0)
  return Math.round((da.getTime() - db.getTime()) / 86_400_000)
}

export function formatDateChipPrimary(day: string): string {
  const date = parseDay(day)
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}`
}

export function formatDateChipSecondary(day: string, currentDay: string): string {
  const diff = dayDiff(day, currentDay)
  if (diff === 0) return 'сегодня'
  if (diff === 1) return 'завтра'
  if (diff === -1) return 'вчера'
  return WEEKDAYS[parseDay(day).getDay()]
}
