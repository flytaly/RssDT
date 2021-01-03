import { DeepPartial, getRepository } from 'typeorm';

// https://github.com/typeorm/typeorm/issues/5152#issuecomment-666601851
export default function createWithDefaults<T>(
    entityClass: new () => T,
    entityLike: DeepPartial<T> = {},
): T {
    const repository = getRepository(entityClass);
    const entity = repository.create(entityLike);
    const colsWithDefaults = repository.metadata.columns.filter((x) => {
        return Object.prototype.hasOwnProperty.call(x, 'default');
    });
    for (const col of colsWithDefaults) {
        // Unassigned properties will be undefined after create()
        // @ts-ignore
        if (typeof entity[col.propertyName] === 'undefined') {
            // Property is currently undefined, so apply the default.
            // @ts-ignore
            entity[col.propertyName] = col.default;
        }
    }
    // @ts-ignore
    return entity;
}
