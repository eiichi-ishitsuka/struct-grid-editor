[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [domain/service/FormatPreserver](../README.md) / FormatPreserver

# Class: FormatPreserver

Defined in: domain/service/FormatPreserver.ts:6

インデント幅、改行コード、末尾改行などのドキュメント書式特性を検出・保持するドメインサービス。

## Constructors

### Constructor

> **new FormatPreserver**(): `FormatPreserver`

#### Returns

`FormatPreserver`

## Methods

### applyTrailingNewline()

> **applyTrailingNewline**(`text`, `format`): `string`

Defined in: domain/service/FormatPreserver.ts:50

DocumentFormat の設定に従って、シリアライズ後のテキスト末尾に改行を適用します。

#### Parameters

##### text

`string`

適用対象のテキスト

##### format

[`DocumentFormat`](../../../model/DocumentFormat/classes/DocumentFormat.md)

書式設定

#### Returns

`string`

末尾改行が整形されたテキスト

***

### detectFormat()

> **detectFormat**(`text`, `fileType`): [`DocumentFormat`](../../../model/DocumentFormat/classes/DocumentFormat.md)

Defined in: domain/service/FormatPreserver.ts:13

ソーステキストを検査し、ドキュメントの書式プロパティ（インデント幅や末尾改行の有無）を検出します。

#### Parameters

##### text

`string`

ソーステキスト文字列

##### fileType

[`DocumentFileType`](../../../model/DocumentFormat/type-aliases/DocumentFileType.md)

ファイル種別 ('json' または 'yaml')

#### Returns

[`DocumentFormat`](../../../model/DocumentFormat/classes/DocumentFormat.md)

検出された書式情報を持つ DocumentFormat インスタンス

***

### detectIndent()

> **detectIndent**(`text`): `string` \| `number`

Defined in: domain/service/FormatPreserver.ts:29

テキスト内のインデント（スペース数またはタブ）を検出します。

#### Parameters

##### text

`string`

検査対象のテキスト

#### Returns

`string` \| `number`

インデントのスペース数、またはタブ文字列
