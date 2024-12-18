import applyFilters from './applyFilters';

type Entity = Record<string, any>;
type Filter = Record<string, any>;

interface QueryArgs {
    filter?: Filter;
}

export default (entityData: Entity[]) =>
    (_: unknown, { filter = {} }: QueryArgs): { count: number } => {
        const items = applyFilters(entityData, filter);

        return { count: items.length };
    };
