import { createRoot } from 'react-dom/client';
import './styles/webview.css';

/**
 * React 化後の Webview UI の起点。
 *
 * 現段階では既存の WebviewRenderer が画面を生成しているため、この root はまだ
 * HTML から読み込まれない。以降の工程で Renderer を HTML shell に置き換える際に、
 * App コンポーネントの描画先として利用する。
 */
function WebviewApp() {
    return null;
}

const rootElement = document.getElementById('app');
if (!rootElement) {
    throw new Error('Webview root element "#app" was not found.');
}

createRoot(rootElement).render(<WebviewApp />);
