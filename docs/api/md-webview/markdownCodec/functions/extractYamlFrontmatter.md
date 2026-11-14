[**struct-grid-editor**](../../../README.md)

***

[struct-grid-editor](../../../README.md) / [md-webview/markdownCodec](../README.md) / extractYamlFrontmatter

# Function: extractYamlFrontmatter()

> **extractYamlFrontmatter**(`md`): `object`

Defined in: [md-webview/markdownCodec.ts:76](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/c2f468ee741712cd43b1ecdb62cc88f119a9e904/src/md-webview/markdownCodec.ts#L76)

Markdown 文字列の先頭から YAML Frontmatter（`---` で囲まれた領域）と本文を分離抽出します。

## Parameters

### md

`string`

入力 Markdown 全文

## Returns

`object`

分離された Frontmatter（存在しない場合は null）と本文オブジェクト

### body

> **body**: `string`

### frontmatter

> **frontmatter**: `string` \| `null`
