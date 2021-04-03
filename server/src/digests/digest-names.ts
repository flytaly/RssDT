import { DigestSchedule } from '../types/enums.js';

export const digestNames: Record<DigestSchedule, string> = {
  everyhour: 'Hourly',
  every2hours: '2-hourly',
  every3hours: '3-hourly',
  every6hours: '6-hourly',
  every12hours: '12-hourly',
  daily: 'Daily',
  realtime: '',
  disable: '',
};
