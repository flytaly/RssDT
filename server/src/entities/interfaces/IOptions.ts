import { Theme } from '../../types/enums.js';

export interface IOptions {
  userId: number;
  dailyDigestHour: number;
  withContentTableDefault: boolean;
  itemBodyDefault: boolean;
  attachmentsDefault: boolean;
  themeDefault: Theme;
  customSubject?: string;
  shareEnable: boolean;
  shareList?: string[];
}
