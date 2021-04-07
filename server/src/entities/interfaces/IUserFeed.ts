import { DigestSchedule, TernaryState, Theme } from '../../types/enums.js';

export interface IUserFeed {
  id: number;
  activated: boolean;
  title?: string;
  schedule: DigestSchedule;
  withContentTable: TernaryState;
  itemBody: TernaryState;
  attachments: TernaryState;
  theme: Theme;
  filter?: string;
  lastDigestSentAt?: Date;
  lastViewedItemDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // === GraphQL ONLY FIELDS ===
  newItemsCount?: number;

  // === DB ONLY FIELDS ===
  wasFilteredAt?: Date;
  userId: number;
  feedId: number;
  unsubscribeToken: string;
}
