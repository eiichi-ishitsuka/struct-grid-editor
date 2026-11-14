import * as vscode from 'vscode';
import { JsonDocumentParser } from './infrastructure/parser/JsonDocumentParser';
import { YamlDocumentParser } from './infrastructure/parser/YamlDocumentParser';
import { JsonlDocumentParser } from './infrastructure/parser/JsonlDocumentParser';
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
import { WebviewRenderer } from './infrastructure/vscode/WebviewRenderer';
import { StructGridEditorProvider } from './infrastructure/vscode/StructGridEditorProvider';
import { MarkdownEditorProvider } from './infrastructure/vscode/MarkdownEditorProvider';

/**
 * VS Code 拡張機能のエントリーポイント（有効化処理）。
 * 依存性注入（DI）を行い、各パーサー、ユースケース、レンダラーを配線してカスタムエディタを登録します。
 * @param context 拡張機能コンテキスト
 */
export function activate(context: vscode.ExtensionContext) {
    // 1. アダプター & パーサーの初期化
    const jsonParser = new JsonDocumentParser();
    const yamlParser = new YamlDocumentParser();
    const jsonlParser = new JsonlDocumentParser();
    const parsers = [jsonParser, yamlParser, jsonlParser];

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

    // 4. VS Code カスタムエディタプロバイダーの登録 (JSON / YAML / JSONL + Markdown)
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

    context.subscriptions.push(MarkdownEditorProvider.register(context));

    // 5. エディタ切り替えコマンドの登録
    context.subscriptions.push(
        vscode.commands.registerCommand('struct-grid-editor.openInGrid', async (uri?: vscode.Uri) => {
            const targetUri = uri ?? getActiveUri();
            if (targetUri) {
                await vscode.commands.executeCommand('vscode.openWith', targetUri, StructGridEditorProvider.viewType);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('struct-grid-editor.openInMarkdownEditor', async (uri?: vscode.Uri) => {
            const targetUri = uri ?? getActiveUri();
            if (targetUri) {
                await vscode.commands.executeCommand('vscode.openWith', targetUri, MarkdownEditorProvider.viewType);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('struct-grid-editor.openMarkdownAsText', async (uri?: vscode.Uri) => {
            const targetUri = uri ?? getActiveUri();
            if (targetUri) {
                await vscode.commands.executeCommand('vscode.openWith', targetUri, 'default');
            }
        })
    );

    // 6. 拡張子ごとのデフォルトエディタ設定および Git diff 表示時のテキストエディタ優先設定を同期
    void ensureEditorAssociations();
    void ensureDiffEditorAssociations();

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('struct-grid-editor.openByDefault')) {
                void ensureEditorAssociations();
            }
        })
    );
}

/**
 * 現在アクティブなテキストエディタまたはカスタムエディタタブから対象ファイルの URI を取得します。
 * @returns 対象ファイルの URI（取得できない場合は undefined）
 */
function getActiveUri(): vscode.Uri | undefined {
    if (vscode.window.activeTextEditor) {
        return vscode.window.activeTextEditor.document.uri;
    }
    const activeTab = vscode.window.tabGroups.activeTabGroup.activeTab;
    if (activeTab?.input && typeof activeTab.input === 'object' && 'uri' in activeTab.input) {
        return (activeTab.input as { uri: vscode.Uri }).uri;
    }
    return undefined;
}

/**
 * `struct-grid-editor.openByDefault.*` の設定値に応じて VS Code の `workbench.editorAssociations` を同期します。
 * デフォルトでは Markdown (`.md`, `.markdown`) と JSONL (`.jsonl`) が有効、JSON と YAML が無効となります。
 */
async function ensureEditorAssociations(): Promise<void> {
    try {
        const extConfig = vscode.workspace.getConfiguration('struct-grid-editor');
        const openMarkdown = extConfig.get<boolean>('openByDefault.markdown', true);
        const openJsonl = extConfig.get<boolean>('openByDefault.jsonl', true);
        const openJson = extConfig.get<boolean>('openByDefault.json', false);
        const openYaml = extConfig.get<boolean>('openByDefault.yaml', false);

        const rules: Array<{ patterns: string[]; enabled: boolean; viewType: string }> = [
            {
                patterns: ['*.md', '*.markdown'],
                enabled: openMarkdown,
                viewType: MarkdownEditorProvider.viewType,
            },
            {
                patterns: ['*.jsonl'],
                enabled: openJsonl,
                viewType: StructGridEditorProvider.viewType,
            },
            {
                patterns: ['*.json'],
                enabled: openJson,
                viewType: StructGridEditorProvider.viewType,
            },
            {
                patterns: ['*.yaml', '*.yml'],
                enabled: openYaml,
                viewType: StructGridEditorProvider.viewType,
            },
        ];

        const workbenchConfig = vscode.workspace.getConfiguration('workbench');
        const current = workbenchConfig.get<Record<string, string>>('editorAssociations') || {};
        const updated: Record<string, string> = { ...current };
        let changed = false;

        for (const rule of rules) {
            for (const pattern of rule.patterns) {
                if (rule.enabled) {
                    if (!updated[pattern] || updated[pattern] === 'default') {
                        updated[pattern] = rule.viewType;
                        changed = true;
                    }
                } else {
                    if (updated[pattern] === rule.viewType) {
                        delete updated[pattern];
                        changed = true;
                    }
                }
            }
        }

        if (changed) {
            await workbenchConfig.update(
                'editorAssociations',
                updated,
                vscode.ConfigurationTarget.Global
            );
        }
    } catch {
        // 設定の自動書き込みに失敗した場合は無視
    }
}

/**
 * Git diff 表示時に通常のエディタ（Text Diff Editor）を優先するよう設定を構成します。
 */
async function ensureDiffEditorAssociations(): Promise<void> {
    try {
        const config = vscode.workspace.getConfiguration('workbench');
        const current = config.get<Record<string, string>>('diffEditorAssociations') || {};
        const needed: Record<string, string> = {
            '**/*.json': 'default',
            '**/*.yaml': 'default',
            '**/*.yml': 'default',
            '**/*.jsonl': 'default',
            '**/*.md': 'default',
            '**/*.markdown': 'default',
            '*.json': 'default',
            '*.yaml': 'default',
            '*.yml': 'default',
            '*.jsonl': 'default',
            '*.md': 'default',
            '*.markdown': 'default',
        };
        let changed = false;
        const updated = { ...current };
        for (const [pattern, editor] of Object.entries(needed)) {
            if (!updated[pattern]) {
                updated[pattern] = editor;
                changed = true;
            }
        }
        if (changed) {
            await config.update('diffEditorAssociations', updated, vscode.ConfigurationTarget.Global);
        }
    } catch {
        // 設定の自動書き込みに失敗した場合は無視
    }
}

/**
 * VS Code 拡張機能の無効化処理。
 */
export function deactivate() {}
