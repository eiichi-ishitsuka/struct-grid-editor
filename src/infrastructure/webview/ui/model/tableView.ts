import type { GridDataDto, TableCellDto, TableColumnDto, TableRowDto, TableViewDto } from '../../../../application/dto/GridData';

export const DEFAULT_PAGE_SIZE = 100;
export const ROOT_TABLE_PATH_KEY = '__root__';

export type TableSortDirection = 'asc' | 'desc';

export interface TableSortState {
    colKey: string;
    direction: TableSortDirection;
}

/** Webview state に保存する、表表示に影響する設定。 */
export interface TableViewPreferences {
    customColOrders: Record<string, string[]>;
    customRowOrders: Record<string, string[]>;
    hiddenCols: Record<string, string[]>;
    sortState: Record<string, TableSortState | undefined>;
}

export interface OrderedTableView extends Omit<TableViewDto, 'columns' | 'rows'> {
    columns: TableColumnDto[];
    allColumns: TableColumnDto[];
    rows: TableRowDto[];
}

export interface IndexedTableRow {
    row: TableRowDto;
    originalIndex: number;
}

export interface TablePage {
    currentPage: number;
    totalPages: number;
    totalRows: number;
    startIndex: number;
    endIndex: number;
    rows: IndexedTableRow[];
}

/** 指定パスに対応するテーブルを取得する。null は KV 表示中を表す。 */
export function getActiveTableView(data: GridDataDto, activeArrayPath: string | null): TableViewDto | null {
    if (activeArrayPath === null) {
        return null;
    }
    if (activeArrayPath === '') {
        return data.tableData ?? null;
    }

    return data.subArrays?.find(subArray => subArray.path === activeArrayPath)?.tableData ?? null;
}

/** UI state でルートテーブルを識別するキーを返す。 */
export function getTablePathKey(activeArrayPath: string | null): string {
    return activeArrayPath || ROOT_TABLE_PATH_KEY;
}

/**
 * テーブルを表示用に変換する。列・行の並び替え、非表示列、ソートを反映するが、
 * 入力 DTO と設定は変更しない。
 */
export function getOrderedTableView(
    data: GridDataDto,
    activeArrayPath: string | null,
    preferences: TableViewPreferences
): OrderedTableView | null {
    const baseView = getActiveTableView(data, activeArrayPath);
    if (!baseView) {
        return null;
    }

    const pathKey = getTablePathKey(activeArrayPath);
    const allColumns = [...baseView.columns];
    const hiddenColumns = preferences.hiddenCols[pathKey] ?? [];
    let columns = allColumns.filter(column => !hiddenColumns.includes(column.key));

    const customColumnOrder = preferences.customColOrders[pathKey];
    if (customColumnOrder?.length) {
        const columnByKey = new Map(columns.map(column => [column.key, column]));
        const orderedColumns: TableColumnDto[] = [];
        for (const key of customColumnOrder) {
            const column = columnByKey.get(key);
            if (column) {
                orderedColumns.push(column);
                columnByKey.delete(key);
            }
        }
        columns = [...orderedColumns, ...columnByKey.values()];
    }

    let rows = [...baseView.rows];
    const sort = preferences.sortState[pathKey];
    if (sort) {
        rows.sort((left, right) => compareRows(left, right, sort));
    } else {
        const customRowOrder = preferences.customRowOrders[pathKey];
        if (customRowOrder?.length) {
            const rowByPath = new Map(rows.map(row => [row.path, row]));
            const orderedRows: TableRowDto[] = [];
            for (const path of customRowOrder) {
                const row = rowByPath.get(path);
                if (row) {
                    orderedRows.push(row);
                    rowByPath.delete(path);
                }
            }
            rows = [...orderedRows, ...rowByPath.values()];
        }
    }

    return {
        ...baseView,
        columns,
        allColumns,
        rows,
    };
}

/** 検索語を含む行だけを残し、表示上の行番号を付与する。 */
export function filterTableRows(rows: TableRowDto[], searchQuery: string): IndexedTableRow[] {
    const normalizedQuery = searchQuery.toLowerCase();

    return rows
        .map((row, originalIndex) => ({ row, originalIndex }))
        .filter(({ row }) => {
            if (!normalizedQuery) {
                return true;
            }
            return Object.values(row.cells)
                .map(cell => cell.displayValue)
                .join(' ')
                .toLowerCase()
                .includes(normalizedQuery);
        });
}

/** 現在ページを有効な範囲に補正し、ページに含める行を返す。 */
export function paginateTableRows(
    rows: IndexedTableRow[],
    currentPage: number,
    pageSize: number = DEFAULT_PAGE_SIZE
): TablePage {
    if (!Number.isInteger(pageSize) || pageSize < 1) {
        throw new Error('pageSize must be a positive integer.');
    }

    const totalRows = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
    const normalizedPage = Math.min(Math.max(Math.trunc(currentPage) || 1, 1), totalPages);
    const startIndex = (normalizedPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalRows);

    return {
        currentPage: normalizedPage,
        totalPages,
        totalRows,
        startIndex,
        endIndex,
        rows: rows.slice(startIndex, endIndex),
    };
}

function compareRows(left: TableRowDto, right: TableRowDto, sort: TableSortState): number {
    const leftCell = left.cells[sort.colKey];
    const rightCell = right.cells[sort.colKey];
    const leftValue = leftCell?.displayValue ?? '';
    const rightValue = rightCell?.displayValue ?? '';

    let comparison = compareCellValues(leftCell, rightCell, leftValue, rightValue);
    if (sort.direction === 'desc') {
        comparison = -comparison;
    }
    return comparison;
}

function compareCellValues(
    leftCell: TableCellDto | undefined,
    rightCell: TableCellDto | undefined,
    leftValue: string,
    rightValue: string
): number {
    const leftIsEmpty = leftValue === '';
    const rightIsEmpty = rightValue === '';
    if (leftIsEmpty && rightIsEmpty) {
        return 0;
    }
    if (leftIsEmpty) {
        return 1;
    }
    if (rightIsEmpty) {
        return -1;
    }

    if (leftCell?.type === 'number' && rightCell?.type === 'number') {
        const leftNumber = Number.parseFloat(leftValue);
        const rightNumber = Number.parseFloat(rightValue);
        return !Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)
            ? leftNumber - rightNumber
            : leftValue.localeCompare(rightValue);
    }
    if (leftCell?.type === 'boolean' && rightCell?.type === 'boolean') {
        return Number(leftValue === 'true') - Number(rightValue === 'true');
    }

    const leftNumber = Number(leftValue);
    const rightNumber = Number(rightValue);
    if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber) && leftValue.trim() && rightValue.trim()) {
        return leftNumber - rightNumber;
    }
    return leftValue.localeCompare(rightValue, undefined, { numeric: true, sensitivity: 'base' });
}
