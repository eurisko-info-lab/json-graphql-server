import applyFilters from './applyFilters';

type Filter = Record<string, any>;

interface QueryArgs {
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    perPage?: number;
    filter?: Filter;
}

export default (entityData: Record<string, any>[] = []) =>
    (
        _: unknown,
        { sortField, sortOrder = 'asc', page, perPage = 25, filter = {} }: QueryArgs
    ): Record<string, any>[] => {
        let items = [...entityData];

        if (sortField) {
            const direction = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
            items = items.sort((a, b) => {
                if (a[sortField] > b[sortField]) {
                    return direction;
                }
                if (a[sortField] < b[sortField]) {
                    return -1 * direction;
                }
                return 0;
            });
        }

        items = applyFilters(items, filter);

        if (page !== undefined && perPage) {
            items = items.slice(page * perPage, page * perPage + perPage);
        }

        return items;
    };
