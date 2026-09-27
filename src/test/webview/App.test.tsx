// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GridDataDto } from '../../application/dto/GridData';
import { App } from '../../webview/App';

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

    /** 【観点】サブ配列ボタンのクリックで配列を展開し、パンくずでルートへ戻れること */
    it('navigates to sub-array and back via breadcrumbs', async () => {
        const user = userEvent.setup();
        const dataWithSubArray: GridDataDto = {
            ...tableData,
            tableData: {
                ...tableData.tableData!,
                columns: [
                    ...tableData.tableData!.columns,
                    { key: 'tags', label: 'Tags', type: 'array' },
                ],
                rows: [
                    {
                        index: 0,
                        path: '[0]',
                        cells: {
                            ...tableData.tableData!.rows[0].cells,
                            tags: { path: '[0].tags', value: ['tag1'], displayValue: 'tag1', type: 'array' },
                        },
                    },
                ],
            },
            subArrays: [
                {
                    path: '[0].tags',
                    label: 'tags',
                    length: 1,
                    isObjectArray: false,
                    tableData: {
                        path: '[0].tags',
                        columns: [{ key: 'value', label: 'Value', type: 'string' }],
                        rows: [{ index: 0, path: '[0].tags[0]', cells: { value: { path: '[0].tags[0]', value: 'tag1', displayValue: 'tag1', type: 'string' } } }],
                        totalRows: 1,
                        totalColumns: 1,
                        isObjectArray: false,
                    },
                },
            ],
        };

        render(<App initialData={dataWithSubArray} />);

        // サブ配列編集ボタンをクリック
        const editArrayBtn = screen.getByRole('button', { name: '編集する' });
        expect(editArrayBtn).not.toBeNull();
        await user.click(editArrayBtn);

        // パンくずが更新され、サブ配列の列名 'Value' が表示される
        expect(screen.getByText('tags')).not.toBeNull();
        expect(screen.getByRole('columnheader', { name: /Value/ })).not.toBeNull();

        // パンくずの 'root/' をクリックしてルートに戻る
        const rootLink = screen.getByRole('button', { name: 'root/' });
        await user.click(rootLink);

        expect(screen.getByRole('columnheader', { name: /Name/ })).not.toBeNull();
    });

    /** 【観点】保存された列幅（customColWidths）を初期描画に反映すること */
    it('applies saved column widths from state', () => {
        (globalThis as unknown as { acquireVsCodeApi: unknown }).acquireVsCodeApi = () => ({
            getState: () => ({
                customColWidths: {
                    __root__: { name: 250 },
                },
            }),
            setState: vi.fn(),
            postMessage: postMessageMock,
        });

        render(<App initialData={tableData} />);

        const nameHeader = document.querySelector('th.col-header-cell[data-col-key="name"]') as HTMLElement;
        expect(nameHeader).not.toBeNull();
        expect(nameHeader.style.width).toBe('250px');
    });

    /** 【観点】列のドラッグ＆ドロップで列の並び順が更新されること */
    it('reorders columns on drag and drop', () => {
        render(<App initialData={tableData} />);

        const idHeader = document.querySelector('th.col-header-cell[data-col-key="id"]') as HTMLElement;
        const nameHeader = document.querySelector('th.col-header-cell[data-col-key="name"]') as HTMLElement;

        // dragstart on id, drop on name
        fireEvent.dragStart(idHeader, { dataTransfer: { effectAllowed: 'move' } });
        fireEvent.dragOver(nameHeader, { clientX: 200, currentTarget: nameHeader, dataTransfer: { dropEffect: 'move' } });
        fireEvent.drop(nameHeader, { dataTransfer: {} });

        const headers = Array.from(document.querySelectorAll('th.col-header-cell')).map(th => th.getAttribute('data-col-key'));
        expect(headers).toEqual(['name', 'id']);
    });
});
