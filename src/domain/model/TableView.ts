import { CellPath } from './CellPath';
import { CellValue } from './CellValue';
import { TreeNode } from './TreeNode';

/**
 * テーブルビューのカラム定義。
 */
export interface TableColumn {
    /** カラムの識別キー（プロパティ名等） */
    key: string;
    /** カラムの表示名 */
    label: string;
    /** カラムのデータ型 */
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'other';
    /** ヘッダー等に表示する型シンボル（例: "1234", "Aa", "[ ]" 等） */
    typeSymbol: string;
}

/**
 * テーブルビュー内の個別セル。
 */
export interface TableCell {
    /** セルの絶対アクセスパス */
    path: CellPath;
    /** セルの値 */
    value: CellValue;
    /** カラム識別キー */
    key: string;
}

/**
 * テーブルビュー内の1行分のデータ。
 */
export interface TableRow {
    /** 行のインデックス（0起点） */
    index: number;
    /** 行のアクセスパス */
    path: CellPath;
    /** カラムキーをキーとする各セルのマップ */
    cells: Record<string, TableCell>;
}

/**
 * 配列データを2次元のスプレッドシート／テーブル形式として表現するドメインモデル。
 */
export class TableView {
    /** テーブルの基点となる配列のパス */
    public readonly path: CellPath;
    /** カラム一覧 */
    public readonly columns: ReadonlyArray<TableColumn>;
    /** 行データ一覧 */
    public readonly rows: ReadonlyArray<TableRow>;
    /** オブジェクト配列であるか（false の場合はプリミティブ配列） */
    public readonly isObjectArray: boolean;

    constructor(
        path: CellPath,
        columns: TableColumn[],
        rows: TableRow[],
        isObjectArray: boolean
    ) {
        this.path = path;
        this.columns = Object.freeze([...columns]);
        this.rows = Object.freeze([...rows]);
        this.isObjectArray = isObjectArray;
    }

    /**
     * 総行数を取得します。
     */
    public get totalRows(): number {
        return this.rows.length;
    }

    /**
     * 総カラム数を取得します。
     */
    public get totalColumns(): number {
        return this.columns.length;
    }

