[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/model/tsv](../README.md) / formatTsvValue

# Function: formatTsvValue()

> **formatTsvValue**(`val`): `string`

Defined in: [webview/model/tsv.ts:8](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/e20beb86538f08849d50b688bca0eb17506d34aa/src/webview/model/tsv.ts#L8)

TSV 用にセル値をエスケープする。
タブ、改行、ダブルクォートを含む場合はダブルクォートで囲み、内部のクォートを二重化する。

## Parameters

### val

`unknown`

## Returns

`string`
