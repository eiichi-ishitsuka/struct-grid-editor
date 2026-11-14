[**struct-grid-editor**](../../../README.md)

***

[struct-grid-editor](../../../README.md) / [md-webview/markdownCodec](../README.md) / resolveImageSrc

# Function: resolveImageSrc()

> **resolveImageSrc**(`rawSrc`): `string`

Defined in: md-webview/markdownCodec.ts:38

Markdown 内の画像パスを Webview 上で表示可能な URI に解決します。
外部 URL や data URI はそのまま返し、相対パスはベース URI と結合します。

## Parameters

### rawSrc

`string`

Markdown 内に記述された元の画像パス

## Returns

`string`

解決済みの画像 URI
