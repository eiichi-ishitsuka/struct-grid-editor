import { DocumentFormat, DocumentFileType } from '../model/DocumentFormat';

/**
 * インデント幅、改行コード、末尾改行などのドキュメント書式特性を検出・保持するドメインサービス。
 */
export class FormatPreserver {
    /**
     * ソーステキストを検査し、ドキュメントの書式プロパティ（インデント幅や末尾改行の有無）を検出します。
     * @param text ソーステキスト文字列
     * @param fileType ファイル種別 ('json' または 'yaml')
     * @returns 検出された書式情報を持つ DocumentFormat インスタンス
     */
    public detectFormat(text: string, fileType: DocumentFileType): DocumentFormat {
        const hasTrailingNewline = text.endsWith('\n') || text.endsWith('\r\n');
        const indent = this.detectIndent(text);

        return new DocumentFormat({
            fileType,
            indent,
            hasTrailingNewline,
        });
    }

    /**
     * テキスト内のインデント（スペース数またはタブ）を検出します。
     * @param text 検査対象のテキスト
     * @returns インデントのスペース数、またはタブ文字列
     */
    public detectIndent(text: string): number | string {
        const lines = text.split(/\r?\n/);
        for (const line of lines) {
            const match = line.match(/^([ \t]+)\S/);
            if (match) {
                const indentStr = match[1];
                if (indentStr.startsWith('\t')) {
                    return '\t';
                }
                return indentStr.length;
            }
        }
        return 2; // デフォルトは2スペース
    }

    /**
     * DocumentFormat の設定に従って、シリアライズ後のテキスト末尾に改行を適用します。
     * @param text 適用対象のテキスト
     * @param format 書式設定
     * @returns 末尾改行が整形されたテキスト
     */
    public applyTrailingNewline(text: string, format: DocumentFormat): string {
        const trimmed = text.replace(/[\r\n]+$/, '');
        return format.hasTrailingNewline ? trimmed + '\n' : trimmed;
    }
}
