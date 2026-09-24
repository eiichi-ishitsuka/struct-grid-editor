import { describe, expect, it } from 'vitest';
import { isWebviewMessage, type WebviewMessage } from '../../../infrastructure/webview/protocol';

describe('Webview message protocol', () => {
    /** 【観点】定義済みの全コマンドを受信できること */
    it('accepts every supported command and its payload', () => {
        const messages: WebviewMessage[] = [
            { command: 'update_cell', path: 'users[0].name', value: 'Alice' },
            { command: 'add_row', parentPath: '', key: 'name', value: 'Alice' },
            { command: 'delete_row', path: 'users[0]' },
            { command: 'add_table_row', arrayPath: 'users', rowData: { name: 'Alice' } },
            { command: 'add_table_column', arrayPath: 'users', columnKey: 'age' },
            { command: 'rename_table_column', arrayPath: 'users', oldKey: 'name', newKey: 'fullName' },
            { command: 'rename_key', path: 'name', newKey: 'fullName' },
            { command: 'move_table_row', arrayPath: 'users', fromIndex: 0, toIndex: 1 },
            { command: 'move_table_column', arrayPath: 'users', fromIndex: 0, toIndex: 1 },
            { command: 'clear_table_column', arrayPath: 'users', columnKey: 'age' },
            { command: 'clear_table_data', arrayPath: 'users' },
            { command: 'open_text_editor' },
        ];

        for (const message of messages) {
            expect(isWebviewMessage(message)).toBe(true);
        }
    });

    /** 【観点】不完全または未知のメッセージを拡張機能へ渡さないこと */
    it.each([
        null,
        'update_cell',
        {},
        { command: 'unknown_command' },
        { command: 'update_cell', path: 'users[0].name' },
        { command: 'move_table_row', arrayPath: 'users', fromIndex: 0, toIndex: Number.NaN },
        { command: 'clear_table_data' },
    ])('rejects an invalid message: %j', (message) => {
        expect(isWebviewMessage(message)).toBe(false);
    });
});
