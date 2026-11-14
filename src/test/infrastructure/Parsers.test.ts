import { describe, it, expect } from 'vitest';
import { JsonDocumentParser } from '../../infrastructure/parser/JsonDocumentParser';
import { YamlDocumentParser } from '../../infrastructure/parser/YamlDocumentParser';
import { JsonlDocumentParser } from '../../infrastructure/parser/JsonlDocumentParser';
import { CsvDocumentParser, TsvDocumentParser } from '../../infrastructure/parser/DelimitedDocumentParser';
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

describe('CsvDocumentParser & TsvDocumentParser', () => {
    const csvParser = new CsvDocumentParser();
    const tsvParser = new TsvDocumentParser();

    /**
     * 【観点】拡張子サポート判定（csv, tsv）の確認
     * 【テスト内容】CsvDocumentParser が csv/.csv のみをサポートし、TsvDocumentParser が tsv/.tsv のみをサポートすることを検証する。
     */
    it('supports csv and tsv extensions respectively', () => {
        expect(csvParser.supports('csv')).toBe(true);
        expect(csvParser.supports('.csv')).toBe(true);
        expect(csvParser.supports('tsv')).toBe(false);

        expect(tsvParser.supports('tsv')).toBe(true);
        expect(tsvParser.supports('.tsv')).toBe(true);
        expect(tsvParser.supports('csv')).toBe(false);
    });

    /**
     * 【観点】ヘッダー付きCSVのパース、型自動推論（数値・真偽値・先頭ゼロ文字列維持）、セル更新・シリアライズの確認
     * 【テスト内容】1行目をヘッダーとしてCSVを解析し、数値・真偽値・先頭ゼロ文字列（0012）の型が正しく推論され、カンマを含む値へのセル更新後にクォート付きでシリアライズされることを検証する。
     */
    it('parses CSV with header, infers primitive types, updates cell, and serializes', () => {
        const csv = `id,name,active,code\n1,Alice,true,0012\n2,"Bob, Jr.",false,0099\n`;
        const doc = csvParser.parse(csv);

        expect(doc.isArrayRoot()).toBe(true);
        expect(doc.format.fileType).toBe('csv');
        expect(doc.format.hasTrailingNewline).toBe(true);
        expect(doc.toJS()).toEqual([
            { id: 1, name: 'Alice', active: true, code: '0012' },
            { id: 2, name: 'Bob, Jr.', active: false, code: '0099' },
        ]);

        const updated = doc.updateCell(CellPath.fromString('[0].name'), new CellValue('Alice, PhD'));
        const serialized = csvParser.serialize(updated);
        expect(serialized).toBe(`id,name,active,code\n1,"Alice, PhD",true,0012\n2,"Bob, Jr.",false,0099\n`);
    });

    /**
     * 【観点】ヘッダーなし（hasHeader: false）モードでのCSVパースとシリアライズの確認
     * 【テスト内容】hasHeader: false 指定時に1行目からデータ行（col1, col2, col3）として解析され、シリアライズ時もヘッダー行を出力せずデータ行のみ出力されることを検証する。
     */
    it('parses and serializes CSV without header when hasHeader is false', () => {
        const csv = `100,Apple,true\n200,Orange,false\n`;
        const doc = csvParser.parse(csv, { hasHeader: false });

        expect(doc.toJS()).toEqual([
            { col1: 100, col2: 'Apple', col3: true },
            { col1: 200, col2: 'Orange', col3: false },
        ]);

        const updated = doc.updateCell(CellPath.fromString('[1].col2'), new CellValue('Banana'));
        const serialized = csvParser.serialize(updated);
        expect(serialized).toBe(`100,Apple,true\n200,Banana,false\n`);
    });

    /**
     * 【観点】RFC 4180 ダブルクォートエスケープ（""）およびセル内改行のパース・シリアライズ確認
     * 【テスト内容】ダブルクォートの二重エスケープや改行を含むCSVセルが1つのセル文字列として正確に解析され、再シリアライズで元のRFC 4180表現に戻ることを検証する。
     */
    it('handles escaped quotes and multiline cells in CSV', () => {
        const csv = `id,note\n1,"Hello ""World""\nLine 2"\n`;
        const doc = csvParser.parse(csv);

        expect(doc.toJS()).toEqual([
            { id: 1, note: 'Hello "World"\nLine 2' },
        ]);
        expect(csvParser.serialize(doc)).toBe(csv);
    });

    /**
     * 【観点】TSVドキュメントのパースおよびシリアライズ確認
     * 【テスト内容】CRLF改行およびタブ区切りを持つTSV文字列をパースし、セル値更新後もCRLF改行とタブ区切りを維持してシリアライズされることを検証する。
     */
    it('parses and serializes TSV correctly', () => {
        const tsv = `id\tname\tscore\r\n1\tAlice\t95.5\r\n2\tBob\t80\r\n`;
        const doc = tsvParser.parse(tsv);

        expect(doc.format.fileType).toBe('tsv');
        expect(doc.toJS()).toEqual([
            { id: 1, name: 'Alice', score: 95.5 },
            { id: 2, name: 'Bob', score: 80 },
        ]);

        const updated = doc.updateCell(CellPath.fromString('[1].score'), new CellValue(88));
        expect(tsvParser.serialize(updated)).toBe(`id\tname\tscore\r\n1\tAlice\t95.5\r\n2\tBob\t88\r\n`);
    });
});
