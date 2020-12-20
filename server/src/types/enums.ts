import { registerEnumType } from 'type-graphql';

export enum Theme {
    default = 'default',
    text = 'text',
}
registerEnumType(Theme, { name: 'Theme' });

export enum TernaryState {
    enable = 'enable',
    disable = 'disable',
    default = 'default',
}
registerEnumType(TernaryState, { name: 'TernaryState' });

export enum DigestSchedule {
    realtime = 'realtime',
    everyhour = 'everyhour',
    every2hours = 'every2hours',
    every3hours = 'every3hours',
    every6hours = 'every6hours',
    every12hours = 'every12hours',
    daily = 'daily',
}
registerEnumType(DigestSchedule, { name: 'DigestSchedule' });
