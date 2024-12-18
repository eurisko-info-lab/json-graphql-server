import update from './update';

interface Entity {
    id: string | number;
    [key: string]: any;
}

test('returns undefined by default', () => {
    expect(update()(null, {id: undefined as unknown as string})).toBeUndefined();
});

test('returns updated record when found', () => {
    const data: Entity[] = [{ id: 1, value: 'foo', bar: 'baz' }];
    expect(update(data)(null, { id: 1, value: 'bar' })).toEqual({
        id: 1,
        value: 'bar',
        bar: 'baz',
    });
});

test('returns undefined when not found', () => {
    const data: Entity[] = [
        { id: 1, value: 'foo' },
        { id: 2, value: 'bar' },
    ];
    expect(update(data)(null, { id: 3 })).toBeUndefined();
});

test('updates record when found', () => {
    const data: Entity[] = [{ id: 1, value: 'foo' }];
    update(data)(null, { id: 1, value: 'bar', bar: 'baz' });
    expect(data).toEqual([{ id: 1, value: 'bar', bar: 'baz' }]);
});

test('updates record with string id', () => {
    const data: Entity[] = [{ id: 'abc', value: 'foo' }];
    update(data)(null, { id: 'abc', value: 'bar', bar: 'baz' });
    expect(data).toEqual([{ id: 'abc', value: 'bar', bar: 'baz' }]);
});

test('removes property when setting the value to undefined', () => {
    const data: Entity[] = [{ id: 1, value: 'foo' }];
    update(data)(null, { id: 1, value: undefined });
    expect(data).toEqual([{ id: 1 }]);
});

test("doesn't confuse undefined id with the id 'undefined'", () => {
    const data: Entity[] = [{ id: 'undefined', value: 'foo' }];
    expect(
        update(data)(null, { id: undefined as unknown as string, value: 'bar', bar: 'baz' })
    ).toBeUndefined();
    expect(data).toEqual([{ id: "undefined", value: 'foo' }]);
});
