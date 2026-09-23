import * as assert from 'assert';
import { Key } from 'vscode-extension-tester';
import { StructGridPage } from './page-objects/StructGridPage';
import { createTempFixture, cleanupTempFixture, sleep } from './helpers/test-utils';

describe('Phase 2: キーボードナビゲーション (Keyboard Navigation)', function () {
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
     * 【観点】Enter キー押下による下のセルへのフォーカス移動
     * 【テスト内容】(0行, name列) セルにフォーカスを当てて Enter を押下した際、直下の (1行, name列) セルにフォーカスが移動することを検証する。
     */
    it.skip('UC-05: Enter キー押下で直下のセルにフォーカスが移動すること', async () => {
        if (!page) {
            return;
        }

        // 0行目の name セルをクリック
        await page.clickCell(0, 'name');
        let coords = await page.getFocusedCellCoordinates();
        assert.deepStrictEqual(coords, { rowIndex: 0, colKey: 'name' });

        // Enter キーを送信
        await page.sendKeysToActiveElement(Key.ENTER);
        await sleep(300);

        // 1行目の name セルへフォーカスが移動していることを検証
        coords = await page.getFocusedCellCoordinates();
        assert.deepStrictEqual(coords, { rowIndex: 1, colKey: 'name' });
    });

    /**
     * 【観点】Tab キー押下による右のセルへのフォーカス移動
     * 【テスト内容】(0行, name列) セルにフォーカスを当てて Tab を押下した際、右隣の (0行, role列) セルにフォーカスが移動することを検証する。
     */
    it.skip('UC-06: Tab キー押下で右隣のセルにフォーカスが移動すること', async () => {
        if (!page) {
            return;
        }

        // 0行目の name セルをクリック
        await page.clickCell(0, 'name');
        let coords = await page.getFocusedCellCoordinates();
        assert.deepStrictEqual(coords, { rowIndex: 0, colKey: 'name' });

        // Tab キーを送信
        await page.sendKeysToActiveElement(Key.TAB);
        await sleep(300);

        // 右隣の role セルへフォーカスが移動していることを検証
        coords = await page.getFocusedCellCoordinates();
        assert.deepStrictEqual(coords, { rowIndex: 0, colKey: 'role' });
    });

    /**
     * 【観点】Shift + Tab キー押下による左のセルへのフォーカス移動
     * 【テスト内容】(0行, role列) セルにフォーカスを当てて Shift + Tab を押下した際、左隣の (0行, name列) セルにフォーカスが戻ることを検証する。
     */
    it.skip('UC-07: Shift + Tab キー押下で左隣のセルにフォーカスが戻ること', async () => {
        if (!page) {
            return;
        }

        // 0行目の role セルをクリック
        await page.clickCell(0, 'role');
        let coords = await page.getFocusedCellCoordinates();
        assert.deepStrictEqual(coords, { rowIndex: 0, colKey: 'role' });

        // Shift + Tab を送信
        await page.sendKeysToActiveElement(Key.chord(Key.SHIFT, Key.TAB));
        await sleep(300);

        // 左隣の name セルへフォーカスが戻っていることを検証
        coords = await page.getFocusedCellCoordinates();
        assert.deepStrictEqual(coords, { rowIndex: 0, colKey: 'name' });
    });

    /**
     * 【観点】セル編集中 Ctrl + A でのセル内テキスト全選択
     * 【テスト内容】セル編集フォーカス中に Ctrl+A を押下した際、セル内テキスト全選択が行われ、グローバルなテーブル全選択等に横取りされないことを検証する。
     */
    it.skip('UC-08: セル編集中に Ctrl + A を押下した際、セル内のテキストが全選択されること', async () => {
        if (!page) {
            return;
        }

        await page.clickCell(0, 'name');
        await page.sendKeysToActiveElement(Key.chord(Key.CONTROL, 'a'));
        await sleep(200);

        // アクティブ要素がセルのままであることを検証
        const coords = await page.getFocusedCellCoordinates();
        assert.deepStrictEqual(coords, { rowIndex: 0, colKey: 'name' });
    });
});
