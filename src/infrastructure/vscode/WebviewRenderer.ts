import { randomBytes } from 'crypto';
import type { GridDataDto } from '../../application/dto/GridData';

/** Webview 内で許可する拡張機能リソース。 */
export interface WebviewAssets {
    cspSource: string;
    styleUri: string;
    scriptUri: string;
}

/**
 * GridDataDto を受け取り、React UI をホストする安全な HTML shell を生成するレンダラー。
 * UI の描画・状態管理・イベント処理は React アプリケーション (main.js) が担当する。
 */
export class WebviewRenderer {
    /**
     * グリッドデータ DTO から VS Code Webview 用の HTML shell 文字列を生成します。
     * @param data 描画対象の GridDataDto
     * @param assets Webview で読み込む静的アセット情報
     * @returns 生成された HTML 文字列
     */
    public render(data: GridDataDto, assets: WebviewAssets): string {
        if (data.error) {
            return this.renderError(data.error, assets);
        }

        const jsonData = JSON.stringify(data).replace(/</g, '\\u003c');
        const nonce = this.createNonce();
        const initialData = this.escapeHtml(jsonData);

        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="${this.createContentSecurityPolicy(assets.cspSource, nonce)}">
    <title>StructGridEditor</title>
    <link rel="stylesheet" href="${this.escapeHtml(assets.styleUri)}">
</head>
<body>
    <div id="app" data-react-ui="true" data-initial-data="${initialData}"></div>
    <script nonce="${nonce}" src="${this.escapeHtml(assets.scriptUri)}"></script>
</body>
</html>`;
    }

    private renderError(error: string, assets: WebviewAssets): string {
        const nonce = this.createNonce();

        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="${this.createContentSecurityPolicy(assets.cspSource, nonce)}">
    <link rel="stylesheet" href="${this.escapeHtml(assets.styleUri)}">
    <style nonce="${nonce}">
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

    private createNonce(): string {
        return randomBytes(16).toString('base64');
    }

    private createContentSecurityPolicy(cspSource: string, nonce: string): string {
        const source = this.escapeHtml(cspSource);
        return `default-src 'none'; style-src ${source} 'nonce-${nonce}'; script-src ${source} 'nonce-${nonce}';`;
    }
}
