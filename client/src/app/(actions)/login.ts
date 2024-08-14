'use server';

import { z, ZodFormattedError } from 'zod';

import { getGQLServerClient } from '@/lib/gqlClient.server';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8).max(100),
});

export type LoginValidationError = ZodFormattedError<
  { email: string; password: string },
  string
> | null;

export async function loginAction(data: FormData) {
  const { email, password } = Object.fromEntries(data);

  const validation = await LoginSchema.safeParseAsync({ email, password });

  if (!validation.success) {
    return { error: validation.error.format(), response: null };
  }

  const { login } = await getGQLServerClient().login({
    email: email.toString(),
    password: password.toString(),
  });

  return { error: null, response: login };
}
