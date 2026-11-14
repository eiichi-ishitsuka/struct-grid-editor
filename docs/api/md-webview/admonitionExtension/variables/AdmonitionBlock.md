[**struct-grid-editor**](../../../README.md)

***

[struct-grid-editor](../../../README.md) / [md-webview/admonitionExtension](../README.md) / AdmonitionBlock

# Variable: AdmonitionBlock

> `const` **AdmonitionBlock**: `Node`\<`any`, `any`\>

Defined in: [md-webview/admonitionExtension.ts:34](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/md-webview/admonitionExtension.ts#L34)

Python-Markdown 形式の Admonition および Details（折りたたみ）ブロックを表現するカスタム Tiptap ノード。
`!!! note "Title"` や `??? warning "Collapsible Title"` と 4 スペースインデント本文の編集に対応します。
