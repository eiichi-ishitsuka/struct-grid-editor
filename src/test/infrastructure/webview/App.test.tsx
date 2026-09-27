// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
    const postMessageMock = vi.fn();

    beforeEach(() => {
        postMessageMock.mockClear();
        (globalThis as unknown as { acquireVsCodeApi: unknown }).acquireVsCodeApi = () => ({
            getState: () => undefined,
            setState: vi.fn(),
            postMessage: postMessageMock,
        });
    });

    afterEach(() => {
        cleanup();
        delete (globalThis as unknown as { acquireVsCodeApi?: unknown }).acquireVsCodeApi;
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

    /** 【観点】セル編集で blur または Enter 時に update_cell メッセージを送信すること */
    it('sends update_cell message on cell edit blur', () => {
        render(<App initialData={tableData} />);

        const aliceCell = document.querySelector('td.col-val[data-col-key="name"][data-row-index="0"]');
        expect(aliceCell).not.toBeNull();

        if (aliceCell) {
            (aliceCell as HTMLElement).innerText = 'Alicia';
            fireEvent.blur(aliceCell);

            expect(postMessageMock).toHaveBeenCalledWith({
                command: 'update_cell',
                path: '[0].name',
                value: 'Alicia',
            });
        }
    });

    /** 【観点】行追加・列追加・テキストエディタ切替ボタンのクリックで対応するメッセージを送信すること */
    it('sends add_table_row, add_table_column, and open_text_editor commands', async () => {
        const user = userEvent.setup();
        render(<App initialData={tableData} />);

        // 行追加
        const addRowBtn = document.getElementById('addTableRowBtn');
        expect(addRowBtn).not.toBeNull();
        await user.click(addRowBtn!);
        expect(postMessageMock).toHaveBeenCalledWith({
            command: 'add_table_row',
            arrayPath: '',
        });

        // 列追加
        const addColBtn = document.getElementById('addColBtn');
        expect(addColBtn).not.toBeNull();
        await user.click(addColBtn!);
        expect(postMessageMock).toHaveBeenCalledWith({
            command: 'add_table_column',
            arrayPath: '',
            columnKey: 'col1',
        });

        // テキストで開く
        const openTextBtn = document.getElementById('openTextEditorBtn');
        expect(openTextBtn).not.toBeNull();
        await user.click(openTextBtn!);
        expect(postMessageMock).toHaveBeenCalledWith({
            command: 'open_text_editor',
        });
    });

    /** 【観点】列名編集で Enter または blur 時に rename_table_column メッセージを送信すること */
    it('sends rename_table_column on column header label blur', () => {
        render(<App initialData={tableData} />);

        const labelSpan = document.querySelector('.col-header-label[data-col-key="name"]');
        expect(labelSpan).not.toBeNull();

        if (labelSpan) {
            (labelSpan as HTMLElement).innerText = 'fullName';
            fireEvent.blur(labelSpan);

            expect(postMessageMock).toHaveBeenCalledWith({
                command: 'rename_table_column',
                arrayPath: '',
                oldKey: 'name',
                newKey: 'fullName',
            });
        }
    });

    /** 【観点】行ヘッダーのコンテキストメニューから行削除を実行できること */
    it('opens context menu and deletes row', async () => {
        const user = userEvent.setup();
        render(<App initialData={tableData} />);

        const rowHeader = document.querySelector('td.row-header[data-row-index="0"]');
        expect(rowHeader).not.toBeNull();

        fireEvent.contextMenu(rowHeader!);
        const deleteItem = screen.getByText('行 1 を削除');
        expect(deleteItem).not.toBeNull();

        await user.click(deleteItem);
        expect(postMessageMock).toHaveBeenCalledWith({
            command: 'delete_row',
            path: '[0]',
        });
    });
});
