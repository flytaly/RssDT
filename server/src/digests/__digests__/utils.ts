import { Options, User, UserFeed, UserFeedWithOpts } from '#root/db/schema.js';
import { DigestSchedule, TernaryState, Theme } from '#root/types/enums.js';
import { DeepPartial } from 'typeorm/common/DeepPartial';

export function createDefaultUserFeed(ufOptions: DeepPartial<UserFeed> = {}) {
  const uf = {
    theme: Theme.default,
    schedule: DigestSchedule.daily,
    withContentTable: TernaryState.enable,
    itemBody: TernaryState.enable,
    attachments: TernaryState.enable,
    unsubscribeToken: 'unsubscribe-token',
    ...ufOptions,
  } as UserFeed;
  const user = { locale: 'ru-RU', timeZone: 'Europe/Moscow' } as User;
  const opts = {
    shareEnable: true,
    themeDefault: Theme.default,
    attachmentsDefault: true,
    itemBodyDefault: true,
    withContentTableDefault: true,
  } as Options;
  return { ...uf, user: { ...user, options: opts } } as UserFeedWithOpts;
}
