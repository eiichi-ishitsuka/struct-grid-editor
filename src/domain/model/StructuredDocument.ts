import { TreeNode } from './TreeNode';
import { CellPath } from './CellPath';
import { CellValue } from './CellValue';
import { DocumentFormat } from './DocumentFormat';
import { FlatRow } from './FlatRow';
import { TableView } from './TableView';
import { TreeFlattener, FlattenOptions } from '../service/TreeFlattener';

/**
 * 構造化ドキュメントを表現する集約ルート（Aggregate Root）。
 * ドキュメント構文木、書式メタデータ、およびドメイン操作をカプセル化します。
 */
export class StructuredDocument {
    private readonly treeFlattener: TreeFlattener;

    constructor(
        /** ドキュメントのルート構文木ノード */
        public readonly root: TreeNode,
        /** ドキュメントの書式メタデータ */
        public readonly format: DocumentFormat,
        treeFlattener?: TreeFlattener
    ) {
        this.treeFlattener = treeFlattener ?? new TreeFlattener();
    }

    /**
     * 指定されたパスのセル値を更新した新しい StructuredDocument インスタンスを生成して返します（イミュータブル更新）。
     * @param path 更新対象ノードへのアクセスパス
     * @param newValue 新しいセル値
     * @returns 更新後の新しい StructuredDocument インスタンス
     */
    public updateCell(path: CellPath, newValue: CellValue): StructuredDocument {
        const updatedRoot = this.root.withUpdatedValue(path, newValue);
        return new StructuredDocument(updatedRoot, this.format, this.treeFlattener);
    }

    /**
     * 指定された親パスの下に新しいノード／要素を追加します。
     * @param parentPath 追加先親ノードのパス
     * @param key 新しいキー名またはインデックス
     * @param initialValue 初期セル値
     * @returns 更新後の新しい StructuredDocument インスタンス
     */
    public addNode(parentPath: CellPath, key: string | number, initialValue: CellValue): StructuredDocument {
        const js = this.root.toJS();

        if (parentPath.length === 0) {
            if (Array.isArray(js)) {
                js.push(initialValue.value);
            } else if (typeof js === 'object' && js !== null) {
                js[String(key)] = initialValue.value;
            }
        } else {
            let target = js;
            for (const seg of parentPath.segments) {
                target = target[seg];
            }
            if (Array.isArray(target)) {
                target.push(initialValue.value);
            } else if (typeof target === 'object' && target !== null) {
                target[String(key)] = initialValue.value;
            }
        }

        const newRoot = TreeNode.fromJS(js);
        return new StructuredDocument(newRoot, this.format, this.treeFlattener);
    }

    /**
     * 指定されたパスのノードを削除します。
     * @param path 削除対象ノードのパス
     * @returns 更新後の新しい StructuredDocument インスタンス
     */
    public deleteNode(path: CellPath): StructuredDocument {
        if (path.length === 0) {
            return this;
        }

        const js = this.root.toJS();
        const segments = path.segments;
        let target = js;

        for (let i = 0; i < segments.length - 1; i++) {
            target = target[segments[i]];
            if (!target) {
                return this;
            }
        }

        const lastSeg = segments[segments.length - 1];
        if (Array.isArray(target)) {
            const idx = typeof lastSeg === 'number' ? lastSeg : parseInt(String(lastSeg), 10);
            if (!isNaN(idx) && idx >= 0 && idx < target.length) {
                target.splice(idx, 1);
            }
        } else if (typeof target === 'object' && target !== null) {
            delete target[String(lastSeg)];
        }

        const newRoot = TreeNode.fromJS(js);
        return new StructuredDocument(newRoot, this.format, this.treeFlattener);
    }

    /**
     * ドキュメントのルートが配列形式であるかを判定します。
     * @returns ルートが配列の場合は true
     */
    public isArrayRoot(): boolean {
        return this.root.type === 'array';
    }

