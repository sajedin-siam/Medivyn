import { z } from 'zod'
import { BLOOD_GROUPS } from '../../api/types'

export const bloodRequestSchema = z.object({
  bloodGroup: z.enum(BLOOD_GROUPS, 'Choose a blood group'),
  units: z.coerce.number<string>().int('Whole bags only').min(1, 'At least 1 unit').max(10, 'At most 10 units per request'),
  hospital: z.string().trim().min(3, 'Enter the hospital name'),
  area: z.string().trim().min(2, 'Enter the area'),
  urgent: z.boolean(),
})
export type BloodRequestInput = z.input<typeof bloodRequestSchema>
export type BloodRequestForm = z.output<typeof bloodRequestSchema>
