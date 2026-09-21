import * as vscode from 'vscode';
import { JsonDocumentParser } from './infrastructure/parser/JsonDocumentParser';
import { YamlDocumentParser } from './infrastructure/parser/YamlDocumentParser';
import { ParseDocumentUseCase } from './application/usecase/ParseDocumentUseCase';
import { UpdateCellUseCase } from './application/usecase/UpdateCellUseCase';
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
} from './application/usecase/RowModificationUseCases';
import { WebviewRenderer } from './infrastructure/webview/WebviewRenderer';
import { StructGridEditorProvider } from './infrastructure/vscode/StructGridEditorProvider';

/**
 * VS Code 拡張機能のエントリーポイント（有効化処理）。
 * 依存性注入（DI）を行い、各パーサー、ユースケース、レンダラーを配線してカスタムエディタを登録します。
 * @param context 拡張機能コンテキスト
 */
export function activate(context: vscode.ExtensionContext) {
    // 1. アダプター & パーサーの初期化
    const jsonParser = new JsonDocumentParser();
    const yamlParser = new YamlDocumentParser();
    const parsers = [jsonParser, yamlParser];

    // 2. ユースケースの初期化
    const parseUseCase = new ParseDocumentUseCase(parsers);
    const updateCellUseCase = new UpdateCellUseCase(parsers);
    const addRowUseCase = new AddRowUseCase(parsers);
    const deleteRowUseCase = new DeleteRowUseCase(parsers);
    const addTableRowUseCase = new AddTableRowUseCase(parsers);
    const addTableColumnUseCase = new AddTableColumnUseCase(parsers);
    const renameTableColumnUseCase = new RenameTableColumnUseCase(parsers);
    const renameKeyUseCase = new RenameKeyUseCase(parsers);
    const moveTableRowUseCase = new MoveTableRowUseCase(parsers);
    const moveTableColumnUseCase = new MoveTableColumnUseCase(parsers);
    const clearTableColumnUseCase = new ClearTableColumnUseCase(parsers);
    const clearTableDataUseCase = new ClearTableDataUseCase(parsers);

    // 3. プレゼンター & レンダラーの初期化
    const renderer = new WebviewRenderer();

    // 4. VS Code カスタムエディタプロバイダーの登録
    context.subscriptions.push(
        StructGridEditorProvider.register(
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
        )
    );

    // 5. グリッドエディタで開くコマンドの登録
    context.subscriptions.push(
        vscode.commands.registerCommand('struct-grid-editor.openInGrid', async (uri?: vscode.Uri) => {
            const targetUri = uri ?? vscode.window.activeTextEditor?.document.uri;
            if (targetUri) {
                await vscode.commands.executeCommand('vscode.openWith', targetUri, StructGridEditorProvider.viewType);
            }
        })
    );
}

/**
 * VS Code 拡張機能の無効化処理。
 */
export function deactivate() {}