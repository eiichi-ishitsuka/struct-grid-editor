[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/components/EditableCell](../README.md) / EditableCellProps

# Interface: EditableCellProps

Defined in: [webview/components/EditableCell.tsx:11](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/EditableCell.tsx#L11)

## Properties

### className?

> `optional` **className?**: `string`

Defined in: [webview/components/EditableCell.tsx:17](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/EditableCell.tsx#L17)

***

### colKey

> **colKey**: `string`

Defined in: [webview/components/EditableCell.tsx:13](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/EditableCell.tsx#L13)

***

### displayValue

> **displayValue**: `string`

Defined in: [webview/components/EditableCell.tsx:15](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/EditableCell.tsx#L15)

***

### isSelected?

> `optional` **isSelected?**: `boolean`

Defined in: [webview/components/EditableCell.tsx:19](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/EditableCell.tsx#L19)

***

### onContextMenu?

> `optional` **onContextMenu?**: (`event`) => `void`

Defined in: [webview/components/EditableCell.tsx:23](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/EditableCell.tsx#L23)

#### Parameters

##### event

`MouseEvent`\<`HTMLTableCellElement`\>

#### Returns

`void`

***

### onNavigateAdjacent?

> `optional` **onNavigateAdjacent?**: (`direction`) => `void`

Defined in: [webview/components/EditableCell.tsx:22](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/EditableCell.tsx#L22)

#### Parameters

##### direction

[`GridNavigationDirection`](../../../hooks/useKeyboardNavigation/type-aliases/GridNavigationDirection.md)

#### Returns

`void`

***

### onSelectCell

> **onSelectCell**: (`rowIndex`, `colKey`, `path`) => `void`

Defined in: [webview/components/EditableCell.tsx:21](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/EditableCell.tsx#L21)

#### Parameters

##### rowIndex

`number`

##### colKey

`string`

##### path

`string`

#### Returns

`void`

***

### onUpdateCell

> **onUpdateCell**: (`path`, `value`) => `void`

Defined in: [webview/components/EditableCell.tsx:20](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/EditableCell.tsx#L20)

#### Parameters

##### path

`string`

##### value

`string`

#### Returns

`void`

***

### path

> **path**: `string`

Defined in: [webview/components/EditableCell.tsx:12](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/EditableCell.tsx#L12)

***

### rowIndex

> **rowIndex**: `number`

Defined in: [webview/components/EditableCell.tsx:14](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/EditableCell.tsx#L14)

***

### style?

> `optional` **style?**: `CSSProperties`

Defined in: [webview/components/EditableCell.tsx:18](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/EditableCell.tsx#L18)

***

### type?

> `optional` **type?**: `string`

Defined in: [webview/components/EditableCell.tsx:16](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/EditableCell.tsx#L16)
