import { DeepPartial } from 'typeorm/common/DeepPartial';
import { Options, User, UserFeed } from '#entities';
import { Theme, DigestSchedule, TernaryState } from '../../types/enums';

export function createDefaultUserFeed(ufOptions: DeepPartial<UserFeed> = {}) {
  const uf = UserFeed.create({
    theme: Theme.default,
    schedule: DigestSchedule.daily,
    withContentTable: TernaryState.enable,
    itemBody: TernaryState.enable,
    attachments: TernaryState.enable,
    unsubscribeToken: 'unsubscribe-token',
    ...ufOptions,
  });
  const user = User.create({ locale: 'ru-RU', timeZone: 'Europe/Moscow' });
  const options = Options.create({ shareEnable: true });
  user.options = options;
  uf.user = user;
  return uf;
}
