import { createRoot } from 'react-dom/client';
import type { GridDataDto } from '../application/dto/GridData';
import { App } from './App';
import './styles/webview.css';

/**
 * React 化後の Webview UI の起点。
 *
 * 現段階では既存の WebviewRenderer が画面を生成しているため、この root はまだ
 * HTML から読み込まれない。以降の工程で Renderer を HTML shell に置き換える際に、
 * App コンポーネントの描画先として利用する。
 */
const rootElement = document.getElementById('app');
const initialData = rootElement?.dataset.initialData;

// 既存 UI を CSP 化した移行期間は legacy renderer が #app を描画する。
// data-react-ui が付いた HTML shell だけを React が所有する。
if (rootElement?.dataset.reactUi === 'true') {
    if (!initialData) {
        rootElement.innerHTML = '<div style="padding: 24px; color: var(--vscode-inputValidation-errorForeground, #f44336);">Webview の初期データが見つかりませんでした。</div>';
        throw new Error('Webview initial data was not found.');
    }

    try {
        const parsedData = JSON.parse(initialData) as GridDataDto;
        createRoot(rootElement).render(<App initialData={parsedData} />);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        rootElement.innerHTML = `<div style="padding: 24px; color: var(--vscode-inputValidation-errorForeground, #f44336);">画面の初期化に失敗しました: ${message}</div>`;
        console.error('Failed to initialize StructGridEditor webview:', err);
    }
}

