import { IDocumentParser, DocumentParseOptions } from '../../domain/port/IDocumentParser';
import { StructuredDocument } from '../../domain/model/StructuredDocument';
import { TreeNode } from '../../domain/model/TreeNode';
import { DocumentFormat } from '../../domain/model/DocumentFormat';

/**
 * 先頭ゼロを持つコード文字列（例: "0012"）を誤って数値化しないための厳密な数値リテラル正規表現。
 */
const STRICT_NUMBER_REGEX = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;

/**
 * CSV / TSV（区切り文字形式）ドキュメントの解析およびシリアライズを担う汎用パーサー。
 * RFC 4180 に準拠し、ダブルクォート囲み・エスケープ（""）・セル内改行・区切り文字を適切に処理します。
 * また、1行目をヘッダーとして扱うモード（hasHeader: true）と、すべてデータ行として扱うモード（hasHeader: false）の両方をサポートします。
 */
export class DelimitedDocumentParser implements IDocumentParser {
    constructor(
        private readonly fileType: 'csv' | 'tsv',
        private readonly delimiter: ',' | '\t'
    ) {}

    /**
     * 指定された拡張子が本パーサーの対象（csv または tsv）であるかを判定します。
     * @param fileExtension 拡張子文字列
     * @returns サポートしている場合は true
     */
    public supports(fileExtension: string): boolean {
        const ext = fileExtension.toLowerCase().replace(/^\./, '');
        return ext === this.fileType;
    }

    /**
     * 区切り文字形式のテキストを解析し、オブジェクト配列をルートとする StructuredDocument を生成します。
     * @param text 解析対象のテキスト
     * @param options 解析オプション（hasHeader: 1行目をヘッダーとして扱うか）
     * @returns 生成された StructuredDocument インスタンス
     */
    public parse(text: string, options?: DocumentParseOptions): StructuredDocument {
        const hasHeader = options?.hasHeader ?? true;
        const hasTrailingNewline = text.endsWith('\n') || text.endsWith('\r\n');
        const newline = text.includes('\r\n') ? '\r\n' : '\n';

        const rawRows = this.parseDelimitedText(text);

        if (rawRows.length === 0) {
            const root = TreeNode.fromJS([]);
            const format = new DocumentFormat({
                fileType: this.fileType,
                indent: 0,
                hasTrailingNewline,
                metadata: {
                    delimiter: this.delimiter,
                    hasHeader,
                    headerColumns: [],
                    newline,
                },
            });
            return new StructuredDocument(root, format);
        }

        const maxCols = rawRows.reduce((max, row) => Math.max(max, row.length), 0);
        let headerColumns: string[];
        let dataRows: string[][];

        if (hasHeader) {
            const rawHeader = rawRows[0];
            headerColumns = this.normalizeHeaders(rawHeader, maxCols);
            dataRows = rawRows.slice(1);
        } else {
            headerColumns = Array.from({ length: maxCols }, (_, idx) => `col${idx + 1}`);
            dataRows = rawRows;
        }

        const items = dataRows.map(row => {
            const obj: Record<string, unknown> = {};
            for (let colIdx = 0; colIdx < headerColumns.length; colIdx++) {
                const key = headerColumns[colIdx];
                const rawVal = colIdx < row.length ? row[colIdx] : '';
                obj[key] = this.inferCellValue(rawVal);
            }
            return obj;
        });

        const root = TreeNode.fromJS(items);
        const format = new DocumentFormat({
            fileType: this.fileType,
            indent: 0,
            hasTrailingNewline,
            metadata: {
                delimiter: this.delimiter,
                hasHeader,
                headerColumns,
                newline,
            },
        });

        return new StructuredDocument(root, format);
    }

    /**
     * StructuredDocument を CSV または TSV 形式の文字列にシリアライズします。
     * @param document シリアライズ対象の StructuredDocument
     * @returns シリアライズされた文字列
     */
    public serialize(document: StructuredDocument): string {
        const js = document.toJS();
        const newline = (document.format.metadata?.newline as string) || '\n';
        const delimiter = (document.format.metadata?.delimiter as string) || this.delimiter;
        const hasHeader = document.format.metadata?.hasHeader !== false;
        const savedHeaders = (document.format.metadata?.headerColumns as string[] | undefined) ?? [];
        const hasTrailingNewline = document.format.hasTrailingNewline;

        if (!Array.isArray(js)) {
            return '';
        }

        // カラム順序の収集（データ行が存在する場合はデータのキー順序を優先し、0行の場合は保存済みヘッダーを使用）
        const columnKeys: string[] = [];
        if (js.length > 0) {
            for (const item of js) {
                if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                    for (const k of Object.keys(item)) {
                        if (!columnKeys.includes(k)) {
                            columnKeys.push(k);
                        }
                    }
                }
            }
        } else if (savedHeaders.length > 0) {
            columnKeys.push(...savedHeaders);
        }

