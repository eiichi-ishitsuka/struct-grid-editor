import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Markdown ファイルを WYSIWYG / Live Preview 形式で表示・編集する VS Code カスタムテキストエディタプロバイダー。
 * ドキュメントの双方向同期、ローカル画像パスの Webview URI 変換、およびクリップボード画像の保存処理を担当します。
 */
export class MarkdownEditorProvider implements vscode.CustomTextEditorProvider {
  /** カスタムエディタのビュータイプ識別子 */
  public static readonly viewType = 'struct-grid-editor.markdownEditor';

  /**
   * カスタムエディタプロバイダーを VS Code に登録します。
   * @param context 拡張機能コンテキスト
   * @returns 購読解除用の Disposable
   */
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new MarkdownEditorProvider(context);
    return vscode.window.registerCustomEditorProvider(
      MarkdownEditorProvider.viewType,
      provider,
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
        supportsMultipleEditorsPerDocument: false,
      }
    );
  }

  /**
   * プロバイダーのインスタンスを生成します。
   * @param context 拡張機能コンテキスト
   */
  constructor(private readonly context: vscode.ExtensionContext) {}

  /**
   * カスタムテキストエディタの Webview パネルを初期化し、対象ドキュメントと双方向バインディングします。
   * @param document 対象の Markdown テキストドキュメント
   * @param webviewPanel 表示先の Webview パネル
   * @param _token キャンセルトークン
   */
  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    const docDir = vscode.Uri.file(path.dirname(document.uri.fsPath));
    const workspaceRoots = (vscode.workspace.workspaceFolders ?? []).map((f) => f.uri);

    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'md-webview'),
        docDir,
        ...workspaceRoots,
      ],
    };

    let lastContentFromWebview = document.getText();
    let isApplyingWebviewEdit = false;

    const getBaseUriString = () => {
      const baseUri = webviewPanel.webview.asWebviewUri(docDir);
      return baseUri.toString().replace(/\/$/, '');
    };

    const sendDocumentToWebview = () => {
      const text = document.getText();
      if (text === lastContentFromWebview) {
        return;
      }
      lastContentFromWebview = text;
      webviewPanel.webview.postMessage({
        type: 'update',
        text,
        baseUri: getBaseUriString(),
      });
    };

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() === document.uri.toString()) {
        if (!isApplyingWebviewEdit && e.contentChanges.length > 0) {
          sendDocumentToWebview();
        }
      }
    });

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });

    webviewPanel.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'ready': {
          lastContentFromWebview = document.getText();
          webviewPanel.webview.postMessage({
            type: 'init',
            text: lastContentFromWebview,
            baseUri: getBaseUriString(),
          });
          break;
        }

        case 'edit': {
          const newText: string = message.text;
          if (newText === document.getText()) {
            return;
          }
          lastContentFromWebview = newText;
          isApplyingWebviewEdit = true;
          try {
            const edit = new vscode.WorkspaceEdit();
            edit.replace(
              document.uri,
              new vscode.Range(0, 0, document.lineCount, 0),
              newText
            );
            await vscode.workspace.applyEdit(edit);
          } finally {
            isApplyingWebviewEdit = false;
          }
          break;
        }

        case 'saveImage': {
          try {
            const { base64, ext } = message as { base64: string; ext: string };
            const config = vscode.workspace.getConfiguration('struct-grid-editor', document.uri);
            const assetsFolder =
              config.get<string>('markdownAssetsFolder', 'assets').trim() || 'assets';
            const docDirPath = path.dirname(document.uri.fsPath);
            const targetDir = path.join(docDirPath, assetsFolder);

            await fs.promises.mkdir(targetDir, { recursive: true });

            const timestamp = new Date()
              .toISOString()
              .replace(/[-:T.Z]/g, '')
              .slice(0, 14);
            const rand = Math.random().toString(36).slice(2, 6);
            const safeExt = (ext || 'png').replace(/[^a-zA-Z0-9]/g, '');
            const fileName = `image-${timestamp}-${rand}.${safeExt}`;
            const fullPath = path.join(targetDir, fileName);

            const buffer = Buffer.from(base64, 'base64');
            await fs.promises.writeFile(fullPath, buffer);

            const relativePath = path.posix.join(assetsFolder.replace(/\\/g, '/'), fileName);
            const webviewUri = webviewPanel.webview
              .asWebviewUri(vscode.Uri.file(fullPath))
              .toString();

            webviewPanel.webview.postMessage({
              type: 'imageSaved',
              relativePath,
              webviewUri,
              alt: fileName,
            });
          } catch (err) {
            vscode.window.showErrorMessage(
              `画像の保存に失敗しました: ${err instanceof Error ? err.message : String(err)}`
            );
          }
          break;
        }

        case 'pickImage': {
          const uris = await vscode.window.showOpenDialog({
            canSelectMany: false,
            openLabel: '画像を挿入',
            filters: {
              Images: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'],
            },
            defaultUri: docDir,
          });
          if (uris && uris.length > 0) {
            const pickedUri = uris[0];
            const docDirPath = path.dirname(document.uri.fsPath);
            let relPath = path.relative(docDirPath, pickedUri.fsPath).replace(/\\/g, '/');
            if (!relPath.startsWith('.') && !relPath.startsWith('/')) {
              relPath = `./${relPath}`;
            }
            const webviewUri = webviewPanel.webview.asWebviewUri(pickedUri).toString();
            webviewPanel.webview.postMessage({
              type: 'imageSaved',
              relativePath: relPath,
              webviewUri,
              alt: path.basename(pickedUri.fsPath),
            });
          }
          break;
        }

        case 'switchToText': {
          await vscode.commands.executeCommand('vscode.openWith', document.uri, 'default');
          break;
        }

        case 'openLink': {
          if (typeof message.href === 'string' && message.href) {
            await this.handleOpenLink(document, message.href);
          }
          break;
        }
      }
    });

    webviewPanel.webview.html = this.getHtmlForWebview(
      webviewPanel.webview,
      lastContentFromWebview,
      getBaseUriString()
    );
  }

  /**
   * エディタ内のリンクが Ctrl/Cmd + クリックされた際の遷移処理を行います。
   * - http / https 等の外部 URL: 確認ダイアログを表示し、承認された場合のみ外部ブラウザで開きます。
   * - ローカルファイルパス（相対パス・絶対パス）: ドキュメント基準（またはワークスペース基準）で解決し、ファイルが存在する場合のみ新しいタブで開きます（存在しない場合はスキップ）。
   * @param document 現在の Markdown ドキュメント
   * @param rawHref クリックされたリンクの href 属性値
   */
  public async handleOpenLink(document: vscode.TextDocument, rawHref: string): Promise<void> {
    const href = rawHref.trim();
    if (!href || href.startsWith('#')) {
      return;
    }

    // インターネット上の外部 URL (http / https / mailto)
    if (/^(https?:\/\/|mailto:)/i.test(href)) {
      const confirmOption = '開く';
      const choice = await vscode.window.showInformationMessage(
        `外部リンクをブラウザで開きますか？\n${href}`,
        { modal: true },
        confirmOption
      );
      if (choice === confirmOption) {
        await vscode.env.openExternal(vscode.Uri.parse(href));
      }
      return;
    }

    // ローカルファイルパスの解決（#fragment や ?query を除去してファイル存在確認）
    const pathWithoutHashOrQuery = href.split('#')[0].split('?')[0];
    if (!pathWithoutHashOrQuery) {
      return;
    }

    let decodedPath = pathWithoutHashOrQuery;
    try {
      decodedPath = decodeURIComponent(pathWithoutHashOrQuery);
    } catch {
      // デコード失敗時は元の文字列をそのまま使用
    }

    const docDirPath = path.dirname(document.uri.fsPath);
    const candidatePaths: string[] = [];

    if (decodedPath.startsWith('file://')) {
      try {
        candidatePaths.push(vscode.Uri.parse(decodedPath).fsPath);
      } catch {
        // 無視
      }
    } else if (path.isAbsolute(decodedPath)) {
      // 先頭スラッシュの場合はワークスペースルート相対と絶対パスの両方を候補にする
      const wsFolder = vscode.workspace.getWorkspaceFolder(document.uri);
      if (wsFolder) {
        candidatePaths.push(path.join(wsFolder.uri.fsPath, decodedPath.replace(/^\/+/, '')));
      }
      candidatePaths.push(decodedPath);
    } else {
      // 1. 現在の Markdown ファイルの親ディレクトリ基準で解決
      candidatePaths.push(path.resolve(docDirPath, decodedPath));
      // 2. ワークスペースルート基準のフォールバック
      const wsFolder = vscode.workspace.getWorkspaceFolder(document.uri);
      if (wsFolder) {
        candidatePaths.push(path.resolve(wsFolder.uri.fsPath, decodedPath));
      }
    }

    for (const candidate of candidatePaths) {
      try {
        const stat = await fs.promises.stat(candidate);
        if (stat.isFile()) {
          const targetUri = vscode.Uri.file(candidate);
          await vscode.commands.executeCommand('vscode.open', targetUri, {
            preview: false,
          });
          return;
        }
      } catch {
        // 存在しない場合は次の候補へ（すべて存在しなければスキップ）
      }
    }
  }

  private getHtmlForWebview(
    webview: vscode.Webview,
    initialText: string,
    baseUri: string
  ): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'md-webview', 'index.js')
    );
    const mermaidScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'md-webview', 'mermaid.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'md-webview', 'styles.css')
    );
    const katexStyleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'md-webview', 'katex.min.css')
    );
    const nonce = getNonce();

    const initialPayload = JSON.stringify({
      text: initialText,
      baseUri,
    }).replace(/</g, '\\u003c');

    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: http: data: blob:; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource} data:; script-src 'nonce-${nonce}';">
  <link href="${katexStyleUri}" rel="stylesheet">
  <link href="${styleUri}" rel="stylesheet">
  <title>Markdown Live Preview Editor</title>
</head>
<body>
  <div id="app">
    <div id="toolbar-container"></div>
    <div id="table-Banner-container"></div>
    <div id="editor-wrapper">
      <div id="editor"></div>
    </div>
    <div id="slash-menu" class="slash-menu hidden"></div>
    <div id="status-bar">
      <span id="status-info">WYSIWYG Mode — <code>/</code> でブロック挿入</span>
      <span id="status-stats">0 文字</span>
    </div>
  </div>
  <script id="initial-data" type="application/json" nonce="${nonce}">${initialPayload}</script>
  <script nonce="${nonce}" src="${scriptUri}"></script>
  <script nonce="${nonce}" defer src="${mermaidScriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

