'use server';

import { ZodFormattedError, z } from 'zod';

import { getGQLServerClient } from '@/lib/gqlClient.server';

const RegisterSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8).max(100),
    confirm: z.string().min(8).max(100),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ['confirm'],
  });

export type RegisterValidationError = ZodFormattedError<
  { email: string; password: string; confirm: string },
  string
> | null;

export async function registerAction(data: FormData) {
  const { email, password, confirm } = Object.fromEntries(data);

  const validation = await RegisterSchema.safeParseAsync({ email, password, confirm });

  if (!validation.success) {
    return { error: validation.error.format(), response: null };
  }

  const { register } = await getGQLServerClient().register({
    email: email.toString(),
    password: password.toString(),
  });

  return { error: null, response: register };
}
