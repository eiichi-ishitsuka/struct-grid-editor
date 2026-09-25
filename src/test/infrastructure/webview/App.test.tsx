// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import type { GridDataDto } from '../../../application/dto/GridData';
import { App } from '../../../infrastructure/webview/ui/App';

const tableData: GridDataDto = {
    documentType: 'json',
    viewMode: 'table',
    rows: [],
    totalRows: 2,
    tableData: {
        path: '',
        columns: [
            { key: 'id', label: 'ID', type: 'number' },
            { key: 'name', label: 'Name', type: 'string' },
        ],
        rows: [
            { index: 0, path: '[0]', cells: { id: { path: '[0].id', value: 1, displayValue: '1', type: 'number' }, name: { path: '[0].name', value: 'Alice', displayValue: 'Alice', type: 'string' } } },
            { index: 1, path: '[1]', cells: { id: { path: '[1].id', value: 2, displayValue: '2', type: 'number' }, name: { path: '[1].name', value: 'Bob', displayValue: 'Bob', type: 'string' } } },
        ],
        totalRows: 2,
        totalColumns: 2,
        isObjectArray: true,
    },
};

describe('React Webview App', () => {
    afterEach(() => {
        cleanup();
    });

    /** 【観点】表ビューを既存セレクタとともに表示し、検索と列の表示切替ができること */
    it('renders and filters the spreadsheet view', async () => {
        const user = userEvent.setup();
        render(<App initialData={tableData} />);

        expect(screen.getByText('StructGridEditor')).not.toBeNull();
        expect(screen.getByRole('columnheader', { name: /Name/ })).not.toBeNull();
        expect(screen.getByText('Alice')).not.toBeNull();

        await user.type(screen.getByRole('searchbox'), 'alice');
        expect(screen.getByText('Alice')).not.toBeNull();
        expect(screen.queryByText('Bob')).toBeNull();

        await user.clear(screen.getByRole('searchbox'));
        await user.click(screen.getByRole('button', { name: /列 \(2\/2\)/ }));
        await user.click(screen.getByRole('checkbox', { name: 'Name' }));
        expect(screen.queryByRole('columnheader', { name: /Name/ })).toBeNull();
    });

    /** 【観点】KV ビューでも検索結果だけを表示できること */
    it('renders and filters the key-value view', async () => {
        const user = userEvent.setup();
        render(<App initialData={{
            documentType: 'yaml',
            viewMode: 'kv',
            totalRows: 2,
            rows: [
                { id: 'name', path: 'name', key: 'name', value: 'Alice', displayValue: 'Alice', type: 'string', depth: 1, isLeaf: true },
                { id: 'enabled', path: 'enabled', key: 'enabled', value: true, displayValue: 'true', type: 'boolean', depth: 1, isLeaf: true },
            ],
        }} />);

        expect(screen.getByText('Alice')).not.toBeNull();
        await user.type(screen.getByRole('searchbox'), 'enabled');
        expect(screen.queryByText('Alice')).toBeNull();
        expect(screen.getByText('true')).not.toBeNull();
    });
});
