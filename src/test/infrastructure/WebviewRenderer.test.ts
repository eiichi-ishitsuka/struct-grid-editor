import { describe, expect, it } from 'vitest';
import { JsonDocumentParser } from '../../infrastructure/parser/JsonDocumentParser';
import { ParseDocumentUseCase } from '../../application/usecase/ParseDocumentUseCase';
import { WebviewAssets, WebviewRenderer } from '../../infrastructure/vscode/WebviewRenderer';

const assets: WebviewAssets = {
    cspSource: 'vscode-webview://test-origin',
    styleUri: 'vscode-webview://test-origin/webview/main.css',
    scriptUri: 'vscode-webview://test-origin/webview/main.js',
};

describe('WebviewRenderer', () => {
    const renderer = new WebviewRenderer();
    const parser = new JsonDocumentParser();
    const useCase = new ParseDocumentUseCase([parser]);

    /** 【観点】Webview の実行に必要な最小 HTML shell とローカル bundle を出力すること */
    it('renders a CSP-protected HTML shell with local assets', () => {
        const data = useCase.execute('[{"id": 1}]', 'json').dto;
        const html = renderer.render(data, assets);

        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('id="app"');
        expect(html).toContain('data-react-ui="true"');
        expect(html).toContain('data-initial-data=');
        expect(html).toContain(`<link rel="stylesheet" href="${assets.styleUri}">`);
        expect(html).toContain(`<script nonce=`);
        expect(html).toContain(`src="${assets.scriptUri}"`);
        expect(html).toContain(`style-src ${assets.cspSource}`);
        expect(html).toContain(`script-src ${assets.cspSource}`);

        const nonce = html.match(/<script nonce="([^"]+)"/)?.[1];
        expect(nonce).toBeTruthy();
        expect(html).toContain(`'nonce-${nonce}'`);
        expect(html).toContain(`<script nonce="${nonce}" src="${assets.scriptUri}"></script>`);
    });

    /** 【観点】初期データ内のタグをスクリプトとして解釈させないこと */
    it('escapes HTML-like initial data before embedding it in the shell', () => {
        const data = useCase.execute('{"value":"</script><img src=x onerror=alert(1)>"}', 'json').dto;
        const html = renderer.render(data, assets);

        expect(html).toContain('\\u003c/script&gt;\\u003cimg src=x onerror=alert(1)&gt;');
        expect(html).not.toContain('</script><img src=x onerror=alert(1)>');
    });

    /** 【観点】構文エラー画面にも同じ CSP と nonce を適用すること */
    it('renders the error view with the same CSP protections', () => {
        const html = renderer.render({ error: '<invalid>' } as ReturnType<typeof useCase.execute>['dto'], assets);

        expect(html).toContain(`style-src ${assets.cspSource}`);
        expect(html).toContain('nonce=');
        expect(html).toContain('&lt;invalid&gt;');
        expect(html).not.toContain('<p><invalid></p>');
    });
});
