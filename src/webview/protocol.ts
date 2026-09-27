/**
 * Webview から拡張機能へ送る操作メッセージ。
 *
 * `command` を判別子にすることで、送信側と受信側の payload を同時に型検査できる。
 */
export type WebviewMessage =
    | { command: 'update_cell'; path: string; value: string }
    | { command: 'add_row'; parentPath: string; key: string; value: string }
    | { command: 'delete_row'; path: string }
    | { command: 'add_table_row'; arrayPath: string; rowData?: unknown }
    | { command: 'add_table_column'; arrayPath: string; columnKey: string }
    | { command: 'rename_table_column'; arrayPath: string; oldKey: string; newKey: string }
    | { command: 'rename_key'; path: string; newKey: string }
    | { command: 'move_table_row'; arrayPath: string; fromIndex: number; toIndex: number }
    | { command: 'move_table_column'; arrayPath: string; fromIndex: number; toIndex: number }
    | { command: 'clear_table_column'; arrayPath: string; columnKey: string }
    | { command: 'clear_table_data'; arrayPath: string }
    | { command: 'open_text_editor' };

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function hasString(value: Record<string, unknown>, key: string): boolean {
    return typeof value[key] === 'string';
}

function hasFiniteNumber(value: Record<string, unknown>, key: string): boolean {
    return typeof value[key] === 'number' && Number.isFinite(value[key]);
}

/**
 * VS Code Webview 境界で受け取った未知の値を WebviewMessage として検証する。
 */
export function isWebviewMessage(value: unknown): value is WebviewMessage {
    if (!isRecord(value) || !hasString(value, 'command')) {
        return false;
    }

    switch (value.command) {
        case 'update_cell':
            return hasString(value, 'path') && hasString(value, 'value');
        case 'add_row':
            return hasString(value, 'parentPath') && hasString(value, 'key') && hasString(value, 'value');
        case 'delete_row':
            return hasString(value, 'path');
        case 'add_table_row':
            return hasString(value, 'arrayPath');
        case 'add_table_column':
        case 'clear_table_column':
            return hasString(value, 'arrayPath') && hasString(value, 'columnKey');
        case 'rename_table_column':
            return hasString(value, 'arrayPath') && hasString(value, 'oldKey') && hasString(value, 'newKey');
        case 'rename_key':
            return hasString(value, 'path') && hasString(value, 'newKey');
        case 'move_table_row':
        case 'move_table_column':
            return hasString(value, 'arrayPath')
                && hasFiniteNumber(value, 'fromIndex')
                && hasFiniteNumber(value, 'toIndex');
        case 'clear_table_data':
            return hasString(value, 'arrayPath');
        case 'open_text_editor':
            return true;
        default:
            return false;
    }
}
