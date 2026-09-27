import * as assert from 'assert';
import { StructGridPage } from './page-objects/StructGridPage';
import { createTempFixture, cleanupTempFixture, sleep } from './helpers/test-utils';

describe('Phase 4: 配列ドリルダウンと編集時の画面維持 (Array Navigation & Persistence)', function () {
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
     * 【観点】KV モードでの配列展開と行追加時の画面維持
     * 【テスト内容】KV ドキュメント内の配列（hosts）を展開し、行追加を行っても前の画面（ルート階層）に戻らず
     * 配列のスプレッドシート画面が維持されることを検証する。
     */
    it('UC-18: KVモードで配列を展開して行追加しても前の画面に戻らないこと', async () => {
        testFile = createTempFixture('samples/yaml/nested-service.yaml');
        page = await StructGridPage.open(testFile);

        // 初期表示で「編集する」ボタンが存在することを確認
        const hasEditBtn = await page.isEditArrayButtonPresent('network.ingress.hosts');
        assert.ok(hasEditBtn, '配列 network.ingress.hosts の「編集する」ボタンが表示されていること');

        // 配列を展開
        await page.clickEditArray('network.ingress.hosts');

        // パンくずに配列名が含まれ、表形式ビューへ遷移したことを確認
        let breadcrumbs = await page.getBreadcrumbsText();
        assert.ok(breadcrumbs.includes('hosts'), `パンくずに hosts が含まれること (実際: ${breadcrumbs})`);

        const initialRowCount = await page.getTableRowCount();
        assert.strictEqual(initialRowCount, 2, 'hosts 配列の初期要素数が 2 行であること');

        // 行追加を実行（VS Code ドキュメント変更と Webview 再描画が発生する）
        await page.clickAddTableRow();

        // 【最重要検証】前の画面に戻らず、パンくずに hosts が維持されていること
        breadcrumbs = await page.getBreadcrumbsText();
        assert.ok(breadcrumbs.includes('hosts'), `行追加後もパンくずに hosts が維持されていること (実際: ${breadcrumbs})`);

        // 行数が増加していること
        const updatedRowCount = await page.getTableRowCount();
        assert.strictEqual(updatedRowCount, 3, '行追加後に配列行数が 3 行になっていること');

        // パンくずの 'root/' をクリックして元の KV 画面に戻れること
        await page.clickBreadcrumbRoot();

        const isAtRoot = await page.isEditArrayButtonPresent('network.ingress.hosts');
        assert.ok(isAtRoot, 'root/ クリックで元の KV 画面に戻り「編集する」ボタンが再表示されること');
    });

    /**
     * 【観点】テーブルモードでのサブ配列展開とセル編集時の画面維持
     * 【テスト内容】テーブル形式ドキュメント内のネストされた配列（skills）を展開し、セル値を編集・確定しても
     * 前の画面に戻らずサブ配列ビューが維持されることを検証する。
     */
    it('UC-19: テーブルモードでサブ配列を展開してセル編集しても前の画面に戻らないこと', async () => {
        testFile = createTempFixture('samples/yaml/users-with-nested-array.yaml');
        page = await StructGridPage.open(testFile);

        // 初期表示はルートテーブル
        const rootHeaders = await page.getTableHeaders();
        assert.ok(rootHeaders.includes('name'), 'ルートテーブルに name 列が含まれること');

        // 最初の行の skills 配列を展開
        await page.clickEditArray('[0].skills');

        // パンくずが skills に切り替わっていることを確認
        let breadcrumbs = await page.getBreadcrumbsText();
        assert.ok(breadcrumbs.includes('skills'), `パンくずに skills が含まれること (実際: ${breadcrumbs})`);

        // セル値を編集（VS Code ドキュメント変更と Webview 再描画が発生する）
        await page.editCellValue(0, 'value', 'Rust');

        // 【最重要検証】編集後も前の画面に戻らず、サブ配列画面が維持されていること
        breadcrumbs = await page.getBreadcrumbsText();
        assert.ok(breadcrumbs.includes('skills'), `セル編集後もパンくずに skills が維持されていること (実際: ${breadcrumbs})`);

        const updatedValue = await page.getCellValue(0, 'value');
        assert.strictEqual(updatedValue, 'Rust', 'セル値が Rust に更新されていること');

        // パンくずの 'root/' をクリックしてルートテーブルに戻れること
        await page.clickBreadcrumbRoot();

        const headersAfterRoot = await page.getTableHeaders();
        assert.ok(headersAfterRoot.includes('name'), 'ルートテーブルに戻り name 列が表示されること');
    });
});
