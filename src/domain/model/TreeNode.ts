import { CellPath } from './CellPath';
import { CellValue } from './CellValue';

/**
 * 構文木ノードの種類。
 */
export type TreeNodeType = 'object' | 'array' | 'primitive';

/**
 * 構造化ドキュメントのツリーを構成する各ノード。
 * キーの出現順序と階層構造を正確に保持します。
 */
export class TreeNode {
    /** ルートからの絶対アクセスパス */
    public readonly path: CellPath;
    /** ノードのプロパティ名または配列インデックス */
    public readonly key: string | number;
    /** ノードの種類 ('object' | 'array' | 'primitive') */
    public readonly type: TreeNodeType;
    /** プリミティブノードの場合の値 */
    public readonly value?: CellValue;
    /** 子ノードのリスト（オブジェクトまたは配列の場合） */
    public readonly children: ReadonlyArray<TreeNode>;

    constructor(
        path: CellPath,
        key: string | number,
        type: TreeNodeType,
        value?: CellValue,
        children: TreeNode[] = []
    ) {
        this.path = path;
        this.key = key;
        this.type = type;
        this.value = value;
        this.children = Object.freeze([...children]);
    }

    /**
     * プリミティブ値（文字列、数値、真偽値等）を表すノードを生成します。
     * @param path ノードへのアクセスパス
     * @param key キー名またはインデックス
     * @param value セル値
     * @returns 生成された TreeNode インスタンス
     */
    public static primitive(path: CellPath, key: string | number, value: CellValue): TreeNode {
        return new TreeNode(path, key, 'primitive', value, []);
    }

    /**
     * オブジェクト（辞書構造）を表すノードを生成します。
     * @param path ノードへのアクセスパス
     * @param key キー名またはインデックス
     * @param children 子ノードの配列
     * @returns 生成された TreeNode インスタンス
     */
    public static object(path: CellPath, key: string | number, children: TreeNode[] = []): TreeNode {
        return new TreeNode(path, key, 'object', undefined, children);
    }

    /**
     * 配列を表すノードを生成します。
     * @param path ノードへのアクセスパス
     * @param key キー名またはインデックス
     * @param children 配列要素を表す子ノードの配列
     * @returns 生成された TreeNode インスタンス
     */
    public static array(path: CellPath, key: string | number, children: TreeNode[] = []): TreeNode {
        return new TreeNode(path, key, 'array', undefined, children);
    }

    /**
     * ノードが末端（プリミティブ値）であるかを判定します。
     */
    public get isLeaf(): boolean {
        return this.type === 'primitive';
    }

    /**
     * TreeNode 階層を標準的な JavaScript のオブジェクト・配列・プリミティブ値に変換します。
     * @returns 変換後の JavaScript データ
     */
    public toJS(): any {
        if (this.type === 'primitive') {
            return this.value ? this.value.value : null;
        }
        if (this.type === 'array') {
            return this.children.map(child => child.toJS());
        }
        const obj: Record<string, any> = {};
        for (const child of this.children) {
            obj[String(child.key)] = child.toJS();
        }
        return obj;
    }

    /**
     * 指定されたパスの値を更新した新しい TreeNode インスタンスを生成して返します（イミュータブル更新）。
     * @param targetPath 更新対象のノードへのパス
     * @param newValue 新しいセル値
     * @returns 更新後の新しい TreeNode インスタンス
     */
    public withUpdatedValue(targetPath: CellPath, newValue: CellValue): TreeNode {
        if (this.path.equals(targetPath)) {
            return new TreeNode(this.path, this.key, 'primitive', newValue, []);
        }

        if (this.type === 'primitive') {
            return this;
        }

        const updatedChildren = this.children.map(child => {
            if (targetPath.equals(child.path) || targetPath.isChildOf(child.path)) {
                return child.withUpdatedValue(targetPath, newValue);
            }
            return child;
        });

        return new TreeNode(this.path, this.key, this.type, undefined, updatedChildren);
    }

    /**
     * 標準的な JavaScript データから TreeNode 構文木を再帰的に構築します。
     * @param data 変換対象のデータ
     * @param path カレントパス（省略時はルート）
     * @param key カレントキー（省略時は空文字）
     * @returns 構築された TreeNode ルートノード
     */
    public static fromJS(data: any, path: CellPath = new CellPath([]), key: string | number = ''): TreeNode {
        if (data === null || data === undefined || typeof data !== 'object') {
            return TreeNode.primitive(path, key, new CellValue(data));
        }

        if (Array.isArray(data)) {
            const children = data.map((item, index) =>
                TreeNode.fromJS(item, path.append(index), index)
            );
            return TreeNode.array(path, key, children);
        }

        const keys = Object.keys(data);
        const children = keys.map(k =>
            TreeNode.fromJS(data[k], path.append(k), k)
        );
        return TreeNode.object(path, key, children);
    }
}
