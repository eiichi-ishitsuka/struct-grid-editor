import { IDocumentParser } from '../../domain/port/IDocumentParser';
import { StructuredDocument } from '../../domain/model/StructuredDocument';
import { TreeNode } from '../../domain/model/TreeNode';
import { FormatPreserver } from '../../domain/service/FormatPreserver';

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
     * @param text 解析対象の JSON 文字列
     * @returns 生成された StructuredDocument インスタンス
     */
    public parse(text: string): StructuredDocument {
        const format = this.formatPreserver.detectFormat(text, 'json');
        const trimmed = text.trim();
        const data = trimmed === '' ? {} : JSON.parse(text);
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
