import type { OrderedTableView, TablePage } from '../model/tableView';
import { Pagination } from './Pagination';
import { ValueTypeTag } from './ValueTypeTag';

interface SpreadsheetGridProps {
    tableView: OrderedTableView;
    page: TablePage;
    onPageChange: (page: number) => void;
}

export function SpreadsheetGrid({ tableView, page, onPageChange }: SpreadsheetGridProps) {
    return (
        <div className="table-container" id="tableContainer">
            <table id="spreadsheetTable">
                <thead>
                    <tr>
                        <th className="col-index">#</th>
                        {tableView.columns.map(column => (
                            <th className="col-header-cell" data-col-key={column.key} key={column.key}>
                                <span className="col-header-label">{column.label}</span>
                                <ValueTypeTag type={column.type} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {page.totalRows === 0 ? (
                        <tr><td className="empty-placeholder" colSpan={tableView.columns.length + 1}>データがありません</td></tr>
                    ) : page.rows.map(({ row, originalIndex }) => (
                        <tr className="table-row-item" data-row-index={originalIndex} data-row-path={row.path} key={row.path}>
                            <td className="col-index row-header" data-row-index={originalIndex}>{originalIndex + 1}</td>
                            {tableView.columns.map(column => {
                                const cell = row.cells[column.key];
                                const isArray = column.type === 'array' || cell?.type === 'array';
                                return (
                                    <td
                                        className={isArray ? 'col-val col-val-array' : 'col-val'}
                                        data-col-key={column.key}
                                        data-path={cell?.path ?? `${row.path}.${column.key}`}
                                        data-row-index={originalIndex}
                                        key={column.key}
                                    >
                                        {isArray ? <span>配列</span> : cell?.displayValue ?? ''}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination page={page} onPageChange={onPageChange} />
        </div>
    );
}
