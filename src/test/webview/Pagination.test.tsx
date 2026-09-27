// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Pagination } from '../../webview/components/Pagination';
import type { TablePage } from '../../webview/model/tableView';

describe('Pagination Component', () => {
    afterEach(() => {
        cleanup();
    });

    const createPage = (currentPage: number, totalPages: number, totalRows: number): TablePage => ({
        currentPage,
        totalPages,
        totalRows,
        startIndex: (currentPage - 1) * 100,
        endIndex: Math.min(currentPage * 100, totalRows),
        rows: [],
    });

    /** 【観点】総件数が100件以下の場合は何も表示しないこと */
    it('returns null when totalRows is 100 or less', () => {
        const onPageChange = vi.fn();
        const { container } = render(<Pagination page={createPage(1, 1, 50)} onPageChange={onPageChange} />);
        expect(container.firstChild).toBeNull();
    });

    /** 【観点】1ページ目では前へ・最初ボタンが無効化されること */
    it('disables previous and first buttons on page 1', () => {
        const onPageChange = vi.fn();
        render(<Pagination page={createPage(1, 3, 250)} onPageChange={onPageChange} />);

        expect((screen.getByRole('button', { name: '最初のページ' }) as HTMLButtonElement).disabled).toBe(true);
        expect((screen.getByRole('button', { name: '前のページ' }) as HTMLButtonElement).disabled).toBe(true);
        expect((screen.getByRole('button', { name: '次のページ' }) as HTMLButtonElement).disabled).toBe(false);
        expect((screen.getByRole('button', { name: '最後のページ' }) as HTMLButtonElement).disabled).toBe(false);
    });

    /** 【観点】次へ・最後のページボタンクリックで onPageChange が呼ばれること */
    it('calls onPageChange on next and last button clicks', async () => {
        const user = userEvent.setup();
        const onPageChange = vi.fn();
        render(<Pagination page={createPage(1, 3, 250)} onPageChange={onPageChange} />);

        await user.click(screen.getByRole('button', { name: '次のページ' }));
        expect(onPageChange).toHaveBeenCalledWith(2);

        await user.click(screen.getByRole('button', { name: '最後のページ' }));
        expect(onPageChange).toHaveBeenCalledWith(3);
    });

    /** 【観点】入力欄にページ番号を入力して Enter でジャンプできること */
    it('jumps to a valid page number on Enter in jump input', async () => {
        const user = userEvent.setup();
        const onPageChange = vi.fn();
        render(<Pagination page={createPage(1, 5, 450)} onPageChange={onPageChange} />);

        const input = screen.getByLabelText('ページ移動');
        await user.clear(input);
        await user.type(input, '4{Enter}');

        expect(onPageChange).toHaveBeenCalledWith(4);
    });
});
