import { useEffect, useMemo, useState } from 'react';
import type { GridDataDto } from '../../application/dto/GridData';
import {
    filterTableRows,
    getOrderedTableView,
    getTablePathKey,
    paginateTableRows,
} from '../model/tableView';
import type { TableSortState } from '../model/tableView';
import type { GridUiState } from './gridUiState';
import type { StateUpdater } from './useVsCodeState';

export interface UseTableViewResult {
    activeArrayPath: string | null;
    searchQuery: string;
    tableView: ReturnType<typeof getOrderedTableView>;
    page: ReturnType<typeof paginateTableRows>;
    pathKey: string;
    sortState: TableSortState | undefined;
    setSearchQuery: (query: string) => void;
    setActiveArrayPath: (path: string) => void;
    setCurrentPage: (page: number) => void;
    setHiddenColumns: (columnKeys: string[]) => void;
    toggleSort: (colKey: string) => void;
}

/** 表示パス、検索、ページングと永続設定から、現在の表表示モデルを組み立てる。 */
export function useTableView(
    data: GridDataDto,
    uiState: GridUiState,
    setUiState: (updater: StateUpdater<GridUiState>) => void
): UseTableViewResult {
    const [activeArrayPath, setActiveArrayPathState] = useState<string | null>(
        data.viewMode === 'table' ? data.tableData?.path ?? '' : null
    );
    const [searchQuery, setSearchQueryState] = useState('');

    const tableView = useMemo(
        () => getOrderedTableView(data, activeArrayPath, uiState),
        [activeArrayPath, data, uiState]
    );
    const filteredRows = useMemo(
        () => tableView ? filterTableRows(tableView.rows, searchQuery) : [],
        [searchQuery, tableView]
    );
    const page = useMemo(
        () => paginateTableRows(filteredRows, uiState.currentPage),
        [filteredRows, uiState.currentPage]
    );
    const pathKey = getTablePathKey(activeArrayPath);
    const sortState = uiState.sortState[pathKey];

    useEffect(() => {
        if (page.currentPage !== uiState.currentPage) {
            setUiState(current => ({ ...current, currentPage: page.currentPage }));
        }
    }, [page.currentPage, setUiState, uiState.currentPage]);

    return {
        activeArrayPath,
        searchQuery,
        tableView,
        page,
        pathKey,
        sortState,
        setSearchQuery: query => {
            setSearchQueryState(query);
            setUiState(current => ({ ...current, currentPage: 1 }));
        },
        setActiveArrayPath: path => {
            setActiveArrayPathState(path);
            setUiState(current => ({ ...current, currentPage: 1 }));
        },
        setCurrentPage: currentPage => setUiState(current => ({ ...current, currentPage })),
        setHiddenColumns: columnKeys => setUiState(current => ({
            ...current,
            hiddenCols: { ...current.hiddenCols, [pathKey]: columnKeys },
        })),
        toggleSort: colKey => setUiState(current => {
            const currentSort = current.sortState[pathKey];
            let nextSort: TableSortState | undefined;
            if (!currentSort || currentSort.colKey !== colKey) {
                nextSort = { colKey, direction: 'asc' };
            } else if (currentSort.direction === 'asc') {
                nextSort = { colKey, direction: 'desc' };
            }
            // desc → undefined でソート解除
            return {
                ...current,
                sortState: { ...current.sortState, [pathKey]: nextSort },
            };
        }),
    };
}
