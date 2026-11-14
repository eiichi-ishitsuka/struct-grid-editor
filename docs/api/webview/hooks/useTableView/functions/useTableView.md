[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/hooks/useTableView](../README.md) / useTableView

# Function: useTableView()

> **useTableView**(`data`, `uiState`, `setUiState`): [`UseTableViewResult`](../interfaces/UseTableViewResult.md)

Defined in: [webview/hooks/useTableView.ts:44](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/e20beb86538f08849d50b688bca0eb17506d34aa/src/webview/hooks/useTableView.ts#L44)

表示パス、検索、ページングと永続設定から、現在の表表示モデルを組み立てる。

## Parameters

### data

[`GridDataDto`](../../../../application/dto/GridData/interfaces/GridDataDto.md)

### uiState

[`GridUiState`](../../gridUiState/interfaces/GridUiState.md)

### setUiState

(`updater`) => `void`

## Returns

[`UseTableViewResult`](../interfaces/UseTableViewResult.md)
