/**
 * サポートされているドキュメントファイル形式。
 */
export type DocumentFileType = 'json' | 'yaml' | 'jsonl';

/**
 * ドキュメントの書式オプション。
 */
export interface DocumentFormatOptions {
    /** ファイル形式 ('json', 'yaml' または 'jsonl') */
    fileType: DocumentFileType;
    /** インデント幅またはインデント文字列 */
    indent: number | string;
    /** 末尾改行が存在するかどうか */
    hasTrailingNewline: boolean;
    /** 各フォーマット固有の追加メタデータ */
    metadata?: Record<string, any>;
}

/**
 * ドキュメントの書式特性をカプセル化する値オブジェクト（Value Object）。
 * 編集時にも元のインデントや改行などの書式を保持するために使用されます。
 */
export class DocumentFormat {
    /** ファイル形式 */
    public readonly fileType: DocumentFileType;
    /** インデント幅またはインデント文字列 */
    public readonly indent: number | string;
    /** 末尾改行が存在するかどうか */
    public readonly hasTrailingNewline: boolean;
    /** 各フォーマット固有の追加メタデータ */
    public readonly metadata: Readonly<Record<string, any>>;

    constructor(options: DocumentFormatOptions) {
        this.fileType = options.fileType;
        this.indent = options.indent;
        this.hasTrailingNewline = options.hasTrailingNewline;
        this.metadata = Object.freeze(options.metadata ? { ...options.metadata } : {});
    }

    /**
     * デフォルトのJSON書式を生成します。
     * @returns デフォルトJSON書式
     */
    public static defaultJson(): DocumentFormat {
        return new DocumentFormat({
            fileType: 'json',
            indent: 2,
            hasTrailingNewline: true,
        });
    }

    /**
     * デフォルトのYAML書式を生成します。
     * @returns デフォルトYAML書式
     */
    public static defaultYaml(): DocumentFormat {
        return new DocumentFormat({
            fileType: 'yaml',
            indent: 2,
            hasTrailingNewline: true,
        });
    }

    /**
     * デフォルトのJSONL書式を生成します。
     * @returns デフォルトJSONL書式
     */
    public static defaultJsonl(): DocumentFormat {
        return new DocumentFormat({
            fileType: 'jsonl',
            indent: 0,
            hasTrailingNewline: true,
        });
    }
}
