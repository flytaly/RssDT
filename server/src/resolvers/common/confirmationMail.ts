import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import {
    EMAIL_CONFIRM_PREFIX,
    PASSWORD_RESET_PREFIX,
    SUBSCRIPTION_CONFIRM_PREFIX,
} from '../../constants';
import {
    sendConfirmEmail,
    sendConfirmSubscription,
    sendPasswordReset,
    ConfirmFeedProps,
} from '../../mail/dispatcher';

export async function verificationEmail(redis: Redis, userId: number, email: string) {
    const token = uuidv4();
    await redis.set(EMAIL_CONFIRM_PREFIX + token, userId, 'EX', 60 * 60 * 24 * 2);
    return sendConfirmEmail(email, token, userId);
}

export async function resetPasswordEmail(redis: Redis, userId: number, email: string) {
    const token = uuidv4();
    await redis.set(PASSWORD_RESET_PREFIX + token, userId, 'EX', 60 * 60 * 24 * 2);
    return sendPasswordReset(email, token, userId);
}

interface PartialConfirmFeedProps extends Omit<ConfirmFeedProps, 'token'> {}

export async function subscriptionVerifyEmail(redis: Redis, props: PartialConfirmFeedProps) {
    const token = uuidv4();
    const { userFeedId } = props;
    await redis.set(SUBSCRIPTION_CONFIRM_PREFIX + token, userFeedId, 'EX', 60 * 60 * 24 * 2);
    return sendConfirmSubscription({ ...props, token });
}
