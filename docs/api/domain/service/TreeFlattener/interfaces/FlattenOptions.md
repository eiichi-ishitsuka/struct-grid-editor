[**struct-grid-editor**](../../../../README.md)

***

[struct-grid-editor](../../../../README.md) / [domain/service/TreeFlattener](../README.md) / FlattenOptions

# Interface: FlattenOptions

Defined in: [domain/service/TreeFlattener.ts:9](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/service/TreeFlattener.ts#L9)

構文木のフラット化オプション。

## Properties

### collapseArrays?

> `optional` **collapseArrays?**: `boolean`

Defined in: [domain/service/TreeFlattener.ts:19](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/service/TreeFlattener.ts#L19)

true の場合、ネストされた配列ノードをさらに展開せず1行（件数表示）として折りたたみ、
スプレッドシートのドリルダウン編集を可能にします。

***

### includeIntermediateNodes?

> `optional` **includeIntermediateNodes?**: `boolean`

Defined in: [domain/service/TreeFlattener.ts:14](https://github.com/eiichi-ishitsuka/struct-grid-editor/blob/ed0c1332f6f848335ce1461339913a2fab0f194d/src/domain/service/TreeFlattener.ts#L14)

true の場合、非リーフノード（オブジェクトや配列）も行として出力し、
グリッド上での構造操作を可能にします。
