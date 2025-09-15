import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be less than 128 characters'),
  code: z.string()
    .min(1, 'Signup code is required')
    .max(50, 'Invalid signup code format')
    .trim(),
});

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required'),
});

export const codeSchema = z.object({
  code: z.string()
    .min(1, 'Code is required')
    .max(50, 'Code must be less than 50 characters')
    .trim(),
  startDatetime: z.string()
    .datetime('Invalid start datetime format'),
  endDatetime: z.string()
    .datetime('Invalid end datetime format'),
  type: z.string()
    .min(1, 'Type is required')
    .default('signup'),
  target: z.string()
    .min(1, 'Target is required')
    .max(255, 'Target must be less than 255 characters'),
}).refine((data) => {
  const start = new Date(data.startDatetime);
  const end = new Date(data.endDatetime);
  return start < end;
}, {
  message: 'End datetime must be after start datetime',
  path: ['endDatetime'],
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CodeInput = z.infer<typeof codeSchema>;