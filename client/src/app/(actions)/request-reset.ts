'use server';

import { ZodFormattedError, z } from 'zod';

import { getGQLServerClient } from '@/lib/gqlClient.server';

const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type RequestResetValidationError = ZodFormattedError<{ email: string }, string> | null;

export async function requestResetAction(data: FormData) {
  const { email } = Object.fromEntries(data);

  const validation = await RegisterSchema.safeParseAsync({ email });

  if (!validation.success) {
    return { error: validation.error.format(), response: null };
  }

  const { requestPasswordReset } = await getGQLServerClient().RequestPasswordReset({
    email: email.toString(),
  });

  return { error: null, response: requestPasswordReset };
}
