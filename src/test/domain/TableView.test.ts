import { describe, it, expect } from 'vitest';
import { TreeNode } from '../../domain/model/TreeNode';
import { TableView } from '../../domain/model/TableView';
import { CellPath } from '../../domain/model/CellPath';

describe('TableView Domain Model', () => {
    /**
     * 【観点】オブジェクト配列からの2次元スプレッドシートモデル生成の確認
     * 【テスト内容】オブジェクトの配列（id, name, role, active）から TableView を構築し、isObjectArrayフラグ、行数、列定義、各行セルの値およびCellPathが正確にマッピングされることを検証する。
     */
    it('should build a 2D table from an array of objects (like simple-list.json)', () => {
        const sampleData = [
            { id: 1, name: 'ユーザーA', role: '管理者', active: true },
            { id: 2, name: 'ユーザーB', role: '一般ユーザー', active: false },
            { id: 3, name: 'ユーザーC', role: '閲覧者', active: true }
        ];

        const root = TreeNode.fromJS(sampleData);
        const tableView = TableView.fromArrayNode(root);

        expect(tableView.isObjectArray).toBe(true);
        expect(tableView.totalRows).toBe(3);
        expect(tableView.columns.map(c => c.key)).toEqual(['id', 'name', 'role', 'active']);

        // Check first row cells
        const row0 = tableView.rows[0];
        expect(row0.index).toBe(0);
        expect(row0.cells['id'].value.value).toBe(1);
        expect(row0.cells['id'].path.toString()).toBe('[0].id');
        expect(row0.cells['name'].value.value).toBe('ユーザーA');
        expect(row0.cells['active'].value.value).toBe(true);

        // Check row 2
        const row2 = tableView.rows[2];
        expect(row2.cells['role'].value.value).toBe('閲覧者');
    });

    /**
     * 【観点】レコード間でキーの有無が異なる（欠損キーがある）データの寛容な処理確認
     * 【テスト内容】1行目に存在して2行目に存在しないキー、および2行目のみに存在するキーがある場合、全列が集約され、欠損値セルには null が補完されてクラッシュしないことを検証する。
     */
    it('should handle missing keys gracefully by assigning null cell values', () => {
        const sampleData = [
            { id: 1, name: 'A' },
            { id: 2, role: 'admin' }
        ];

        const root = TreeNode.fromJS(sampleData);
        const tableView = TableView.fromArrayNode(root);

        expect(tableView.columns.map(c => c.key)).toEqual(['id', 'name', 'role']);
        expect(tableView.rows[0].cells['role'].value.value).toBeNull();
        expect(tableView.rows[1].cells['name'].value.value).toBeNull();
    });

    /**
     * 【観点】文字列・数値などのプリミティブ配列からの単一列テーブルモデル構築の確認
     * 【テスト内容】文字列の配列（['apple', 'banana', 'cherry']）を与えた際、isObjectArrayがfalseとなり、単一列（列名 `[ ]`）として各インデックスパス（`[1]`など）とともに正しく生成されることを検証する。
     */
    it('should build a single-column table from a primitive array', () => {
        const sampleData = ['apple', 'banana', 'cherry'];
        const root = TreeNode.fromJS(sampleData);
        const tableView = TableView.fromArrayNode(root);

        expect(tableView.isObjectArray).toBe(false);
        expect(tableView.totalRows).toBe(3);
        expect(tableView.columns.length).toBe(1);
        expect(tableView.columns[0].key).toBe('value');
        expect(tableView.columns[0].label).toBe('[ ]');
        expect(tableView.rows[1].cells['value'].value.value).toBe('banana');
        expect(tableView.rows[1].cells['value'].path.toString()).toBe('[1]');
    });

    /**
     * 【観点】列のデータ型推論および型シンボルアイコン（1234, T/F, [ ], { }, Aa）の正確性の確認
     * 【テスト内容】数値（id -> '1234'）、文字列（name -> 'Aa'）、真偽値（active -> 'T/F'）、配列（skills -> '[ ]'）、オブジェクト（meta -> '{ }'）の各列型推論が、先頭サンプリングによって正しく判定されることを検証する。
     */
    it('should correctly detect column types and symbols including nested arrays', () => {
        const sampleData = [
            {
                id: 1,
                name: '山田 太郎',
                active: true,
                skills: ['TypeScript', 'Python'],
                meta: { level: 3 }
            }
        ];

        const root = TreeNode.fromJS(sampleData);
        const tableView = TableView.fromArrayNode(root);

        const colMap = new Map(tableView.columns.map(c => [c.key, c]));

        expect(colMap.get('id')?.type).toBe('number');
        expect(colMap.get('id')?.typeSymbol).toBe('1234');

        expect(colMap.get('name')?.type).toBe('string');
        expect(colMap.get('name')?.typeSymbol).toBe('Aa');

        expect(colMap.get('active')?.type).toBe('boolean');
        expect(colMap.get('active')?.typeSymbol).toBe('T/F');

        expect(colMap.get('skills')?.type).toBe('array');
        expect(colMap.get('skills')?.typeSymbol).toBe('[ ]');

        expect(colMap.get('meta')?.type).toBe('object');
        expect(colMap.get('meta')?.typeSymbol).toBe('{ }');
    });
});
