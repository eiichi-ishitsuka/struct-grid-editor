[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/hooks/useKeyboardNavigation](../README.md) / KeyboardNavigationOptions

# Interface: KeyboardNavigationOptions

Defined in: [webview/hooks/useKeyboardNavigation.ts:64](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useKeyboardNavigation.ts#L64)

## Properties

### activeArrayPath

> **activeArrayPath**: `string` \| `null`

Defined in: [webview/hooks/useKeyboardNavigation.ts:67](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useKeyboardNavigation.ts#L67)

***

### onNavigate

> **onNavigate**: (`cell`) => `void`

Defined in: [webview/hooks/useKeyboardNavigation.ts:68](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useKeyboardNavigation.ts#L68)

#### Parameters

##### cell

[`GridCellCoordinate`](GridCellCoordinate.md)

#### Returns

`void`

***

### onSelectAll

> **onSelectAll**: () => `void`

Defined in: [webview/hooks/useKeyboardNavigation.ts:69](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useKeyboardNavigation.ts#L69)

#### Returns

`void`

***

### postMessage

> **postMessage**: (`message`) => `void`

Defined in: [webview/hooks/useKeyboardNavigation.ts:70](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useKeyboardNavigation.ts#L70)

#### Parameters

##### message

[`WebviewMessage`](../../../protocol/type-aliases/WebviewMessage.md)

#### Returns

`void`

***

### rows

> **rows**: [`IndexedTableRow`](../../../model/tableView/interfaces/IndexedTableRow.md)[]

Defined in: [webview/hooks/useKeyboardNavigation.ts:65](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useKeyboardNavigation.ts#L65)

***

### tableView

> **tableView**: [`OrderedTableView`](../../../model/tableView/interfaces/OrderedTableView.md)

Defined in: [webview/hooks/useKeyboardNavigation.ts:66](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/hooks/useKeyboardNavigation.ts#L66)
