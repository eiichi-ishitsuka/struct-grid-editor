import { useCallback, useEffect, useRef } from 'react';
import type { PendingFocus } from './gridUiState';
import type { StateUpdater } from './useVsCodeState';
import type { GridUiState } from './gridUiState';
import type { GridSelection } from './gridUiState';

interface FocusRestorationOptions {
    pendingFocus: PendingFocus | undefined;
    setUiState: (updater: StateUpdater<GridUiState>) => void;
    setSelection: (selection: GridSelection) => void;
}

/** 再描画をまたぐセル選択を Webview state に保存・復元する。 */
export function useFocusRestoration({ pendingFocus, setUiState, setSelection }: FocusRestorationOptions) {
    const containerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!pendingFocus?.path || pendingFocus.rowIndex === undefined || !pendingFocus.colKey) {
            return;
        }

        setSelection({
            type: 'cell',
            path: pendingFocus.path,
            rowIndex: pendingFocus.rowIndex,
            colKey: pendingFocus.colKey,
        });
        setUiState(current => ({ ...current, pendingFocus: undefined }));

        // 選択状態を設定した後、対象セルへ DOM フォーカスを移す
        requestAnimationFrame(() => {
            const container = containerRef.current ?? document;
            const cell = container.querySelector<HTMLElement>(
                `[data-row-index="${pendingFocus.rowIndex}"][data-col-key="${pendingFocus.colKey}"]`
            );
            cell?.focus();
        });
    }, [pendingFocus, setSelection, setUiState]);

    const savePendingFocus = useCallback((focus: PendingFocus) => {
        setUiState(current => ({ ...current, pendingFocus: focus }));
    }, [setUiState]);

    return { containerRef, savePendingFocus };
}
