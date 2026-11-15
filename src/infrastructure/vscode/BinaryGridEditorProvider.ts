import * as vscode from 'vscode';
import * as path from 'path';
import { ParseDocumentUseCase } from '../../application/usecase/ParseDocumentUseCase';
import type { GridDataDto } from '../../application/dto/GridData';
import type { DocumentFileType } from '../../domain/model/DocumentFormat';
import { parseAvroBuffer, parseParquetBuffer } from '../parser/BinaryDocumentParser';
import { WebviewRenderer } from './WebviewRenderer';

/**
 * Apache Parquet / Apache Avro 等のバイナリ構造化データを読み取り専用で表示する
 * VS Code CustomReadonlyEditorProvider 実装。
 */
export class BinaryGridEditorProvider implements vscode.CustomReadonlyEditorProvider {
    public static readonly viewType = 'struct-grid-editor.binaryGridEditor';

    /**
     * バイナリカスタムエディタプロバイダーを VS Code に登録します。
     * @param context 拡張機能コンテキスト
     * @param parseUseCase ドキュメント変換ユースケース
     * @param renderer Webview HTML レンダラー
     * @returns リソース解放用の Disposable
     */
    public static register(
        context: vscode.ExtensionContext,
        parseUseCase: ParseDocumentUseCase,
        renderer: WebviewRenderer
    ): vscode.Disposable {
        const provider = new BinaryGridEditorProvider(context, parseUseCase, renderer);
        return vscode.window.registerCustomEditorProvider(
            BinaryGridEditorProvider.viewType,
            provider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true,
                },
            }
        );
    }

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly parseUseCase: ParseDocumentUseCase,
        private readonly renderer: WebviewRenderer
    ) {}

    public async openCustomDocument(
        uri: vscode.Uri,
        _openContext: vscode.CustomDocumentOpenContext,
        _token: vscode.CancellationToken
    ): Promise<vscode.CustomDocument> {
        return {
            uri,
            dispose: () => {},
        };
    }

    public async resolveCustomEditor(
        document: vscode.CustomDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview')],
        };

        const ext = path.extname(document.uri.fsPath).toLowerCase().replace(/^\./, '');
        const docType: DocumentFileType = ext === 'avro' ? 'avro' : 'parquet';

        let dto: GridDataDto;
        try {
            const bytes = await vscode.workspace.fs.readFile(document.uri);
            const result = docType === 'avro'
                ? await parseAvroBuffer(bytes)
                : await parseParquetBuffer(bytes);

            dto = this.parseUseCase.toGridDataDto(result.document, {
                readOnly: true,
                isTruncated: result.isTruncated,
                totalSourceRows: result.totalSourceRows,
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            dto = {
                documentType: docType,
                viewMode: 'table',
                rows: [],
                totalRows: 0,
                readOnly: true,
                error: `${docType.toUpperCase()} ファイルの解析に失敗しました: ${message}`,
            };
        }

        const styleUri = webviewPanel.webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview', 'main.css')
        ).toString();
        const scriptUri = webviewPanel.webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview', 'main.js')
        ).toString();

        webviewPanel.webview.html = this.renderer.render(dto, {
            cspSource: webviewPanel.webview.cspSource,
            styleUri,
            scriptUri,
        });
    }
}
