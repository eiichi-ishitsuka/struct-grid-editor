/**
 * 構造化データ内の特定セルまたはノードへのアクセスパスを表現する値オブジェクト（Value Object）。
 * 例: "users[0].address.city", "metadata.tags[1]"
 */
export class CellPath {
    /** パスを構成する各セグメント（プロパティ名または配列インデックス）の配列 */
    public readonly segments: ReadonlyArray<string | number>;

    constructor(segments: (string | number)[]) {
        this.segments = Object.freeze([...segments]);
    }

    /**
     * "a.b[0].c" や "items[2]" などのパス文字列を解析して CellPath インスタンスを生成します。
     * @param pathStr 解析対象のパス文字列
     * @returns 生成された CellPath インスタンス
     */
    public static fromString(pathStr: string): CellPath {
        if (!pathStr || pathStr.trim() === '') {
            return new CellPath([]);
        }

        const segments: (string | number)[] = [];
        // ドット区切りのキーおよびブラケットで囲まれたインデックス（foo, [0], .bar 等）にマッチ
        const regex = /([^[.\]]+)|\[(\d+)\]/g;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(pathStr)) !== null) {
            if (match[2] !== undefined) {
                // 配列インデックス
                segments.push(parseInt(match[2], 10));
            } else if (match[1] !== undefined) {
                // プロパティ名
                segments.push(match[1]);
            }
        }

        return new CellPath(segments);
    }

    /**
     * セグメントの配列から CellPath インスタンスを生成します。
     * @param segments セグメントの配列
     * @returns 生成された CellPath インスタンス
     */
    public static fromSegments(segments: (string | number)[]): CellPath {
        return new CellPath(segments);
    }

    /**
     * パスの長さ（セグメント数）を取得します。
     */
    public get length(): number {
        return this.segments.length;
    }

    /**
     * パスの深さ（セグメント数）を取得します。
     */
    public get depth(): number {
        return this.segments.length;
    }

    /**
     * パスの末尾セグメントを取得します。
     */
    public get lastSegment(): string | number | undefined {
        return this.segments[this.segments.length - 1];
    }

    /**
     * 親要素へのパスを取得します。ルート要素の場合は null を返します。
     */
    public get parent(): CellPath | null {
        if (this.segments.length === 0) {
            return null;
        }
        return new CellPath(this.segments.slice(0, -1));
    }

    /**
     * 現在のパスの末尾に新しいセグメントを追加した新しい CellPath インスタンスを返します。
     * @param segment 追加するセグメント
     * @returns 新しい CellPath インスタンス
     */
    public append(segment: string | number): CellPath {
        return new CellPath([...this.segments, segment]);
    }

    /**
     * 指定されたパスの子要素であるかを判定します。
     * @param other 比較対象の CellPath
     * @returns 子要素である場合は true
     */
    public isChildOf(other: CellPath): boolean {
        if (this.segments.length <= other.segments.length) {
            return false;
        }
        for (let i = 0; i < other.segments.length; i++) {
            if (this.segments[i] !== other.segments[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * 別の CellPath と等価であるかを判定します。
     * @param other 比較対象の CellPath
     * @returns 等価である場合は true
     */
    public equals(other: CellPath): boolean {
        if (this.segments.length !== other.segments.length) {
            return false;
        }
        return this.segments.every((seg, idx) => seg === other.segments[idx]);
    }

    /**
     * パスを文字列表現（例: "users[0].name"）に変換します。
     * @returns 文字列表現のパス
     */
    public toString(): string {
        if (this.segments.length === 0) {
            return '';
        }
        let result = '';
        for (let i = 0; i < this.segments.length; i++) {
            const seg = this.segments[i];
            if (typeof seg === 'number') {
                result += `[${seg}]`;
            } else {
                result += (i > 0 ? '.' : '') + seg;
            }
        }
        return result;
    }
}
