'use server';

import { ZodFormattedError, z } from 'zod';

import { getGQLServerClient } from '@/lib/gqlClient.server';
import { DigestSchedule } from '@/types';

const AddFeedSchema = z.object({
  url: z.string().url('Invalid feed address'),
  email: z.string().email('Invalid email address'),
  digest: z.nativeEnum(DigestSchedule),
});

export type AddFeedValidationError = ZodFormattedError<
  { url: string; email: string; digest: string },
  string
> | null;

async function parseAddFeedArgs(data: FormData) {
  const { url, email, digest } = Object.fromEntries(data);

  const validation = await AddFeedSchema.safeParseAsync({ url, digest, email });

  if (!validation.success) {
    return { error: validation.error.format() };
  }
  return { feedUrl: url.toString(), email: email.toString(), schedule: digest.toString() };
}

export async function addFeedAnonAction(data: FormData) {
  const { error, email, feedUrl, schedule } = await parseAddFeedArgs(data);

  if (error) {
    return { error, response: null };
  }

  const { addFeedWithEmail } = await getGQLServerClient().addFeedWithEmail({
    input: { feedUrl, email },
    feedOpts: { schedule },
  });

  return { error: null, response: addFeedWithEmail };
}

export async function addFeedLoggedInAction(data: FormData) {
  const { error, feedUrl, schedule } = await parseAddFeedArgs(data);

  if (error) {
    return { error, response: null };
  }

  const { addFeedToCurrentUser } = await getGQLServerClient().addFeedToCurrentUser({
    input: { feedUrl },
    feedOpts: { schedule },
  });

  return { error: null, response: addFeedToCurrentUser };
}
