import single from './single';

interface Entity {
    id: number;
    value: string;
}

test('returns undefined by default', () => {
    expect(single()(null, {id: undefined as unknown as string})).toBeUndefined();
});

test('returns record when found', () => {
    const data: Entity[] = [
        { id: 1, value: 'foo' },
        { id: 2, value: 'bar' },
    ];
    expect(single(data)(null, { id: 1 })).toEqual({ id: 1, value: 'foo' });
});

test('returns undefined when not found', () => {
    const data: Entity[] = [
        { id: 1, value: 'foo' },
        { id: 2, value: 'bar' },
    ];
    expect(single(data)(null, { id: 3 })).toBeUndefined();
});
