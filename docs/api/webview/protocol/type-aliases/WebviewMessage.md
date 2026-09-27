[**struct-grid-editor**](../../../README.md)

***

[struct-grid-editor](../../../README.md) / [webview/protocol](../README.md) / WebviewMessage

# Type Alias: WebviewMessage

> **WebviewMessage** = \{ `command`: `"update_cell"`; `path`: `string`; `value`: `string`; \} \| \{ `command`: `"add_row"`; `key`: `string`; `parentPath`: `string`; `value`: `string`; \} \| \{ `command`: `"delete_row"`; `path`: `string`; \} \| \{ `arrayPath`: `string`; `command`: `"add_table_row"`; `rowData?`: `unknown`; \} \| \{ `arrayPath`: `string`; `columnKey`: `string`; `command`: `"add_table_column"`; \} \| \{ `arrayPath`: `string`; `command`: `"rename_table_column"`; `newKey`: `string`; `oldKey`: `string`; \} \| \{ `command`: `"rename_key"`; `newKey`: `string`; `path`: `string`; \} \| \{ `arrayPath`: `string`; `command`: `"move_table_row"`; `fromIndex`: `number`; `toIndex`: `number`; \} \| \{ `arrayPath`: `string`; `command`: `"move_table_column"`; `fromIndex`: `number`; `toIndex`: `number`; \} \| \{ `arrayPath`: `string`; `columnKey`: `string`; `command`: `"clear_table_column"`; \} \| \{ `arrayPath`: `string`; `command`: `"clear_table_data"`; \} \| \{ `command`: `"open_text_editor"`; \}

Defined in: [webview/protocol.ts:6](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/protocol.ts#L6)

Webview から拡張機能へ送る操作メッセージ。

`command` を判別子にすることで、送信側と受信側の payload を同時に型検査できる。
