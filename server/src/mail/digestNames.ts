import { DigestSchedule } from '../types/enums';

export const digestNames: Record<DigestSchedule, string> = {
    everyhour: 'hourly digest',
    every2hours: '2-hourly digest',
    every3hours: '3-hourly digest',
    every6hours: '6-hourly digest',
    every12hours: '12-hourly digest',
    daily: 'daily digest',
    realtime: '',
    disable: '',
};
