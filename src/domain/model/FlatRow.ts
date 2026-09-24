import { CellPath } from './CellPath';
import { CellValue } from './CellValue';
import { TreeNodeType } from './TreeNode';

/**
 * スプレッドシートグリッドにおける1行分のデータを表現する値オブジェクト（Value Object）。
 */
export class FlatRow {
    /** 行の一意識別子 */
    public readonly id: string;
    /** ルートからの絶対アクセスパス */
    public readonly path: CellPath;
    /** プロパティ名または配列インデックス */
    public readonly key: string | number;
    /** グリッドに表示するためのパス文字列（例: "users[0].name"） */
    public readonly displayPath: string;
    /** セルの値 */
    public readonly value: CellValue;
    /** 階層の深さ（0起点） */
    public readonly depth: number;
    /** リーフ（末端の値）であるかどうか */
    public readonly isLeaf: boolean;
    /** ノードの種類 ('object' | 'array' | 'primitive') */
    public readonly nodeType: TreeNodeType;

    constructor(
        path: CellPath,
        key: string | number,
        value: CellValue,
        depth: number,
        isLeaf: boolean,
        nodeType: TreeNodeType
    ) {
        this.path = path;
        this.key = key;
        this.displayPath = path.toString();
        this.id = this.displayPath || `root-${key}`;
        this.value = value;
        this.depth = depth;
        this.isLeaf = isLeaf;
        this.nodeType = nodeType;
    }
}
