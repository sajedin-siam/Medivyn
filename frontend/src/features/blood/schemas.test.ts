import { describe, expect, it } from 'vitest'
import { registerSchema } from '../account/schemas'
import { bloodRequestSchema } from './schemas'

describe('bloodRequestSchema', () => {
  const valid = { bloodGroup: 'O+', units: '2', hospital: 'MediConnect General', area: 'Dhanmondi', urgent: true }

  it('accepts a valid request and converts units to a number', () => {
    expect(bloodRequestSchema.parse(valid).units).toBe(2)
  })

  it.each([['0'], ['11'], ['1.5']])('rejects %s units', (units) => {
    expect(bloodRequestSchema.safeParse({ ...valid, units }).success).toBe(false)
  })

  it('rejects an unknown blood group', () => {
    expect(bloodRequestSchema.safeParse({ ...valid, bloodGroup: 'C+' }).success).toBe(false)
  })
})

describe('registerSchema', () => {
  const base = { name: 'Test User', email: 'test@example.com', password: 'secret123', confirm: 'secret123', role: 'PATIENT' }

  it('accepts a patient', () => {
    expect(registerSchema.safeParse(base).success).toBe(true)
  })

  it('requires matching passwords', () => {
    const r = registerSchema.safeParse({ ...base, confirm: 'other123' })
    expect(r.error?.issues[0].path).toEqual(['confirm'])
  })

  it('requires a blood group for donors and a specialty for doctors', () => {
    expect(registerSchema.safeParse({ ...base, role: 'DONOR' }).error?.issues[0].path).toEqual(['bloodGroup'])
    expect(registerSchema.safeParse({ ...base, role: 'DOCTOR' }).error?.issues[0].path).toEqual(['specialty'])
  })
})
