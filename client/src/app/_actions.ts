'use server';

import { z } from 'zod';

const AddFeedSchema = z.object({
  url: z.string().url('Invalid feed address'),
  email: z.string().email('Invalid email address'),
});

export async function addFeedAction(data: FormData) {
  const { url, email } = Object.fromEntries(data);

  const validation = await AddFeedSchema.safeParseAsync({ url, email });

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
