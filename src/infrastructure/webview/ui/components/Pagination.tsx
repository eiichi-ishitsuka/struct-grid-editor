import type { TablePage } from '../model/tableView';

interface PaginationProps {
    page: TablePage;
    onPageChange: (page: number) => void;
}

export function Pagination({ page, onPageChange }: PaginationProps) {
    if (page.totalRows <= 100) {
        return null;
    }

    return (
        <div className="pagination-container" id="tablePagination">
            <div className="pagination-info">
                <span><strong>{page.currentPage}</strong> / {page.totalPages} ページ</span>
                <span className="pagination-range">
                    (全 {page.totalRows.toLocaleString()} 件中 {(page.startIndex + 1).toLocaleString()} - {page.endIndex.toLocaleString()} 件を表示)
                </span>
            </div>
            <div className="pagination-controls">
                <button className="pagination-btn" type="button" disabled={page.currentPage === 1} onClick={() => onPageChange(1)}>«</button>
                <button className="pagination-btn" type="button" disabled={page.currentPage === 1} onClick={() => onPageChange(page.currentPage - 1)}>‹ 前へ</button>
                <button className="pagination-btn" type="button" disabled={page.currentPage === page.totalPages} onClick={() => onPageChange(page.currentPage + 1)}>次へ ›</button>
                <button className="pagination-btn" type="button" disabled={page.currentPage === page.totalPages} onClick={() => onPageChange(page.totalPages)}>»</button>
            </div>
        </div>
    );
}
