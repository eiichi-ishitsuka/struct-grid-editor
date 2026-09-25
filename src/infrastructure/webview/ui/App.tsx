import { useMemo, useState } from 'react';
import type { GridDataDto } from '../../../application/dto/GridData';
import { Breadcrumbs } from './components/Breadcrumbs';
import { ColumnVisibilityMenu } from './components/ColumnVisibilityMenu';
import { KvGrid } from './components/KvGrid';
import { SpreadsheetGrid } from './components/SpreadsheetGrid';
import { Toolbar } from './components/Toolbar';
import {
    filterTableRows,
    getOrderedTableView,
    getTablePathKey,
    paginateTableRows,
    type TableViewPreferences,
} from './model/tableView';

const emptyPreferences: Omit<TableViewPreferences, 'hiddenCols'> = {
    customColOrders: {},
    customRowOrders: {},
    sortState: {},
};

interface AppProps {
    initialData: GridDataDto;
}

export function App({ initialData }: AppProps) {
    const [activeArrayPath, setActiveArrayPath] = useState<string | null>(
        initialData.viewMode === 'table' ? initialData.tableData?.path ?? '' : null
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hiddenCols, setHiddenCols] = useState<Record<string, string[]>>({});

    const preferences = useMemo<TableViewPreferences>(() => ({ ...emptyPreferences, hiddenCols }), [hiddenCols]);
    const tableView = getOrderedTableView(initialData, activeArrayPath, preferences);
    const filteredRows = tableView ? filterTableRows(tableView.rows, searchQuery) : [];
    const page = paginateTableRows(filteredRows, currentPage);
    const pathKey = getTablePathKey(activeArrayPath);

    const updateSearchQuery = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const navigateTo = (path: string) => {
        setActiveArrayPath(path);
        setCurrentPage(1);
    };

    if (initialData.error) {
        return <div className="error-card"><h3>構文エラー</h3><p>{initialData.error}</p></div>;
    }

    const isTableMode = initialData.viewMode === 'table' && tableView !== null;
    const itemCount = isTableMode
        ? `${tableView.totalRows} 行 (${tableView.totalColumns} 列)`
        : `${initialData.totalRows} 項目`;

    return (
        <main className="webview-app">
            <Toolbar
                documentType={initialData.documentType}
                itemCount={itemCount}
                searchQuery={searchQuery}
                onSearchQueryChange={updateSearchQuery}
            >
                {isTableMode && (
                    <ColumnVisibilityMenu
                        columns={tableView.allColumns}
                        hiddenColumns={hiddenCols[pathKey] ?? []}
                        onHiddenColumnsChange={columns => setHiddenCols(current => ({ ...current, [pathKey]: columns }))}
                    />
                )}
            </Toolbar>
            <Breadcrumbs activeArrayPath={activeArrayPath} onNavigate={navigateTo} />
            {isTableMode ? (
                <SpreadsheetGrid tableView={tableView} page={page} onPageChange={setCurrentPage} />
            ) : (
                <KvGrid rows={initialData.rows} searchQuery={searchQuery} />
            )}
        </main>
    );
}
