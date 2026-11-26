import { z } from 'zod'
import { BLOOD_GROUPS } from '../../api/types'

export const registerSchema = z
  .object({
    name: z.string().trim().min(3, 'Enter your full name'),
    email: z.email('Enter a valid email address'),
    password: z.string().min(8, 'Use at least 8 characters').regex(/\d/, 'Include at least one number'),
    confirm: z.string(),
    role: z.enum(['PATIENT', 'DOCTOR', 'DONOR']),
    bloodGroup: z.enum(BLOOD_GROUPS).optional(),
    specialty: z.string().optional(),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' })
  .refine((v) => v.role !== 'DONOR' || !!v.bloodGroup, { path: ['bloodGroup'], message: 'Donors must choose a blood group' })
  .refine((v) => v.role !== 'DOCTOR' || !!v.specialty?.trim(), { path: ['specialty'], message: 'Enter your specialty' })

export type RegisterForm = z.infer<typeof registerSchema>
