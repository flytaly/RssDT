import { getSdk } from '#root/tests/graphql/generated.js';
import { startTestServer, stopTestServer } from '#root/tests/test-server.js';
import getTestClient from '#root/tests/test-utils/getClient.js';
import { getEmailByAddress } from '#root/tests/test-utils/test-emails.js';
import test from 'ava';
import { faker } from '@faker-js/faker';

const sdk: ReturnType<typeof getSdk> = getSdk(getTestClient().client);
test.before(() => startTestServer());
test.after(() => stopTestServer());

test("send email with user's feedback", async (t) => {
  const email = faker.internet.email().toLowerCase();
  const text = faker.lorem.paragraph();
  const emailTo = process.env.MAIL_FEEDBACK_TO;
  const { feedback } = await sdk.sendFeedback({ input: { email, text } });
  t.true(feedback?.success);
  t.falsy(feedback?.errors);
  const mail = await getEmailByAddress(emailTo);
  t.truthy(mail);
  t.like(mail, { subject: `Feedback from ${email}` });
  const respText = mail?.text || '';
  t.true(respText.search(text) !== -1);
});
