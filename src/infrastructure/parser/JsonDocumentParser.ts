import { IDocumentParser } from '../../domain/port/IDocumentParser';
import { StructuredDocument } from '../../domain/model/StructuredDocument';
import { TreeNode } from '../../domain/model/TreeNode';
import { FormatPreserver } from '../../domain/service/FormatPreserver';

/**
 * JSON文字列からコメント（//, /* ... *\/）を除去し、JSONCをパース可能にします。
 */
export function stripJsonComments(text: string): string {
    let insideString = false;
    let stringChar = '';
    let isEscaped = false;
    let result = '';
    let i = 0;

    while (i < text.length) {
        const char = text[i];
        const next = text[i + 1];

        if (insideString) {
            result += char;
            if (char === '\\' && !isEscaped) {
                isEscaped = true;
            } else {
                if (char === stringChar && !isEscaped) {
                    insideString = false;
                }
                isEscaped = false;
            }
            i++;
            continue;
        }

        if (char === '"' || char === "'") {
            insideString = true;
            stringChar = char;
            result += char;
            i++;
            continue;
        }

        // 行コメント // ...
        if (char === '/' && next === '/') {
            while (i < text.length && text[i] !== '\n' && text[i] !== '\r') {
                i++;
            }
            continue;
        }

        // ブロックコメント /* ... */
        if (char === '/' && next === '*') {
            i += 2;
            while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) {
                i++;
            }
            i += 2;
            continue;
        }

        result += char;
        i++;
    }

    return result;
}

/**
 * JSONドキュメントの解析およびシリアライズを担うインフラストラクチャ層のアダプター。
 */
export class JsonDocumentParser implements IDocumentParser {
    constructor(private readonly formatPreserver: FormatPreserver = new FormatPreserver()) {}

    /**
     * 指定された拡張子が JSON であるかを判定します。
     * @param fileExtension 拡張子文字列（例: "json", ".json"）
     * @returns サポートしている場合は true
     */
    public supports(fileExtension: string): boolean {
        const ext = fileExtension.toLowerCase().replace(/^\./, '');
        return ext === 'json';
    }

    /**
     * JSON 文字列を解析し、StructuredDocument ドメインモデルを生成します。
     * コメント付き JSON (JSONC) にも対応しています。
     * @param text 解析対象の JSON 文字列
     * @returns 生成された StructuredDocument インスタンス
     */
    public parse(text: string): StructuredDocument {
        const format = this.formatPreserver.detectFormat(text, 'json');
        const stripped = stripJsonComments(text);
        const trimmed = stripped.trim();
        const data = trimmed === '' ? {} : JSON.parse(stripped);
        const root = TreeNode.fromJS(data);

        return new StructuredDocument(root, format);
    }

    /**
     * StructuredDocument を元の書式（インデント幅や末尾改行）を保持しながら JSON 文字列にシリアライズします。
     * @param document シリアライズ対象の StructuredDocument
     * @returns シリアライズされた JSON 文字列
     */
    public serialize(document: StructuredDocument): string {
        const js = document.toJS();
        const indent = document.format.indent;
        const serialized = JSON.stringify(js, null, indent);
        return this.formatPreserver.applyTrailingNewline(serialized, document.format);
    }
}
