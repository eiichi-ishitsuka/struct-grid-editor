import * as vscode from 'vscode';
import { GridDataDto, TableViewDto } from '../../application/dto/GridData';

/**
 * GridDataDto を元にスプレッドシート・グリッドUIの完全な HTML 文字列を生成するレンダラー。
 */
export class WebviewRenderer {
    /**
     * グリッドデータ DTO から VS Code Webview 用の HTML 文字列を生成します。
     * @param data 描画対象の GridDataDto
     * @returns 生成された HTML 文字列
     */
    public render(data: GridDataDto, webview: vscode.Webview, extensionUri: vscode.Uri): string {
        if (data.error) {
            return this.renderError(data.error);
        }

        const jsonData = JSON.stringify(data).replace(/</g, '\\u003c');
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'dist', 'webview.js'));
        const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'dist', 'webview.css'));
        const nonce = this.getNonce();

        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${webview.cspSource}; img-src * data:; script-src 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval' ${webview.cspSource};">
    <title>StructGridEditor</title>
    <link href="${cssUri}" rel="stylesheet">
    <style>
        :root {
            --font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif);
        }
        body {
            font-family: var(--font-family);
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 16px;
            box-sizing: border-box;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script nonce="${nonce}">
        window.initialData = ${jsonData};
    </script>
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }

    private renderError(error: string): string {
        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
            padding: 24px;
        }
        .error-card {
            border: 1px solid var(--vscode-inputValidation-errorBorder, #f44336);
            background: var(--vscode-inputValidation-errorBackground, rgba(244, 67, 54, 0.1));
            padding: 16px;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="error-card">
        <h3 style="margin-top: 0;">構文エラー</h3>
        <p>${this.escapeHtml(error)}</p>
    </div>
</body>
</html>`;
    }

    private escapeHtml(str: string): string {
        return (str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    private getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}
