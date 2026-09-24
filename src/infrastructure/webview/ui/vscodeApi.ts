import type { WebviewMessage } from '../protocol';

/** VS Code が Webview に公開する状態・通信 API。 */
export interface VsCodeWebviewApi<TState = unknown> {
    getState(): TState | undefined;
    setState(newState: TState): void;
    postMessage(message: WebviewMessage): void;
}

declare const acquireVsCodeApi: <TState = unknown>() => VsCodeWebviewApi<TState>;

/** React コンポーネントから利用する VS Code Webview API を取得する。 */
export function getVsCodeApi<TState = unknown>(): VsCodeWebviewApi<TState> {
    return acquireVsCodeApi<TState>();
}
