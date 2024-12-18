import getFilterTypesFromData from './getFilterTypesFromData';
import { GraphQLObjectType } from 'graphql';

export default (name: string, data: { [x: string]: any[] }) =>
    Object.values(getFilterTypesFromData(data)).reduce((hasJSON, type) => {
        if (hasJSON) return true;
        return Object.values(type.getFields()).reduce((hasJSONField, field) => {
            if (hasJSONField) return true;
            return field.type instanceof GraphQLObjectType ? field.type.name == name : false;
        }, false);
    }, false);
