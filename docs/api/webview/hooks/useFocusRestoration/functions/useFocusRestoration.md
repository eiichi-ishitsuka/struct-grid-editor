[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/hooks/useFocusRestoration](../README.md) / useFocusRestoration

# Function: useFocusRestoration()

> **useFocusRestoration**(`__namedParameters`): `object`

Defined in: [webview/hooks/useFocusRestoration.ts:14](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useFocusRestoration.ts#L14)

再描画をまたぐセル選択を Webview state に保存・復元する。

## Parameters

### \_\_namedParameters

[`FocusRestorationOptions`](../interfaces/FocusRestorationOptions.md)

## Returns

`object`

### containerRef

> **containerRef**: `RefObject`\<`HTMLElement` \| `null`\>

### savePendingFocus

> **savePendingFocus**: (`focus`) => `void`

#### Parameters

##### focus

[`PendingFocus`](../../gridUiState/interfaces/PendingFocus.md)

#### Returns

`void`
