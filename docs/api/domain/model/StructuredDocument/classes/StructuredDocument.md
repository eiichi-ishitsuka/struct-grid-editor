[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [domain/model/StructuredDocument](../README.md) / StructuredDocument

# Class: StructuredDocument

Defined in: [domain/model/StructuredDocument.ts:13](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L13)

構造化ドキュメントを表現する集約ルート（Aggregate Root）。
ドキュメント構文木、書式メタデータ、およびドメイン操作をカプセル化します。

## Constructors

### Constructor

> **new StructuredDocument**(`root`, `format`, `treeFlattener?`): `StructuredDocument`

Defined in: [domain/model/StructuredDocument.ts:16](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L16)

#### Parameters

##### root

[`TreeNode`](../../TreeNode/classes/TreeNode.md)

ドキュメントのルート構文木ノード

##### format

[`DocumentFormat`](../../DocumentFormat/classes/DocumentFormat.md)

ドキュメントの書式メタデータ

##### treeFlattener?

[`TreeFlattener`](../../../service/TreeFlattener/classes/TreeFlattener.md)

#### Returns

`StructuredDocument`

## Properties

### format

> `readonly` **format**: [`DocumentFormat`](../../DocumentFormat/classes/DocumentFormat.md)

Defined in: [domain/model/StructuredDocument.ts:20](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L20)

ドキュメントの書式メタデータ

***

### root

> `readonly` **root**: [`TreeNode`](../../TreeNode/classes/TreeNode.md)

Defined in: [domain/model/StructuredDocument.ts:18](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L18)

ドキュメントのルート構文木ノード

## Methods

### addNode()

> **addNode**(`parentPath`, `key`, `initialValue`): `StructuredDocument`

Defined in: [domain/model/StructuredDocument.ts:44](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L44)

指定された親パスの下に新しいノード／要素を追加します。

#### Parameters

##### parentPath

[`CellPath`](../../CellPath/classes/CellPath.md)

追加先親ノードのパス

##### key

`string` \| `number`

新しいキー名またはインデックス

##### initialValue

[`CellValue`](../../CellValue/classes/CellValue.md)

初期セル値

#### Returns

`StructuredDocument`

更新後の新しい StructuredDocument インスタンス

***

### addTableColumn()

> **addTableColumn**(`arrayPath`, `columnKey`, `defaultValue?`): `StructuredDocument`

Defined in: [domain/model/StructuredDocument.ts:192](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L192)

指定された配列パス（arrayPath）の全オブジェクト要素に新しいカラム（プロパティ）を追加します。

#### Parameters

##### arrayPath

[`CellPath`](../../CellPath/classes/CellPath.md)

対象の配列へのアクセスパス

##### columnKey

`string`

追加するカラムキー名

##### defaultValue?

`any` = `''`

初期値（デフォルトは空文字）

#### Returns

`StructuredDocument`

更新後の新しい StructuredDocument インスタンス

***

### addTableRow()

> **addTableRow**(`arrayPath`, `newRowData?`): `StructuredDocument`

Defined in: [domain/model/StructuredDocument.ts:152](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L152)

指定された配列パス（arrayPath）に新しい行（要素）を追加します。

#### Parameters

##### arrayPath

[`CellPath`](../../CellPath/classes/CellPath.md)

対象の配列へのアクセスパス

##### newRowData?

`any`

追加する行データ（省略時は既存要素の構造から自動生成）

#### Returns

`StructuredDocument`

更新後の新しい StructuredDocument インスタンス

***

### clearTableColumn()

> **clearTableColumn**(`arrayPath`, `columnKey`): `StructuredDocument`

Defined in: [domain/model/StructuredDocument.ts:449](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L449)

指定された配列パス内の全行から指定カラムの値をクリア（空文字列に設定）します。

#### Parameters

##### arrayPath

[`CellPath`](../../CellPath/classes/CellPath.md)

対象の配列へのアクセスパス

##### columnKey

`string`

クリア対象のカラムキー名

#### Returns

`StructuredDocument`

更新後の新しい StructuredDocument インスタンス

***

### clearTableData()

> **clearTableData**(`arrayPath`): `StructuredDocument`

Defined in: [domain/model/StructuredDocument.ts:483](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L483)

指定された配列パス内の全行のデータセルの値をクリア（空文字列に設定）します。

#### Parameters

##### arrayPath

[`CellPath`](../../CellPath/classes/CellPath.md)

対象の配列へのアクセスパス

#### Returns

`StructuredDocument`

更新後の新しい StructuredDocument インスタンス

***

### deleteNode()

> **deleteNode**(`path`): `StructuredDocument`

Defined in: [domain/model/StructuredDocument.ts:74](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L74)

指定されたパスのノードを削除します。

#### Parameters

##### path

[`CellPath`](../../CellPath/classes/CellPath.md)

削除対象ノードのパス

#### Returns

`StructuredDocument`

更新後の新しい StructuredDocument インスタンス

***

### findNode()

> **findNode**(`path`): [`TreeNode`](../../TreeNode/classes/TreeNode.md) \| `null`

Defined in: [domain/model/StructuredDocument.ts:117](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L117)

指定されたパスの TreeNode を探索して取得します。

#### Parameters

##### path

[`CellPath`](../../CellPath/classes/CellPath.md)

探索対象のアクセスパス

#### Returns

[`TreeNode`](../../TreeNode/classes/TreeNode.md) \| `null`

発見された TreeNode、存在しない場合は null

***

### findSubArrays()

> **findSubArrays**(): `object`[]

Defined in: [domain/model/StructuredDocument.ts:516](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L516)

ドキュメントツリー内に存在するすべての配列ノードを探索して一覧を返します。

#### Returns

`object`[]

発見された配列ノードの情報リスト

***

### isArrayRoot()

> **isArrayRoot**(): `boolean`

Defined in: [domain/model/StructuredDocument.ts:108](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L108)

ドキュメントのルートが配列形式であるかを判定します。

#### Returns

`boolean`

ルートが配列の場合は true

***

### moveTableColumn()

> **moveTableColumn**(`arrayPath`, `fromIndex`, `toIndex`): `StructuredDocument`

Defined in: [domain/model/StructuredDocument.ts:389](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L389)

テーブルビューにおいて、オブジェクトプロパティの順序を再配置することでカラムを移動します。

#### Parameters

##### arrayPath

[`CellPath`](../../CellPath/classes/CellPath.md)

対象の配列へのアクセスパス

##### fromIndex

`number`

移動元カラムインデックス

##### toIndex

`number`

移動先カラムインデックス

#### Returns

`StructuredDocument`

更新後の新しい StructuredDocument インスタンス

***

### moveTableRow()

> **moveTableRow**(`arrayPath`, `fromIndex`, `toIndex`): `StructuredDocument`

Defined in: [domain/model/StructuredDocument.ts:357](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L357)

指定された配列パス（arrayPath）内の行を fromIndex から toIndex へ移動（並び替え）します。

#### Parameters

##### arrayPath

[`CellPath`](../../CellPath/classes/CellPath.md)

対象の配列へのアクセスパス

##### fromIndex

`number`

移動元インデックス

##### toIndex

`number`

移動先インデックス

#### Returns

`StructuredDocument`

更新後の新しい StructuredDocument インスタンス

***

### renameNodeKey()

> **renameNodeKey**(`path`, `newKey`): `StructuredDocument`

Defined in: [domain/model/StructuredDocument.ts:296](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L296)

指定されたパスにあるオブジェクト内のプロパティキー名を変更します。

#### Parameters

##### path

[`CellPath`](../../CellPath/classes/CellPath.md)

対象ノードへのアクセスパス

##### newKey

`string`

新しいキー名

#### Returns

`StructuredDocument`

更新後の新しい StructuredDocument インスタンス

***

### renameTableColumn()

> **renameTableColumn**(`arrayPath`, `oldKey`, `newKey`): `StructuredDocument`

Defined in: [domain/model/StructuredDocument.ts:242](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L242)

指定された配列パス（arrayPath）内のカラム名を変更します。
オブジェクト配列の場合は全要素の oldKey を newKey に置換します。
プリミティブ配列の場合は各要素を newKey を持つオブジェクトに変換します。

#### Parameters

##### arrayPath

[`CellPath`](../../CellPath/classes/CellPath.md)

対象の配列へのアクセスパス

##### oldKey

`string`

変更元のカラムキー名

##### newKey

`string`

変更後の新しいカラムキー名

#### Returns

`StructuredDocument`

更新後の新しい StructuredDocument インスタンス

***

### toFlatRows()

> **toFlatRows**(`options?`): [`FlatRow`](../../FlatRow/classes/FlatRow.md)[]

Defined in: [domain/model/StructuredDocument.ts:544](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L544)

スプレッドシートテーブル描画に適したフラットな行リストを取得します。
デフォルトでは、ネスト配列は折りたたまれて1行として表現されます。

#### Parameters

##### options?

[`FlattenOptions`](../../../service/TreeFlattener/interfaces/FlattenOptions.md)

フラット化オプション

#### Returns

[`FlatRow`](../../FlatRow/classes/FlatRow.md)[]

フラット化された行（FlatRow）の配列

***

### toJS()

> **toJS**(): `any`

Defined in: [domain/model/StructuredDocument.ts:556](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L556)

標準的な JavaScript 表現（オブジェクト／配列）に変換します。

#### Returns

`any`

JavaScript データ

***

### toTableView()

> **toTableView**(`targetPath?`): [`TableView`](../../TableView/classes/TableView.md) \| `null`

Defined in: [domain/model/StructuredDocument.ts:137](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L137)

ルート配列または指定された targetPath のネスト配列から TableView を生成します。

#### Parameters

##### targetPath?

[`CellPath`](../../CellPath/classes/CellPath.md)

配列ノードへのパス（省略時はルート）

#### Returns

[`TableView`](../../TableView/classes/TableView.md) \| `null`

TableView インスタンス、対象が配列でない場合は null

***

### updateCell()

> **updateCell**(`path`, `newValue`): `StructuredDocument`

Defined in: [domain/model/StructuredDocument.ts:32](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/model/StructuredDocument.ts#L32)

指定されたパスのセル値を更新した新しい StructuredDocument インスタンスを生成して返します（イミュータブル更新）。

#### Parameters

##### path

[`CellPath`](../../CellPath/classes/CellPath.md)

更新対象ノードへのアクセスパス

##### newValue

[`CellValue`](../../CellValue/classes/CellValue.md)

新しいセル値

#### Returns

`StructuredDocument`

更新後の新しい StructuredDocument インスタンス
