import { z } from 'zod';

export const bookingSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  
  phone: z.string()
    .trim()
    .regex(/^(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/, 'Formato de telefone inválido (ex: (11) 98765-4321)')
    .transform(s => s.replace(/\D/g, '')), // Remove formatting, store only digits
  
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
    .refine((d) => {
      const date = new Date(d);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, 'Data deve ser hoje ou futura'),
  
  time: z.string()
    .regex(/^\d{2}:\d{2}$/, 'Horário inválido')
});

export const authSchema = z.object({
  email: z.string()
    .trim()
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(72, 'Senha muito longa'),
  
  fullName: z.string()
    .trim()
    .min(2, 'Nome muito curto')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  
  phone: z.string()
    .trim()
    .regex(/^(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/, 'Telefone inválido (ex: (11) 98765-4321)')
    .transform(s => s.replace(/\D/g, ''))
});

export type BookingFormData = z.infer<typeof bookingSchema>;
export type AuthFormData = z.infer<typeof authSchema>;
