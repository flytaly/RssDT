export enum PubSubTopics {
  newItems = 'newItems',
}
export type NewItemsPayload = Array<{ feedId: number; count: number }>;
