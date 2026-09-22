import { IDocumentParser } from '../../domain/port/IDocumentParser';
import { StructuredDocument } from '../../domain/model/StructuredDocument';
import { TreeNode } from '../../domain/model/TreeNode';
import { DocumentFormat } from '../../domain/model/DocumentFormat';
import { stripJsonComments } from './JsonDocumentParser';

/**
 * JSONL（JSON Lines: 改行区切りJSON）ドキュメントの解析およびシリアライズを担うパーサー。
 * ファイル全体をトップレベル配列としてモデル化し、スプレッドシート形式での閲覧・編集を可能にします。
 */
export class JsonlDocumentParser implements IDocumentParser {
    /**
     * 指定された拡張子が JSONL であるかを判定します。
     * @param fileExtension 拡張子文字列（例: "jsonl", ".jsonl", "ndjson"）
     * @returns サポートしている場合は true
     */
    public supports(fileExtension: string): boolean {
        const ext = fileExtension.toLowerCase().replace(/^\./, '');
        return ext === 'jsonl' || ext === 'ndjson';
    }

    /**
     * JSONL 文字列を各行ごとに解析し、配列をルートとする StructuredDocument ドメインモデルを生成します。
     * 空行のスキップや JSONC コメント（//, /* ... *\/）の除去にも対応しています。
     * @param text 解析対象の JSONL 文字列
     * @returns 生成された StructuredDocument インスタンス
     */
    public parse(text: string): StructuredDocument {
        const hasTrailingNewline = text.endsWith('\n') || text.endsWith('\r\n');
        const newline = text.includes('\r\n') ? '\r\n' : '\n';

        const lines = text.split(/\r?\n/);
        const items: any[] = [];

        for (let i = 0; i < lines.length; i++) {
            const rawLine = lines[i];
            const stripped = stripJsonComments(rawLine).trim();
            if (stripped === '') {
                continue;
            }

            try {
                const parsed = JSON.parse(stripped);
                items.push(parsed);
            } catch (err: any) {
                throw new Error(`JSONL 解析エラー (${i + 1}行目): ${err.message}`);
            }
        }

        const root = TreeNode.fromJS(items);
        const format = new DocumentFormat({
            fileType: 'jsonl',
            indent: 0,
            hasTrailingNewline,
            metadata: {
                newline,
            },
        });

        return new StructuredDocument(root, format);
    }

    /**
     * StructuredDocument を1行1JSON形式（JSON Lines）の文字列にシリアライズします。
     * @param document シリアライズ対象の StructuredDocument
     * @returns シリアライズされた JSONL 文字列
     */
    public serialize(document: StructuredDocument): string {
        const js = document.toJS();
        const newline = (document.format.metadata?.newline as string) || '\n';
        const hasTrailingNewline = document.format.hasTrailingNewline;

        if (Array.isArray(js)) {
            if (js.length === 0) {
                return hasTrailingNewline ? newline : '';
            }
            const serializedLines = js.map(item => JSON.stringify(item));
            const joined = serializedLines.join(newline);
            return hasTrailingNewline ? joined + newline : joined;
        }

        // トップレベルが配列でない場合のフォールバック
        const serialized = JSON.stringify(js);
        return hasTrailingNewline ? serialized + newline : serialized;
    }
}
