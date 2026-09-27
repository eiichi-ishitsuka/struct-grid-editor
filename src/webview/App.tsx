import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import type { GridDataDto, GridRowDto } from '../application/dto/GridData';
import type { WebviewMessage } from './protocol';
import { Breadcrumbs } from './components/Breadcrumbs';
import { ColumnVisibilityMenu } from './components/ColumnVisibilityMenu';
import { ContextMenu, type ContextMenuItem } from './components/ContextMenu';
import { KvGrid } from './components/KvGrid';
import { SpreadsheetGrid } from './components/SpreadsheetGrid';
import { Toast } from './components/Toast';
import { Toolbar } from './components/Toolbar';
import { defaultGridUiState, normalizeGridUiState, type GridUiState } from './hooks/gridUiState';
import { useFocusRestoration } from './hooks/useFocusRestoration';
import { useGridSelection } from './hooks/useGridSelection';
import { findAdjacentCell, type GridCellCoordinate, type GridNavigationDirection } from './hooks/useKeyboardNavigation';
import { useTableView } from './hooks/useTableView';
import { useVsCodeState } from './hooks/useVsCodeState';
import { generateTsv } from './model/tsv';
import { tryGetVsCodeApi } from './vscodeApi';

export interface AppProps {
    initialData: GridDataDto;
}

