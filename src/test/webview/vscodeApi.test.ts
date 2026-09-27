import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getVsCodeApi, resetVsCodeApiForTesting, tryGetVsCodeApi } from '../../webview/vscodeApi';

describe('vscodeApi wrapper', () => {
    beforeEach(() => {
        resetVsCodeApiForTesting();
    });

    afterEach(() => {
        resetVsCodeApiForTesting();
        vi.unstubAllGlobals();
    });

    /** 【観点】acquireVsCodeApi を複数回呼ばず、同一のインスタンスをキャッシュして返すこと */
    it('acquires the VS Code API once and returns the cached singleton', () => {
        const acquireMock = vi.fn().mockReturnValue({
            getState: vi.fn(),
            setState: vi.fn(),
            postMessage: vi.fn(),
        });
        vi.stubGlobal('acquireVsCodeApi', acquireMock);

        const api1 = getVsCodeApi();
        const api2 = tryGetVsCodeApi();
        const api3 = getVsCodeApi();

        expect(acquireMock).toHaveBeenCalledTimes(1);
        expect(api1).toBe(api2);
        expect(api2).toBe(api3);
    });

    /** 【観点】acquireVsCodeApi が未定義の環境で tryGetVsCodeApi が undefined を返すこと */
    it('returns undefined from tryGetVsCodeApi when outside VS Code webview', () => {
        const api = tryGetVsCodeApi();
        expect(api).toBeUndefined();
    });

    /** 【観点】acquireVsCodeApi が未定義の環境で getVsCodeApi がエラーをスローすること */
    it('throws from getVsCodeApi when outside VS Code webview', () => {
        expect(() => getVsCodeApi()).toThrow('acquireVsCodeApi is not available in this environment.');
    });
});
