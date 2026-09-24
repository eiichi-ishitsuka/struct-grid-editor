import { describe, it, expect } from 'vitest';
import { JsonDocumentParser } from '../../infrastructure/parser/JsonDocumentParser';
import { YamlDocumentParser } from '../../infrastructure/parser/YamlDocumentParser';
import { JsonlDocumentParser } from '../../infrastructure/parser/JsonlDocumentParser';
import { CellPath } from '../../domain/model/CellPath';
import { CellValue } from '../../domain/model/CellValue';

describe('JsonDocumentParser', () => {
    const parser = new JsonDocumentParser();

    /**
     * 【観点】JSONのフォーマット保全（2スペースインデント、末尾改行）を伴うパースおよびシリアライズの確認
     * 【テスト内容】2スペースインデントと末尾改行を持つJSON文字列をパースし、特定セル値を更新した後にシリアライズした際、元のインデントおよび改行形式が正確に保たれることを検証する。
     */
    it('parses and serializes JSON with 2-space indentation', () => {
        const json = `{\n  "title": "Test",\n  "count": 42\n}\n`;
        const doc = parser.parse(json);

        expect(doc.format.indent).toBe(2);
        expect(doc.format.hasTrailingNewline).toBe(true);

        const updated = doc.updateCell(CellPath.fromString('count'), new CellValue(99));
        const output = parser.serialize(updated);

        expect(output).toBe(`{\n  "title": "Test",\n  "count": 99\n}\n`);
    });

    /**
     * 【観点】深くネストされたJSONオブジェクトの構造解析と平坦化確認
     * 【テスト内容】多重ネストされたJSON（a.b.c）をパースし、toFlatRows() を介してドット区切りの正しいパスと値が抽出されることを検証する。
     */
    it('handles nested objects in JSON', () => {
        const json = JSON.stringify({ a: { b: { c: 'hello' } } }, null, 2) + '\n';
        const doc = parser.parse(json);
        const rows = doc.toFlatRows();

        expect(rows[0].displayPath).toBe('a.b.c');
        expect(rows[0].value.value).toBe('hello');
    });

    /**
     * 【観点】コメント付きJSON（JSONC: settings.jsonやtsconfig.jsonなど）のパース確認
     * 【テスト内容】行コメント（//）およびブロックコメント（/* ... *\/）が含まれるJSON文字列をエラーなくパースできることを検証する。
     */
    it('parses JSON with comments (JSONC)', () => {
        const jsonc = `// Place your settings in this file\n{\n  /* multi-line comment */\n  "key": "value", // inline comment\n  "count": 10\n}\n`;
        const doc = parser.parse(jsonc);
        const rows = doc.toFlatRows();

        expect(rows.length).toBe(2);
        expect(rows.find(r => r.displayPath === 'key')?.value.value).toBe('value');
        expect(rows.find(r => r.displayPath === 'count')?.value.value).toBe(10);
    });
});

describe('YamlDocumentParser', () => {
    const parser = new YamlDocumentParser();

    /**
     * 【観点】YAMLドキュメントのパース、セル値更新、および再シリアライズの確認
     * 【テスト内容】ネストを含むYAML文字列をパースして構造を抽出し、ブール値セル（settings.enabled: true -> false）を更新してシリアライズした際、正しくYAML形式のまま値が更新出力されることを検証する。
     */
    it('parses and serializes YAML', () => {
        const yaml = `name: demo\nversion: 1.0\nsettings:\n  enabled: true\n`;
        const doc = parser.parse(yaml);

        const rows = doc.toFlatRows();
        expect(rows.map(r => r.displayPath)).toContain('settings.enabled');

        const updated = doc.updateCell(CellPath.fromString('settings.enabled'), new CellValue(false));
        const output = parser.serialize(updated);

        expect(output).toContain('enabled: false');
    });
});

describe('JsonlDocumentParser', () => {
    const parser = new JsonlDocumentParser();

    /**
     * 【観点】拡張子サポート判定（jsonl, ndjson）の確認
     */
    it('supports jsonl and ndjson extensions', () => {
        expect(parser.supports('jsonl')).toBe(true);
        expect(parser.supports('.jsonl')).toBe(true);
        expect(parser.supports('ndjson')).toBe(true);
        expect(parser.supports('.ndjson')).toBe(true);
        expect(parser.supports('json')).toBe(false);
        expect(parser.supports('yaml')).toBe(false);
    });

    /**
     * 【観点】JSONLのパース、トップレベル配列としての認識、セル値更新、および再シリアライズの確認
     */
    it('parses JSONL into array root, updates cell and serializes correctly', () => {
        const jsonl = `{"id":1,"name":"Alice"}\n{"id":2,"name":"Bob"}\n`;
        const doc = parser.parse(jsonl);

        expect(doc.isArrayRoot()).toBe(true);
        expect(doc.format.fileType).toBe('jsonl');
        expect(doc.format.hasTrailingNewline).toBe(true);

        const updated = doc.updateCell(CellPath.fromString('[0].name'), new CellValue('Alice Cooper'));
        const output = parser.serialize(updated);

        expect(output).toBe(`{"id":1,"name":"Alice Cooper"}\n{"id":2,"name":"Bob"}\n`);
    });

    /**
     * 【観点】空行スキップおよびコメント付きJSONL（JSONC対応）の検証
     */
    it('handles empty lines and comments in JSONL', () => {
        const jsonlWithComments = `// Header comment\n{"id":1,"status":"ok"}\n\n{"id":2,"status":"pending"} // line comment\n`;
        const doc = parser.parse(jsonlWithComments);

        expect(doc.toJS()).toEqual([
            { id: 1, status: 'ok' },
            { id: 2, status: 'pending' }
        ]);

        const output = parser.serialize(doc);
        expect(output).toBe(`{"id":1,"status":"ok"}\n{"id":2,"status":"pending"}\n`);
    });

    /**
     * 【観点】行追加・行削除の操作とシリアライズ確認
     */
    it('supports adding and deleting table rows in JSONL', () => {
        const jsonl = `{"id":1,"name":"User1"}\n{"id":2,"name":"User2"}\n`;
        const doc = parser.parse(jsonl);

        const withNewRow = doc.addTableRow(new CellPath([]), { id: 3, name: 'User3' });
        const outputAfterAdd = parser.serialize(withNewRow);
        expect(outputAfterAdd).toBe(`{"id":1,"name":"User1"}\n{"id":2,"name":"User2"}\n{"id":3,"name":"User3"}\n`);

        const afterDelete = withNewRow.deleteNode(CellPath.fromString('[0]'));
        const outputAfterDelete = parser.serialize(afterDelete);
        expect(outputAfterDelete).toBe(`{"id":2,"name":"User2"}\n{"id":3,"name":"User3"}\n`);
    });

    /**
     * 【観点】空ドキュメントの安全なパースとシリアライズ
     */
    it('handles empty text gracefully', () => {
        const doc = parser.parse('');
        expect(doc.isArrayRoot()).toBe(true);
        expect(doc.toJS()).toEqual([]);
        expect(parser.serialize(doc)).toBe('');
    });
});
