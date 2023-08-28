'use server';

import { ZodFormattedError, z } from 'zod';

import { getGQLClient } from '@/lib/gqlClient.server';

const ResetPasswordSchema = z
  .object({
    password: z.string().min(8).max(100),
    confirm: z.string().min(8).max(100),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ['confirm'],
  });

export type ResetPasswordValidationError = ZodFormattedError<
  { password: string; confirm: string },
  string
> | null;

export async function resetPasswordAction(data: FormData) {
  const { password, confirm, token, userId } = Object.fromEntries(data);

  const validation = await ResetPasswordSchema.safeParseAsync({ password, confirm });

  if (!validation.success) {
    return { error: validation.error.format(), response: null };
  }

  const { resetPassword } = await getGQLClient().resetPassword({
    input: { password: password.toString(), token: token.toString(), userId: userId.toString() },
  });

  return { error: null, response: resetPassword };
}
