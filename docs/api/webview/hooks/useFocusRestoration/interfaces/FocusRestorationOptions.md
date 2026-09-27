[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/hooks/useFocusRestoration](../README.md) / FocusRestorationOptions

# Interface: FocusRestorationOptions

Defined in: [webview/hooks/useFocusRestoration.ts:7](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useFocusRestoration.ts#L7)

## Properties

### pendingFocus

> **pendingFocus**: [`PendingFocus`](../../gridUiState/interfaces/PendingFocus.md) \| `undefined`

Defined in: [webview/hooks/useFocusRestoration.ts:8](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useFocusRestoration.ts#L8)

***

### setSelection

> **setSelection**: (`selection`) => `void`

Defined in: [webview/hooks/useFocusRestoration.ts:10](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useFocusRestoration.ts#L10)

#### Parameters

##### selection

[`GridSelection`](../../gridUiState/type-aliases/GridSelection.md)

#### Returns

`void`

***

### setUiState

> **setUiState**: (`updater`) => `void`

Defined in: [webview/hooks/useFocusRestoration.ts:9](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useFocusRestoration.ts#L9)

#### Parameters

##### updater

[`StateUpdater`](../../useVsCodeState/type-aliases/StateUpdater.md)\<[`GridUiState`](../../gridUiState/interfaces/GridUiState.md)\>

#### Returns

`void`
