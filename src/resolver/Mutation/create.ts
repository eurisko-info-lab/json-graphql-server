type Entity = Record<string, any>;

export default (entityData: Entity[] = []) =>
    (_: unknown, entity: Entity): Entity => {
    const newId =
        entityData.length > 0 ? entityData[entityData.length - 1].id + 1 : 0;
    const newEntity = { ...entity, id: newId };
    entityData.push(newEntity);
    return newEntity;
};
