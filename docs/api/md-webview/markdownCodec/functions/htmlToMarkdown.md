[**struct-grid-editor**](../../../README.md)

***

[struct-grid-editor](../../../README.md) / [md-webview/markdownCodec](../README.md) / htmlToMarkdown

# Function: htmlToMarkdown()

> **htmlToMarkdown**(`html`): `string`

Defined in: md-webview/markdownCodec.ts:334

Tiptap エディタが出力した HTML を GFM / Python-Markdown 互換の Markdown 文字列へ変換します。
保持されている YAML Frontmatter がある場合は先頭に付与して返します。

## Parameters

### html

`string`

Tiptap エディタの HTML 文字列

## Returns

`string`

正規化された Markdown 文字列
