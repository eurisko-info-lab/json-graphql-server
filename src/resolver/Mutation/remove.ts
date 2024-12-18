type Entity = Record<string, any>;

interface QueryArgs {
    id: string | number;
}

export const remove = (entityData: Entity[] = []) =>
    (_: unknown, { id }: QueryArgs): Entity | undefined => {
        let removedEntity: Entity | undefined = undefined;

        if (id != null) {
            const stringId = id.toString();
            const indexOfEntity = entityData.findIndex(
                (e) => e.id != null && e.id.toString() === stringId
            );

            if (indexOfEntity !== -1) {
                removedEntity = entityData.splice(indexOfEntity, 1)[0];
            }
        }
        return removedEntity;
    };
