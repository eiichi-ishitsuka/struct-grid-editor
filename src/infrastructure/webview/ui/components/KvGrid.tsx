import type { GridRowDto } from '../../../../application/dto/GridData';
import { ValueTypeTag } from './ValueTypeTag';

interface KvGridProps {
    rows: GridRowDto[];
    searchQuery: string;
}

export function KvGrid({ rows, searchQuery }: KvGridProps) {
    const normalizedQuery = searchQuery.toLowerCase();
    const visibleRows = rows.filter(row => {
        if (!normalizedQuery) {
            return true;
        }
        return row.path.toLowerCase().includes(normalizedQuery)
            || row.key.toLowerCase().includes(normalizedQuery)
            || row.displayValue.toLowerCase().includes(normalizedQuery);
    });

    return (
        <div className="table-container">
            <table id="gridTable">
                <thead><tr><th>パス / キー</th><th>値</th></tr></thead>
                <tbody>
                    {visibleRows.length === 0 ? (
                        <tr><td className="empty-placeholder" colSpan={2}>データがありません</td></tr>
                    ) : visibleRows.map(row => {
                        const isArray = row.type === 'array' || row.isArray;
                        const isObject = row.type === 'object' || row.type === 'complex';
                        return (
                            <tr data-id={row.id} data-path={row.path} key={row.id}>
                                <td className="col-path" style={{ paddingLeft: `${Math.max(0, row.depth - 1) * 16 + 10}px` }}>
                                    <span className="path-connector">{row.depth > 1 ? '└─ ' : ''}</span>
                                    <span className="path-text">{row.key || row.path}</span>
                                    <ValueTypeTag type={row.type} />
                                </td>
                                <td className={isArray ? 'col-val col-val-array' : isObject && !row.isLeaf ? 'col-val col-val-object' : 'col-val'}>
                                    {isArray ? '配列' : isObject && !row.isLeaf ? '' : row.displayValue}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