export function App({ initialData }: AppProps) {
    const [savedUiState, setSavedUiState] = useVsCodeState(defaultGridUiState);
    const uiState = normalizeGridUiState(savedUiState);
    const { selection, setSelection, clearSelection, selectCell, selectRow, selectCol, selectAll } = useGridSelection();

    const setUiState = useCallback((updater: GridUiState | ((state: GridUiState) => GridUiState)) => {
        setSavedUiState(current => {
            const normalizedCurrent = normalizeGridUiState(current);
            return typeof updater === 'function' ? updater(normalizedCurrent) : updater;
        });
    }, [setSavedUiState]);

    const table = useTableView(initialData, uiState, setUiState);
    const { containerRef, savePendingFocus } = useFocusRestoration({
        pendingFocus: uiState.pendingFocus,
        setUiState,
        setSelection,
    });
    const tableView = table.tableView;

    // Toast 通知状態
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback((msg: string) => {
        setToastMessage(msg);
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }
        toastTimeoutRef.current = setTimeout(() => {
            setToastMessage(null);
        }, 1800);
    }, []);

    // コンテキストメニュー状態
    const [contextMenu, setContextMenu] = useState<{
        items: ContextMenuItem[];
        position: { x: number; y: number };
    } | null>(null);

    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
    }, []);

    // postMessage ヘルパー
    const vsCodeApiRef = useRef(tryGetVsCodeApi());
    const postMessage = useCallback((message: WebviewMessage) => {
        vsCodeApiRef.current?.postMessage(message);
    }, []);

    // セル移動ヘルパー
    const handleNavigateAdjacent = useCallback((current: GridCellCoordinate, direction: GridNavigationDirection) => {
        if (!tableView) {
            return;
        }
        const nextCell = findAdjacentCell(table.page.rows, tableView, current, direction);
        if (nextCell) {
            selectCell(nextCell.rowIndex, nextCell.colKey, nextCell.path);
            savePendingFocus(nextCell);
            const target = document.querySelector<HTMLElement>(
                `td.col-val[data-row-index="${nextCell.rowIndex}"][data-col-key="${nextCell.colKey}"]`
            );
            target?.focus();
        }
    }, [savePendingFocus, selectCell, table.page.rows, tableView]);

    // セル値更新
    const handleUpdateCell = useCallback((path: string, value: string) => {
        postMessage({ command: 'update_cell', path, value });
    }, [postMessage]);

    // 行追加
    const handleAddTableRow = useCallback(() => {
        postMessage({
            command: 'add_table_row',
            arrayPath: table.activeArrayPath || '',
        });
    }, [postMessage, table.activeArrayPath]);

    // 列追加
    const handleAddTableColumn = useCallback(() => {
        const existingKeys = tableView ? tableView.columns.map(c => c.key) : [];
        let counter = 1;
        let candidate = `col${counter}`;
        while (existingKeys.includes(candidate)) {
            counter++;
            candidate = `col${counter}`;
        }
        postMessage({
            command: 'add_table_column',
            arrayPath: table.activeArrayPath || '',
            columnKey: candidate,
        });
    }, [postMessage, table.activeArrayPath, tableView]);

    // 列名変更
    const handleRenameColumn = useCallback((oldKey: string, newKey: string) => {
        postMessage({
            command: 'rename_table_column',
            arrayPath: table.activeArrayPath || '',
            oldKey,
            newKey,
        });
    }, [postMessage, table.activeArrayPath]);

    // KV行追加
    const handleAddKvRow = useCallback(() => {
        const existingKeys = initialData.rows.map(r => r.path);
        let baseKey = 'newKey';
        let counter = 1;
        while (existingKeys.includes(baseKey)) {
            baseKey = `newKey${counter}`;
            counter++;
        }
        postMessage({
            command: 'add_row',
            parentPath: '',
            key: baseKey,
            value: '',
        });
    }, [initialData.rows, postMessage]);

    // KVキー名変更
    const handleRenameKey = useCallback((path: string, _oldKey: string, newKey: string) => {
        postMessage({
            command: 'rename_key',
            path,
            newKey,
        });
    }, [postMessage]);

    // テキストエディタを開く
    const handleOpenTextEditor = useCallback(() => {
        postMessage({ command: 'open_text_editor' });
    }, [postMessage]);

    // 列 DnD
    const handleMoveColumn = useCallback((fromIndex: number, toIndex: number) => {
        if (!tableView || fromIndex === toIndex) {
            return;
        }
        const colKeys = tableView.columns.map(c => c.key);
        const [moved] = colKeys.splice(fromIndex, 1);
        colKeys.splice(toIndex, 0, moved);
        setUiState(current => ({
            ...current,
            customColOrders: {
                ...current.customColOrders,
                [table.pathKey]: colKeys,
            },
        }));
    }, [setUiState, table.pathKey, tableView]);

    // 行 DnD
    const handleMoveRow = useCallback((fromIndex: number, toIndex: number) => {
        if (!tableView || fromIndex === toIndex) {
            return;
        }
        const rowPaths = tableView.rows.map(r => r.path);
        const [moved] = rowPaths.splice(fromIndex, 1);
        rowPaths.splice(toIndex, 0, moved);
        setUiState(current => ({
            ...current,
            customRowOrders: {
                ...current.customRowOrders,
                [table.pathKey]: rowPaths,
            },
        }));
    }, [setUiState, table.pathKey, tableView]);

    // 列リサイズ
    const handleResizeColumn = useCallback((colKey: string, width: number) => {
        setUiState(current => ({
            ...current,
            customColWidths: {
                ...current.customColWidths,
                [table.pathKey]: {
                    ...(current.customColWidths[table.pathKey] ?? {}),
                    [colKey]: width,
                },
            },
        }));
    }, [setUiState, table.pathKey]);

    // 列幅リセット
    const handleResetColWidth = useCallback((colKey: string) => {
        setUiState(current => {
            const pathWidths = { ...(current.customColWidths[table.pathKey] ?? {}) };
            delete pathWidths[colKey];
            return {
                ...current,
                customColWidths: {
                    ...current.customColWidths,
                    [table.pathKey]: pathWidths,
                },
            };
        });
    }, [setUiState, table.pathKey]);

    // クリップボード コピー / 切り取り / 削除
    const copySelection = useCallback(async (showToastNotification = true) => {
        const tsv = generateTsv(tableView, selection);
        if (!tsv) {
            return;
        }
        try {
            await navigator.clipboard.writeText(tsv);
            if (showToastNotification) {
                showToast('クリップボードにTSV形式でコピーしました');
            }
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = tsv;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            if (showToastNotification) {
                showToast('クリップボードにTSV形式でコピーしました');
            }
        }
    }, [selection, showToast, tableView]);

    const deleteSelection = useCallback(() => {
        if (selection.type === 'row') {
            postMessage({ command: 'delete_row', path: selection.path });
            clearSelection();
        } else if (selection.type === 'col') {
            postMessage({
                command: 'clear_table_column',
                arrayPath: table.activeArrayPath || '',
                columnKey: selection.colKey,
            });
        } else if (selection.type === 'all') {
            postMessage({
                command: 'clear_table_data',
                arrayPath: table.activeArrayPath || '',
            });
        } else if (selection.type === 'cell') {
            postMessage({ command: 'update_cell', path: selection.path, value: '' });
        }
    }, [clearSelection, postMessage, selection, table.activeArrayPath]);

    const cutSelection = useCallback(async () => {
        if (selection.type === 'none') {
            return;
        }
        await copySelection(false);
        deleteSelection();
        showToast('切り取りました（TSV形式でコピー済み）');
    }, [copySelection, deleteSelection, selection.type, showToast]);

    // Context Menu Handlers
    const handleCornerContextMenu = useCallback((event: MouseEvent<HTMLTableCellElement>) => {
        event.preventDefault();
        event.stopPropagation();
        selectAll();

        const hidden = uiState.hiddenCols[table.pathKey] ?? [];
        const curSort = table.sortState;

        const items: ContextMenuItem[] = [
            { label: 'すべてコピー (TSV)', action: () => { void copySelection(true); } },
            { label: 'すべて切り取り', action: () => { void cutSelection(); } },
        ];

        if (curSort) {
            items.push({
                label: 'ソートを解除',
                action: () => {
                    setUiState(current => {
                        const newSortState = { ...current.sortState };
                        delete newSortState[table.pathKey];
                        return { ...current, sortState: newSortState };
                    });
                },
            });
        }

        if (hidden.length > 0) {
            items.push({
                label: `すべての非表示列を再表示 (${hidden.length}列)`,
                action: () => {
                    table.setHiddenColumns([]);
                    showToast('すべての列を再表示しました');
                },
            });
        }

        items.push(
            { isSeparator: true },
            { label: '全データをクリア', danger: true, action: deleteSelection }
        );

        setContextMenu({ items, position: { x: event.clientX, y: event.clientY } });
    }, [copySelection, cutSelection, deleteSelection, selectAll, setUiState, showToast, table, uiState.hiddenCols]);

    const handleRowContextMenu = useCallback((event: MouseEvent<HTMLTableCellElement>, rowIndex: number, path: string) => {
        event.preventDefault();
        event.stopPropagation();
        selectRow(rowIndex, path);

        const items: ContextMenuItem[] = [
            { label: '行をコピー (TSV)', action: () => { void copySelection(true); } },
            { label: '行を切り取り', action: () => { void cutSelection(); } },
            { isSeparator: true },
            {
                label: `行 ${rowIndex + 1} を削除`,
                danger: true,
                action: () => {
                    postMessage({ command: 'delete_row', path });
                    clearSelection();
                },
            },
        ];

        setContextMenu({ items, position: { x: event.clientX, y: event.clientY } });
    }, [clearSelection, copySelection, cutSelection, postMessage, selectRow]);

    const handleColContextMenu = useCallback((event: MouseEvent<HTMLTableCellElement>, colKey: string, _colIndex: number) => {
        event.preventDefault();
        event.stopPropagation();
        selectCol(colKey);

        const curSort = table.sortState;
        const isSortedThis = curSort?.colKey === colKey;
        const customWidths = uiState.customColWidths[table.pathKey] ?? {};
        const hasCustomWidth = !!customWidths[colKey];
        const hidden = uiState.hiddenCols[table.pathKey] ?? [];

        const items: ContextMenuItem[] = [
            { label: '列をコピー (TSV)', action: () => { void copySelection(true); } },
            { label: '列を切り取り', action: () => { void cutSelection(); } },
            { isSeparator: true },
            {
                label: '昇順でソート (A→Z / 0→9)',
                action: () => {
                    setUiState(current => ({
                        ...current,
                        sortState: { ...current.sortState, [table.pathKey]: { colKey, direction: 'asc' } },
                        currentPage: 1,
                    }));
                },
            },
            {
                label: '降順でソート (Z→A / 9→0)',
                action: () => {
                    setUiState(current => ({
                        ...current,
                        sortState: { ...current.sortState, [table.pathKey]: { colKey, direction: 'desc' } },
                        currentPage: 1,
                    }));
                },
            },
        ];

        if (isSortedThis) {
            items.push({
                label: 'ソートを解除',
                action: () => {
                    setUiState(current => {
                        const newSortState = { ...current.sortState };
                        delete newSortState[table.pathKey];
                        return { ...current, sortState: newSortState };
                    });
                },
            });
        }

        items.push({ isSeparator: true });

        if (hasCustomWidth) {
            items.push({
                label: '列の幅をリセット',
                action: () => handleResetColWidth(colKey),
            });
        }

        items.push({
            label: 'この列を非表示',
            action: () => {
                const currentHidden = uiState.hiddenCols[table.pathKey] ?? [];
                if (!currentHidden.includes(colKey)) {
                    table.setHiddenColumns([...currentHidden, colKey]);
                }
                clearSelection();
                showToast(`列 "${colKey}" を非表示にしました`);
            },
        });

        if (hidden.length > 0) {
            items.push({
                label: `すべての非表示列を再表示 (${hidden.length}列)`,
                action: () => {
                    table.setHiddenColumns([]);
                    showToast('すべての列を再表示しました');
                },
            });
        }

        items.push(
            { isSeparator: true },
            { label: '列の値をクリア', danger: true, action: deleteSelection }
        );

        setContextMenu({ items, position: { x: event.clientX, y: event.clientY } });
    }, [clearSelection, copySelection, cutSelection, deleteSelection, handleResetColWidth, selectCol, setUiState, showToast, table, uiState.customColWidths, uiState.hiddenCols]);

    const handleCellContextMenu = useCallback((event: MouseEvent<HTMLTableCellElement>, cell: GridCellCoordinate) => {
        event.preventDefault();
        event.stopPropagation();
        if (selection.type !== 'all' && selection.type !== 'row' && selection.type !== 'col') {
            selectCell(cell.rowIndex, cell.colKey, cell.path);
        }

        const items: ContextMenuItem[] = [
            { label: 'コピー (TSV)', action: () => { void copySelection(true); } },
            { label: '切り取り', action: () => { void cutSelection(); } },
            { isSeparator: true },
            { label: 'セルの値をクリア', danger: true, action: deleteSelection },
        ];

        setContextMenu({ items, position: { x: event.clientX, y: event.clientY } });
    }, [copySelection, cutSelection, deleteSelection, selectCell, selection.type]);

    const handleKvKeyContextMenu = useCallback((event: MouseEvent<HTMLSpanElement>, row: GridRowDto) => {
        event.preventDefault();
        event.stopPropagation();
        const key = row.key || row.path;

        const items: ContextMenuItem[] = [
            {
                label: `キー "${key}" を削除`,
                danger: true,
                action: () => {
                    postMessage({ command: 'delete_row', path: row.path });
                },
            },
        ];

        setContextMenu({ items, position: { x: event.clientX, y: event.clientY } });
    }, [postMessage]);

    // グローバル キーボード ショートカット (未編集時の Ctrl+C, Ctrl+X, Delete, Backspace, Ctrl+A, Escape)
    useEffect(() => {
        const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
            const active = document.activeElement as HTMLElement | null;
            const isEditing = active && (
                active.tagName === 'INPUT' ||
                (active.getAttribute('contenteditable') === 'true' && (
                    active.classList.contains('col-header-label') ||
                    active.classList.contains('path-text') ||
                    active.classList.contains('col-val')
                ))
            );
            if (isEditing) {
                return;
            }

            const isCmdOrCtrl = e.ctrlKey || e.metaKey;
            if (isCmdOrCtrl && (e.key === 'c' || e.key === 'C')) {
                if (selection.type !== 'none') {
                    e.preventDefault();
                    void copySelection(true);
                }
            } else if (isCmdOrCtrl && (e.key === 'x' || e.key === 'X')) {
                if (selection.type !== 'none') {
                    e.preventDefault();
                    void cutSelection();
                }
            } else if (isCmdOrCtrl && (e.key === 'a' || e.key === 'A')) {
                e.preventDefault();
                selectAll();
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selection.type !== 'none') {
                    e.preventDefault();
                    deleteSelection();
                }
            } else if (e.key === 'Escape') {
                clearSelection();
                closeContextMenu();
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [clearSelection, closeContextMenu, copySelection, cutSelection, deleteSelection, selectAll, selection.type]);

    if (initialData.error) {
        return <div className="error-card"><h3>構文エラー</h3><p>{initialData.error}</p></div>;
    }

    const isTableMode = tableView !== null;
    const itemCount = isTableMode
        ? `${tableView.totalRows} 行 (${tableView.totalColumns} 列)`
        : `${initialData.totalRows} 項目`;

    return (
        <main
            className="webview-app"
            ref={containerRef}
            onClick={event => {
                closeContextMenu();
                if (!(event.target as HTMLElement).closest('table')) {
                    clearSelection();
                }
            }}
        >
            <Toolbar
                documentType={initialData.documentType}
                itemCount={itemCount}
                searchQuery={table.searchQuery}
                onSearchQueryChange={table.setSearchQuery}
                onOpenTextEditor={handleOpenTextEditor}
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
                    colWidths={uiState.customColWidths[table.pathKey] ?? {}}
                    onPageChange={table.setCurrentPage}
                    onCellClick={selectCell}
                    onRowClick={selectRow}
                    onColClick={selectCol}
                    onSelectAll={selectAll}
                    onSortChange={table.toggleSort}
                    onUpdateCell={handleUpdateCell}
                    onNavigateAdjacent={handleNavigateAdjacent}
                    onRenameColumn={handleRenameColumn}
                    onAddColumn={handleAddTableColumn}
                    onAddRow={handleAddTableRow}
                    onMoveColumn={handleMoveColumn}
                    onMoveRow={handleMoveRow}
                    onResizeColumn={handleResizeColumn}
                    onResetColWidth={handleResetColWidth}
                    onNavigateArray={table.setActiveArrayPath}
                    onCornerContextMenu={handleCornerContextMenu}
                    onRowContextMenu={handleRowContextMenu}
                    onColContextMenu={handleColContextMenu}
                    onCellContextMenu={handleCellContextMenu}
                />
            ) : (
                <KvGrid
                    rows={initialData.rows}
                    searchQuery={table.searchQuery}
                    onUpdateCell={handleUpdateCell}
                    onRenameKey={handleRenameKey}
                    onAddKvRow={handleAddKvRow}
                    onNavigateArray={table.setActiveArrayPath}
                    onKeyContextMenu={handleKvKeyContextMenu}
                />
            )}
            <ContextMenu
                items={contextMenu?.items ?? []}
                position={contextMenu?.position ?? null}
                onClose={closeContextMenu}
            />
            <Toast message={toastMessage} />
        </main>
    );
}
