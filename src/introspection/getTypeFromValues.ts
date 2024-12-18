import {
    GraphQLBoolean,
    GraphQLFloat,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString,
    GraphQLType,
} from 'graphql';
import { GraphQLJSON } from 'graphql-type-json';
import DateType, { isISODateString } from './DateType';

const isNumeric = (value: unknown): boolean => !isNaN(parseFloat(String(value))) && isFinite(Number(value));
const valuesAreNumeric = (values: unknown[]): boolean => values.every(isNumeric);
const isInteger = (value: unknown): boolean => Number.isInteger(value);
const valuesAreInteger = (values: unknown[]): boolean => values.every(isInteger);
const isBoolean = (value: unknown): boolean => typeof value === 'boolean';
const valuesAreBoolean = (values: unknown[]): boolean => values.every(isBoolean);
const isString = (value: unknown): boolean => typeof value === 'string';
const valuesAreString = (values: unknown[]): boolean => values.every(isString);
const isArray = (value: unknown): boolean => Array.isArray(value);
const valuesAreArray = (values: unknown[]): boolean => values.every(isArray);
const isDate = (value: unknown): boolean => value instanceof Date || isISODateString(value as string);
const valuesAreDate = (values: unknown[]): boolean => values.every(isDate);
const isObject = (value: unknown): boolean =>
    Object.prototype.toString.call(value) === '[object Object]';
const valuesAreObject = (values: unknown[]): boolean => values.every(isObject);

const requiredTypeOrNormal = (type: GraphQLType, isRequired: boolean): GraphQLType =>
    isRequired ? new GraphQLNonNull(type) : type;

/**
 * Infers the GraphQL type for a given field based on its name, values, and requirement.
 *
 * @param name - The name of the field.
 * @param values - The values of the field to determine its type.
 * @param isRequired - Whether the field is required.
 * @returns The inferred GraphQL type.
 */
export default function inferGraphQLType(
    name: string,
    values: unknown[] = [],
    isRequired: boolean = false
): GraphQLType {
    if (name === 'id' || name.endsWith('_id')) {
        return requiredTypeOrNormal(GraphQLID, isRequired);
    }

    if (values.length > 0) {
        if (valuesAreArray(values)) {
            const leafValues = values.reduce<unknown[]>((agg, arr) => {
                if (Array.isArray(arr)) {
                    agg.push(...arr);
                }
                return agg;
            }, []);
            if (valuesAreBoolean(leafValues)) {
                return requiredTypeOrNormal(new GraphQLList(GraphQLBoolean), isRequired);
            }
            if (valuesAreString(leafValues)) {
                return requiredTypeOrNormal(new GraphQLList(GraphQLString), isRequired);
            }
            if (valuesAreInteger(leafValues)) {
                return requiredTypeOrNormal(new GraphQLList(GraphQLInt), isRequired);
            }
            if (valuesAreNumeric(leafValues)) {
                return requiredTypeOrNormal(new GraphQLList(GraphQLFloat), isRequired);
            }
            if (valuesAreObject(leafValues)) {
                return requiredTypeOrNormal(GraphQLJSON, isRequired);
            }
            return requiredTypeOrNormal(new GraphQLList(GraphQLString), isRequired); // FIXME introspect further
        }
        if (valuesAreBoolean(values)) {
            return requiredTypeOrNormal(GraphQLBoolean, isRequired);
        }
        if (valuesAreDate(values)) {
            return requiredTypeOrNormal(DateType, isRequired);
        }
        if (valuesAreString(values)) {
            return requiredTypeOrNormal(GraphQLString, isRequired);
        }
        if (valuesAreInteger(values)) {
            return requiredTypeOrNormal(GraphQLInt, isRequired);
        }
        if (valuesAreNumeric(values)) {
            return requiredTypeOrNormal(GraphQLFloat, isRequired);
        }
        if (valuesAreObject(values)) {
            return requiredTypeOrNormal(GraphQLJSON, isRequired);
        }
    }
    return requiredTypeOrNormal(GraphQLString, isRequired); // FIXME introspect further
}
