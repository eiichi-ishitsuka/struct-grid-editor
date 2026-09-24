import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	/**
	 * 【観点】VS Code拡張機能ホスト環境の起動と基本的なアサーション動作確認
	 * 【テスト内容】VS Codeテストランナー上でテスト環境が正常に初期化され、基本配列操作のアサーションが成功することを検証する。
	 */
	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});
