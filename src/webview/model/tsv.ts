import type { OrderedTableView } from './tableView';
import type { GridSelection } from '../hooks/gridUiState';

/**
 * TSV 用にセル値をエスケープする。
 * タブ、改行、ダブルクォートを含む場合はダブルクォートで囲み、内部のクォートを二重化する。
 */
export function formatTsvValue(val: unknown): string {
    if (val === null || val === undefined) {
        return '';
    }
    const str = String(val);
    if (str.includes('\t') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

/**
 * 現在の選択状態と表示中の表モデルから TSV 文字列を生成する。
 */
export function generateTsv(
    view: OrderedTableView | null,
    selection: GridSelection,
    getCellValue?: (path: string) => string
): string {
    if (!view) {
        return '';
    }

    if (selection.type === 'all') {
        const header = view.columns.map(c => formatTsvValue(c.label)).join('\t');
        const rows = view.rows.map(r => {
            return view.columns.map(c => formatTsvValue(r.cells[c.key]?.displayValue ?? '')).join('\t');
        }).join('\n');
        return `${header}\n${rows}`;
    }

    if (selection.type === 'row') {
        const row = view.rows.find(r => r.path === selection.path) ?? view.rows[selection.rowIndex];
        if (!row) {
            return '';
        }
        return view.columns.map(c => formatTsvValue(row.cells[c.key]?.displayValue ?? '')).join('\t');
    }

    if (selection.type === 'col') {
        return view.rows.map(r => formatTsvValue(r.cells[selection.colKey]?.displayValue ?? '')).join('\n');
    }

    if (selection.type === 'cell') {
        if (getCellValue) {
            return formatTsvValue(getCellValue(selection.path));
        }
        const row = view.rows.find(r => r.path === selection.path) ?? view.rows[selection.rowIndex];
        return formatTsvValue(row?.cells[selection.colKey]?.displayValue ?? '');
    }

    return '';
}
