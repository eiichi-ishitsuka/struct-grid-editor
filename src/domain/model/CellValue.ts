/**
 * セル値のデータ型分類。
 */
export type CellValueType = 'string' | 'number' | 'boolean' | 'null' | 'undefined' | 'complex' | 'array';

/**
 * 型情報を保持するセル値を表現する値オブジェクト（Value Object）。
 */
export class CellValue {
    /** 実際の生データ値 */
    public readonly value: any;
    /** 判定・指定されたデータ型 */
    public readonly type: CellValueType;

    constructor(value: any, type?: CellValueType) {
        this.value = value;
        this.type = type ?? CellValue.detectType(value);
    }

    /**
     * 与えられた値の型を自動判別します。
     * @param value 判定対象の値
     * @returns 判別された CellValueType
     */
    public static detectType(value: any): CellValueType {
        if (value === null) {
            return 'null';
        }
        if (value === undefined) {
            return 'undefined';
        }
        if (typeof value === 'boolean') {
            return 'boolean';
        }
        if (typeof value === 'number') {
            return 'number';
        }
        if (typeof value === 'string') {
            return 'string';
        }
        return 'complex';
    }

    /**
     * ユーザーが入力した文字列から、型を推定して CellValue を生成します。
     * 元の型ヒントが指定されている場合は可能な限り尊重します。
     * @param input ユーザー入力文字列
     * @param originalType 元のデータ型（任意）
     * @returns 型付けされた CellValue インスタンス
     */
    public static fromInputString(input: string, originalType?: CellValueType): CellValue {
        const trimmed = input.trim();

        if (trimmed === '' && originalType === 'string') {
            return new CellValue('', 'string');
        }

        if (trimmed === 'null') {
            return new CellValue(null, 'null');
        }
        if (trimmed === 'true') {
            return new CellValue(true, 'boolean');
        }
        if (trimmed === 'false') {
            return new CellValue(false, 'boolean');
        }

        // 数値として解析可能である場合
        if (!isNaN(Number(trimmed)) && trimmed !== '') {
            return new CellValue(Number(trimmed), 'number');
        }

        // JSON 配列またはオブジェクトの解析を試行
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
            (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            try {
                const parsed = JSON.parse(trimmed);
                return new CellValue(parsed, 'complex');
            } catch {
                // 解析失敗時は文字列として扱う
            }
        }

        return new CellValue(input, 'string');
    }

    /**
     * グリッドUI上に表示するための文字列形式に変換します。
     * @returns 表示用文字列
     */
    public toDisplayString(): string {
        if (this.value === null || this.value === undefined) {
            return '';
        }
        if (this.type === 'complex') {
            return JSON.stringify(this.value);
        }
        return String(this.value);
    }

    /**
     * 別の CellValue と型および値が等価であるかを判定します。
     * @param other 比較対象の CellValue
     * @returns 等価である場合は true
     */
    public equals(other: CellValue): boolean {
        return this.type === other.type && this.value === other.value;
    }
}
