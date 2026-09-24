import { describe, it, expect } from 'vitest';
import { TreeNode } from '../../domain/model/TreeNode';
import { StructuredDocument } from '../../domain/model/StructuredDocument';
import { CellPath } from '../../domain/model/CellPath';
import { DocumentFormat } from '../../domain/model/DocumentFormat';

describe('StructuredDocument Operations', () => {
    /**
     * 【観点】オブジェクトキー名の変更（リネーム）およびキー順序の保全確認
     * 【テスト内容】オブジェクト内の特定のキー（'b' -> 'bRenamed'）をリネームした際、値（2）が維持され、かつキーの並び順（'a', 'bRenamed', 'c'）が崩れずに保たれることを検証する。
     */
    it('should rename a key in an object preserving key order', () => {
        const data = { a: 1, b: 2, c: 3 };
        const doc = new StructuredDocument(TreeNode.fromJS(data), DocumentFormat.defaultJson());

        const updated = doc.renameNodeKey(CellPath.fromString('b'), 'bRenamed');
        const js = updated.toJS();

        expect(Object.keys(js)).toEqual(['a', 'bRenamed', 'c']);
        expect(js.bRenamed).toBe(2);
    });

    /**
     * 【観点】階層構造の深い位置（ネストされたオブジェクト）におけるキーリネームの確認
     * 【テスト内容】'network.ingress.port' のような深いパスのキーを 'targetPort' にリネームした際、旧キーが削除され、親・祖先構造を壊さずに該当キーのみが更新されることを検証する。
     */
    it('should rename a nested key in an object', () => {
        const data = {
            network: {
                ingress: {
                    enabled: true,
                    port: 80
                }
            }
        };
        const doc = new StructuredDocument(TreeNode.fromJS(data), DocumentFormat.defaultYaml());

        const updated = doc.renameNodeKey(CellPath.fromString('network.ingress.port'), 'targetPort');
        const js = updated.toJS();

        expect(js.network.ingress.targetPort).toBe(80);
        expect(js.network.ingress.port).toBeUndefined();
        expect(Object.keys(js.network.ingress)).toEqual(['enabled', 'targetPort']);
    });

    /**
     * 【観点】配列内の要素（行）の並び替え（D&D移動）の確認
     * 【テスト内容】配列内の特定インデックスの要素（index 2 の Charlie）を別の位置（index 0）に移動させた際、要素順が意図通りに再配置されることを検証する。
     */
    it('should move a row in an array', () => {
        const data = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
            { id: 3, name: 'Charlie' }
        ];
        const doc = new StructuredDocument(TreeNode.fromJS(data), DocumentFormat.defaultJson());

        const updated = doc.moveTableRow(new CellPath([]), 2, 0);
        const js = updated.toJS();

        expect(js.map((r: any) => r.name)).toEqual(['Charlie', 'Alice', 'Bob']);
    });

    /**
     * 【観点】テーブル列の並び替え（全オブジェクトのプロパティ順変更）の確認
     * 【テスト内容】オブジェクト配列において、特定列（index 2 の 'role'）を先頭（index 0）に移動させた際、全レコード内のキー定義順が同期して並び変わることを検証する。
     */
    it('should move a table column across objects in an array', () => {
        const data = [
            { id: 1, name: 'Alice', role: 'Dev' },
            { id: 2, name: 'Bob', role: 'Designer' }
        ];
        const doc = new StructuredDocument(TreeNode.fromJS(data), DocumentFormat.defaultJson());

        const updated = doc.moveTableColumn(new CellPath([]), 2, 0); // move 'role' to first column
        const js = updated.toJS();

        expect(Object.keys(js[0])).toEqual(['role', 'id', 'name']);
        expect(Object.keys(js[1])).toEqual(['role', 'id', 'name']);
        expect(js[0].role).toBe('Dev');
    });

    /**
     * 【観点】配列要素の削除（文字列・数値インデックスパス経由）の確認
     * 【テスト内容】CellPath（'1'）を指定して配列の中間要素を削除した際、対象要素のみが配列から splice され、配列長が縮小して後続要素が前に詰まることを検証する。
     */
    it('should delete an item in an array by path', () => {
        const data = ['item0', 'item1', 'item2'];
        const doc = new StructuredDocument(TreeNode.fromJS(data), DocumentFormat.defaultJson());

        const updated = doc.deleteNode(CellPath.fromString('1'));
        const js = updated.toJS();

        expect(js).toEqual(['item0', 'item2']);
    });

    /**
     * 【観点】オブジェクトプロパティ（キー）の削除の確認
     * 【テスト内容】CellPath（'b'）を指定してオブジェクト内のキーを削除した際、該当キーおよびその値のみがオブジェクトから除去され、他のキーは保持されることを検証する。
     */
    it('should delete a key in an object by path', () => {
        const data = { a: 1, b: 2, c: 3 };
        const doc = new StructuredDocument(TreeNode.fromJS(data), DocumentFormat.defaultJson());

        const updated = doc.deleteNode(CellPath.fromString('b'));
        const js = updated.toJS();

        expect(js).toEqual({ a: 1, c: 3 });
    });

    /**
     * 【観点】テーブル列の値クリア操作の確認
     * 【テスト内容】オブジェクト配列内の指定カラム（'role'）をクリアした際、各レコードのキー自体は残り、値のみが空文字列に更新されることを検証する。
     */
    it('should clear values of a specific column in a table array', () => {
        const data = [
            { id: 1, name: 'Alice', role: 'Dev' },
            { id: 2, name: 'Bob', role: 'Designer' }
        ];
        const doc = new StructuredDocument(TreeNode.fromJS(data), DocumentFormat.defaultJson());

        const updated = doc.clearTableColumn(new CellPath([]), 'role');
        const js = updated.toJS();

        expect(js[0].role).toBe('');
        expect(js[1].role).toBe('');
        expect(js[0].name).toBe('Alice');
        expect(js[1].name).toBe('Bob');
    });

    /**
     * 【観点】テーブル全データセルの値クリア操作の確認
     * 【テスト内容】オブジェクト配列内の全レコードのデータセルの値をクリアした際、各キーの構造は保持されたまま、全フィールド値が空文字列に更新されることを検証する。
     */
    it('should clear all data cells in a table array', () => {
        const data = [
            { id: 1, name: 'Alice', role: 'Dev' },
            { id: 2, name: 'Bob', role: 'Designer' }
        ];
        const doc = new StructuredDocument(TreeNode.fromJS(data), DocumentFormat.defaultJson());

        const updated = doc.clearTableData(new CellPath([]));
        const js = updated.toJS();

        expect(js[0]).toEqual({ id: '', name: '', role: '' });
        expect(js[1]).toEqual({ id: '', name: '', role: '' });
    });
});

