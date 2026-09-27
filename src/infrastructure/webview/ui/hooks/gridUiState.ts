import type { TableViewPreferences } from '../model/tableView';

export type GridSelection =
    | { type: 'none' }
    | { type: 'all' }
    | { type: 'row'; rowIndex: number; path: string }
    | { type: 'col'; colKey: string }
    | { type: 'cell'; rowIndex: number; colKey: string; path: string };

export interface PendingFocus {
    path?: string;
    rowIndex?: number;
    colKey?: string;
}

/** 既存 Webview state と互換性のある、React 側の永続 UI state。 */
export interface GridUiState extends TableViewPreferences {
    customColWidths: Record<string, Record<string, number>>;
    currentPage: number;
    pendingFocus?: PendingFocus;
}

export const defaultGridUiState: GridUiState = {
    customColOrders: {},
    customRowOrders: {},
    customColWidths: {},
    hiddenCols: {},
    sortState: {},
    currentPage: 1,
};

/** 過去の Webview state を、現在の完全な state 形式へ補完する。 */
export function normalizeGridUiState(state: Partial<GridUiState> | undefined): GridUiState {
    return {
        ...defaultGridUiState,
        ...state,
        customColOrders: state?.customColOrders ?? {},
        customRowOrders: state?.customRowOrders ?? {},
        customColWidths: state?.customColWidths ?? {},
        hiddenCols: state?.hiddenCols ?? {},
        sortState: state?.sortState ?? {},
        currentPage: state?.currentPage || 1,
    };
}
