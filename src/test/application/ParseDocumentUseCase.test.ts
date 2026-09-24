import { describe, it, expect } from 'vitest';
import { JsonDocumentParser } from '../../infrastructure/parser/JsonDocumentParser';
import { YamlDocumentParser } from '../../infrastructure/parser/YamlDocumentParser';
import { JsonlDocumentParser } from '../../infrastructure/parser/JsonlDocumentParser';
import { ParseDocumentUseCase } from '../../application/usecase/ParseDocumentUseCase';
import { AddTableRowUseCase, AddTableColumnUseCase, RenameTableColumnUseCase } from '../../application/usecase/RowModificationUseCases';

describe('ParseDocumentUseCase with Table View & Drill-down', () => {
    const parsers = [new JsonDocumentParser(), new YamlDocumentParser(), new JsonlDocumentParser()];
    const parseUseCase = new ParseDocumentUseCase(parsers);
    const addTableRowUseCase = new AddTableRowUseCase(parsers);
    const addTableColumnUseCase = new AddTableColumnUseCase(parsers);
    const renameTableColumnUseCase = new RenameTableColumnUseCase(parsers);

    /**
     * 【観点】トップレベルJSON配列のスプレッドシート（table）モード判定と列・行のDTOマッピング確認
     * 【テスト内容】オブジェクト配列のJSON文字列を入力した際、viewModeが'table'となり、キー一覧から列定義が生成され、各セルの値が正確に抽出されることを検証する。
     */
    it('should parse top-level JSON array into table mode with columns and rows (simple-list.json style)', () => {
        const jsonText = JSON.stringify([
            { id: 1, name: 'ユーザーA', role: '管理者', active: true },
            { id: 2, name: 'ユーザーB', role: '一般ユーザー', active: false },
            { id: 3, name: 'ユーザーC', role: '閲覧者', active: true }
        ], null, 2);

        const { dto } = parseUseCase.execute(jsonText, 'json');

        expect(dto.viewMode).toBe('table');
        expect(dto.totalRows).toBe(3);
        expect(dto.tableData).toBeDefined();
        expect(dto.tableData?.columns.map(c => c.key)).toEqual(['id', 'name', 'role', 'active']);
        expect(dto.tableData?.rows.length).toBe(3);
        expect(dto.tableData?.rows[0].cells['id'].value).toBe(1);
        expect(dto.tableData?.rows[0].cells['name'].value).toBe('ユーザーA');
    });

    /**
     * 【観点】トップレベルYAML配列のスプレッドシート（table）モード判定確認
     * 【テスト内容】リスト構造を持つYAML文字列を入力した際、viewModeが'table'と判定され、行数および列キー（id, name, score）が正しく抽出されることを検証する。
     */
    it('should parse top-level YAML array into table mode', () => {
        const yamlText = `
- id: 1
  name: Item 1
  score: 95
- id: 2
  name: Item 2
  score: 80
`;

        const { dto } = parseUseCase.execute(yamlText, 'yaml');

        expect(dto.viewMode).toBe('table');
        expect(dto.totalRows).toBe(2);
        expect(dto.tableData?.columns.map(c => c.key)).toEqual(['id', 'name', 'score']);
    });

    /**
     * 【観点】トップレベルJSONオブジェクトのKVモード判定とドリルダウン用ネスト配列の検出確認
     * 【テスト内容】オブジェクト直下にプリミティブ配列やオブジェクト配列が存在する場合、viewModeが'kv'となり、サブ配列（subArrays）としてパス、要素数、オブジェクト配列フラグが正確に抽出されることを検証する。
     */
    it('should parse top-level JSON object into kv mode and identify sub-arrays for drill-down', () => {
        const jsonText = JSON.stringify({
            appName: 'Demo',
            features: ['grid-view', 'nested-editor'],
            users: [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' }
            ]
        }, null, 2);

        const { dto } = parseUseCase.execute(jsonText, 'json');

        expect(dto.viewMode).toBe('kv');
        expect(dto.subArrays).toBeDefined();
        expect(dto.subArrays?.length).toBe(2);

        const featuresArray = dto.subArrays?.find(s => s.path === 'features');
        expect(featuresArray).toBeDefined();
        expect(featuresArray?.length).toBe(2);
        expect(featuresArray?.isObjectArray).toBe(false);

        const usersArray = dto.subArrays?.find(s => s.path === 'users');
        expect(usersArray).toBeDefined();
        expect(usersArray?.length).toBe(2);
        expect(usersArray?.isObjectArray).toBe(true);
        expect(usersArray?.tableData?.columns.map(c => c.key)).toEqual(['id', 'name']);
    });

    /**
     * 【観点】深くネストされた構造における中間オブジェクトノード、インデント深度（depth）、キー名の正確性確認
     * 【テスト内容】service や network.ingress などのネスト階層を持つYAMLを入力した際、中間親ノードの行が生成され、正しい深さ（depth 1, 2, 3）とキー名が階層構造として反映されることを検証する。
     */
    it('should include intermediate object nodes and correct keys/depths for deeply nested structures (nested-service style)', () => {
        const yamlText = `
service:
  name: payment-gateway
network:
  ingress:
    enabled: true
    hosts:
      - api.staging.internal
`;
        const { dto } = parseUseCase.execute(yamlText, 'yaml');

        expect(dto.viewMode).toBe('kv');

        // Check that intermediate nodes exist
        const paths = dto.rows.map(r => r.path);
        expect(paths).toContain('service');
        expect(paths).toContain('service.name');
        expect(paths).toContain('network');
        expect(paths).toContain('network.ingress');
        expect(paths).toContain('network.ingress.enabled');
        expect(paths).toContain('network.ingress.hosts');

        // Check keys
        const networkRow = dto.rows.find(r => r.path === 'network');
        expect(networkRow?.key).toBe('network');
        expect(networkRow?.type).toBe('object');
        expect(networkRow?.depth).toBe(1);

        const ingressRow = dto.rows.find(r => r.path === 'network.ingress');
        expect(ingressRow?.key).toBe('ingress');
        expect(ingressRow?.type).toBe('object');
        expect(ingressRow?.depth).toBe(2);

        const enabledRow = dto.rows.find(r => r.path === 'network.ingress.enabled');
        expect(enabledRow?.key).toBe('enabled');
        expect(enabledRow?.type).toBe('boolean');
        expect(enabledRow?.depth).toBe(3);

        const hostsRow = dto.rows.find(r => r.path === 'network.ingress.hosts');
        expect(hostsRow?.key).toBe('hosts');
        expect(hostsRow?.type).toBe('array');
        expect(hostsRow?.depth).toBe(3);
    });

    /**
     * 【観点】AddTableRowUseCase によるテーブル行の末尾追加と型デフォルト値初期化の確認
     * 【テスト内容】既存のオブジェクト配列に対し行追加ユースケースを実行した際、行数が1つ増加し、既存列定義に応じた初期値（数値は0、文字列は空文字）で新しい行が追加されることを検証する。
     */
    it('should add a row to top-level array via AddTableRowUseCase', () => {
        const jsonText = JSON.stringify([
            { id: 1, name: 'A' }
        ], null, 2);

        const newJson = addTableRowUseCase.execute(jsonText, 'json', '');
        const parsed = JSON.parse(newJson);

        expect(parsed.length).toBe(2);
        expect(parsed[1].id).toBe(0);
        expect(parsed[1].name).toBe('');
    });

    /**
     * 【観点】AddTableColumnUseCase によるテーブル列追加と全レコードへのプロパティ反映確認
     * 【テスト内容】オブジェクト配列に対し新規列名（'age'）を追加した際、すべてのオブジェクトの末尾に該当プロパティが空文字初期値で均一に追加されることを検証する。
     */
    it('should add a column to array objects via AddTableColumnUseCase', () => {
        const jsonText = JSON.stringify([
            { id: 1, name: 'A' },
            { id: 2, name: 'B' }
        ], null, 2);

        const newJson = addTableColumnUseCase.execute(jsonText, 'json', '', 'age');
        const parsed = JSON.parse(newJson);

        expect(parsed[0].age).toBe('');
        expect(parsed[1].age).toBe('');
        // Ensure 'age' is appended at the end
        expect(Object.keys(parsed[0])).toEqual(['id', 'name', 'age']);
    });

    /**
     * 【観点】プリミティブ配列に対する列追加時のオブジェクト配列化（スキーマ拡張）の確認
     * 【テスト内容】文字列の配列（hosts）に対して新しい列（port）を追加した際、各プリミティブ要素が既存値キー（col1）と新規列キーを持つオブジェクトへと構造変換されることを検証する。
     */
    it('should add a column to a primitive array by converting elements to objects', () => {
        const jsonText = JSON.stringify({
            network: {
                ingress: {
                    hosts: ['api.example.com', 'pay.example.com']
                }
            }
        }, null, 2);

        const newJson = addTableColumnUseCase.execute(jsonText, 'json', 'network.ingress.hosts', 'port');
        const parsed = JSON.parse(newJson);

        expect(parsed.network.ingress.hosts).toEqual([
            { col1: 'api.example.com', port: '' },
            { col1: 'pay.example.com', port: '' }
        ]);
    });

    /**
     * 【観点】オブジェクト内にネストされた配列を持つスプレッドシートの列型推論確認
     * 【テスト内容】配列プロパティ（skills: string[]）を含むオブジェクト配列を入力した際、該当列の型が 'array'、アイコンシンボルが '[ ]' として認識されることを検証する。
     */
    it('should parse top-level array with objects containing nested array (users-with-nested-array style)', () => {
        const jsonText = JSON.stringify([
            { id: 1, name: '山田 太郎', skills: ['TypeScript', 'Python'], active: true }
        ], null, 2);

        const { dto } = parseUseCase.execute(jsonText, 'json');

        expect(dto.viewMode).toBe('table');
        expect(dto.tableData?.columns.map(c => c.key)).toEqual(['id', 'name', 'skills', 'active']);

        const skillsCol = dto.tableData?.columns.find(c => c.key === 'skills');
        expect(skillsCol?.type).toBe('array');
        expect(skillsCol?.typeSymbol).toBe('[ ]');
    });

    /**
     * 【観点】RenameTableColumnUseCase によるテーブル列名リネームと全オブジェクトへの置換反映確認
     * 【テスト内容】オブジェクト配列の列名（'name' -> 'fullName'）を変更した際、配列内の全要素の旧キーが新キーへと一括置換されることを検証する。
     */
    it('should rename a column in an object array and replace keys across all objects', () => {
        const jsonText = JSON.stringify([
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' }
        ], null, 2);

        const updatedJson = renameTableColumnUseCase.execute(jsonText, 'json', '', 'name', 'fullName');
        const parsed = JSON.parse(updatedJson);

        expect(parsed).toEqual([
            { id: 1, fullName: 'Alice' },
            { id: 2, fullName: 'Bob' }
        ]);
        expect(parsed[0].name).toBeUndefined();
    });

    /**
     * 【観点】プリミティブ配列の列名リネームに伴うオブジェクト配列への自動構造変換確認
     * 【テスト内容】ネストされたプリミティブ配列（単一列 `[ ]`）の列名を 'host' に変更した際、各要素が `{ host: "..." }` というオブジェクトに変換され、以降オブジェクト配列として認識されることを検証する。
     */
    it('should convert a primitive array inside an object to an array of objects when renaming column', () => {
        const jsonText = JSON.stringify({
            network: {
                ingress: {
                    hosts: ['api.example.com', 'pay.example.com']
                }
            }
        }, null, 2);

        // Before rename, check table view for hosts: column label is '[ ]'
        const initial = parseUseCase.execute(jsonText, 'json');
        const hostsSub = initial.dto.subArrays?.find(s => s.path === 'network.ingress.hosts');
        expect(hostsSub).toBeDefined();
        expect(hostsSub?.tableData?.columns[0].label).toBe('[ ]');

        // Rename '[ ]' (or 'value') column to 'host'
        const updatedJson = renameTableColumnUseCase.execute(jsonText, 'json', 'network.ingress.hosts', 'value', 'host');
        const parsed = JSON.parse(updatedJson);

        expect(parsed.network.ingress.hosts).toEqual([
            { host: 'api.example.com' },
            { host: 'pay.example.com' }
        ]);

        // After rename, it should now parse as an object array with column 'host'
        const updated = parseUseCase.execute(updatedJson, 'json');
        const updatedHostsSub = updated.dto.subArrays?.find(s => s.path === 'network.ingress.hosts');
        expect(updatedHostsSub?.tableData?.columns[0].key).toBe('host');
        expect(updatedHostsSub?.tableData?.columns[0].label).toBe('host');
    });

    /**
     * 【観点】YAMLドキュメントにおける列名リネームとYAMLシリアライズの整合性確認
     * 【テスト内容】YAML形式のドキュメント内のネストされたプリミティブ配列に対して列名変更を実行した際、YAMLのインデント構造を維持したままオブジェクトリスト形式へ変換・保存されることを検証する。
     */
    it('should rename column in YAML document', () => {
        const yamlText = `
network:
  ingress:
    hosts:
      - api.example.com
      - pay.example.com
`;
        const updatedYaml = renameTableColumnUseCase.execute(yamlText, 'yaml', 'network.ingress.hosts', 'value', 'host');
        const parsed = new YamlDocumentParser().parse(updatedYaml).toJS();

        expect(parsed.network.ingress.hosts).toEqual([
            { host: 'api.example.com' },
            { host: 'pay.example.com' }
        ]);
    });

    /**
     * 【観点】JSONLドキュメントのスプレッドシート（table）モード判定と列・行のDTOマッピング確認
     */
    it('should parse JSONL into table mode with columns and rows', () => {
        const jsonlText = `{"id":1,"name":"Alice","role":"Admin"}\n{"id":2,"name":"Bob","role":"User"}\n`;
        const { dto } = parseUseCase.execute(jsonlText, 'jsonl');

        expect(dto.documentType).toBe('jsonl');
        expect(dto.viewMode).toBe('table');
        expect(dto.totalRows).toBe(2);
        expect(dto.tableData).toBeDefined();
        expect(dto.tableData?.columns.map(c => c.key)).toEqual(['id', 'name', 'role']);
        expect(dto.tableData?.rows[0].cells['name'].value).toBe('Alice');
        expect(dto.tableData?.rows[1].cells['name'].value).toBe('Bob');
    });

    /**
     * 【観点】JSONLドキュメントに対するテーブル行追加ユースケースの動作検証
     */
    it('should add table row in JSONL document through use case', () => {
        const jsonlText = `{"id":1,"name":"Alice"}\n`;
        const updated = addTableRowUseCase.execute(jsonlText, 'jsonl', '', { id: 2, name: 'Bob' });
        const { dto } = parseUseCase.execute(updated, 'jsonl');

        expect(dto.totalRows).toBe(2);
        expect(dto.tableData?.rows[1].cells['name'].value).toBe('Bob');
        expect(updated).toBe(`{"id":1,"name":"Alice"}\n{"id":2,"name":"Bob"}\n`);
    });
});
