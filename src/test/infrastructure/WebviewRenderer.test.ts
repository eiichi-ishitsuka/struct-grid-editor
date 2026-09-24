import { describe, it, expect } from 'vitest';
import { WebviewRenderer } from '../../infrastructure/webview/WebviewRenderer';
import { JsonDocumentParser } from '../../infrastructure/parser/JsonDocumentParser';
import { YamlDocumentParser } from '../../infrastructure/parser/YamlDocumentParser';
import { ParseDocumentUseCase } from '../../application/usecase/ParseDocumentUseCase';
import * as fs from 'fs';
import * as path from 'path';

import * as vm from 'vm';

describe('WebviewRenderer', () => {
    const jsonParser = new JsonDocumentParser();
    const yamlParser = new YamlDocumentParser();
    const useCase = new ParseDocumentUseCase([jsonParser, yamlParser]);
    const renderer = new WebviewRenderer();

    it('renders simple-list.json without syntax errors', () => {
        const filePath = path.resolve(__dirname, '../../../samples/json/simple-list.json');
        const text = fs.readFileSync(filePath, 'utf-8');
        const result = useCase.execute(text, 'json');
        const html = renderer.render(result.dto);

        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('spreadsheetTable');

        // Extract script
        const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
        expect(scriptMatch).not.toBeNull();
        const scriptContent = scriptMatch![1];

        try {
            new vm.Script(scriptContent);
        } catch (e: any) {
            console.error('SyntaxError in script:', e.message, e.stack);
            throw e;
        }
    });

    it('renders nested-service.yaml without syntax errors', () => {
        const filePath = path.resolve(__dirname, '../../../samples/yaml/nested-service.yaml');
        const text = fs.readFileSync(filePath, 'utf-8');
        const result = useCase.execute(text, 'yaml');
        const html = renderer.render(result.dto);

        expect(html).toContain('<!DOCTYPE html>');

        const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
        expect(scriptMatch).not.toBeNull();
        expect(() => {
            new vm.Script(scriptMatch![1]);
        }).not.toThrow();
    });

    it('renders k8s-deployment.yaml without syntax errors', () => {
        const filePath = path.resolve(__dirname, '../../../samples/yaml/k8s-deployment.yaml');
        const text = fs.readFileSync(filePath, 'utf-8');
        const result = useCase.execute(text, 'yaml');
        const html = renderer.render(result.dto);

        expect(html).toContain('<!DOCTYPE html>');

        const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
        expect(scriptMatch).not.toBeNull();
        expect(() => {
            new vm.Script(scriptMatch![1]);
        }).not.toThrow();
    });

    it('paginates and renders 100 rows per page for large-sample-1000.json', () => {
        const filePath = path.resolve(__dirname, '../../../samples/large_data/large-sample-1000.json');
        const text = fs.readFileSync(filePath, 'utf-8');
        const result = useCase.execute(text, 'json');
        const html = renderer.render(result.dto);

        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('tablePagination');
        expect(html).toContain('pageNextBtn');
        expect(html).toContain('pageJumpInput');

        const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
        expect(scriptMatch).not.toBeNull();
        const scriptContent = scriptMatch![1];

        // Verify script execution and pagination behavior in a mock DOM environment
        let appHtml = '';
        const mockApp = {
            set innerHTML(val: string) {
                appHtml = val;
            },
            get innerHTML() {
                return appHtml;
            }
        };

        const sandbox: any = {
            acquireVsCodeApi: () => ({
                getState: () => ({}),
                setState: () => {},
                postMessage: () => {}
            }),
            document: {
                getElementById: (id: string) => {
                    if (id === 'app') {
                        return mockApp;
                    }
                    return null;
                },
                querySelectorAll: () => [],
                querySelector: () => null,
                addEventListener: () => {},
                activeElement: null
            },
            console,
            Math,
            parseInt,
            isNaN,
            Object,
            Array,
            Map,
            String
        };

        const context = vm.createContext(sandbox);
        const script = new vm.Script(scriptContent);
        try {
            script.runInContext(context);
        } catch (e: any) {
            console.error('Script run error:', e);
            throw e;
        }

        // Check that initial render produces exactly 100 table rows
        const rowMatches = appHtml.match(/class="table-row-item"/g);
        expect(rowMatches).not.toBeNull();
        expect(rowMatches!.length).toBe(100);

        // Check pagination controls are present in the rendered HTML
        expect(appHtml).toContain('id="tablePagination"');
        expect(appHtml).toContain('<strong>1</strong> / 10 ページ');
        expect(appHtml).toContain('全 1,000 件中 1 - 100 件を表示');
        expect(appHtml).toContain('id="pageNextBtn"');
        expect(appHtml).toContain('>1</td>'); // First row index
        expect(appHtml).toContain('>100</td>'); // 100th row index
    });

    it('renders page 2 (rows 101 to 200) when savedState.currentPage is 2', () => {
        const filePath = path.resolve(__dirname, '../../../samples/large_data/large-sample-1000.json');
        const text = fs.readFileSync(filePath, 'utf-8');
        const result = useCase.execute(text, 'json');
        const html = renderer.render(result.dto);

        const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
        expect(scriptMatch).not.toBeNull();
        const scriptContent = scriptMatch![1];

        let appHtml = '';
        const mockApp = {
            set innerHTML(val: string) {
                appHtml = val;
            },
            get innerHTML() {
                return appHtml;
            }
        };

        const sandbox: any = {
            acquireVsCodeApi: () => ({
                getState: () => ({ currentPage: 2 }),
                setState: () => {},
                postMessage: () => {}
            }),
            document: {
                getElementById: (id: string) => {
                    if (id === 'app') {
                        return mockApp;
                    }
                    return null;
                },
                querySelectorAll: () => [],
                querySelector: () => null,
                addEventListener: () => {},
                activeElement: null
            },
            console,
            Math,
            parseInt,
            isNaN,
            Object,
            Array,
            Map,
            String
        };

        const context = vm.createContext(sandbox);
        const script = new vm.Script(scriptContent);
        script.runInContext(context);

        const rowMatches = appHtml.match(/class="table-row-item"/g);
        expect(rowMatches).not.toBeNull();
        expect(rowMatches!.length).toBe(100);

        expect(appHtml).toContain('<strong>2</strong> / 10 ページ');
        expect(appHtml).toContain('全 1,000 件中 101 - 200 件を表示');
        expect(appHtml).toContain('>101</td>');
        expect(appHtml).toContain('>200</td>');
    });

    it('does not display pagination when total rows <= 100', () => {
        const filePath = path.resolve(__dirname, '../../../samples/json/simple-list.json');
        const text = fs.readFileSync(filePath, 'utf-8');
        const result = useCase.execute(text, 'json');
        const html = renderer.render(result.dto);

        const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
        expect(scriptMatch).not.toBeNull();
        const scriptContent = scriptMatch![1];

        let appHtml = '';
        const mockApp = {
            set innerHTML(val: string) {
                appHtml = val;
            },
            get innerHTML() {
                return appHtml;
            }
        };

        const sandbox: any = {
            acquireVsCodeApi: () => ({
                getState: () => ({}),
                setState: () => {},
                postMessage: () => {}
            }),
            document: {
                getElementById: (id: string) => {
                    if (id === 'app') {
                        return mockApp;
                    }
                    return null;
                },
                querySelectorAll: () => [],
                querySelector: () => null,
                addEventListener: () => {},
                activeElement: null
            },
            console,
            Math,
            parseInt,
            isNaN,
            Object,
            Array,
            Map,
            String
        };

        const context = vm.createContext(sandbox);
        const script = new vm.Script(scriptContent);
        script.runInContext(context);

        expect(appHtml).not.toContain('id="tablePagination"');
    });

    it('sorts rows by column in ascending and descending order without mutating document', () => {
        const filePath = path.resolve(__dirname, '../../../samples/json/simple-list.json');
        const text = fs.readFileSync(filePath, 'utf-8');
        const result = useCase.execute(text, 'json');
        const html = renderer.render(result.dto);

        const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
        expect(scriptMatch).not.toBeNull();
        const scriptContent = scriptMatch![1];

        const postMessages: any[] = [];
        let appHtml = '';
        const mockApp = {
            set innerHTML(val: string) { appHtml = val; },
            get innerHTML() { return appHtml; }
        };

        const createSandbox = (savedState: any) => ({
            acquireVsCodeApi: () => ({
                getState: () => savedState,
                setState: () => {},
                postMessage: (msg: any) => { postMessages.push(msg); }
            }),
            document: {
                getElementById: (id: string) => (id === 'app' ? mockApp : null),
                querySelectorAll: () => [],
                querySelector: () => null,
                addEventListener: () => {},
                activeElement: null
            },
            console, Math, parseInt, parseFloat, isNaN, Number, Object, Array, Map, String
        });

        // Test Ascending Sort on "id"
        const contextAsc = vm.createContext(createSandbox({
            sortState: { '__root__': { colKey: 'id', direction: 'asc' } }
        }));
        new vm.Script(scriptContent).runInContext(contextAsc);

        expect(postMessages.length).toBe(0);
        expect(appHtml).toContain('class="col-sort-btn active asc"');
        expect(appHtml).toContain('▲');

        // Test Descending Sort on "id"
        const contextDesc = vm.createContext(createSandbox({
            sortState: { '__root__': { colKey: 'id', direction: 'desc' } }
        }));
        new vm.Script(scriptContent).runInContext(contextDesc);

        expect(postMessages.length).toBe(0);
        expect(appHtml).toContain('class="col-sort-btn active desc"');
        expect(appHtml).toContain('▼');
    });

    it('applies custom column widths and renders resizers', () => {
        const filePath = path.resolve(__dirname, '../../../samples/json/simple-list.json');
        const text = fs.readFileSync(filePath, 'utf-8');
        const result = useCase.execute(text, 'json');
        const html = renderer.render(result.dto);

        const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
        expect(scriptMatch).not.toBeNull();
        const scriptContent = scriptMatch![1];

        let appHtml = '';
        const mockApp = {
            set innerHTML(val: string) { appHtml = val; },
            get innerHTML() { return appHtml; }
        };

        const sandbox: any = {
            acquireVsCodeApi: () => ({
                getState: () => ({
                    customColWidths: { '__root__': { name: 220 } }
                }),
                setState: () => {},
                postMessage: () => {}
            }),
            document: {
                getElementById: (id: string) => (id === 'app' ? mockApp : null),
                querySelectorAll: () => [],
                querySelector: () => null,
                addEventListener: () => {},
                activeElement: null
            },
            console, Math, parseInt, parseFloat, isNaN, Number, Object, Array, Map, String
        };

        const context = vm.createContext(sandbox);
        new vm.Script(scriptContent).runInContext(context);

        expect(appHtml).toContain('class="col-resizer"');
        expect(appHtml).toContain('width: 220px; min-width: 220px; max-width: 220px;');
    });

    it('hides specified columns and provides column visibility toggle menu', () => {
        const filePath = path.resolve(__dirname, '../../../samples/json/simple-list.json');
        const text = fs.readFileSync(filePath, 'utf-8');
        const result = useCase.execute(text, 'json');
        const html = renderer.render(result.dto);

        const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
        expect(scriptMatch).not.toBeNull();
        const scriptContent = scriptMatch![1];

        let appHtml = '';
        const mockApp = {
            set innerHTML(val: string) { appHtml = val; },
            get innerHTML() { return appHtml; }
        };

        const sandbox: any = {
            acquireVsCodeApi: () => ({
                getState: () => ({
                    hiddenCols: { '__root__': ['active'] }
                }),
                setState: () => {},
                postMessage: () => {}
            }),
            document: {
                getElementById: (id: string) => (id === 'app' ? mockApp : null),
                querySelectorAll: () => [],
                querySelector: () => null,
                addEventListener: () => {},
                activeElement: null
            },
            console, Math, parseInt, parseFloat, isNaN, Number, Object, Array, Map, String
        };

        const context = vm.createContext(sandbox);
        new vm.Script(scriptContent).runInContext(context);

        // Column visibility menu is present
        expect(appHtml).toContain('id="colVisibilityBtn"');
        expect(appHtml).toContain('id="colVisibilityDropdown"');
        expect(appHtml).toContain('id="showAllColsBtn"');

        // 'active' column header is NOT in spreadsheet table header
        expect(appHtml).not.toContain('data-col-key="active" title="クリックで列を選択 / ドラッグして移動"');
        // But 'active' checkbox is present in visibility list as unchecked
        expect(appHtml).toContain('data-col-key="active"');
        expect(appHtml).toContain('class="col-vis-checkbox"');
    });

    /**
     * 【観点】Excel/Googleスプレッドシートライクな操作性（セル内改行CSS、キーボードナビゲーションスクリプト）の検証
     */
    it('includes multiline pre-wrap CSS and spreadsheet keyboard navigation logic', () => {
        const filePath = path.resolve(__dirname, '../../../samples/json/simple-list.json');
        const text = fs.readFileSync(filePath, 'utf-8');
        const result = useCase.execute(text, 'json');
        const html = renderer.render(result.dto);

        // 1. セル内改行（white-space: pre-wrap）がCSSに含まれていること
        expect(html).toContain('white-space: pre-wrap;');

        // 2. セル移動関数（navigateToAdjacentCell）およびセル内テキスト選択（selectCellContents）が含まれること
        expect(html).toContain('function navigateToAdjacentCell(');
        expect(html).toContain('function selectCellContents(');

        // 3. Enter/NumpadEnter, Tab, Ctrl+A, テンキー・矢印キーの処理ロジックが含まれること
        expect(html).toContain("e.key === 'Enter' || e.code === 'NumpadEnter'");
        expect(html).toContain("e.key === 'Tab'");
        expect(html).toContain("e.key === 'a' || e.key === 'A'");
        expect(html).toContain("e.key === 'ArrowDown' || e.code === 'Numpad2'");
        expect(html).toContain("e.key === 'ArrowUp' || e.code === 'Numpad8'");

        // 4. スクリプト構文エラーがないこと
        const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
        expect(scriptMatch).not.toBeNull();
        expect(() => {
            new vm.Script(scriptMatch![1]);
        }).not.toThrow();
    });
});
