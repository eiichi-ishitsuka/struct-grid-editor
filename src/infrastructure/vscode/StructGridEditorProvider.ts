import * as vscode from 'vscode';
import * as path from 'path';
import { ParseDocumentUseCase } from '../../application/usecase/ParseDocumentUseCase';
import { UpdateCellUseCase } from '../../application/usecase/UpdateCellUseCase';
import {
    AddRowUseCase,
    DeleteRowUseCase,
    AddTableRowUseCase,
    AddTableColumnUseCase,
    RenameTableColumnUseCase,
    RenameKeyUseCase,
    MoveTableRowUseCase,
    MoveTableColumnUseCase,
    ClearTableColumnUseCase,
    ClearTableDataUseCase,
} from '../../application/usecase/RowModificationUseCases';
import { WebviewRenderer } from '../webview/WebviewRenderer';

/**
 * VS Code の CustomTextEditorProvider アダプター。
 * すべてのビジネス操作を Application 層のユースケースに委譲する薄いプレゼンテーション層です。
 */
export class StructGridEditorProvider implements vscode.CustomTextEditorProvider {
    public static readonly viewType = 'struct-grid-editor.jsonEditor';

    /**
     * VS Code のカスタムエディタプロバイダーとして本クラスを登録します。
     * @param context 拡張機能コンテキスト
     * @param parseUseCase ドキュメント解析ユースケース
     * @param updateCellUseCase セル更新ユースケース
     * @param addRowUseCase 行追加ユースケース
     * @param deleteRowUseCase 行削除ユースケース
     * @param addTableRowUseCase テーブル行追加ユースケース
     * @param addTableColumnUseCase テーブル列追加ユースケース
     * @param renameTableColumnUseCase カラム名変更ユースケース
     * @param renameKeyUseCase キー名変更ユースケース
     * @param moveTableRowUseCase 行並び替えユースケース
     * @param moveTableColumnUseCase 列並び替えユースケース
     * @param renderer Webview HTML レンダラー
     * @returns リソース解放用の Disposable
     */
    public static register(
        context: vscode.ExtensionContext,
        parseUseCase: ParseDocumentUseCase,
        updateCellUseCase: UpdateCellUseCase,
        addRowUseCase: AddRowUseCase,
        deleteRowUseCase: DeleteRowUseCase,
        addTableRowUseCase: AddTableRowUseCase,
        addTableColumnUseCase: AddTableColumnUseCase,
        renameTableColumnUseCase: RenameTableColumnUseCase,
        renameKeyUseCase: RenameKeyUseCase,
        moveTableRowUseCase: MoveTableRowUseCase,
        moveTableColumnUseCase: MoveTableColumnUseCase,
        renderer: WebviewRenderer,
        clearTableColumnUseCase?: ClearTableColumnUseCase,
        clearTableDataUseCase?: ClearTableDataUseCase
    ): vscode.Disposable {
        const provider = new StructGridEditorProvider(
            context,
            parseUseCase,
            updateCellUseCase,
            addRowUseCase,
            deleteRowUseCase,
            addTableRowUseCase,
            addTableColumnUseCase,
            renameTableColumnUseCase,
            renameKeyUseCase,
            moveTableRowUseCase,
            moveTableColumnUseCase,
            renderer,
            clearTableColumnUseCase,
            clearTableDataUseCase
        );
        return vscode.window.registerCustomEditorProvider(
            StructGridEditorProvider.viewType,
            provider
        );
    }

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly parseUseCase: ParseDocumentUseCase,
        private readonly updateCellUseCase: UpdateCellUseCase,
        private readonly addRowUseCase: AddRowUseCase,
        private readonly deleteRowUseCase: DeleteRowUseCase,
        private readonly addTableRowUseCase: AddTableRowUseCase,
        private readonly addTableColumnUseCase: AddTableColumnUseCase,
        private readonly renameTableColumnUseCase: RenameTableColumnUseCase,
        private readonly renameKeyUseCase: RenameKeyUseCase,
        private readonly moveTableRowUseCase: MoveTableRowUseCase,
        private readonly moveTableColumnUseCase: MoveTableColumnUseCase,
        private readonly renderer: WebviewRenderer,
        private readonly clearTableColumnUseCase?: ClearTableColumnUseCase,
        private readonly clearTableDataUseCase?: ClearTableDataUseCase
    ) {}

    /**
     * カスタムテキストエディタの Webview を初期化・バインドします。
     * @param document 対象の VS Code テキストドキュメント
     * @param webviewPanel 描画対象の WebviewPanel
     * @param _token キャンセレーショントークン
     */
    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
        };

        const getFileExtension = () => {
            const ext = path.extname(document.fileName).replace(/^\./, '');
            return ext.toLowerCase();
        };

        const updateWebview = () => {
            const text = document.getText();
            const ext = getFileExtension();
            const result = this.parseUseCase.execute(text, ext);
            webviewPanel.webview.html = this.renderer.render(result.dto, webviewPanel.webview, this.context.extensionUri);
        };

        // Webview からの操作メッセージを受信して対応するユースケースを実行
        webviewPanel.webview.onDidReceiveMessage(async (message) => {
            const ext = getFileExtension();
            const text = document.getText();

            try {
                let newText: string | undefined;

                switch (message.command) {
                    case 'update_cell': {
                        newText = this.updateCellUseCase.execute(
                            text,
                            ext,
                            message.path,
                            message.value
                        );
                        break;
                    }
                    case 'add_row': {
                        newText = this.addRowUseCase.execute(
                            text,
                            ext,
                            message.parentPath,
                            message.key,
                            message.value
                        );
                        break;
                    }
                    case 'delete_row': {
                        newText = this.deleteRowUseCase.execute(
                            text,
                            ext,
                            message.path
                        );
                        break;
                    }
                    case 'add_table_row': {
                        newText = this.addTableRowUseCase.execute(
                            text,
                            ext,
                            message.arrayPath || '',
                            message.rowData
                        );
                        break;
                    }
                    case 'add_table_column': {
                        newText = this.addTableColumnUseCase.execute(
                            text,
                            ext,
                            message.arrayPath || '',
                            message.columnKey
                        );
                        break;
                    }
                    case 'rename_table_column': {
                        newText = this.renameTableColumnUseCase.execute(
                            text,
                            ext,
                            message.arrayPath || '',
                            message.oldKey,
                            message.newKey
                        );
                        break;
                    }
                    case 'rename_key': {
                        newText = this.renameKeyUseCase.execute(
                            text,
                            ext,
                            message.path,
                            message.newKey
                        );
                        break;
                    }
                    case 'move_table_row': {
                        newText = this.moveTableRowUseCase.execute(
                            text,
                            ext,
                            message.arrayPath || '',
                            message.fromIndex,
                            message.toIndex
                        );
                        break;
                    }
                    case 'move_table_column': {
                        newText = this.moveTableColumnUseCase.execute(
                            text,
                            ext,
                            message.arrayPath || '',
                            message.fromIndex,
                            message.toIndex
                        );
                        break;
                    }
                    case 'clear_table_column': {
                        if (this.clearTableColumnUseCase) {
                            newText = this.clearTableColumnUseCase.execute(
                                text,
                                ext,
                                message.arrayPath || '',
                                message.columnKey
                            );
                        }
                        break;
                    }
                    case 'clear_table_data': {
                        if (this.clearTableDataUseCase) {
                            newText = this.clearTableDataUseCase.execute(
                                text,
                                ext,
                                message.arrayPath || ''
                            );
                        }
                        break;
                    }
                    case 'open_text_editor': {
                        await vscode.commands.executeCommand('vscode.openWith', document.uri, 'default');
                        return;
                    }
                }

                // テキスト変更がある場合は WorkspaceEdit を通じてドキュメントに適用
                if (newText !== undefined && newText !== text) {
                    const edit = new vscode.WorkspaceEdit();
                    edit.replace(
                        document.uri,
                        new vscode.Range(0, 0, document.lineCount, 0),
                        newText
                    );
                    await vscode.workspace.applyEdit(edit);
                }
            } catch (err: any) {
                vscode.window.showErrorMessage(`エラーが発生しました: ${err?.message}`);
            }
        });

        updateWebview();

        // 外部または元テキストエディタで内容が変更された場合に自動追従更新
        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateWebview();
            }
        });

        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });
    }
}
