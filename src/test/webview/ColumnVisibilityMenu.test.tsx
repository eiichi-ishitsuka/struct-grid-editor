// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ColumnVisibilityMenu } from '../../webview/components/ColumnVisibilityMenu';
import type { TableColumnDto } from '../../application/dto/GridData';

describe('ColumnVisibilityMenu Component', () => {
    afterEach(() => {
        cleanup();
    });

    const columns: TableColumnDto[] = [
        { key: 'id', label: 'ID', type: 'number' },
        { key: 'name', label: 'Name', type: 'string' },
        { key: 'age', label: 'Age', type: 'number' },
    ];

    /** 【観点】初期状態ではメニューが閉じており、ボタンクリックで開閉すること */
    it('toggles dropdown visibility on button click', async () => {
        const user = userEvent.setup();
        const onHiddenColumnsChange = vi.fn();
        render(<ColumnVisibilityMenu columns={columns} hiddenColumns={[]} onHiddenColumnsChange={onHiddenColumnsChange} />);

        const btn = screen.getByRole('button', { name: /👁 列 \(3\/3\)/ });
        expect(screen.queryByText('列の表示切替')).toBeNull();

        await user.click(btn);
        expect(screen.getByText('列の表示切替')).not.toBeNull();

        await user.click(btn);
        expect(screen.queryByText('列の表示切替')).toBeNull();
    });

    /** 【観点】チェックボックスの操作で列の非表示・再表示が切り替わること */
    it('toggles column visibility via checkbox', async () => {
        const user = userEvent.setup();
        const onHiddenColumnsChange = vi.fn();
        render(<ColumnVisibilityMenu columns={columns} hiddenColumns={['name']} onHiddenColumnsChange={onHiddenColumnsChange} />);

        await user.click(screen.getByRole('button', { name: /👁 列 \(2\/3\)/ }));

        const nameCheckbox = screen.getByRole('checkbox', { name: 'Name' });
        expect((nameCheckbox as HTMLInputElement).checked).toBe(false);

        await user.click(nameCheckbox);
        expect(onHiddenColumnsChange).toHaveBeenCalledWith([]);

        const idCheckbox = screen.getByRole('checkbox', { name: 'ID' });
        await user.click(idCheckbox);
        expect(onHiddenColumnsChange).toHaveBeenCalledWith(['name', 'id']);
    });

    /** 【観点】「すべて表示」リンクをクリックすると全列が表示状態になること */
    it('restores all columns on "すべて表示" button click', async () => {
        const user = userEvent.setup();
        const onHiddenColumnsChange = vi.fn();
        render(<ColumnVisibilityMenu columns={columns} hiddenColumns={['id', 'age']} onHiddenColumnsChange={onHiddenColumnsChange} />);

        await user.click(screen.getByRole('button', { name: /👁 列 \(1\/3\)/ }));
        const showAllBtn = screen.getByRole('button', { name: 'すべて表示' });
        await user.click(showAllBtn);

        expect(onHiddenColumnsChange).toHaveBeenCalledWith([]);
    });
});
