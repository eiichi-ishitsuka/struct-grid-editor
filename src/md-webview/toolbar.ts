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
  /** ReadOnly モード切り替え時に呼び出され、切り替え後の状態を返します。 */
  onToggleReadOnly?: () => boolean;
  /** 現在の ReadOnly 状態を取得します。 */
  getReadOnly?: () => boolean;
  /** 左右分割表示切り替え時に呼び出され、切り替え後の状態を返します。 */
  onToggleSplitView?: () => boolean;
  /** 現在の左右分割表示状態を取得します。 */
  getSplitView?: () => boolean;
  /** 見出し Index パネル表示切り替え時に呼び出され、切り替え後の状態を返します。 */
  onToggleOutline?: () => boolean;
  /** 現在の見出し Index パネル表示状態を取得します。 */
  getOutlineVisible?: () => boolean;
}

function createToggleButton(options: {
  label: string;
  title: string;
  extraClass: string;
  initialActive: boolean;
  syncKey?: 'readOnly' | 'splitView' | 'showIndex';
  onToggle: () => boolean;
}): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `toolbar-btn toolbar-toggle ${options.extraClass}`.trim();
  btn.title = options.title;

  const syncState = (active: boolean) => {
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
    btn.textContent = `${options.label}: ${active ? 'ON' : 'OFF'}`;
  };

  syncState(options.initialActive);

  btn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const next = options.onToggle();
    syncState(next);
  });

  if (options.syncKey) {
    const key = options.syncKey;
    window.addEventListener('md-preference-sync', ((
      e: CustomEvent<Partial<Record<'readOnly' | 'splitView' | 'showIndex', boolean>>>
    ) => {
      const value = e.detail?.[key];
      if (typeof value === 'boolean') {
        syncState(value);
      }
    }) as EventListener);
  }

  return btn;
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

  if (callbacks.onToggleReadOnly) {
    let readOnly = callbacks.getReadOnly ? callbacks.getReadOnly() : false;
    bar.appendChild(
      createToggleButton({
        label: 'Read Mode',
        title: '読み取り専用モード（行クリック時のMarkdown記法表示を無効化） (Ctrl+Alt+R / Cmd+Alt+R)',
        extraClass: 'toolbar-toggle-readonly',
        initialActive: readOnly,
        syncKey: 'readOnly',
        onToggle: () => {
          readOnly = callbacks.onToggleReadOnly ? callbacks.onToggleReadOnly() : !readOnly;
          return readOnly;
        },
      })
    );
  }

  if (callbacks.onToggleSplitView) {
    let splitView = callbacks.getSplitView ? callbacks.getSplitView() : false;
    bar.appendChild(
      createToggleButton({
        label: 'Split View',
        title: '左側にプレビュー、右側にローテキストエディタを表示 (Ctrl+Alt+V / Cmd+Alt+V)',
        extraClass: 'toolbar-toggle-split',
        initialActive: splitView,
        syncKey: 'splitView',
        onToggle: () => {
          splitView = callbacks.onToggleSplitView ? callbacks.onToggleSplitView() : !splitView;
          return splitView;
        },
      })
    );
  }

  if (callbacks.onToggleOutline) {
    let outlineVisible = callbacks.getOutlineVisible ? callbacks.getOutlineVisible() : true;
    bar.appendChild(
      createToggleButton({
        label: 'Show Index',
        title: 'プレビュー右上の見出しインデックス表示を切り替え (Ctrl+Alt+O / Cmd+Alt+O)',
        extraClass: 'toolbar-toggle-outline',
        initialActive: outlineVisible,
        syncKey: 'showIndex',
        onToggle: () => {
          outlineVisible = callbacks.onToggleOutline
            ? callbacks.onToggleOutline()
            : !outlineVisible;
          return outlineVisible;
        },
      })
    );
  }

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
  sourceBtn.textContent = 'View Source';
  sourceBtn.title = 'VSCode標準のテキストエディタでMarkdownソースを開く (Ctrl+Alt+E / Cmd+Alt+E)';
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
    if (editor.isEditable && editor.isActive('table')) {
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
