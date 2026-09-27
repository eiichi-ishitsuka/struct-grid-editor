import type { WebviewMessage } from './protocol';

/** VS Code が Webview に公開する状態・通信 API。 */
export interface VsCodeWebviewApi<TState = unknown> {
    getState(): TState | undefined;
    setState(newState: TState): void;
    postMessage(message: WebviewMessage): void;
}

declare const acquireVsCodeApi: (<TState = unknown>() => VsCodeWebviewApi<TState>) | undefined;

let vsCodeApiInstance: VsCodeWebviewApi<any> | undefined;

/** React コンポーネントから利用する VS Code Webview API を取得する。 */
export function getVsCodeApi<TState = unknown>(): VsCodeWebviewApi<TState> {
    if (!vsCodeApiInstance) {
        if (typeof acquireVsCodeApi !== 'function') {
            throw new Error('acquireVsCodeApi is not available in this environment.');
        }
        vsCodeApiInstance = acquireVsCodeApi<TState>();
    }
    return vsCodeApiInstance as VsCodeWebviewApi<TState>;
}

/** VS Code 外のコンポーネントテストでは API を持たない状態を許容する。 */
export function tryGetVsCodeApi<TState = unknown>(): VsCodeWebviewApi<TState> | undefined {
    if (!vsCodeApiInstance && typeof acquireVsCodeApi === 'function') {
        try {
            vsCodeApiInstance = acquireVsCodeApi<TState>();
        } catch {
            // 既に取得済み等の例外時は既存インスタンスまたは undefined を維持
        }
    }
    return vsCodeApiInstance as VsCodeWebviewApi<TState> | undefined;
}

/** テスト用: キャッシュされた VS Code API インスタンスを破棄する。 */
export function resetVsCodeApiForTesting(): void {
    vsCodeApiInstance = undefined;
}

