import { useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import type { WebviewMessage } from '../protocol';
import type { IndexedTableRow, OrderedTableView } from '../model/tableView';

export type GridNavigationDirection = 'up' | 'down' | 'left' | 'right';

export interface GridCellCoordinate {
    rowIndex: number;
    colKey: string;
    path: string;
}

/** 表の可視セル間で、指定方向に隣接するセルを返す。 */
export function findAdjacentCell(
    rows: IndexedTableRow[],
    tableView: OrderedTableView,
    current: GridCellCoordinate,
    direction: GridNavigationDirection
): GridCellCoordinate | null {
    const rowPosition = rows.findIndex(({ originalIndex }) => originalIndex === current.rowIndex);
    const columnPosition = tableView.columns.findIndex(column => column.key === current.colKey);
    if (rowPosition < 0 || columnPosition < 0) {
        return null;
    }

    let nextRowPosition = rowPosition;
    let nextColumnPosition = columnPosition;
    if (direction === 'up') {
        nextRowPosition -= 1;
    }
    if (direction === 'down') {
        nextRowPosition += 1;
    }
    if (direction === 'left') {
        nextColumnPosition -= 1;
    }
    if (direction === 'right') {
        nextColumnPosition += 1;
    }

    if (nextColumnPosition < 0) {
        nextRowPosition -= 1;
        nextColumnPosition = tableView.columns.length - 1;
    }
    if (nextColumnPosition >= tableView.columns.length) {
        nextRowPosition += 1;
        nextColumnPosition = 0;
    }
    const nextRow = rows[nextRowPosition];
    const nextColumn = tableView.columns[nextColumnPosition];
    if (!nextRow || !nextColumn) {
        return null;
    }

    const cell = nextRow.row.cells[nextColumn.key];
    return {
        rowIndex: nextRow.originalIndex,
        colKey: nextColumn.key,
        path: cell?.path ?? `${nextRow.row.path}.${nextColumn.key}`,
    };
}

export interface KeyboardNavigationOptions {
    rows: IndexedTableRow[];
    tableView: OrderedTableView;
    activeArrayPath: string | null;
    onNavigate: (cell: GridCellCoordinate) => void;
    onSelectAll: () => void;
    postMessage: (message: WebviewMessage) => void;
}

/** Enter、Tab、矢印キー、Delete、Ctrl/Cmd+A を同じセル移動規則へ集約する。 */
export function useKeyboardNavigation({
    rows,
    tableView,
    activeArrayPath,
    onNavigate,
    onSelectAll,
    postMessage,
}: KeyboardNavigationOptions) {
    return useCallback((event: KeyboardEvent<HTMLElement>, current: GridCellCoordinate) => {
        // Ctrl/Cmd+A → 全選択
        if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            onSelectAll();
            return;
        }

        // Delete / Backspace → セルクリア
        if (event.key === 'Delete' || event.key === 'Backspace') {
            event.preventDefault();
            postMessage({
                command: 'update_cell',
                path: current.path,
                value: '',
            });
            return;
        }

        const direction = getDirection(event);
        if (!direction) {
            return;
        }

        const nextCell = findAdjacentCell(rows, tableView, current, direction);
        if (nextCell) {
            event.preventDefault();
            onNavigate(nextCell);
        }
    }, [activeArrayPath, onNavigate, onSelectAll, postMessage, rows, tableView]);
}

function getDirection(event: KeyboardEvent<HTMLElement>): GridNavigationDirection | null {
    if (event.key === 'ArrowUp' || event.code === 'Numpad8') {
        return 'up';
    }
    if (event.key === 'ArrowDown' || event.code === 'Numpad2') {
        return 'down';
    }
    if (event.key === 'ArrowLeft' || event.code === 'Numpad4') {
        return 'left';
    }
    if (event.key === 'ArrowRight' || event.code === 'Numpad6') {
        return 'right';
    }
    if (event.key === 'Tab') {
        return event.shiftKey ? 'left' : 'right';
    }
    if (event.key === 'Enter' || event.code === 'NumpadEnter') {
        return event.shiftKey ? 'up' : 'down';
    }
    return null;
}
