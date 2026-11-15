[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/hooks/useTableView](../README.md) / resolveActiveArrayPath

# Function: resolveActiveArrayPath()

> **resolveActiveArrayPath**(`data`, `candidate`): `string` \| `null`

Defined in: [webview/hooks/useTableView.ts:28](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/f2bc95f4d1b429803858e0f71617e0d396de529f/src/webview/hooks/useTableView.ts#L28)

有効な配列パスを検証・解決する。対象が存在しない場合はデフォルトパスへフォールバックする。

## Parameters

### data

[`GridDataDto`](../../../../application/dto/GridData/interfaces/GridDataDto.md)

### candidate

`string` \| `null` \| `undefined`

## Returns

`string` \| `null`
