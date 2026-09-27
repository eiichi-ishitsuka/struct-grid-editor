[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [webview/components/KvGrid](../README.md) / KvGridProps

# Interface: KvGridProps

Defined in: [webview/components/KvGrid.tsx:6](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/KvGrid.tsx#L6)

## Properties

### onAddKvRow?

> `optional` **onAddKvRow?**: () => `void`

Defined in: [webview/components/KvGrid.tsx:11](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/KvGrid.tsx#L11)

#### Returns

`void`

***

### onCellContextMenu?

> `optional` **onCellContextMenu?**: (`event`, `path`) => `void`

Defined in: [webview/components/KvGrid.tsx:14](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/KvGrid.tsx#L14)

#### Parameters

##### event

`MouseEvent`\<`HTMLTableCellElement`\>

##### path

`string`

#### Returns

`void`

***

### onKeyContextMenu?

> `optional` **onKeyContextMenu?**: (`event`, `row`) => `void`

Defined in: [webview/components/KvGrid.tsx:13](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/KvGrid.tsx#L13)

#### Parameters

##### event

`MouseEvent`\<`HTMLSpanElement`\>

##### row

[`GridRowDto`](../../../../application/dto/GridData/interfaces/GridRowDto.md)

#### Returns

`void`

***

### onNavigateArray?

> `optional` **onNavigateArray?**: (`arrayPath`) => `void`

Defined in: [webview/components/KvGrid.tsx:12](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/KvGrid.tsx#L12)

#### Parameters

##### arrayPath

`string`

#### Returns

`void`

***

### onRenameKey?

> `optional` **onRenameKey?**: (`path`, `oldKey`, `newKey`) => `void`

Defined in: [webview/components/KvGrid.tsx:10](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/KvGrid.tsx#L10)

#### Parameters

##### path

`string`

##### oldKey

`string`

##### newKey

`string`

#### Returns

`void`

***

### onUpdateCell?

> `optional` **onUpdateCell?**: (`path`, `value`) => `void`

Defined in: [webview/components/KvGrid.tsx:9](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/KvGrid.tsx#L9)

#### Parameters

##### path

`string`

##### value

`string`

#### Returns

`void`

***

### rows

> **rows**: [`GridRowDto`](../../../../application/dto/GridData/interfaces/GridRowDto.md)[]

Defined in: [webview/components/KvGrid.tsx:7](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/KvGrid.tsx#L7)

***

### searchQuery

> **searchQuery**: `string`

Defined in: [webview/components/KvGrid.tsx:8](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/webview/components/KvGrid.tsx#L8)