    /**
     * 指定されたパスの TreeNode を探索して取得します。
     * @param path 探索対象のアクセスパス
     * @returns 発見された TreeNode、存在しない場合は null
     */
    public findNode(path: CellPath): TreeNode | null {
        if (path.length === 0) {
            return this.root;
        }
        let current: TreeNode = this.root;
        for (const seg of path.segments) {
            const child = current.children.find(c => String(c.key) === String(seg));
            if (!child) {
                return null;
            }
            current = child;
        }
        return current;
    }

    /**
     * ルート配列または指定された targetPath のネスト配列から TableView を生成します。
     * @param targetPath 配列ノードへのパス（省略時はルート）
     * @returns TableView インスタンス、対象が配列でない場合は null
     */
    public toTableView(targetPath?: CellPath): TableView | null {
        const path = targetPath ?? new CellPath([]);
        const node = this.findNode(path);
        if (!node || node.type !== 'array') {
            return null;
        }
        return TableView.fromArrayNode(node);
    }

    /**
     * 指定された配列パス（arrayPath）に新しい行（要素）を追加します。
     * @param arrayPath 対象の配列へのアクセスパス
     * @param newRowData 追加する行データ（省略時は既存要素の構造から自動生成）
     * @returns 更新後の新しい StructuredDocument インスタンス
     */
    public addTableRow(arrayPath: CellPath, newRowData?: any): StructuredDocument {
        const js = this.root.toJS();
        let target = js;

        if (arrayPath.length > 0) {
            for (const seg of arrayPath.segments) {
                target = target[seg];
            }
        }

        if (!Array.isArray(target)) {
            throw new Error(`Target at path "${arrayPath.toString()}" is not an array`);
        }

        // newRowData が指定されていない場合、既存行の形状から自動補完
        let itemToAdd = newRowData;
        if (itemToAdd === undefined) {
            if (target.length > 0 && typeof target[0] === 'object' && target[0] !== null) {
                const template = target[0];
                itemToAdd = {};
                for (const k of Object.keys(template)) {
                    itemToAdd[k] = typeof template[k] === 'number' ? 0 : typeof template[k] === 'boolean' ? false : '';
                }
            } else {
                itemToAdd = '';
            }
        }

        target.push(itemToAdd);
        const newRoot = TreeNode.fromJS(js);
        return new StructuredDocument(newRoot, this.format, this.treeFlattener);
    }

    /**
     * 指定された配列パス（arrayPath）の全オブジェクト要素に新しいカラム（プロパティ）を追加します。
     * @param arrayPath 対象の配列へのアクセスパス
     * @param columnKey 追加するカラムキー名
     * @param defaultValue 初期値（デフォルトは空文字）
     * @returns 更新後の新しい StructuredDocument インスタンス
     */
    public addTableColumn(arrayPath: CellPath, columnKey: string, defaultValue: any = ''): StructuredDocument {
        const js = this.root.toJS();
        let target = js;

        if (arrayPath.length > 0) {
            for (const seg of arrayPath.segments) {
                target = target[seg];
            }
        }

        if (!Array.isArray(target)) {
            throw new Error(`Target at path "${arrayPath.toString()}" is not an array`);
        }

        const hasObjectItems = target.some(item => typeof item === 'object' && item !== null && !Array.isArray(item));

        if (!hasObjectItems && target.length > 0) {
            // プリミティブ配列の場合: 各プリミティブ要素をオブジェクト化し、既存値を col1、新しいキーを追加
            for (let i = 0; i < target.length; i++) {
                const existingVal = target[i];
                target[i] = {
                    col1: existingVal,
                    [columnKey]: defaultValue
                };
            }
        } else if (target.length === 0) {
            target.push({ [columnKey]: defaultValue });
        } else {
            for (const item of target) {
                if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                    if (!(columnKey in item)) {
                        item[columnKey] = defaultValue;
                    }
                }
            }
        }

