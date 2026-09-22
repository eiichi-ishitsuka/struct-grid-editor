import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * UIテスト実行用の一時ディレクトリパスを取得します。
 */
export function getTestTempDir(): string {
    const tempDir = path.join(os.tmpdir(), 'struct-grid-editor-ui-tests');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    return tempDir;
}

/**
 * サンプルファイルをテスト用一時ディレクトリにコピーし、その絶対パスを返します。
 * @param relativeSamplePath プロジェクトルートからのサンプルファイル相対パス（例: 'samples/json/simple-list.json'）
 * @returns コピー先の一時ファイル絶対パス
 */
export function createTempFixture(relativeSamplePath: string): string {
    const sourcePath = path.resolve(process.cwd(), relativeSamplePath);
    if (!fs.existsSync(sourcePath)) {
        throw new Error(`Fixture file not found: ${sourcePath}`);
    }

    const tempDir = getTestTempDir();
    const fileName = `${Date.now()}-${path.basename(relativeSamplePath)}`;
    const destPath = path.join(tempDir, fileName);

    fs.copyFileSync(sourcePath, destPath);
    return destPath;
}

/**
 * 一時ファイルを削除します。
 * @param filePath 削除するファイルパス
 */
export function cleanupTempFixture(filePath: string): void {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch {
        // クリーンアップエラーは無視
    }
}

/**
 * 指定されたミリ秒待機します。
 * @param ms 待機時間（ミリ秒）
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 条件が真になるまでポーリング待機します。
 * @param predicate 判定関数
 * @param timeoutMs タイムアウト（ミリ秒）
 * @param intervalMs ポーリング間隔（ミリ秒）
 */
export async function waitForCondition(
    predicate: () => Promise<boolean>,
    timeoutMs: number = 10000,
    intervalMs: number = 200
): Promise<void> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
        if (await predicate()) {
            return;
        }
        await sleep(intervalMs);
    }
    throw new Error(`Condition not met within ${timeoutMs}ms`);
}
