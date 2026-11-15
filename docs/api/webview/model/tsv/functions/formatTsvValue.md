[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/model/tsv](../README.md) / formatTsvValue

# Function: formatTsvValue()

> **formatTsvValue**(`val`): `string`

Defined in: [webview/model/tsv.ts:8](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/webview/model/tsv.ts#L8)

TSV 用にセル値をエスケープする。
タブ、改行、ダブルクォートを含む場合はダブルクォートで囲み、内部のクォートを二重化する。

## Parameters

### val

`unknown`

## Returns

`string`
