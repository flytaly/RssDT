import { Field, ObjectType, registerEnumType } from 'type-graphql';
import { IMPORT_STATUS_PREFIX } from '../../constants.js';
import { redis } from '../../redis.js';

export enum ImportState {
  importing = '0',
  done = '1',
}
registerEnumType(ImportState, { name: 'ImportState' });

@ObjectType()
export class ImportStatusObject {
  @Field(() => ImportState, { nullable: true })
  state: ImportState;

  @Field({ nullable: true })
  progress: number;

  @Field({ nullable: true })
  total: number;

  @Field({ nullable: true })
  result: string;
}

const fields: Record<keyof ImportStatusObject, keyof ImportStatusObject> = {
  progress: 'progress',
  state: 'state',
  total: 'total',
  result: 'result',
};

export class ImportStatus {
  key: string;

  exp = 60 * 15;

  constructor(userId: number) {
    this.key = IMPORT_STATUS_PREFIX + userId;
  }

  async getCurrent() {
    return ((await redis.hgetall(this.key)) as unknown) as ImportStatusObject | undefined;
  }

  async isImporting() {
    const field: keyof ImportStatusObject = 'state';
    const state = await redis.hget(this.key, field);
    return state === ImportState.importing;
  }

  async start(total: number) {
    const status: ImportStatusObject = {
      state: ImportState.importing,
      progress: 0,
      total,
      result: '',
    };
    await redis.hmset(this.key, status as any);
    await this.expire();
  }

  async expire() {
    return redis.expire(this.key, this.exp);
  }

  async incr() {
    return redis.hincrby(this.key, fields.progress, 1);
  }

  async del() {
    return redis.hdel(this.key);
  }

  async done() {
    await redis.hset(this.key, fields.state, ImportState.done);
    await this.expire();
  }

  async saveResults(result: string) {
    return redis.hset(this.key, fields.result, result);
  }
}
