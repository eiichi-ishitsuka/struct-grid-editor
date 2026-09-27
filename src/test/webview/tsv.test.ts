import { describe, expect, it } from 'vitest';
import { formatTsvValue, generateTsv } from '../../webview/model/tsv';
import type { OrderedTableView } from '../../webview/model/tableView';

describe('TSV Generation Utilities', () => {
    /**
     * 【観点】特殊文字（タブ、改行、引用符）のエスケープおよび null/undefined の空文字変換
     * 【テスト内容】formatTsvValue に特殊文字を含む文字列や null/undefined を渡した際、タブや改行が二重引用符で囲まれ、二重引用符が二重化され、null/undefined が空文字へ変換されることを検証する。
     */
    it('escapes special characters with quotes and doubles inner quotes', () => {
        expect(formatTsvValue('simple')).toBe('simple');
        expect(formatTsvValue('hello\tworld')).toBe('"hello\tworld"');
        expect(formatTsvValue('hello\nworld')).toBe('"hello\nworld"');
        expect(formatTsvValue('say "hello"')).toBe('"say ""hello"""');
        expect(formatTsvValue(null)).toBe('');
        expect(formatTsvValue(undefined)).toBe('');
    });

    const mockView: OrderedTableView = {
        path: '',
        columns: [
            { key: 'id', label: 'ID', type: 'number' },
            { key: 'name', label: 'Name', type: 'string' },
        ],
        allColumns: [
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
    };

    /**
     * 【観点】全選択（all）時のTSV文字列生成
     * 【テスト内容】全選択状態で generateTsv を呼び出した際、ヘッダー行を含み全行・全列のデータがタブ・改行区切りのTSVとして出力されることを検証する。
     */
    it('generates TSV for all selection', () => {
        const tsv = generateTsv(mockView, { type: 'all' });
        expect(tsv).toBe('ID\tName\n1\tAlice\n2\tBob');
    });

    /**
     * 【観点】行選択（row）時のTSV文字列生成
     * 【テスト内容】行選択状態で generateTsv を呼び出した際、指定した単一行の全列値がタブ区切りで出力されることを検証する。
     */
    it('generates TSV for row selection', () => {
        const tsv = generateTsv(mockView, { type: 'row', rowIndex: 0, path: '[0]' });
        expect(tsv).toBe('1\tAlice');
    });

    /**
     * 【観点】列選択（col）時のTSV文字列生成
     * 【テスト内容】列選択状態で generateTsv を呼び出した際、指定したカラムの全行の値が改行区切りで出力されることを検証する。
     */
    it('generates TSV for column selection', () => {
        const tsv = generateTsv(mockView, { type: 'col', colKey: 'name' });
        expect(tsv).toBe('Alice\nBob');
    });

    /**
     * 【観点】単一セル選択（cell）時のTSV文字列生成
     * 【テスト内容】セル選択状態で generateTsv を呼び出した際、対象セルの値のみが出力されることを検証する。
     */
    it('generates TSV for cell selection', () => {
        const tsv = generateTsv(mockView, { type: 'cell', rowIndex: 1, colKey: 'name', path: '[1].name' });
        expect(tsv).toBe('Bob');
    });
});
