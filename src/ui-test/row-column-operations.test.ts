import * as assert from 'assert';
import { EditorView } from 'vscode-extension-tester';
import { StructGridPage } from './page-objects/StructGridPage';
import { createTempFixture, cleanupTempFixture, sleep } from './helpers/test-utils';

describe('Phase 3: 行・列操作 (Row & Column Operations)', function () {
    this.timeout(60000);

    let testFile: string | null = null;
    let page: StructGridPage | null = null;

    beforeEach(async () => {
        testFile = createTempFixture('samples/json/simple-list.json');
        page = await StructGridPage.open(testFile);
    });

    afterEach(async () => {
        if (page) {
            await page.close();
            page = null;
        }
        if (testFile) {
            cleanupTempFixture(testFile);
            testFile = null;
        }
        await sleep(500);
    });

    /**
     * 【観点】テーブル行の追加
     * 【テスト内容】行追加ボタン（＋）を押下した際、テーブルの行数が1増加することを検証する。
     */
    it('UC-09: テーブル行追加ボタン押下で行数が増加すること', async () => {
        if (!page) {
            return;
        }

        const initialRowCount = await page.getTableRowCount();
        await page.clickAddTableRow();

        const updatedRowCount = await page.getTableRowCount();
        assert.strictEqual(updatedRowCount, initialRowCount + 1);
    });

    /**
     * 【観点】テーブル行の削除
     * 【テスト内容】行を選択して Delete キーを押下した際、対象の行が削除されて行数が1減少することを検証する。
     */
    it('UC-10: 行を選択して削除した際に行数が減少すること', async () => {
        if (!page) {
            return;
        }

        const initialRowCount = await page.getTableRowCount();
        assert.ok(initialRowCount > 1);

        // 最終行を選択して削除
        const targetRowIndex = initialRowCount - 1;
        await page.deleteSelectedRow(targetRowIndex);

        const updatedRowCount = await page.getTableRowCount();
        assert.strictEqual(updatedRowCount, initialRowCount - 1);
    });

    /**
     * 【観点】テーブル列の追加
     * 【テスト内容】列追加ボタン（＋）を押下した際、ヘッダーに新しい列（col1等）が追加され列数が増加することを検証する。
     */
    it('UC-11: テーブル列追加ボタン押下で新しい列が追加されること', async () => {
        if (!page) {
            return;
        }

        const initialHeaders = await page.getTableHeaders();
        await page.clickAddTableColumn();

        const updatedHeaders = await page.getTableHeaders();
        assert.strictEqual(updatedHeaders.length, initialHeaders.length + 1);
        assert.ok(updatedHeaders.includes('col1'));
    });

    /**
     * 【観点】テキストエディタで開く機能
     * 【テスト内容】「テキストで開く」ボタンを押下した際、デフォルトの VS Code テキストエディタに切り替わることを検証する。
     */
    it('UC-12: 「テキストで開く」ボタン押下でテキストエディタに切り替わること', async () => {
        if (!page) {
            return;
        }

        await page.clickOpenInTextEditor();
        await page.switchBack();

        const editorView = new EditorView();
        const activeTab = await editorView.getActiveTab();
        assert.notStrictEqual(activeTab, undefined);
    });
});
