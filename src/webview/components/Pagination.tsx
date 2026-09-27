import { useState, useEffect, type KeyboardEvent } from 'react';
import type { TablePage } from '../model/tableView';

export interface PaginationProps {
    page: TablePage;
    onPageChange: (page: number) => void;
}

export function Pagination({ page, onPageChange }: PaginationProps) {
    const [jumpPage, setJumpPage] = useState(String(page.currentPage));

    useEffect(() => {
        setJumpPage(String(page.currentPage));
    }, [page.currentPage]);

    if (page.totalRows <= 100) {
        return null;
    }

    const handleJump = () => {
        const parsed = parseInt(jumpPage, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= page.totalPages) {
            onPageChange(parsed);
        } else {
            setJumpPage(String(page.currentPage));
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleJump();
        }
    };

    return (
        <div className="pagination-container" id="tablePagination">
            <div className="pagination-info">
                <span><strong>{page.currentPage}</strong> / {page.totalPages} ページ</span>
                <span className="pagination-range">
                    (全 {page.totalRows.toLocaleString()} 件中 {(page.startIndex + 1).toLocaleString()} - {page.endIndex.toLocaleString()} 件を表示)
                </span>
            </div>
            <div className="pagination-controls">
                <button
                    className="pagination-btn"
                    id="pageFirstBtn"
                    title="最初のページ"
                    aria-label="最初のページ"
                    type="button"
                    disabled={page.currentPage === 1}
                    onClick={() => onPageChange(1)}
                >
                    «
                </button>
                <button
                    className="pagination-btn"
                    id="pagePrevBtn"
                    title="前のページ"
                    aria-label="前のページ"
                    type="button"
                    disabled={page.currentPage === 1}
                    onClick={() => onPageChange(page.currentPage - 1)}
                >
                    ‹ 前へ
                </button>
                <input
                    type="text"
                    className="pagination-input"
                    id="pageJumpInput"
                    value={jumpPage}
                    onChange={e => setJumpPage(e.target.value)}
                    onBlur={handleJump}
                    onKeyDown={handleKeyDown}
                    aria-label="ページ移動"
                />
                <button
                    className="pagination-btn"
                    id="pageNextBtn"
                    title="次のページ"
                    aria-label="次のページ"
                    type="button"
                    disabled={page.currentPage === page.totalPages}
                    onClick={() => onPageChange(page.currentPage + 1)}
                >
                    次へ ›
                </button>
                <button
                    className="pagination-btn"
                    id="pageLastBtn"
                    title="最後のページ"
                    aria-label="最後のページ"
                    type="button"
                    disabled={page.currentPage === page.totalPages}
                    onClick={() => onPageChange(page.totalPages)}
                >
                    »
                </button>
            </div>
        </div>
    );
}
