export enum PubSubTopics {
  newItems = 'newItems',
}
export type NewItemsPayload = Record<number, { count: number }>;
