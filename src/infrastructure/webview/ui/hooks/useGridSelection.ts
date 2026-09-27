import { useCallback, useState } from 'react';
import type { GridSelection } from './gridUiState';

/** 表の選択操作と、選択状態に基づく CSS クラスの付与を管理する。 */
export function useGridSelection() {
    const [selection, setSelection] = useState<GridSelection>({ type: 'none' });
    const clearSelection = useCallback(() => setSelection({ type: 'none' }), []);

    const selectCell = useCallback((rowIndex: number, colKey: string, path: string) => {
        setSelection({ type: 'cell', rowIndex, colKey, path });
    }, []);

    const selectRow = useCallback((rowIndex: number, path: string) => {
        setSelection({ type: 'row', rowIndex, path });
    }, []);

    const selectCol = useCallback((colKey: string) => {
        setSelection({ type: 'col', colKey });
    }, []);

    const selectAll = useCallback(() => {
        setSelection({ type: 'all' });
    }, []);

    return { selection, setSelection, clearSelection, selectCell, selectRow, selectCol, selectAll };
}

/** セルの選択状態に応じた CSS クラスを返す。 */
export function cellSelectionClass(selection: GridSelection, rowIndex: number, colKey: string): string {
    if (selection.type === 'all') {
        return 'selected';
    }
    if (selection.type === 'cell' && selection.rowIndex === rowIndex && selection.colKey === colKey) {
        return 'selected';
    }
    if (selection.type === 'row' && selection.rowIndex === rowIndex) {
        return 'selected';
    }
    if (selection.type === 'col' && selection.colKey === colKey) {
        return 'selected';
    }
    return '';
}
