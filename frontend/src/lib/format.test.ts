import { describe, expect, it } from 'vitest'
import { daysFromToday, formatDateTime } from './format'

describe('formatDateTime', () => {
  const now = new Date(2026, 10, 27, 23, 30) // late evening, local time

  it('names yesterday, today and tomorrow by calendar day, not by 24 hours', () => {
    expect(daysFromToday(new Date(2026, 10, 28, 0, 15).toISOString(), now)).toBe(1)
    expect(daysFromToday(new Date(2026, 10, 27, 8, 0).toISOString(), now)).toBe(0)
    expect(daysFromToday(new Date(2026, 10, 26, 23, 59).toISOString(), now)).toBe(-1)
    expect(formatDateTime(new Date(2026, 10, 28, 11, 0).toISOString(), now)).toMatch(/^Tomorrow, /)
    expect(formatDateTime(new Date(2026, 10, 27, 15, 0).toISOString(), now)).toMatch(/^Today, /)
  })

  it('falls back to a date further away, across a month end', () => {
    expect(daysFromToday(new Date(2026, 11, 1, 9, 0).toISOString(), now)).toBe(4)
    expect(formatDateTime(new Date(2026, 11, 1, 9, 0).toISOString(), now)).toMatch(/Dec/)
  })
})
