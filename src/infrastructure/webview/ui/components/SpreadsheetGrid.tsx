import {
    useState,
    useCallback,
    type DragEvent,
    type KeyboardEvent,
    type MouseEvent,
} from 'react';
import type { TableSortState } from '../model/tableView';
import type { OrderedTableView, TablePage } from '../model/tableView';
import type { GridSelection } from '../hooks/gridUiState';
import type { GridCellCoordinate, GridNavigationDirection } from '../hooks/useKeyboardNavigation';
import { cellSelectionClass } from '../hooks/useGridSelection';
import { EditableCell } from './EditableCell';
import { Pagination } from './Pagination';
import { ValueTypeTag } from './ValueTypeTag';

interface SpreadsheetGridProps {
    tableView: OrderedTableView;
    page: TablePage;
    selection: GridSelection;
    sortState: TableSortState | undefined;
    colWidths?: Record<string, number>;
    onPageChange: (page: number) => void;
    onCellClick: (rowIndex: number, colKey: string, path: string) => void;
    onRowClick: (rowIndex: number, path: string) => void;
    onColClick: (colKey: string) => void;
    onSelectAll: () => void;
    onSortChange: (colKey: string) => void;
    onUpdateCell: (path: string, value: string) => void;
    onNavigateAdjacent: (current: GridCellCoordinate, direction: GridNavigationDirection) => void;
    onRenameColumn?: (oldKey: string, newKey: string) => void;
    onAddColumn?: () => void;
    onAddRow?: () => void;
    onMoveColumn?: (fromIndex: number, toIndex: number) => void;
    onMoveRow?: (fromIndex: number, toIndex: number) => void;
    onResizeColumn?: (colKey: string, width: number) => void;
    onResetColWidth?: (colKey: string) => void;
    onNavigateArray?: (arrayPath: string) => void;
    onCornerContextMenu?: (event: MouseEvent<HTMLTableCellElement>) => void;
    onRowContextMenu?: (event: MouseEvent<HTMLTableCellElement>, rowIndex: number, path: string) => void;
    onColContextMenu?: (event: MouseEvent<HTMLTableCellElement>, colKey: string, colIndex: number) => void;
    onCellContextMenu?: (event: MouseEvent<HTMLTableCellElement>, cell: GridCellCoordinate) => void;
}