        const newRoot = TreeNode.fromJS(js);
        return new StructuredDocument(newRoot, this.format, this.treeFlattener);
    }

    /**
     * 指定された配列パス（arrayPath）内のカラム名を変更します。
     * オブジェクト配列の場合は全要素の oldKey を newKey に置換します。
     * プリミティブ配列の場合は各要素を newKey を持つオブジェクトに変換します。
     * @param arrayPath 対象の配列へのアクセスパス
     * @param oldKey 変更元のカラムキー名
     * @param newKey 変更後の新しいカラムキー名
     * @returns 更新後の新しい StructuredDocument インスタンス
     */
    public renameTableColumn(arrayPath: CellPath, oldKey: string, newKey: string): StructuredDocument {
        if (!newKey || newKey.trim() === '' || oldKey === newKey) {
            return this;
        }

        const cleanNewKey = newKey.trim();
        const js = this.root.toJS();
        let target = js;

        if (arrayPath.length > 0) {
            for (const seg of arrayPath.segments) {
                target = target[seg];
            }
        }

        if (!Array.isArray(target)) {
            throw new Error(`Target at path "${arrayPath.toString()}" is not an array`);
        }

        const hasObjectItems = target.some(item => typeof item === 'object' && item !== null && !Array.isArray(item));

        if (!hasObjectItems) {
            // プリミティブ配列: 各プリミティブ要素を cleanNewKey を持つオブジェクトに変換
            for (let i = 0; i < target.length; i++) {
                target[i] = { [cleanNewKey]: target[i] };
            }
        } else {
            // オブジェクト配列: キーの出現順序を維持しながら oldKey を cleanNewKey に置換
            for (let i = 0; i < target.length; i++) {
                const item = target[i];
                if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                    const newItem: Record<string, any> = {};
                    for (const k of Object.keys(item)) {
                        if (k === oldKey) {
                            newItem[cleanNewKey] = item[k];
                        } else {
                            newItem[k] = item[k];
                        }
                    }
                    target[i] = newItem;
                }
            }
        }

        const newRoot = TreeNode.fromJS(js);
        return new StructuredDocument(newRoot, this.format, this.treeFlattener);
    }

    /**
     * 指定されたパスにあるオブジェクト内のプロパティキー名を変更します。
     * @param path 対象ノードへのアクセスパス
     * @param newKey 新しいキー名
     * @returns 更新後の新しい StructuredDocument インスタンス
     */
    public renameNodeKey(path: CellPath, newKey: string): StructuredDocument {
        if (path.length === 0) {
            return this;
        }

        const cleanNewKey = newKey.trim();
        const oldKey = String(path.segments[path.segments.length - 1]);
        if (!cleanNewKey || cleanNewKey === oldKey) {
            return this;
        }

        const js = this.root.toJS();
        if (path.length === 1) {
            if (typeof js === 'object' && js !== null && !Array.isArray(js)) {
                const newObj: Record<string, any> = {};
                for (const k of Object.keys(js)) {
                    if (k === oldKey) {
                        newObj[cleanNewKey] = js[k];
                    } else {
                        newObj[k] = js[k];
                    }
                }
                return new StructuredDocument(TreeNode.fromJS(newObj), this.format, this.treeFlattener);
            }
            return this;
        }

        let target = js;
        for (let i = 0; i < path.segments.length - 1; i++) {
            target = target[path.segments[i]];
            if (!target) {
                return this;
            }
        }

        if (typeof target === 'object' && target !== null && !Array.isArray(target)) {
            const newTarget: Record<string, any> = {};
            for (const k of Object.keys(target)) {
                if (k === oldKey) {
                    newTarget[cleanNewKey] = target[k];
                } else {
                    newTarget[k] = target[k];
                }
            }
            for (const k of Object.keys(target)) {
                delete target[k];
            }
            Object.assign(target, newTarget);
            return new StructuredDocument(TreeNode.fromJS(js), this.format, this.treeFlattener);
        }

        return this;
    }

    /**
     * 指定された配列パス（arrayPath）内の行を fromIndex から toIndex へ移動（並び替え）します。
     * @param arrayPath 対象の配列へのアクセスパス
     * @param fromIndex 移動元インデックス
     * @param toIndex 移動先インデックス
     * @returns 更新後の新しい StructuredDocument インスタンス
     */
    public moveTableRow(arrayPath: CellPath, fromIndex: number, toIndex: number): StructuredDocument {
        const js = this.root.toJS();
        let target = js;

        if (arrayPath.length > 0) {
            for (const seg of arrayPath.segments) {
                target = target[seg];
            }
        }

        if (!Array.isArray(target)) {
            return this;
        }

        if (fromIndex < 0 || fromIndex >= target.length || toIndex < 0 || toIndex >= target.length || fromIndex === toIndex) {
            return this;
        }

        const [movedItem] = target.splice(fromIndex, 1);
        target.splice(toIndex, 0, movedItem);

        const newRoot = TreeNode.fromJS(js);
        return new StructuredDocument(newRoot, this.format, this.treeFlattener);
    }

    /**
     * テーブルビューにおいて、オブジェクトプロパティの順序を再配置することでカラムを移動します。
     * @param arrayPath 対象の配列へのアクセスパス
     * @param fromIndex 移動元カラムインデックス
     * @param toIndex 移動先カラムインデックス
     * @returns 更新後の新しい StructuredDocument インスタンス
     */
    public moveTableColumn(arrayPath: CellPath, fromIndex: number, toIndex: number): StructuredDocument {
        const js = this.root.toJS();
        let target = js;

        if (arrayPath.length > 0) {
            for (const seg of arrayPath.segments) {
                target = target[seg];
            }
        }

        if (!Array.isArray(target) || target.length === 0) {
            return this;
        }

        const columnKeys: string[] = [];
        for (const item of target) {
            if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                for (const k of Object.keys(item)) {
                    if (!columnKeys.includes(k)) {
                        columnKeys.push(k);
                    }
                }
            }
        }

        if (fromIndex < 0 || fromIndex >= columnKeys.length || toIndex < 0 || toIndex >= columnKeys.length || fromIndex === toIndex) {
            return this;
        }

        const [movedCol] = columnKeys.splice(fromIndex, 1);
        columnKeys.splice(toIndex, 0, movedCol);

        for (let i = 0; i < target.length; i++) {
            const item = target[i];
            if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                const newItem: Record<string, any> = {};
                for (const col of columnKeys) {
                    if (col in item) {
                        newItem[col] = item[col];
                    }
                }
                for (const k of Object.keys(item)) {
                    if (!(k in newItem)) {
                        newItem[k] = item[k];
                    }
                }
                target[i] = newItem;
            }
        }

        const newRoot = TreeNode.fromJS(js);
        return new StructuredDocument(newRoot, this.format, this.treeFlattener);
    }

    /**
     * ドキュメントツリー内に存在するすべての配列ノードを探索して一覧を返します。
     * @returns 発見された配列ノードの情報リスト
     */
    public findSubArrays(): { path: string; label: string; length: number; isObjectArray: boolean }[] {
        const result: { path: string; label: string; length: number; isObjectArray: boolean }[] = [];

        const traverse = (node: TreeNode) => {
            if (node.type === 'array') {
                const hasObjectItems = node.children.some(c => c.type === 'object');
                result.push({
                    path: node.path.toString(),
                    label: node.path.toString() || 'ルート配列',
                    length: node.children.length,
                    isObjectArray: hasObjectItems,
                });
            }
            for (const child of node.children) {
                traverse(child);
            }
        };

        traverse(this.root);
        return result;
    }

    /**
     * スプレッドシートテーブル描画に適したフラットな行リストを取得します。
     * デフォルトでは、ネスト配列は折りたたまれて1行として表現されます。
     * @param options フラット化オプション
     * @returns フラット化された行（FlatRow）の配列
     */
    public toFlatRows(options?: FlattenOptions): FlatRow[] {
        return this.treeFlattener.flatten(this.root, {
            includeIntermediateNodes: false,
            collapseArrays: true,
            ...options,
        });
    }

    /**
     * 標準的な JavaScript 表現（オブジェクト／配列）に変換します。
     * @returns JavaScript データ
     */
    public toJS(): any {
        return this.root.toJS();
    }
}
