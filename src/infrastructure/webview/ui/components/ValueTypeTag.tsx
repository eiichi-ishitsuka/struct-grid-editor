interface ValueTypeTagProps {
    type?: string;
}

export function ValueTypeTag({ type }: ValueTypeTagProps) {
    const normalizedType = type === 'complex' ? 'object' : type;
    const typeClass = normalizedType === 'array'
        ? 'array'
        : normalizedType === 'object'
            ? 'object'
            : normalizedType === 'number'
                ? 'number'
                : normalizedType === 'boolean'
                    ? 'boolean'
                    : 'other';
    const typeSymbol = typeClass === 'array'
        ? '[ ]'
        : typeClass === 'object'
            ? '{ }'
            : typeClass === 'number'
                ? '1234'
                : typeClass === 'boolean'
                    ? 'T/F'
                    : 'Aa';

    return <span className={`col-type-tag col-type-${typeClass}`}>{typeSymbol}</span>;
}
