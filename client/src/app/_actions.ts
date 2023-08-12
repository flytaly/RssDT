'use server';

import { z } from 'zod';

import { DigestSchedule } from '@/types';

const AddFeedSchema = z.object({
  url: z.string().url('Invalid feed address'),
  email: z.string().email('Invalid email address'),
  digest: z.nativeEnum(DigestSchedule),
});

export async function addFeedAction(data: FormData) {
  const { url, email, digest } = Object.fromEntries(data);

  const validation = await AddFeedSchema.safeParseAsync({ url, email, digest });

  if (!validation.success) {
    return { error: validation.error.format() };
  }

  // TODO: send data to the server
  //

  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });

  return { error: null };
}
