import getValuesFromEntities from './getValuesFromEntities';

test('does not take empty values into account', () => {
    const result = getValuesFromEntities([{ foo: null }, {}, { foo: 'bar' }]);
    expect(result).toEqual({
        foo: ['bar'],
    });
});

test('returns an array of values for every field', () => {
    const result = getValuesFromEntities([
        { id: 1, foo: 'bar' },
        { id: 2, foo: 'baz' },
    ]);
    expect(result).toEqual({
        id: [1, 2],
        foo: ['bar', 'baz'],
    });
});

test('does not ignore duplicate values', () => {
    const result = getValuesFromEntities([{ foo: 'bar' }, { foo: 'bar' }]);
    expect(result).toEqual({
        foo: ['bar', 'bar'],
    });
});

test('can handle sparse fieldsets', () => {
    const result = getValuesFromEntities([
        { id: 1, foo: 'foo1' },
        { id: 2, foo: 'foo2', bar: 'bar1' },
        { id: 3, bar: 'bar2' },
    ]);
    expect(result).toEqual({
        id: [1, 2, 3],
        foo: ['foo1', 'foo2'],
        bar: ['bar1', 'bar2'],
    });
});
