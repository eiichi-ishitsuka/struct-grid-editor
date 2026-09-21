import { StructuredDocument } from '../model/StructuredDocument';

/**
 * ドキュメントパーサーおよびシリアライザー（JSON、YAMLなど）のポートインターフェース。
 * 依存性逆転の原則（DIP）に準拠します。
 */
export interface IDocumentParser {
    /**
     * ソーステキストを解析し、ドメインの StructuredDocument 集約ルートを生成します。
     * @param text 解析対象の文字列
     * @returns 解析された StructuredDocument インスタンス
     */
    parse(text: string): StructuredDocument;

    /**
     * ドメインの StructuredDocument を、書式やコメントを保持しながらテキスト形式にシリアライズします。
     * @param document シリアライズ対象の StructuredDocument
     * @returns シリアライズされた文字列
     */
    serialize(document: StructuredDocument): string;

    /**
     * 指定されたファイル拡張子（例: "json", "yaml", "yml"）を本パーサーがサポートしているかを判定します。
     * @param fileExtension ファイルの拡張子
     * @returns サポートしている場合は true
     */
    supports(fileExtension: string): boolean;
}

