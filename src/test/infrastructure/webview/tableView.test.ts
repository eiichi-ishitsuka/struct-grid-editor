import { describe, expect, it } from 'vitest';
import type { GridDataDto, TableRowDto, TableViewDto } from '../../../application/dto/GridData';
import {
    filterTableRows,
    getActiveTableView,
    getOrderedTableView,
    paginateTableRows,
    type TableViewPreferences,
} from '../../../infrastructure/webview/ui/model/tableView';

const emptyPreferences: TableViewPreferences = {
    customColOrders: {},
    customRowOrders: {},
    hiddenCols: {},
    sortState: {},
};

function createTable(rows: TableRowDto[]): TableViewDto {
    return {
        path: '',
        columns: [
            { key: 'id', label: 'ID', type: 'number' },
            { key: 'name', label: 'Name', type: 'string' },
            { key: 'active', label: 'Active', type: 'boolean' },
        ],
        rows,
        totalRows: rows.length,
        totalColumns: 3,
        isObjectArray: true,
    };
}

function createRow(index: number, id: string, name: string, active: boolean): TableRowDto {
    return {
        index,
        path: `[${index}]`,
        cells: {
            id: { path: `[${index}].id`, value: id, displayValue: id, type: 'number' },
            name: { path: `[${index}].name`, value: name, displayValue: name, type: 'string' },
            active: { path: `[${index}].active`, value: active, displayValue: String(active), type: 'boolean' },
        },
    };
}

function createData(rows: TableRowDto[]): GridDataDto {
    return {
        documentType: 'json',
        viewMode: 'table',
        rows: [],
        totalRows: rows.length,
        tableData: createTable(rows),
        subArrays: [{ path: 'nested', label: 'nested', length: 0, isObjectArray: true, tableData: createTable([]) }],
    };
}

describe('table view model', () => {
    /** 【観点】ルートとネスト配列のテーブルを選択できること */
    it('selects the active root or nested table without mutating DTOs', () => {
        const data = createData([createRow(0, '1', 'Alice', true)]);

        expect(getActiveTableView(data, null)).toBeNull();
        expect(getActiveTableView(data, '')).toBe(data.tableData);
        expect(getActiveTableView(data, 'nested')).toBe(data.subArrays?.[0].tableData);
        expect(getActiveTableView(data, 'missing')).toBeNull();
    });

    /** 【観点】非表示列と局所的な列・行順を表示モデルにだけ反映すること */
    it('applies visibility and custom ordering without mutating its inputs', () => {
        const rows = [createRow(0, '1', 'Alice', true), createRow(1, '2', 'Bob', false)];
        const data = createData(rows);
        const preferences: TableViewPreferences = {
            ...emptyPreferences,
            hiddenCols: { __root__: ['active'] },
            customColOrders: { __root__: ['name', 'missing'] },
            customRowOrders: { __root__: ['[1]'] },
        };

        const view = getOrderedTableView(data, '', preferences);

        expect(view?.columns.map(column => column.key)).toEqual(['name', 'id']);
        expect(view?.allColumns.map(column => column.key)).toEqual(['id', 'name', 'active']);
        expect(view?.rows.map(row => row.path)).toEqual(['[1]', '[0]']);
        expect(data.tableData?.columns.map(column => column.key)).toEqual(['id', 'name', 'active']);
        expect(data.tableData?.rows.map(row => row.path)).toEqual(['[0]', '[1]']);
    });

    /** 【観点】数値・真偽値のソートでは空セルを常に末尾に置くこと */
    it('sorts typed values while preserving empty values at the end', () => {
        const rows = [
            createRow(0, '10', 'Ten', true),
            createRow(1, '2', 'Two', false),
            createRow(2, '', 'Empty', false),
        ];
        const data = createData(rows);

        const ascending = getOrderedTableView(data, '', {
            ...emptyPreferences,
            sortState: { __root__: { colKey: 'id', direction: 'asc' } },
        });
        const descending = getOrderedTableView(data, '', {
            ...emptyPreferences,
            sortState: { __root__: { colKey: 'active', direction: 'desc' } },
        });

        expect(ascending?.rows.map(row => row.cells.id.displayValue)).toEqual(['2', '10', '']);
        expect(descending?.rows.map(row => row.cells.active.displayValue)).toEqual(['true', 'false', 'false']);
        expect(data.tableData?.rows.map(row => row.cells.id.displayValue)).toEqual(['10', '2', '']);
    });

    /** 【観点】検索結果に表示順の行番号を付け、検索後の最終ページへ補正すること */
    it('filters case-insensitively and clamps pagination to the final page', () => {
        const rows = Array.from({ length: 205 }, (_, index) =>
            createRow(index, String(index), `User ${index}`, index % 2 === 0)
        );
        const indexedRows = filterTableRows(rows, 'user');
        const page = paginateTableRows(indexedRows, 999);
        const match = filterTableRows(rows, 'USER 104');

        expect(match).toHaveLength(1);
        expect(match[0].originalIndex).toBe(104);
        expect(page.currentPage).toBe(3);
        expect(page.totalPages).toBe(3);
        expect(page.startIndex).toBe(200);
        expect(page.endIndex).toBe(205);
        expect(page.rows.map(row => row.originalIndex)).toEqual([200, 201, 202, 203, 204]);
    });
});
