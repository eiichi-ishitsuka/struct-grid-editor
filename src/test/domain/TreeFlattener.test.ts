import { describe, it, expect } from 'vitest';
import { TreeFlattener } from '../../domain/service/TreeFlattener';
import { TreeNode } from '../../domain/model/TreeNode';
import { CellValue } from '../../domain/model/CellValue';
import { CellPath } from '../../domain/model/CellPath';

describe('TreeFlattener', () => {
    const flattener = new TreeFlattener();

    /**
     * 【観点】フラットな単一階層オブジェクトの平坦化（flatten）処理の確認
     * 【テスト内容】ネストのない単純なキー・値ペア（name, age）を平坦化し、期待される行数、displayPath、および値が正確に抽出されることを検証する。
     */
    it('flattens a simple flat object', () => {
        const data = { name: 'Alice', age: 30 };
        const root = TreeNode.fromJS(data);
        const rows = flattener.flatten(root);

        expect(rows).toHaveLength(2);
        expect(rows[0].displayPath).toBe('name');
        expect(rows[0].value.value).toBe('Alice');
        expect(rows[1].displayPath).toBe('age');
        expect(rows[1].value.value).toBe(30);
    });

    /**
     * 【観点】多階層にネストされたオブジェクトの平坦化（flatten）処理の確認
     * 【テスト内容】server.ports.http のようにネストされたオブジェクトを平坦化し、ドット記法のフルパス（displayPath）として各リーフ値が展開されることを検証する。
     */
    it('flattens deeply nested objects', () => {
        const data = {
            server: {
                host: 'localhost',
                ports: {
                    http: 80,
                    https: 443,
                },
            },
        };
        const root = TreeNode.fromJS(data);
        const rows = flattener.flatten(root);

        expect(rows.map(r => r.displayPath)).toEqual([
            'server.host',
            'server.ports.http',
            'server.ports.https',
        ]);
        expect(rows[1].value.value).toBe(80);
    });

    /**
     * 【観点】オブジェクトの配列を含むツリーの平坦化（flatten）処理の確認
     * 【テスト内容】配列内の各オブジェクト要素を展開した際、`[0].id` や `[1].name` のようなインデックス付きパスとして平坦化されることを検証する。
     */
    it('flattens arrays of objects', () => {
        const data = [
            { id: 1, name: 'First' },
            { id: 2, name: 'Second' },
        ];
        const root = TreeNode.fromJS(data);
        const rows = flattener.flatten(root);

        expect(rows.map(r => r.displayPath)).toEqual([
            '[0].id',
            '[0].name',
            '[1].id',
            '[1].name',
        ]);
    });

    /**
     * 【観点】平坦化された行リストからの元ツリー構造の復元（unflatten）の可逆性確認
     * 【テスト内容】オブジェクトや配列が混在するネスト構造を flatten し、それを unflatten して元のJavaScriptオブジェクトと完全一致（等価）に復元できることを検証する。
     */
    it('unflattens flat rows back into original nested structure', () => {
        const original = {
            user: {
                profile: {
                    name: 'Bob',
                    age: 25,
                },
                roles: ['admin', 'editor'],
            },
        };

        const root = TreeNode.fromJS(original);
        const rows = flattener.flatten(root);
        const reconstructed = flattener.unflatten(rows);

        expect(reconstructed).toEqual(original);
    });
});
