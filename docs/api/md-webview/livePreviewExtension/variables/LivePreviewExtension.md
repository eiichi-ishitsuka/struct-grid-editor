[**struct-grid-editor**](../../../README.md)

***

[struct-grid-editor](../../../README.md) / [md-webview/livePreviewExtension](../README.md) / LivePreviewExtension

# Variable: LivePreviewExtension

> `const` **LivePreviewExtension**: `Extension`\<`any`, `any`\>

Defined in: [md-webview/livePreviewExtension.ts:27](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/md-webview/livePreviewExtension.ts#L27)

カーソル位置に連動して Markdown 記法マーカーを動的に表示する Live Preview 拡張。
- カーソルが置かれている見出し行に `# `, `## `, `### ` 等を表示します。
- 引用ブロック内のアクティブ段落に `> ` を表示します。
- カーソルが接しているインライン装飾（太字・斜体・取消線・インラインコード・リンク）の前後に記法記号を表示します。
- 見出し先頭での `#` キーおよび `Backspace` キーによる見出しレベル変更をサポートします。
