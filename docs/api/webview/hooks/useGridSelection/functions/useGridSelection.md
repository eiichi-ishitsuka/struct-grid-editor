[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/hooks/useGridSelection](../README.md) / useGridSelection

# Function: useGridSelection()

> **useGridSelection**(): `object`

Defined in: [webview/hooks/useGridSelection.ts:5](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/e20beb86538f08849d50b688bca0eb17506d34aa/src/webview/hooks/useGridSelection.ts#L5)

表の選択操作と、選択状態に基づく CSS クラスの付与を管理する。

## Returns

`object`

### clearSelection

> **clearSelection**: () => `void`

#### Returns

`void`

### selectAll

> **selectAll**: () => `void`

#### Returns

`void`

### selectCell

> **selectCell**: (`rowIndex`, `colKey`, `path`) => `void`

#### Parameters

##### rowIndex

`number`

##### colKey

`string`

##### path

`string`

#### Returns

`void`

### selectCol

> **selectCol**: (`colKey`) => `void`

#### Parameters

##### colKey

`string`

#### Returns

`void`

### selection

> **selection**: [`GridSelection`](../../gridUiState/type-aliases/GridSelection.md)

### selectRow

> **selectRow**: (`rowIndex`, `path`) => `void`

#### Parameters

##### rowIndex

`number`

##### path

`string`

#### Returns

`void`

### setSelection

> **setSelection**: `Dispatch`\<`SetStateAction`\<[`GridSelection`](../../gridUiState/type-aliases/GridSelection.md)\>\>
