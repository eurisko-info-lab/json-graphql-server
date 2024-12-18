import { GraphQLScalarType, GraphQLError } from 'graphql';
import { Kind } from 'graphql/language';

const ISO_DATE_STRING_PATTERN = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/;

/**
 * Validates if a value is a valid ISO date string.
 *
 * @param value - The value to validate.
 * @returns True if the value is a valid ISO date string, false otherwise.
 */
export const isISODateString = (value: unknown): boolean => {
    if (typeof value !== 'string') return false;
    if (!ISO_DATE_STRING_PATTERN.test(value)) return false;
    const d = new Date(value);
    return d.toISOString() === value;
};

export const GraphQLDate = 'Date';

export default new GraphQLScalarType({
    name: GraphQLDate,
    description: 'Date type',
    parseValue(value: unknown): Date {
        // value comes from the client
        if (typeof value !== 'string' && typeof value !== 'number') {
            throw new GraphQLError('Value must be a string or a number representing a date');
        }
        return new Date(value); // sent to resolvers
    },
    serialize(value: unknown): string {
        // value comes from resolvers
        if (typeof value === 'string' && isISODateString(value)) {
            return value;
        }
        if (value instanceof Date) {
            return value.toISOString(); // sent to the client
        }
        throw new GraphQLError('Value is not a valid Date object or ISO date string');
    },
    parseLiteral(ast): Date {
        // ast comes from parsing the query
        if (ast.kind !== Kind.STRING) {
            throw new GraphQLError(
                `Query error: Can only parse date strings, got a: ${ast.kind}`,
                [ast]
            );
        }
        if (isNaN(Date.parse(ast.value))) {
            throw new GraphQLError(`Query error: not a valid date`, [ast]);
        }
        return new Date(ast.value);
    },
});
