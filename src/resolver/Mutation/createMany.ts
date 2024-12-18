import create from './create';

type Entity = Record<string, any>;

interface Entities {
    data: Entity[];
}

export const createMany = (entityData: Entity[] = []) =>
    (_: unknown, entities: Entities): Entity[] => {
        return entities.data.map((e) => create(entityData)(null, e));
    };
