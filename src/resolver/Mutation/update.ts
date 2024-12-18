type Entity = Record<string, any>;

interface UpdateParams extends Entity {
    id: string | number;
}

export default (entityData: Entity[] = []) =>
    (_: unknown, params: UpdateParams): Entity | undefined => {
        let updatedEntity: Entity | undefined = undefined;

        if (params.id != null) {
            const stringId = params.id.toString();
            const indexOfEntity = entityData.findIndex(
                (e) => e.id != null && e.id.toString() === stringId
            );

            if (indexOfEntity !== -1) {
                entityData[indexOfEntity] = {
                    ...entityData[indexOfEntity],
                    ...params,
                };
                updatedEntity = entityData[indexOfEntity];
            }
        }

        return updatedEntity;
    };
