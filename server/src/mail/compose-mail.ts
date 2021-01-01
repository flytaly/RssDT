import { Feed } from '../entities/Feed';
import { Item } from '../entities/Item';
import { UserFeed } from '../entities/UserFeed';

export const composeDigest = (userFeed: UserFeed, feed: Feed, items: Item[]) => {
    // TODO:
    return { text: '', html: '', errors: [] };
};
