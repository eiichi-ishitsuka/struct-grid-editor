import type { GridDataDto } from '../../../application/dto/GridData';
import { tryGetVsCodeApi } from './vscodeApi';
import { Breadcrumbs } from './components/Breadcrumbs';
import { ColumnVisibilityMenu } from './components/ColumnVisibilityMenu';
import { KvGrid } from './components/KvGrid';
import { SpreadsheetGrid } from './components/SpreadsheetGrid';
import { Toolbar } from './components/Toolbar';
import { useFocusRestoration } from './hooks/useFocusRestoration';
import { useGridSelection } from './hooks/useGridSelection';
import { defaultGridUiState, normalizeGridUiState, type GridUiState } from './hooks/gridUiState';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { useTableView } from './hooks/useTableView';
import { useVsCodeState } from './hooks/useVsCodeState';
import type { WebviewMessage } from '../protocol';
import { useCallback, useRef } from 'react';

interface AppProps {
    initialData: GridDataDto;
}

export function App({ initialData }: AppProps) {
    const [savedUiState, setSavedUiState] = useVsCodeState(defaultGridUiState);
    const uiState = normalizeGridUiState(savedUiState);
    const { selection, setSelection, clearSelection, selectCell, selectRow, selectCol, selectAll } = useGridSelection();
    const setUiState = (updater: GridUiState | ((state: GridUiState) => GridUiState)) => {
        setSavedUiState(current => {
            const normalizedCurrent = normalizeGridUiState(current);
            return typeof updater === 'function' ? updater(normalizedCurrent) : updater;
        });
    };
    const table = useTableView(initialData, uiState, setUiState);
    const { containerRef, savePendingFocus } = useFocusRestoration({
        pendingFocus: uiState.pendingFocus,
        setUiState,
        setSelection,
    });
    const tableView = table.tableView;

    // postMessage ヘルパー
    const vsCodeApiRef = useRef(tryGetVsCodeApi());
    const postMessage = useCallback((message: WebviewMessage) => {
        vsCodeApiRef.current?.postMessage(message);
    }, []);

    const handleKeyDown = useKeyboardNavigation({
        rows: table.page.rows,
        tableView: tableView ?? { path: '', columns: [], allColumns: [], rows: [], totalRows: 0, totalColumns: 0, isObjectArray: false },
        activeArrayPath: table.activeArrayPath,
        onNavigate: cell => {
            selectCell(cell.rowIndex, cell.colKey, cell.path);
            savePendingFocus(cell);
        },
        onSelectAll: selectAll,
        postMessage,
    });

    if (initialData.error) {
        return <div className="error-card"><h3>構文エラー</h3><p>{initialData.error}</p></div>;
    }

    const isTableMode = initialData.viewMode === 'table' && tableView !== null;
    const itemCount = isTableMode
        ? `${tableView.totalRows} 行 (${tableView.totalColumns} 列)`
        : `${initialData.totalRows} 項目`;

    return (
        <main className="webview-app" ref={containerRef} onClick={event => {
            // テーブル外のクリックで選択解除
            if (!(event.target as HTMLElement).closest('table')) {
                clearSelection();
            }
        }}>
            <Toolbar
                documentType={initialData.documentType}
                itemCount={itemCount}
                searchQuery={table.searchQuery}
                onSearchQueryChange={table.setSearchQuery}
            >
                {isTableMode && (
                    <ColumnVisibilityMenu
                        columns={tableView.allColumns}
                        hiddenColumns={uiState.hiddenCols[table.pathKey] ?? []}
                        onHiddenColumnsChange={table.setHiddenColumns}
                    />
                )}
            </Toolbar>
            <Breadcrumbs activeArrayPath={table.activeArrayPath} onNavigate={table.setActiveArrayPath} />
            {isTableMode ? (
                <SpreadsheetGrid
                    tableView={tableView}
                    page={table.page}
                    selection={selection}
                    sortState={table.sortState}
                    onPageChange={table.setCurrentPage}
                    onCellClick={selectCell}
                    onRowClick={selectRow}
                    onColClick={selectCol}
                    onCellKeyDown={handleKeyDown}
                    onSortChange={table.toggleSort}
                />
            ) : (
                <KvGrid rows={initialData.rows} searchQuery={table.searchQuery} />
            )}
        </main>
    );
}
