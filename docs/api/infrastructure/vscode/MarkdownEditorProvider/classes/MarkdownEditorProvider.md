[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [infrastructure/vscode/MarkdownEditorProvider](../README.md) / MarkdownEditorProvider

# Class: MarkdownEditorProvider

Defined in: infrastructure/vscode/MarkdownEditorProvider.ts:9

Markdown ファイルを WYSIWYG / Live Preview 形式で表示・編集する VS Code カスタムテキストエディタプロバイダー。
ドキュメントの双方向同期、ローカル画像パスの Webview URI 変換、およびクリップボード画像の保存処理を担当します。

## Implements

- `CustomTextEditorProvider`

## Constructors

### Constructor

> **new MarkdownEditorProvider**(`context`): `MarkdownEditorProvider`

Defined in: infrastructure/vscode/MarkdownEditorProvider.ts:36

プロバイダーのインスタンスを生成します。

#### Parameters

##### context

`ExtensionContext`

拡張機能コンテキスト

#### Returns

`MarkdownEditorProvider`

## Properties

### viewType

> `readonly` `static` **viewType**: `"struct-grid-editor.markdownEditor"` = `'struct-grid-editor.markdownEditor'`

Defined in: infrastructure/vscode/MarkdownEditorProvider.ts:11

カスタムエディタのビュータイプ識別子

## Methods

### resolveCustomTextEditor()

> **resolveCustomTextEditor**(`document`, `webviewPanel`, `_token`): `Promise`\<`void`\>

Defined in: infrastructure/vscode/MarkdownEditorProvider.ts:44

カスタムテキストエディタの Webview パネルを初期化し、対象ドキュメントと双方向バインディングします。

#### Parameters

##### document

`TextDocument`

対象の Markdown テキストドキュメント

##### webviewPanel

`WebviewPanel`

表示先の Webview パネル

##### \_token

`CancellationToken`

キャンセルトークン

#### Returns

`Promise`\<`void`\>

#### Implementation of

`vscode.CustomTextEditorProvider.resolveCustomTextEditor`

***

### register()

> `static` **register**(`context`): `Disposable`

Defined in: infrastructure/vscode/MarkdownEditorProvider.ts:18

カスタムエディタプロバイダーを VS Code に登録します。

#### Parameters

##### context

`ExtensionContext`

拡張機能コンテキスト

#### Returns

`Disposable`

購読解除用の Disposable
