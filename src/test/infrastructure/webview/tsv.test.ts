import { describe, expect, it } from 'vitest';
import { formatTsvValue, generateTsv } from '../../../infrastructure/webview/ui/model/tsv';
import type { OrderedTableView } from '../../../infrastructure/webview/ui/model/tableView';

describe('TSV Generation Utilities', () => {
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

    it('generates TSV for all selection', () => {
        const tsv = generateTsv(mockView, { type: 'all' });
        expect(tsv).toBe('ID\tName\n1\tAlice\n2\tBob');
    });

    it('generates TSV for row selection', () => {
        const tsv = generateTsv(mockView, { type: 'row', rowIndex: 0, path: '[0]' });
        expect(tsv).toBe('1\tAlice');
    });

    it('generates TSV for column selection', () => {
        const tsv = generateTsv(mockView, { type: 'col', colKey: 'name' });
        expect(tsv).toBe('Alice\nBob');
    });

    it('generates TSV for cell selection', () => {
        const tsv = generateTsv(mockView, { type: 'cell', rowIndex: 1, colKey: 'name', path: '[1].name' });
        expect(tsv).toBe('Bob');
    });
});
