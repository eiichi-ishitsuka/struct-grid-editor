import {
    CustomEditor,
    WebView,
    VSBrowser,
    By,
    Key,
    WebElement,
    EditorView,
} from 'vscode-extension-tester';
import * as fs from 'fs';
import { sleep, waitForCondition } from '../helpers/test-utils';

/**
 * StructGridEditor の Webview を操作・検証するための Page Object クラス。
 */
export class StructGridPage {
    constructor(
        public readonly customEditor: CustomEditor,
        public readonly webview: WebView
    ) {}

    /**
     * 指定ファイルを VS Code で開き、StructGridEditor の Webview を初期化して Page Object を返します。
     * @param filePath 開くファイルの絶対パス
     */
    public static async open(filePath: string): Promise<StructGridPage> {
        // VS Code でファイルを開く
        await VSBrowser.instance.openResources(filePath);
        await sleep(1500);

        const customEditor = new CustomEditor();
        const webview = customEditor.getWebView();

        // Webview の内部フレームへスイッチ
        await webview.switchToFrame(15000);

        // テーブルまたはエディタコンテナが描画されるまで待機
        await waitForCondition(async () => {
            try {
                const driver = VSBrowser.instance.driver;
                const elements = await driver.findElements(By.css('.table-container, .kv-table, .header'));
                return elements.length > 0;
            } catch {
                return false;
            }
        }, 15000);

        return new StructGridPage(customEditor, webview);
    }

    /**
     * Webview iframe 内のコンテキストに切り替えます。
     */
    public async switchToWebview(): Promise<void> {
        await this.webview.switchToFrame(10000);
    }

    /**
     * VS Code メインウィンドウのコンテキストに戻します。
     */
    public async switchBack(): Promise<void> {
        await this.webview.switchBack();
    }

    /**
     * 現在表示されているフォーマットバッジ（JSON / YAML / JSONL）の文字列を取得します。
     */
    public async getFormatBadgeText(): Promise<string> {
        const driver = VSBrowser.instance.driver;
        const badge = await driver.findElement(By.css('.badge-format'));
        return await badge.getText();
    }

    /**
     * テーブルヘッダーの列名一覧を取得します。
     */
    public async getTableHeaders(): Promise<string[]> {
        const driver = VSBrowser.instance.driver;
        const headerElements = await driver.findElements(By.css('.col-header-label'));
        const headers: string[] = [];
        for (const el of headerElements) {
            headers.push((await el.getText()).trim());
        }
        return headers;
    }

    /**
     * テーブルのデータ行数を取得します。
     */
    public async getTableRowCount(): Promise<number> {
        const driver = VSBrowser.instance.driver;
        const rows = await driver.findElements(By.css('tr.table-row-item'));
        return rows.length;
    }

    /**
     * 指定行・カラムキーのセル要素を取得します。
     */
    public async getCell(rowIndex: number, colKey: string): Promise<WebElement> {
        const driver = VSBrowser.instance.driver;
        const selector = `td.col-val[data-row-index="${rowIndex}"][data-col-key="${colKey}"]`;
        return await driver.findElement(By.css(selector));
    }

    /**
     * 指定行・カラムキーのセルのテキスト値を取得します。
     */
    public async getCellValue(rowIndex: number, colKey: string): Promise<string> {
        const cell = await this.getCell(rowIndex, colKey);
        return (await cell.getText()).trim();
    }

    /**
     * 指定行・カラムキーのセルをクリックしてフォーカス・編集状態にします。
     */
    public async clickCell(rowIndex: number, colKey: string): Promise<void> {
        const cell = await this.getCell(rowIndex, colKey);
        await cell.click();
        await sleep(200);
    }

    /**
     * 指定セルをクリックし、新しい値を入力して確定（Enter）します。
     */
    public async editCellValue(rowIndex: number, colKey: string, newValue: string): Promise<void> {
        const cell = await this.getCell(rowIndex, colKey);
        await cell.click();
        await sleep(150);

        // 既存の内容をクリアして入力
        const driver = VSBrowser.instance.driver;
        // Ctrl+A して Backspace で全消去
        await cell.sendKeys(Key.chord(Key.CONTROL, 'a'), Key.BACK_SPACE);
        await cell.sendKeys(newValue);
        await cell.sendKeys(Key.ENTER);
        await sleep(400);
    }

    /**
     * アクティブな要素に対してキー入力を送信します。
     */
    public async sendKeysToActiveElement(...keys: string[]): Promise<void> {
        const driver = VSBrowser.instance.driver;
        const active = await driver.switchTo().activeElement();
        await active.sendKeys(...keys);
        await sleep(200);
    }

    /**
     * 現在フォーカスが当たっているセルの行インデックスと列キーを取得します。
     */
    public async getFocusedCellCoordinates(): Promise<{ rowIndex: number; colKey: string } | null> {
        const driver = VSBrowser.instance.driver;
        const active = await driver.switchTo().activeElement();
        const tagName = (await active.getTagName()).toLowerCase();
        if (tagName !== 'td') {
            return null;
        }
        const rIdx = await active.getAttribute('data-row-index');
        const cKey = await active.getAttribute('data-col-key');
        if (rIdx === null || cKey === null) {
            return null;
        }
        return {
            rowIndex: parseInt(rIdx, 10),
            colKey: cKey,
        };
    }

    /**
     * 行追加ボタン（＋）をクリックして末尾に行を追加します。
     */
    public async clickAddTableRow(): Promise<void> {
        const driver = VSBrowser.instance.driver;
        const addBtn = await driver.findElement(By.id('addTableRowBtn'));
        await addBtn.click();
        await sleep(500);
    }

    /**
     * 列追加ボタン（＋）をクリックして一番右に新しい列を追加します。
     */
    public async clickAddTableColumn(): Promise<void> {
        const driver = VSBrowser.instance.driver;
        const addColBtn = await driver.findElement(By.id('addColBtn'));
        await addColBtn.click();
        await sleep(500);
    }

    /**
     * 指定行の行ヘッダーをクリックして選択します。
     */
    public async selectRow(rowIndex: number): Promise<void> {
        const driver = VSBrowser.instance.driver;
        const rowHeader = await driver.findElement(By.css(`td.row-header[data-row-index="${rowIndex}"]`));
        await rowHeader.click();
        await sleep(200);
    }

    /**
     * 選択中の行・項目を削除します（Delete キー押下）。
     */
    public async deleteSelectedRow(rowIndex: number): Promise<void> {
        await this.selectRow(rowIndex);
        const driver = VSBrowser.instance.driver;
        const active = await driver.switchTo().activeElement();
        await active.sendKeys(Key.DELETE);
        await sleep(500);
    }

    /**
     * 「テキストで開く」ボタンをクリックします。
     */
    public async clickOpenInTextEditor(): Promise<void> {
        const driver = VSBrowser.instance.driver;
        const btn = await driver.findElement(By.id('openTextEditorBtn'));
        await btn.click();
        await sleep(1000);
    }

    /**
     * エディタの変更を保存します。
     */
    public async save(): Promise<void> {
        await this.switchBack();
        await this.customEditor.save();
        await this.switchToWebview();
    }

    /**
     * エディタタブを閉じます。
     */
    public async close(): Promise<void> {
        try {
            await this.switchBack();
        } catch {
            // 既にメインコンテキストにいる場合はスキップ
        }
        const editorView = new EditorView();
        await editorView.closeAllEditors();
    }
}