        if (columnKeys.length === 0 && js.length === 0) {
            return '';
        }

        const lines: string[] = [];

        if (hasHeader && columnKeys.length > 0) {
            lines.push(columnKeys.map(col => this.escapeCell(col, delimiter)).join(delimiter));
        }

        for (const item of js) {
            if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                const rowCells = columnKeys.map(col => {
                    const val = item[col];
                    return this.escapeCell(this.formatCellValue(val), delimiter);
                });
                lines.push(rowCells.join(delimiter));
            } else {
                lines.push(this.escapeCell(this.formatCellValue(item), delimiter));
            }
        }

        if (lines.length === 0) {
            return '';
        }

        const joined = lines.join(newline);
        return hasTrailingNewline ? joined + newline : joined;
    }

    /**
     * RFC 4180 に準拠したステートマシンで区切り文字テキストを行・セルの2次元配列へ解析します。
     */
    private parseDelimitedText(text: string): string[][] {
        if (text.length === 0) {
            return [];
        }

        const rows: string[][] = [];
        let currentRow: string[] = [];
        let currentCell = '';
        let inQuotes = false;
        let cellStarted = false;

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];

            if (inQuotes) {
                if (ch === '"') {
                    if (i + 1 < text.length && text[i + 1] === '"') {
                        currentCell += '"';
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    currentCell += ch;
                }
            } else {
                if (ch === '"' && !cellStarted) {
                    inQuotes = true;
                    cellStarted = true;
                } else if (ch === this.delimiter) {
                    currentRow.push(currentCell);
                    currentCell = '';
                    cellStarted = false;
                } else if (ch === '\r' || ch === '\n') {
                    if (ch === '\r' && i + 1 < text.length && text[i + 1] === '\n') {
                        i++;
                    }
                    currentRow.push(currentCell);
                    rows.push(currentRow);
                    currentRow = [];
                    currentCell = '';
                    cellStarted = false;
                } else {
                    currentCell += ch;
                    cellStarted = true;
                }
            }
        }

        if (inQuotes) {
            throw new Error(`${this.fileType.toUpperCase()} 解析エラー: ダブルクォートが閉じられていません`);
        }

        // 末尾改行で終わっていない場合、最後の行を追加
        if (currentStartedOrHasCells(currentRow, currentCell, cellStarted)) {
            currentRow.push(currentCell);
            rows.push(currentRow);
        }

        return rows;
    }

    /**
     * ヘッダー行のカラム名を正規化し、空カラム名の補完および重複カラム名の連番付与を行います。
     */
    private normalizeHeaders(rawHeader: string[], maxCols: number): string[] {
        const result: string[] = [];
        const used = new Set<string>();
        const totalCols = Math.max(rawHeader.length, maxCols);

        for (let i = 0; i < totalCols; i++) {
            const rawName = i < rawHeader.length ? rawHeader[i].trim() : '';
            const baseName = rawName !== '' ? rawName : `col${i + 1}`;
            let candidate = baseName;
            let suffix = 2;
            while (used.has(candidate)) {
                candidate = `${baseName}_${suffix}`;
                suffix++;
            }
            used.add(candidate);
            result.push(candidate);
        }

        return result;
    }

    /**
     * セルの文字列から型（数値・真偽値・文字列）を自動推論します。
     */
    private inferCellValue(raw: string): string | number | boolean {
        if (raw === '') {
            return '';
        }
        const trimmed = raw.trim();
        if (trimmed === 'true') {
            return true;
        }
        if (trimmed === 'false') {
            return false;
        }
        if (STRICT_NUMBER_REGEX.test(trimmed)) {
            const num = Number(trimmed);
            if (Number.isFinite(num)) {
                return num;
            }
        }
        return raw;
    }

    /**
     * シリアライズ用にセルの値を文字列化します。
     */
    private formatCellValue(val: unknown): string {
        if (val === null || val === undefined) {
            return '';
        }
        if (typeof val === 'object') {
            return JSON.stringify(val);
        }
        return String(val);
    }

    /**
     * 区切り文字・改行・ダブルクォートを含むセル値を RFC 4180 形式でエスケープします。
     */
    private escapeCell(str: string, delimiter: string): string {
        if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }
}

function currentStartedOrHasCells(currentRow: string[], currentCell: string, cellStarted: boolean): boolean {
    return currentRow.length > 0 || currentCell.length > 0 || cellStarted;
}

/**
 * CSV（カンマ区切り）ドキュメントパーサー。
 */
export class CsvDocumentParser extends DelimitedDocumentParser {
    constructor() {
        super('csv', ',');
    }
}

/**
 * TSV（タブ区切り）ドキュメントパーサー。
 */
export class TsvDocumentParser extends DelimitedDocumentParser {
    constructor() {
        super('tsv', '\t');
    }
}
