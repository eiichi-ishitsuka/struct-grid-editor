import type { KeyboardEvent } from 'react';
import type { TableSortState } from '../model/tableView';
import type { OrderedTableView, TablePage } from '../model/tableView';
import type { GridSelection } from '../hooks/gridUiState';
import type { GridCellCoordinate } from '../hooks/useKeyboardNavigation';
import { cellSelectionClass } from '../hooks/useGridSelection';
import { Pagination } from './Pagination';
import { ValueTypeTag } from './ValueTypeTag';

interface SpreadsheetGridProps {
    tableView: OrderedTableView;
    page: TablePage;
    selection: GridSelection;
    sortState: TableSortState | undefined;
    onPageChange: (page: number) => void;
    onCellClick: (rowIndex: number, colKey: string, path: string) => void;
    onRowClick: (rowIndex: number, path: string) => void;
    onColClick: (colKey: string) => void;
    onCellKeyDown: (event: KeyboardEvent<HTMLElement>, current: GridCellCoordinate) => void;
    onSortChange: (colKey: string) => void;
}

export function SpreadsheetGrid({
    tableView,
    page,
    selection,
    sortState,
    onPageChange,
    onCellClick,
    onRowClick,
    onColClick,
    onCellKeyDown,
    onSortChange,
}: SpreadsheetGridProps) {
    return (
        <div className="table-container" id="tableContainer">
            <table id="spreadsheetTable">
                <thead>
                    <tr>
                        <th className="col-index">#</th>
                        {tableView.columns.map(column => {
                            const isSorted = sortState?.colKey === column.key;
                            const sortIndicator = isSorted
                                ? sortState.direction === 'asc' ? ' ▲' : ' ▼'
                                : '';
                            return (
                                <th
                                    className={`col-header-cell${selection.type === 'col' && selection.colKey === column.key ? ' selected' : ''}`}
                                    data-col-key={column.key}
                                    key={column.key}
                                    onClick={() => onColClick(column.key)}
                                >
                                    <span
                                        className="col-header-label"
                                        onClick={event => { event.stopPropagation(); onSortChange(column.key); }}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={event => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                onSortChange(column.key);
                                            }
                                        }}
                                    >
                                        {column.label}{sortIndicator}
                                    </span>
                                    <ValueTypeTag type={column.type} />
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {page.totalRows === 0 ? (
                        <tr><td className="empty-placeholder" colSpan={tableView.columns.length + 1}>データがありません</td></tr>
                    ) : page.rows.map(({ row, originalIndex }) => (
                        <tr
                            className={`table-row-item${selection.type === 'row' && selection.rowIndex === originalIndex ? ' selected' : ''}`}
                            data-row-index={originalIndex}
                            data-row-path={row.path}
                            key={row.path}
                        >
                            <td
                                className="col-index row-header"
                                data-row-index={originalIndex}
                                onClick={() => onRowClick(originalIndex, row.path)}
                            >
                                {originalIndex + 1}
                            </td>
                            {tableView.columns.map(column => {
                                const cell = row.cells[column.key];
                                const isArray = column.type === 'array' || cell?.type === 'array';
                                const cellPath = cell?.path ?? `${row.path}.${column.key}`;
                                const selClass = cellSelectionClass(selection, originalIndex, column.key);
                                return (
                                    <td
                                        className={`col-val${isArray ? ' col-val-array' : ''}${selClass ? ` ${selClass}` : ''}`}
                                        data-col-key={column.key}
                                        data-path={cellPath}
                                        data-row-index={originalIndex}
                                        key={column.key}
                                        tabIndex={0}
                                        onClick={() => onCellClick(originalIndex, column.key, cellPath)}
                                        onKeyDown={event => onCellKeyDown(event, { rowIndex: originalIndex, colKey: column.key, path: cellPath })}
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
