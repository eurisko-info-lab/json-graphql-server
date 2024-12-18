type Entity = Record<string, any>;

interface QueryArgs {
    id: string | number;
}

export default (entityData: Entity[] = []) =>
    (_: unknown, { id }: QueryArgs): Entity | undefined =>
        entityData.find((d) => d.id == id);
