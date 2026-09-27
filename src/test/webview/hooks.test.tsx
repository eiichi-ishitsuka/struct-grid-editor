// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cellSelectionClass, useGridSelection } from '../../webview/hooks/useGridSelection';
import { useFocusRestoration } from '../../webview/hooks/useFocusRestoration';
import { defaultGridUiState, type GridUiState } from '../../webview/hooks/gridUiState';
import { findAdjacentCell } from '../../webview/hooks/useKeyboardNavigation';
import { useVsCodeState } from '../../webview/hooks/useVsCodeState';
import type { IndexedTableRow, OrderedTableView } from '../../webview/model/tableView';

describe('Webview UI hooks', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    /** 【観点】VS Code state を復元し、React state の変更を同じ API へ保存すること */
    it('restores and persists state through the VS Code API', () => {
        const setState = vi.fn();
        vi.stubGlobal('acquireVsCodeApi', () => ({
            getState: () => ({ page: 2 }),
            setState,
            postMessage: vi.fn(),
        }));

        const { result } = renderHook(() => useVsCodeState({ page: 1 }));
        expect(result.current[0]).toEqual({ page: 2 });

        act(() => result.current[1](current => ({ page: current.page + 1 })));
        expect(result.current[0]).toEqual({ page: 3 });
        expect(setState).toHaveBeenCalledWith({ page: 3 });
    });

    /** 【観点】選択状態を一箇所で設定・解除できること */
    it('sets and clears grid selection', () => {
        const { result } = renderHook(() => useGridSelection());

        act(() => result.current.setSelection({ type: 'cell', rowIndex: 0, colKey: 'name', path: '[0].name' }));
        expect(result.current.selection).toEqual({ type: 'cell', rowIndex: 0, colKey: 'name', path: '[0].name' });

        act(() => result.current.clearSelection());
        expect(result.current.selection).toEqual({ type: 'none' });
    });

    /** 【観点】保存済みのフォーカス情報を選択状態へ復元してから消費すること */
    it('restores pending focus after a render', () => {
        const { result } = renderHook(() => {
            const [state, setState] = useState<GridUiState>({
                ...defaultGridUiState,
                pendingFocus: { path: '[1].name', rowIndex: 1, colKey: 'name' },
            });
            const selection = useGridSelection();
            const setUiState = (updater: GridUiState | ((s: GridUiState) => GridUiState)) => {
                setState(current => typeof updater === 'function' ? updater(current) : updater);
            };
            useFocusRestoration({ pendingFocus: state.pendingFocus, setUiState, setSelection: selection.setSelection });
            return { state, selection };
        });

        expect(result.current.selection.selection).toEqual({ type: 'cell', path: '[1].name', rowIndex: 1, colKey: 'name' });
        expect(result.current.state.pendingFocus).toBeUndefined();
    });

    /** 【観点】Tab の行末折返しと矢印移動の次セルを DTO だけから求められること */
    it('finds the adjacent visible cell including horizontal wrapping', () => {
        const rows: IndexedTableRow[] = [
            { originalIndex: 4, row: { index: 4, path: '[4]', cells: { id: { path: '[4].id', value: 4, displayValue: '4', type: 'number' }, name: { path: '[4].name', value: 'A', displayValue: 'A', type: 'string' } } } },
            { originalIndex: 5, row: { index: 5, path: '[5]', cells: { id: { path: '[5].id', value: 5, displayValue: '5', type: 'number' }, name: { path: '[5].name', value: 'B', displayValue: 'B', type: 'string' } } } },
        ];
        const tableView: OrderedTableView = {
            path: '',
            columns: [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }],
            allColumns: [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }],
            rows: rows.map(entry => entry.row),
            totalRows: 2,
            totalColumns: 2,
            isObjectArray: true,
        };

        expect(findAdjacentCell(rows, tableView, { rowIndex: 4, colKey: 'name', path: '[4].name' }, 'right'))
            .toEqual({ rowIndex: 5, colKey: 'id', path: '[5].id' });
        expect(findAdjacentCell(rows, tableView, { rowIndex: 5, colKey: 'id', path: '[5].id' }, 'up'))
            .toEqual({ rowIndex: 4, colKey: 'id', path: '[4].id' });
    });

    /** 【観点】選択状態に応じた CSS クラスを正しく返すこと */
    it('returns the correct CSS class for cell/row/col/all selection', () => {
        expect(cellSelectionClass({ type: 'none' }, 0, 'name')).toBe('');
        expect(cellSelectionClass({ type: 'cell', rowIndex: 0, colKey: 'name', path: '[0].name' }, 0, 'name')).toBe('selected');
        expect(cellSelectionClass({ type: 'cell', rowIndex: 0, colKey: 'name', path: '[0].name' }, 1, 'name')).toBe('');
        expect(cellSelectionClass({ type: 'row', rowIndex: 2, path: '[2]' }, 2, 'id')).toBe('selected');
        expect(cellSelectionClass({ type: 'row', rowIndex: 2, path: '[2]' }, 3, 'id')).toBe('');
        expect(cellSelectionClass({ type: 'col', colKey: 'age' }, 0, 'age')).toBe('selected');
        expect(cellSelectionClass({ type: 'col', colKey: 'age' }, 5, 'name')).toBe('');
        expect(cellSelectionClass({ type: 'all' }, 99, 'any')).toBe('selected');
    });

    /** 【観点】行選択・列選択・全選択のヘルパーが正しい selection を設定すること */
    it('provides selectRow, selectCol, and selectAll helpers', () => {
        const { result } = renderHook(() => useGridSelection());

        act(() => result.current.selectRow(3, '[3]'));
        expect(result.current.selection).toEqual({ type: 'row', rowIndex: 3, path: '[3]' });

        act(() => result.current.selectCol('age'));
        expect(result.current.selection).toEqual({ type: 'col', colKey: 'age' });

        act(() => result.current.selectAll());
        expect(result.current.selection).toEqual({ type: 'all' });

        act(() => result.current.clearSelection());
        expect(result.current.selection).toEqual({ type: 'none' });
    });
});
