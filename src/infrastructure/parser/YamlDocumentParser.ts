import { parseDocument, stringify, Document } from 'yaml';
import { IDocumentParser } from '../../domain/port/IDocumentParser';
import { StructuredDocument } from '../../domain/model/StructuredDocument';
import { TreeNode } from '../../domain/model/TreeNode';
import { DocumentFormat } from '../../domain/model/DocumentFormat';
import { FormatPreserver } from '../../domain/service/FormatPreserver';

/**
 * YAMLドキュメントの解析およびシリアライズを担うインフラストラクチャ層のアダプター。
 * `yaml` ライブラリの AST を活用し、コメントや書式を最大限保持します。
 */
export class YamlDocumentParser implements IDocumentParser {
    constructor(private readonly formatPreserver: FormatPreserver = new FormatPreserver()) {}

    /**
     * 指定された拡張子が YAML であるかを判定します。
     * @param fileExtension 拡張子文字列（例: "yaml", "yml"）
     * @returns サポートしている場合は true
     */
    public supports(fileExtension: string): boolean {
        const ext = fileExtension.toLowerCase().replace(/^\./, '');
        return ext === 'yaml' || ext === 'yml';
    }

    /**
     * YAML 文字列を解析し、StructuredDocument ドメインモデルを生成します。
     * @param text 解析対象の YAML 文字列
     * @returns 生成された StructuredDocument インスタンス
     */
    public parse(text: string): StructuredDocument {
        const detectedFormat = this.formatPreserver.detectFormat(text, 'yaml');
        const trimmed = text.trim();

        if (trimmed === '') {
            const root = TreeNode.fromJS({});
            return new StructuredDocument(root, detectedFormat);
        }

        const yamlDoc = parseDocument(text);
        const data = yamlDoc.toJS();
        const root = TreeNode.fromJS(data);

        const format = new DocumentFormat({
            fileType: 'yaml',
            indent: typeof detectedFormat.indent === 'number' ? detectedFormat.indent : 2,
            hasTrailingNewline: detectedFormat.hasTrailingNewline,
            metadata: {
                yamlDoc,
            },
        });

        return new StructuredDocument(root, format);
    }

    /**
     * StructuredDocument をコメントやインデントを保持しながら YAML 文字列にシリアライズします。
     * @param document シリアライズ対象の StructuredDocument
     * @returns シリアライズされた YAML 文字列
     */
    public serialize(document: StructuredDocument): string {
        const yamlDoc = document.format.metadata.yamlDoc as Document | undefined;

        if (yamlDoc) {
            // コメントやレイアウトを保持しつつ、更新後のJavaScriptデータをYAML ASTに同期
            try {
                const js = document.toJS();
                const newDoc = new Document(js);
                const indent = typeof document.format.indent === 'number' ? document.format.indent : 2;
                yamlDoc.contents = newDoc.contents;
                const output = yamlDoc.toString({ indent });
                return this.formatPreserver.applyTrailingNewline(output, document.format);
            } catch {
                // AST同期で例外が発生した場合は通常の文字列化にフォールバック
            }
        }

        const indent = typeof document.format.indent === 'number' ? document.format.indent : 2;
        const serialized = stringify(document.toJS(), { indent });
        return this.formatPreserver.applyTrailingNewline(serialized, document.format);
    }
}