export function SpreadsheetGrid({
    tableView,
    page,
    selection,
    sortState,
    colWidths = {},
    onPageChange,
    onCellClick,
    onRowClick,
    onColClick,
    onSelectAll,
    onSortChange,
    onUpdateCell,
    onNavigateAdjacent,
    onRenameColumn,
    onAddColumn,
    onAddRow,
    onMoveColumn,
    onMoveRow,
    onResizeColumn,
    onResetColWidth,
    onNavigateArray,
    onCornerContextMenu,
    onRowContextMenu,
    onColContextMenu,
    onCellContextMenu,
}: SpreadsheetGridProps) {
    // 列リサイズ状態
    const [resizingColKey, setResizingColKey] = useState<string | null>(null);

    // 列 DnD 状態
    const [draggedColIndex, setDraggedColIndex] = useState<number | null>(null);
    const [colDragOver, setColDragOver] = useState<{ index: number; side: 'left' | 'right' } | null>(null);

    // 行 DnD 状態
    const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
    const [rowDragOver, setRowDragOver] = useState<{ index: number; side: 'top' | 'bottom' } | null>(null);

    // 列リサイズ開始
    const handleResizeStart = useCallback((event: MouseEvent<HTMLDivElement>, colKey: string) => {
        event.stopPropagation();
        event.preventDefault();
        setResizingColKey(colKey);

        const startX = event.clientX;
        const currentTh = (event.target as HTMLElement).closest('th');
        const startWidth = currentTh ? currentTh.offsetWidth : 100;
        let finalWidth = startWidth;

        const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
            const diff = moveEvent.clientX - startX;
            finalWidth = Math.max(60, startWidth + diff);
            if (currentTh) {
                currentTh.style.width = `${finalWidth}px`;
                currentTh.style.minWidth = `${finalWidth}px`;
                currentTh.style.maxWidth = `${finalWidth}px`;
            }
        };

        const handleMouseUp = () => {
            setResizingColKey(null);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            onResizeColumn?.(colKey, finalWidth);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [onResizeColumn]);

    // 列名インライン編集の確定
    const handleColumnLabelBlur = (colKey: string, oldLabel: string, element: HTMLElement) => {
        const newKey = element.innerText.trim();
        if (!newKey || newKey === oldLabel) {
            element.innerText = oldLabel;
            return;
        }
        onRenameColumn?.(colKey, newKey);
    };

    const handleColumnLabelKeyDown = (event: KeyboardEvent<HTMLSpanElement>, oldLabel: string) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            (event.target as HTMLElement).blur();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            const target = event.target as HTMLElement;
            target.innerText = oldLabel;
            target.blur();
        }
    };

    // 列 DnD
    const handleColDragStart = (index: number, event: DragEvent<HTMLTableCellElement>) => {
        if (resizingColKey) {
            event.preventDefault();
            return;
        }
        setDraggedColIndex(index);
        event.dataTransfer.effectAllowed = 'move';
    };

    const handleColDragOver = (index: number, event: DragEvent<HTMLTableCellElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        if (draggedColIndex === null || draggedColIndex === index) {
            return;
        }
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        setColDragOver({ index, side: event.clientX < midX ? 'left' : 'right' });
    };

    const handleColDrop = (targetIndex: number, event: DragEvent<HTMLTableCellElement>) => {
        event.preventDefault();
        if (draggedColIndex !== null && draggedColIndex !== targetIndex) {
            onMoveColumn?.(draggedColIndex, targetIndex);
        }
        setDraggedColIndex(null);
        setColDragOver(null);
    };

    // 行 DnD
    const handleRowDragStart = (index: number, event: DragEvent<HTMLTableRowElement>) => {
        setDraggedRowIndex(index);
        event.dataTransfer.effectAllowed = 'move';
    };

    const handleRowDragOver = (index: number, event: DragEvent<HTMLTableRowElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        if (draggedRowIndex === null || draggedRowIndex === index) {
            return;
        }
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        setRowDragOver({ index, side: event.clientY < midY ? 'top' : 'bottom' });
    };

    const handleRowDrop = (targetIndex: number, event: DragEvent<HTMLTableRowElement>) => {
        event.preventDefault();
        if (draggedRowIndex !== null && draggedRowIndex !== targetIndex) {
            onMoveRow?.(draggedRowIndex, targetIndex);
        }
        setDraggedRowIndex(null);
        setRowDragOver(null);
    };

    return (
        <div className="table-container" id="tableContainer">
            <table id="spreadsheetTable">
                <thead>
                    <tr>
                        <th
                            className={`col-index corner-cell${selection.type === 'all' ? ' corner-selected' : ''}`}
                            id="cornerSelectAll"
                            title="すべて選択 (Ctrl+A / Cmd+A)"
                            onClick={onSelectAll}
                            onContextMenu={onCornerContextMenu}
                        >
                            <span className="corner-icon" />
                        </th>
                        {tableView.columns.map((column, colIdx) => {
                            const isSorted = sortState?.colKey === column.key;
                            const sortIndicator = isSorted
                                ? sortState.direction === 'asc' ? '▲' : '▼'
                                : '';
                            const customWidth = colWidths[column.key];
                            const widthStyle = customWidth
                                ? { width: `${customWidth}px`, minWidth: `${customWidth}px`, maxWidth: `${customWidth}px` }
                                : undefined;

                            let dndClass = '';
                            if (draggedColIndex === colIdx) {
                                dndClass += ' dragging';
                            }
                            if (colDragOver?.index === colIdx) {
                                dndClass += colDragOver.side === 'left' ? ' drag-over-left' : ' drag-over-right';
                            }

                            return (
                                <th
                                    className={`col-header-cell${selection.type === 'col' && selection.colKey === column.key ? ' col-header-selected' : ''}${dndClass}`}
                                    style={widthStyle}
                                    data-col-index={colIdx}
                                    data-col-key={column.key}
                                    key={column.key}
                                    draggable={!resizingColKey}
                                    onClick={() => onColClick(column.key)}
                                    onContextMenu={event => onColContextMenu?.(event, column.key, colIdx)}
                                    onDragStart={e => handleColDragStart(colIdx, e)}
                                    onDragOver={e => handleColDragOver(colIdx, e)}
                                    onDragLeave={() => setColDragOver(null)}
                                    onDrop={e => handleColDrop(colIdx, e)}
                                    onDragEnd={() => { setDraggedColIndex(null); setColDragOver(null); }}
                                >
                                    <div className="col-header-inner">
                                        <span
                                            className="col-header-label"
                                            contentEditable={true}
                                            suppressContentEditableWarning={true}
                                            data-col-key={column.key}
                                            data-old-label={column.label}
                                            title="クリックして列名を編集"
                                            onClick={event => event.stopPropagation()}
                                            onBlur={event => handleColumnLabelBlur(column.key, column.label, event.currentTarget)}
                                            onKeyDown={event => handleColumnLabelKeyDown(event, column.label)}
                                        >
                                            {column.label}
                                        </span>
                                        <ValueTypeTag type={column.type} />
                                        <button
                                            className={`col-sort-btn${isSorted ? ' active' : ''}`}
                                            title={isSorted ? `ソート中: ${sortState.direction}` : '列でソート'}
                                            type="button"
                                            onClick={event => {
                                                event.stopPropagation();
                                                onSortChange(column.key);
                                            }}
                                        >
                                            {sortIndicator || '↕'}
                                        </button>
                                    </div>
                                    <div
                                        className={`col-resizer${resizingColKey === column.key ? ' is-resizing' : ''}`}
                                        data-col-key={column.key}
                                        title="ドラッグして列幅を調整 / ダブルクリックでリセット"
                                        onMouseDown={event => handleResizeStart(event, column.key)}
                                        onDoubleClick={event => {
                                            event.stopPropagation();
                                            onResetColWidth?.(column.key);
                                        }}
                                    />
                                </th>
                            );
                        })}
                        <th className="col-add-header">
                            <button
                                className="btn-add-col"
                                id="addColBtn"
                                title="一番右に列を挿入"
                                type="button"
                                onClick={onAddColumn}
                            >
                                ＋
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {page.totalRows === 0 ? (
                        <tr><td className="empty-placeholder" colSpan={tableView.columns.length + 2}>データがありません</td></tr>
                    ) : page.rows.map(({ row, originalIndex }, rowIdx) => {
                        let rowDndClass = '';
                        if (draggedRowIndex === originalIndex) {
                            rowDndClass += ' dragging';
                        }
                        if (rowDragOver?.index === originalIndex) {
                            rowDndClass += rowDragOver.side === 'top' ? ' drag-over-top' : ' drag-over-bottom';
                        }

                        return (
                            <tr
                                className={`table-row-item${selection.type === 'row' && selection.rowIndex === originalIndex ? ' row-selected' : ''}${rowDndClass}`}
                                data-row-index={originalIndex}
                                data-row-path={row.path}
                                key={row.path}
                                draggable={true}
                                onDragStart={e => handleRowDragStart(originalIndex, e)}
                                onDragOver={e => handleRowDragOver(originalIndex, e)}
                                onDragLeave={() => setRowDragOver(null)}
                                onDrop={e => handleRowDrop(originalIndex, e)}
                                onDragEnd={() => { setDraggedRowIndex(null); setRowDragOver(null); }}
                            >
                                <td
                                    className="col-index drag-handle row-header"
                                    data-row-index={originalIndex}
                                    data-row-path={row.path}
                                    onClick={() => onRowClick(originalIndex, row.path)}
                                    onContextMenu={event => onRowContextMenu?.(event, originalIndex, row.path)}
                                >
                                    {originalIndex + 1}
                                </td>
                                {tableView.columns.map(column => {
                                    const cell = row.cells[column.key];
                                    const isArray = column.type === 'array' || cell?.type === 'array';
                                    const cellPath = cell?.path ?? `${row.path}.${column.key}`;
                                    const selClass = cellSelectionClass(selection, originalIndex, column.key);
                                    const customWidth = colWidths[column.key];
                                    const widthStyle = customWidth
                                        ? { width: `${customWidth}px`, minWidth: `${customWidth}px`, maxWidth: `${customWidth}px` }
                                        : undefined;

                                    if (isArray) {
                                        return (
                                            <td
                                                className={`col-val col-val-array${selClass ? ` ${selClass}` : ''}`}
                                                style={widthStyle}
                                                data-col-key={column.key}
                                                data-path={cellPath}
                                                data-row-index={originalIndex}
                                                data-type="array"
                                                key={column.key}
                                                onClick={() => onCellClick(originalIndex, column.key, cellPath)}
                                                onContextMenu={e => onCellContextMenu?.(e, { rowIndex: originalIndex, colKey: column.key, path: cellPath })}
                                            >
                                                <button
                                                    className="btn-edit-array edit-sub-array-btn"
                                                    data-array-path={cellPath}
                                                    title="編集する"
                                                    type="button"
                                                    onClick={event => {
                                                        event.stopPropagation();
                                                        onNavigateArray?.(cellPath);
                                                    }}
                                                >
                                                    編集する
                                                </button>
                                            </td>
                                        );
                                    }

                                    return (
                                        <EditableCell
                                            key={column.key}
                                            path={cellPath}
                                            colKey={column.key}
                                            rowIndex={originalIndex}
                                            displayValue={cell?.displayValue ?? ''}
                                            type={column.type}
                                            className={`col-val${selClass ? ` ${selClass}` : ''}`}
                                            style={widthStyle}
                                            isSelected={!!selClass}
                                            onUpdateCell={onUpdateCell}
                                            onSelectCell={onCellClick}
                                            onNavigateAdjacent={dir => onNavigateAdjacent({ rowIndex: originalIndex, colKey: column.key, path: cellPath }, dir)}
                                            onContextMenu={e => onCellContextMenu?.(e, { rowIndex: originalIndex, colKey: column.key, path: cellPath })}
                                        />
                                    );
                                })}
                                <td className="col-add-cell" />
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <Pagination page={page} onPageChange={onPageChange} />
            <div className="add-row-bottom">
                <button
                    className="btn-add-plus"
                    id="addTableRowBtn"
                    title="行を追加"
                    type="button"
                    onClick={onAddRow}
                >
                    ＋
                </button>
            </div>
        </div>
    );
}
