[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [infrastructure/vscode/StructGridEditorProvider](../README.md) / StructGridEditorProvider

# Class: StructGridEditorProvider

Defined in: infrastructure/vscode/StructGridEditorProvider.ts:21

VS Code の CustomTextEditorProvider アダプター。
すべてのビジネス操作を Application 層のユースケースに委譲する薄いプレゼンテーション層です。

## Implements

- `CustomTextEditorProvider`

## Constructors

### Constructor

> **new StructGridEditorProvider**(`context`, `parseUseCase`, `updateCellUseCase`, `addRowUseCase`, `deleteRowUseCase`, `addTableRowUseCase`, `addTableColumnUseCase`, `renameTableColumnUseCase`, `renameKeyUseCase`, `moveTableRowUseCase`, `moveTableColumnUseCase`, `renderer`): `StructGridEditorProvider`

Defined in: infrastructure/vscode/StructGridEditorProvider.ts:74

#### Parameters

##### context

`ExtensionContext`

##### parseUseCase

[`ParseDocumentUseCase`](../../../../application/usecase/ParseDocumentUseCase/classes/ParseDocumentUseCase.md)

##### updateCellUseCase

[`UpdateCellUseCase`](../../../../application/usecase/UpdateCellUseCase/classes/UpdateCellUseCase.md)

##### addRowUseCase

[`AddRowUseCase`](../../../../application/usecase/RowModificationUseCases/classes/AddRowUseCase.md)

##### deleteRowUseCase

[`DeleteRowUseCase`](../../../../application/usecase/RowModificationUseCases/classes/DeleteRowUseCase.md)

##### addTableRowUseCase

[`AddTableRowUseCase`](../../../../application/usecase/RowModificationUseCases/classes/AddTableRowUseCase.md)

##### addTableColumnUseCase

[`AddTableColumnUseCase`](../../../../application/usecase/RowModificationUseCases/classes/AddTableColumnUseCase.md)

##### renameTableColumnUseCase

[`RenameTableColumnUseCase`](../../../../application/usecase/RowModificationUseCases/classes/RenameTableColumnUseCase.md)

##### renameKeyUseCase

[`RenameKeyUseCase`](../../../../application/usecase/RowModificationUseCases/classes/RenameKeyUseCase.md)

##### moveTableRowUseCase

[`MoveTableRowUseCase`](../../../../application/usecase/RowModificationUseCases/classes/MoveTableRowUseCase.md)

##### moveTableColumnUseCase

[`MoveTableColumnUseCase`](../../../../application/usecase/RowModificationUseCases/classes/MoveTableColumnUseCase.md)

##### renderer

[`WebviewRenderer`](../../../webview/WebviewRenderer/classes/WebviewRenderer.md)

#### Returns

`StructGridEditorProvider`

## Properties

### viewType

> `readonly` `static` **viewType**: `"struct-grid-editor.jsonEditor"` = `'struct-grid-editor.jsonEditor'`

Defined in: infrastructure/vscode/StructGridEditorProvider.ts:22

## Methods

### resolveCustomTextEditor()

> **resolveCustomTextEditor**(`document`, `webviewPanel`, `_token`): `Promise`\<`void`\>

Defined in: infrastructure/vscode/StructGridEditorProvider.ts:95

カスタムテキストエディタの Webview を初期化・バインドします。

#### Parameters

##### document

`TextDocument`

対象の VS Code テキストドキュメント

##### webviewPanel

`WebviewPanel`

描画対象の WebviewPanel

##### \_token

`CancellationToken`

キャンセレーショントークン

#### Returns

`Promise`\<`void`\>

#### Implementation of

`vscode.CustomTextEditorProvider.resolveCustomTextEditor`

***

### register()

> `static` **register**(`context`, `parseUseCase`, `updateCellUseCase`, `addRowUseCase`, `deleteRowUseCase`, `addTableRowUseCase`, `addTableColumnUseCase`, `renameTableColumnUseCase`, `renameKeyUseCase`, `moveTableRowUseCase`, `moveTableColumnUseCase`, `renderer`): `Disposable`

Defined in: infrastructure/vscode/StructGridEditorProvider.ts:40

VS Code のカスタムエディタプロバイダーとして本クラスを登録します。

#### Parameters

##### context

`ExtensionContext`

拡張機能コンテキスト

##### parseUseCase

[`ParseDocumentUseCase`](../../../../application/usecase/ParseDocumentUseCase/classes/ParseDocumentUseCase.md)

ドキュメント解析ユースケース

##### updateCellUseCase

[`UpdateCellUseCase`](../../../../application/usecase/UpdateCellUseCase/classes/UpdateCellUseCase.md)

セル更新ユースケース

##### addRowUseCase

[`AddRowUseCase`](../../../../application/usecase/RowModificationUseCases/classes/AddRowUseCase.md)

行追加ユースケース

##### deleteRowUseCase

[`DeleteRowUseCase`](../../../../application/usecase/RowModificationUseCases/classes/DeleteRowUseCase.md)

行削除ユースケース

##### addTableRowUseCase

[`AddTableRowUseCase`](../../../../application/usecase/RowModificationUseCases/classes/AddTableRowUseCase.md)

テーブル行追加ユースケース

##### addTableColumnUseCase

[`AddTableColumnUseCase`](../../../../application/usecase/RowModificationUseCases/classes/AddTableColumnUseCase.md)

テーブル列追加ユースケース

##### renameTableColumnUseCase

[`RenameTableColumnUseCase`](../../../../application/usecase/RowModificationUseCases/classes/RenameTableColumnUseCase.md)

カラム名変更ユースケース

##### renameKeyUseCase

[`RenameKeyUseCase`](../../../../application/usecase/RowModificationUseCases/classes/RenameKeyUseCase.md)

キー名変更ユースケース

##### moveTableRowUseCase

[`MoveTableRowUseCase`](../../../../application/usecase/RowModificationUseCases/classes/MoveTableRowUseCase.md)

行並び替えユースケース

##### moveTableColumnUseCase

[`MoveTableColumnUseCase`](../../../../application/usecase/RowModificationUseCases/classes/MoveTableColumnUseCase.md)

列並び替えユースケース

##### renderer

[`WebviewRenderer`](../../../webview/WebviewRenderer/classes/WebviewRenderer.md)

Webview HTML レンダラー

#### Returns

`Disposable`

リソース解放用の Disposable
