[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/hooks/useTableView](../README.md) / resolveActiveArrayPath

# Function: resolveActiveArrayPath()

> **resolveActiveArrayPath**(`data`, `candidate`): `string` \| `null`

Defined in: [webview/hooks/useTableView.ts:28](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/e20beb86538f08849d50b688bca0eb17506d34aa/src/webview/hooks/useTableView.ts#L28)

有効な配列パスを検証・解決する。対象が存在しない場合はデフォルトパスへフォールバックする。

## Parameters

### data

[`GridDataDto`](../../../../application/dto/GridData/interfaces/GridDataDto.md)

### candidate

`string` \| `null` \| `undefined`

## Returns

`string` \| `null`
