import { useCallback, useRef, useState } from 'react';
import { tryGetVsCodeApi, type VsCodeWebviewApi } from '../vscodeApi';

export type StateUpdater<TState> = TState | ((previousState: TState) => TState);

/** VS Code Webview state と React state を同期する。 */
export function useVsCodeState<TState>(initialState: TState) {
    const apiRef = useRef<VsCodeWebviewApi<TState> | undefined>(undefined);
    if (!apiRef.current) {
        apiRef.current = tryGetVsCodeApi<TState>();
    }

    const [state, setState] = useState<TState>(() => apiRef.current?.getState() ?? initialState);
    const setPersistedState = useCallback((updater: StateUpdater<TState>) => {
        setState(previousState => {
            const nextState = typeof updater === 'function'
                ? (updater as (state: TState) => TState)(previousState)
                : updater;
            apiRef.current?.setState(nextState);
            return nextState;
        });
    }, []);

    return [state, setPersistedState] as const;
}
