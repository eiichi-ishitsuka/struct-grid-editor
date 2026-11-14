[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [infrastructure/vscode/MarkdownEditorProvider](../README.md) / MarkdownEditorProvider

# Class: MarkdownEditorProvider

Defined in: [infrastructure/vscode/MarkdownEditorProvider.ts:9](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/infrastructure/vscode/MarkdownEditorProvider.ts#L9)

Markdown ファイルを WYSIWYG / Live Preview 形式で表示・編集する VS Code カスタムテキストエディタプロバイダー。
ドキュメントの双方向同期、ローカル画像パスの Webview URI 変換、およびクリップボード画像の保存処理を担当します。

## Implements

- `CustomTextEditorProvider`

## Constructors

### Constructor

> **new MarkdownEditorProvider**(`context`): `MarkdownEditorProvider`

Defined in: [infrastructure/vscode/MarkdownEditorProvider.ts:36](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/infrastructure/vscode/MarkdownEditorProvider.ts#L36)

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

Defined in: [infrastructure/vscode/MarkdownEditorProvider.ts:11](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/infrastructure/vscode/MarkdownEditorProvider.ts#L11)

カスタムエディタのビュータイプ識別子

## Methods

### handleOpenLink()

> **handleOpenLink**(`document`, `rawHref`): `Promise`\<`void`\>

Defined in: [infrastructure/vscode/MarkdownEditorProvider.ts:224](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/infrastructure/vscode/MarkdownEditorProvider.ts#L224)

エディタ内のリンクが Ctrl/Cmd + クリックされた際の遷移処理を行います。
- http / https 等の外部 URL: 確認ダイアログを表示し、承認された場合のみ外部ブラウザで開きます。
- ローカルファイルパス（相対パス・絶対パス）: ドキュメント基準（またはワークスペース基準）で解決し、ファイルが存在する場合のみ新しいタブで開きます（存在しない場合はスキップ）。

#### Parameters

##### document

`TextDocument`

現在の Markdown ドキュメント

##### rawHref

`string`

クリックされたリンクの href 属性値

#### Returns

`Promise`\<`void`\>

***

### resolveCustomTextEditor()

> **resolveCustomTextEditor**(`document`, `webviewPanel`, `_token`): `Promise`\<`void`\>

Defined in: [infrastructure/vscode/MarkdownEditorProvider.ts:44](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/infrastructure/vscode/MarkdownEditorProvider.ts#L44)

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

Defined in: [infrastructure/vscode/MarkdownEditorProvider.ts:18](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/infrastructure/vscode/MarkdownEditorProvider.ts#L18)

カスタムエディタプロバイダーを VS Code に登録します。

#### Parameters

##### context

`ExtensionContext`

拡張機能コンテキスト

#### Returns

`Disposable`

購読解除用の Disposable
