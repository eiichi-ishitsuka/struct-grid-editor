import * as assert from 'assert';
import * as fs from 'fs';
import { StructGridPage } from './page-objects/StructGridPage';
import { createTempFixture, cleanupTempFixture, sleep } from './helpers/test-utils';

describe('Phase 1: 基本動作検証 (Basic Operations)', function () {
    this.timeout(60000);

    let testFile: string | null = null;
    let page: StructGridPage | null = null;

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
     * 【観点】JSON ファイルのグリッドビュー表示
     * 【テスト内容】サンプル JSON ファイルを開き、フォーマットバッジ「JSON」と列ヘッダー・データ行が正常に描画されることを検証する。
     */
    it('UC-01: JSON ファイルをグリッドで開き、テーブルが表示されること', async () => {
        testFile = createTempFixture('samples/json/simple-list.json');
        page = await StructGridPage.open(testFile);

        const badgeText = await page.getFormatBadgeText();
        assert.strictEqual(badgeText, 'JSON');

        const headers = await page.getTableHeaders();
        assert.ok(headers.includes('id'));
        assert.ok(headers.includes('name'));
        assert.ok(headers.includes('role'));
        assert.ok(headers.includes('active'));

        const rowCount = await page.getTableRowCount();
        assert.ok(rowCount > 0);

        const firstUserName = await page.getCellValue(0, 'name');
        assert.strictEqual(firstUserName, 'ユーザーA');
    });

    /**
     * 【観点】YAML ファイルのグリッドビュー表示
     * 【テスト内容】サンプル YAML ファイルを開き、フォーマットバッジ「YAML」が表示されることを検証する。
     */
    it('UC-02: YAML ファイルをグリッドで開き、フォーマットバッジが表示されること', async () => {
        testFile = createTempFixture('samples/yaml/simple-list.yaml');
        page = await StructGridPage.open(testFile);

        const badgeText = await page.getFormatBadgeText();
        assert.strictEqual(badgeText, 'YAML');

        const headers = await page.getTableHeaders();
        assert.ok(headers.includes('id'));
        assert.ok(headers.includes('name'));
        assert.ok(headers.includes('role'));
        assert.ok(headers.includes('active'));
    });

    /**
     * 【観点】JSONL ファイルのグリッドビュー表示
     * 【テスト内容】サンプル JSONL ファイルを開き、フォーマットバッジ「JSONL」と行データが正常に表示されることを検証する。
     */
    it('UC-03: JSONL ファイルをグリッドで開き、テーブルが表示されること', async () => {
        testFile = createTempFixture('samples/jsonl/simple-list.jsonl');
        page = await StructGridPage.open(testFile);

        const badgeText = await page.getFormatBadgeText();
        assert.strictEqual(badgeText, 'JSONL');

        const rowCount = await page.getTableRowCount();
        assert.ok(rowCount > 0);

        const firstUserName = await page.getCellValue(0, 'name');
        assert.strictEqual(firstUserName, 'ユーザーA');
    });

    /**
     * 【観点】セル値の編集と保存
     * 【テスト内容】指定セルをクリックして新しい値を入力・確定し、保存後に元ファイルに変更が反映されていることを検証する。
     */
    it('UC-04: セル値を編集して保存すると元ドキュメントに反映されること', async () => {
        testFile = createTempFixture('samples/json/simple-list.json');
        page = await StructGridPage.open(testFile);

        const originalName = await page.getCellValue(0, 'name');
        assert.strictEqual(originalName, 'ユーザーA');

        const updatedName = '更新ユーザーX';
        await page.editCellValue(0, 'name', updatedName);

        // 画面上で値が更新されていることを確認
        const newCellValue = await page.getCellValue(0, 'name');
        assert.strictEqual(newCellValue, updatedName);

        // 保存実行
        await page.save();
        await sleep(1000);

        // ファイルの中身を直接確認
        const fileContent = fs.readFileSync(testFile, 'utf-8');
        assert.ok(fileContent.includes(updatedName));
    });
});
