import faker from 'faker';
import { getSdk } from '../graphql/generated';
import getTestClient from '../test-utils/getClient';
import { deleteEmails, getEmailByAddress } from '../test-utils/test-emails';

describe('Feedback mail', () => {
  let sdk: ReturnType<typeof getSdk>;
  beforeAll(() => {
    sdk = getSdk(getTestClient().client);
  });
  beforeEach(async () => {
    await deleteEmails();
  });

  afterAll(() => deleteEmails());

  test("should send email with user's feedback", async () => {
    const email = faker.internet.email().toLowerCase();
    const text = faker.lorem.paragraph();
    const emailTo = process.env.MAIL_FEEDBACK_TO;
    const { feedback } = await sdk.sendFeedback({ input: { email, text } });
    expect(feedback).toHaveProperty('success', true);
    expect(feedback?.errors).toBe(null);
    const mail = await getEmailByAddress(emailTo);
    expect(mail).not.toBeUndefined();
    expect(mail).toHaveProperty('subject', `Feedback from ${email}`);
    const respText = mail?.text || '';
    expect(respText.search(text)).not.toBe(-1);
  });
});
