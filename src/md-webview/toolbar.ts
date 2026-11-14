import { Editor } from '@tiptap/core';

/**
 * ツールバーのボタン操作時に呼び出されるコールバック群。
 */
export interface ToolbarCallbacks {
  /** 標準テキストエディタ（ソース表示）への切り替え時に呼び出されます。 */
  onSwitchToText: () => void;
  /** テーマ（Light / Dark）切り替え時に呼び出され、切り替え後のスキーム名を返します。 */
  onToggleTheme: () => 'default' | 'slate';
  /** 現在の表示テーマスキーム名（`'default'` または `'slate'`）を取得します。 */
  getCurrentTheme: () => 'default' | 'slate';
}

/**
 * エディタ上部のミニマルヘッダーバーおよびテーブル選択時のコンテキスト操作バーを構築します。
 * @param container 上部ヘッダーバーの描画先コンテナ要素
 * @param tableBannerContainer テーブル操作バーの描画先コンテナ要素
 * @param editor 対象の Tiptap Editor インスタンス
 * @param callbacks ツールバー操作のコールバック群
 */
export function createToolbar(
  container: HTMLElement,
  tableBannerContainer: HTMLElement,
  editor: Editor,
  callbacks: ToolbarCallbacks
): void {
  container.innerHTML = '';
  const bar = document.createElement('div');
  bar.className = 'editor-toolbar editor-toolbar-minimal';

  const spacer = document.createElement('div');
  spacer.className = 'toolbar-spacer';
  bar.appendChild(spacer);

  const themeBtn = document.createElement('button');
  themeBtn.type = 'button';
  themeBtn.className = 'toolbar-btn toolbar-btn-source';
  const updateThemeBtnLabel = (scheme: 'default' | 'slate') => {
    themeBtn.textContent = scheme === 'slate' ? 'Theme: Dark (Slate)' : 'Theme: Light (Default)';
    themeBtn.title = 'エディタの表示テーマ (Light / Dark) を切り替え';
  };
  updateThemeBtnLabel(callbacks.getCurrentTheme());

  themeBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const next = callbacks.onToggleTheme();
    updateThemeBtnLabel(next);
  });
  bar.appendChild(themeBtn);

  const sourceBtn = document.createElement('button');
  sourceBtn.type = 'button';
  sourceBtn.className = 'toolbar-btn toolbar-btn-source';
  sourceBtn.textContent = 'ソース表示';
  sourceBtn.title = 'VSCode標準のテキストエディタでMarkdownソースを開く';
  sourceBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    callbacks.onSwitchToText();
  });
  bar.appendChild(sourceBtn);

  container.appendChild(bar);

  // テーブル内にカーソルがある時のみ表示されるテーブルコンテキスト操作バー
  tableBannerContainer.innerHTML = '';
  const tableBar = document.createElement('div');
  tableBar.className = 'table-toolbar hidden';

  const tableActions: Array<{ label: string; run: () => void; danger?: boolean }> = [
    { label: '+ 上に行追加', run: () => editor.chain().focus().addRowBefore().run() },
    { label: '+ 下に行追加', run: () => editor.chain().focus().addRowAfter().run() },
    { label: '- 行削除', run: () => editor.chain().focus().deleteRow().run() },
    { label: '+ 左に列追加', run: () => editor.chain().focus().addColumnBefore().run() },
    { label: '+ 右に列追加', run: () => editor.chain().focus().addColumnAfter().run() },
    { label: '- 列削除', run: () => editor.chain().focus().deleteColumn().run() },
    {
      label: 'テーブル削除',
      run: () => editor.chain().focus().deleteTable().run(),
      danger: true,
    },
  ];

  const tableLabel = document.createElement('span');
  tableLabel.className = 'table-toolbar-label';
  tableLabel.textContent = 'テーブル操作:';
  tableBar.appendChild(tableLabel);

  for (const act of tableActions) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `table-btn ${act.danger ? 'table-btn-danger' : ''}`.trim();
    b.textContent = act.label;
    b.addEventListener('mousedown', (e) => {
      e.preventDefault();
      act.run();
    });
    tableBar.appendChild(b);
  }
  tableBannerContainer.appendChild(tableBar);

  const updateToolbarState = () => {
    if (editor.isActive('table')) {
      tableBar.classList.remove('hidden');
    } else {
      tableBar.classList.add('hidden');
    }
  };

  editor.on('selectionUpdate', updateToolbarState);
  editor.on('transaction', updateToolbarState);

  window.addEventListener('md-theme-change', ((e: CustomEvent<{ scheme: 'default' | 'slate' }>) => {
    if (e.detail?.scheme) {
      updateThemeBtnLabel(e.detail.scheme);
    }
  }) as EventListener);
}