    /**
     * 配列を表す TreeNode から TableView インスタンスを構築します。
     * @param node 配列型の TreeNode
     * @returns 構築された TableView インスタンス
     */
    public static fromArrayNode(node: TreeNode): TableView {
        if (node.type !== 'array') {
            throw new Error(`Expected array node, got ${node.type}`);
        }

        const children = node.children;
        // 子要素にオブジェクトが含まれるか判定
        const hasObjectItems = children.some(c => c.type === 'object');

        if (!hasObjectItems) {
            // プリミティブまたは非オブジェクト配列: 単一の "value" カラムとして構成
            let colType: TableColumn['type'] = 'other';
            const sampleChildren = children.slice(0, 10);
            const primitiveTypes = new Set<string>();
            for (const child of sampleChildren) {
                if (child.value && (child.value.type === 'string' || child.value.type === 'number' || child.value.type === 'boolean')) {
                    primitiveTypes.add(child.value.type);
                }
            }
            if (primitiveTypes.size === 1) {
                if (primitiveTypes.has('number')) {
                    colType = 'number';
                } else if (primitiveTypes.has('boolean')) {
                    colType = 'boolean';
                } else if (primitiveTypes.has('string')) {
                    colType = 'string';
                }
            }
            const columns: TableColumn[] = [{
                key: 'value',
                label: '[ ]',
                type: colType,
                typeSymbol: TableView.getTypeSymbol(colType),
            }];
            const rows: TableRow[] = children.map((child, idx) => {
                const cellVal = child.value ?? new CellValue(null);
                const cells: Record<string, TableCell> = {
                    value: {
                        path: child.path,
                        value: cellVal,
                        key: 'value',
                    },
                };
                return {
                    index: idx,
                    path: child.path,
                    cells,
                };
            });

            return new TableView(node.path, columns, rows, false);
        }

        // オブジェクトの子要素から出現順にユニークなプロパティキーを収集
        const keySet = new Set<string>();
        const columnOrder: string[] = [];
        const columnSampleNodes = new Map<string, TreeNode[]>();

        for (const child of children) {
            if (child.type === 'object') {
                for (const prop of child.children) {
                    const k = String(prop.key);
                    if (!keySet.has(k)) {
                        keySet.add(k);
                        columnOrder.push(k);
                        columnSampleNodes.set(k, []);
                    }
                    columnSampleNodes.get(k)?.push(prop);
                }
            }
        }

        const columns: TableColumn[] = columnOrder.map(k => {
            const samples = columnSampleNodes.get(k) ?? [];
            const colType = TableView.detectColumnType(samples);
            return {
                key: k,
                label: k,
                type: colType,
                typeSymbol: TableView.getTypeSymbol(colType),
            };
        });

        const rows: TableRow[] = children.map((child, idx) => {
            const cells: Record<string, TableCell> = {};

            if (child.type === 'object') {
                const childMap = new Map<string, TreeNode>();
                for (const prop of child.children) {
                    childMap.set(String(prop.key), prop);
                }

                for (const colKey of columnOrder) {
                    const propNode = childMap.get(colKey);
                    if (propNode) {
                        const cellVal = propNode.value ?? (propNode.type === 'array' || propNode.type === 'object'
                            ? new CellValue(propNode.toJS(), propNode.type === 'array' ? 'array' : 'complex')
                            : new CellValue(null));
                        cells[colKey] = {
                            path: propNode.path,
                            value: cellVal,
                            key: colKey,
                        };
                    } else {
                        // この行に存在しない欠損キーの補完
                        cells[colKey] = {
                            path: child.path.append(colKey),
                            value: new CellValue(null),
                            key: colKey,
                        };
                    }
                }
            } else {
                // オブジェクト配列内に混在するプリミティブ要素のフォールバック
                for (const colKey of columnOrder) {
                    cells[colKey] = {
                        path: child.path.append(colKey),
                        value: new CellValue(null),
                        key: colKey,
                    };
                }
            }

            return {
                index: idx,
                path: child.path,
                cells,
            };
        });

        return new TableView(node.path, columns, rows, true);
    }

    /**
     * データ型に応じた表示用シンボル文字を取得します。
     * @param type カラムのデータ型
     * @returns 表示シンボル文字列
     */
    public static getTypeSymbol(type: TableColumn['type']): string {
        switch (type) {
            case 'array': return '[ ]';
            case 'object': return '{ }';
            case 'number': return '1234';
            case 'boolean': return 'T/F';
            default: return 'Aa';
        }
    }

    /**
     * サンプルノード群からカラム全体のデータ型を推定します。
     * @param sampleNodes サンプルノードのリスト
     * @returns 推定されたカラムデータ型
     */
    public static detectColumnType(sampleNodes: TreeNode[]): TableColumn['type'] {
        const samples = sampleNodes.slice(0, 10);
        for (const node of samples) {
            if (!node) {
                continue;
            }
            if (node.type === 'array') {
                return 'array';
            }
            if (node.type === 'object') {
                return 'object';
            }
            if (node.value) {
                if (node.value.type === 'array') {
                    return 'array';
                }
                if (node.value.type === 'complex') {
                    if (Array.isArray(node.value.value)) {
                        return 'array';
                    }
                    if (typeof node.value.value === 'object' && node.value.value !== null) {
                        return 'object';
                    }
                }
            }
        }

        const primitiveTypes = new Set<string>();
        for (const node of samples) {
            if (!node || !node.value) {
                continue;
            }
            const vt = node.value.type;
            if (vt === 'number' || vt === 'boolean' || vt === 'string') {
                primitiveTypes.add(vt);
            }
        }

        if (primitiveTypes.size === 1) {
            if (primitiveTypes.has('number')) {
                return 'number';
            }
            if (primitiveTypes.has('boolean')) {
                return 'boolean';
            }
            if (primitiveTypes.has('string')) {
                return 'string';
            }
        }

        return 'other';
    }
}
