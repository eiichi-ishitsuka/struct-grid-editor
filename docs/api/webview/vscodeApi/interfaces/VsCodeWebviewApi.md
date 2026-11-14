[**struct-grid-editor**](../../../README.md)

***

[struct-grid-editor](../../../README.md) / [webview/vscodeApi](../README.md) / VsCodeWebviewApi

# Interface: VsCodeWebviewApi\<TState\>

Defined in: [webview/vscodeApi.ts:4](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/webview/vscodeApi.ts#L4)

VS Code が Webview に公開する状態・通信 API。

## Type Parameters

### TState

`TState` = `unknown`

## Methods

### getState()

> **getState**(): `TState` \| `undefined`

Defined in: [webview/vscodeApi.ts:5](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/webview/vscodeApi.ts#L5)

#### Returns

`TState` \| `undefined`

***

### postMessage()

> **postMessage**(`message`): `void`

Defined in: [webview/vscodeApi.ts:7](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/webview/vscodeApi.ts#L7)

#### Parameters

##### message

[`WebviewMessage`](../../protocol/type-aliases/WebviewMessage.md)

#### Returns

`void`

***

### setState()

> **setState**(`newState`): `void`

Defined in: [webview/vscodeApi.ts:6](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/webview/vscodeApi.ts#L6)

#### Parameters

##### newState

`TState`

#### Returns

`void`
