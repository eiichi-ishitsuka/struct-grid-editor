import { TreeNode } from '../model/TreeNode';
import { FlatRow } from '../model/FlatRow';
import { CellValue } from '../model/CellValue';
import { CellPath } from '../model/CellPath';

/**
 * 構文木のフラット化オプション。
 */
export interface FlattenOptions {
    /**
     * true の場合、非リーフノード（オブジェクトや配列）も行として出力し、
     * グリッド上での構造操作を可能にします。
     */
    includeIntermediateNodes?: boolean;
    /**
     * true の場合、ネストされた配列ノードをさらに展開せず1行（件数表示）として折りたたみ、
     * スプレッドシートのドリルダウン編集を可能にします。
     */
    collapseArrays?: boolean;
}

/**
 * 階層構造を持つ TreeNode とフラットな FlatRow 配列との相互変換を行うドメインサービス。
 */
export class TreeFlattener {
    /**
     * TreeNode 構文木を再帰的に走査し、グリッド描画用の FlatRow 配列に平坦化します。
     * @param root ルート TreeNode
     * @param options 平坦化オプション
     * @returns 平坦化された FlatRow の配列
     */
    public flatten(root: TreeNode, options: FlattenOptions = {}): FlatRow[] {
        const rows: FlatRow[] = [];
        this.traverse(root, 0, rows, options);
        return rows;
    }

    private traverse(
        node: TreeNode,
        depth: number,
        rows: FlatRow[],
        options: FlattenOptions
    ): void {
        if (options.collapseArrays && node.type === 'array' && node.path.length > 0) {
            rows.push(new FlatRow(
                node.path,
                node.key,
                new CellValue(`[${node.children.length}件]`, 'array'),
                depth,
                true,
                'array'
            ));
            return;
        }

        if (node.isLeaf) {
            rows.push(new FlatRow(
                node.path,
                node.key,
                node.value ?? new CellValue(null),
                depth,
                true,
                node.type
            ));
            return;
        }

        if (options.includeIntermediateNodes && node.path.length > 0) {
            rows.push(new FlatRow(
                node.path,
                node.key,
                new CellValue(node.type === 'array' ? `[${node.children.length}件]` : null, 'complex'),
                depth,
                false,
                node.type
            ));
        }

        for (const child of node.children) {
            this.traverse(child, depth + 1, rows, options);
        }
    }

    /**
     * フラットなパス・値ペアのリストから、ネストされた JavaScript データ構造を再構築します。
     * @param rows パスと値を持つ行データの配列
     * @returns 再構築された JavaScript データ構造
     */
    public unflatten(rows: { path: CellPath; value: CellValue }[]): any {
        if (rows.length === 0) {
            return {};
        }

        // パスの先頭セグメントからルートが配列かオブジェクトかを判定
        const firstSegment = rows[0].path.segments[0];
        const isRootArray = typeof firstSegment === 'number';
        const root: any = isRootArray ? [] : {};

        for (const row of rows) {
            const segments = row.path.segments;
            if (segments.length === 0) {
                return row.value.value;
            }

            let current = root;
            for (let i = 0; i < segments.length - 1; i++) {
                const seg = segments[i];
                const nextSeg = segments[i + 1];
                const isNextNumber = typeof nextSeg === 'number';

                if (current[seg] === undefined || current[seg] === null || typeof current[seg] !== 'object') {
                    current[seg] = isNextNumber ? [] : {};
                }
                current = current[seg];
            }

            const lastSeg = segments[segments.length - 1];
            current[lastSeg] = row.value.value;
        }

        return root;
    }
}
