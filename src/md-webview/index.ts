import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';

import { CustomCodeBlock } from './mermaidExtension';
import { InlineMath, BlockMath } from './mathExtension';
import { AdmonitionBlock } from './admonitionExtension';
import { LivePreviewExtension } from './livePreviewExtension';
import {
  setMarkdownBaseUri,
  markdownToHtml,
  htmlToMarkdown,
  getFrontmatter,
  setFrontmatter,
} from './markdownCodec';
import { createToolbar } from './toolbar';
import { setupSlashMenu } from './slashMenu';
import { setupTableEdgeControls } from './tableEdgeControls';
import { renderOutline } from './outline';

declare function acquireVsCodeApi(): {
  postMessage: (msg: unknown) => void;
  getState: () => unknown;
  setState: (state: unknown) => void;
};

const vscode = acquireVsCodeApi();

/**
 * ローカル画像の相対パス（`data-raw-src`）を保持するカスタム Image 拡張。
 */
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-raw-src': {
        default: null,
        parseHTML: (element) =>
          element.getAttribute('data-raw-src') || element.getAttribute('src'),
        renderHTML: (attributes) => {
          if (!attributes['data-raw-src']) {
            return {};
          }
          return {
            'data-raw-src': attributes['data-raw-src'],
          };
        },
      },
    };
  },
});

let isProgrammaticUpdate = false;
let syncDebounceTimer: number | undefined;
let rawSyncDebounceTimer: number | undefined;
let isReadOnly = false;
let isSplitView = false;
let isOutlineVisible = true;

const appEl = document.getElementById('app') as HTMLElement;
const mainContainer = document.getElementById('main-container') as HTMLElement;
const previewPane = document.getElementById('preview-pane') as HTMLElement;
const editorWrapper = document.getElementById('editor-wrapper') as HTMLElement;
const editorElement = document.getElementById('editor') as HTMLElement;
const outlinePanel = document.getElementById('outline-panel') as HTMLElement;
const rawEditorPane = document.getElementById('raw-editor-pane') as HTMLElement;
const rawEditorEl = document.getElementById('raw-editor') as HTMLTextAreaElement;
const toolbarContainer = document.getElementById('toolbar-container') as HTMLElement;
const tableBannerContainer = document.getElementById('table-Banner-container') as HTMLElement;
const slashMenuEl = document.getElementById('slash-menu') as HTMLElement;
const statusInfoEl = document.getElementById('status-info') as HTMLElement;
const statusStatsEl = document.getElementById('status-stats') as HTMLElement;

// エディタ上部に YAML Frontmatter 編集パネルを配置する
const frontmatterContainer = document.createElement('div');
frontmatterContainer.className = 'frontmatter-container hidden';
editorWrapper.insertBefore(frontmatterContainer, editorElement);

/**
 * YAML Frontmatter パネルの表示・非表示および入力欄を再描画します。
 */
function renderFrontmatterPanel(): void {
  const fm = getFrontmatter();
  if (fm === null) {
    frontmatterContainer.classList.add('hidden');
    frontmatterContainer.innerHTML = '';
    return;
  }

  frontmatterContainer.classList.remove('hidden');
  frontmatterContainer.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'frontmatter-header';

  const title = document.createElement('span');
  title.className = 'frontmatter-title';
  title.textContent = 'YAML Frontmatter';

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'admonition-remove-btn';
  removeBtn.textContent = '削除';
  removeBtn.disabled = isReadOnly;
  removeBtn.addEventListener('click', () => {
    if (isReadOnly) {
      return;
    }
    setFrontmatter(null);
    renderFrontmatterPanel();
    scheduleDocumentSync();
  });

  header.appendChild(title);
  header.appendChild(removeBtn);

  const textarea = document.createElement('textarea');
  textarea.className = 'frontmatter-textarea';
  textarea.value = fm;
  textarea.readOnly = isReadOnly;
  textarea.placeholder = 'title: ドキュメントタイトル\ndescription: 説明';
  textarea.rows = Math.max(2, Math.min(8, fm.split('\n').length));

  textarea.addEventListener('input', () => {
    if (isReadOnly) {
      return;
    }
    setFrontmatter(textarea.value);
    scheduleDocumentSync();
  });

  frontmatterContainer.appendChild(header);
  frontmatterContainer.appendChild(textarea);
}

// HTML に埋め込まれた初期ドキュメントデータを同期的に読み込み、初回フレームで即座に描画する
let initialHtml = '<p></p>';
const initialDataEl = document.getElementById('initial-data');
if (initialDataEl && initialDataEl.textContent) {
  try {
    const parsed = JSON.parse(initialDataEl.textContent) as {
      text?: string;
      baseUri?: string;
      preferences?: {
        readOnly?: boolean;
        splitView?: boolean;
        showIndex?: boolean;
      };
    };
    if (parsed.baseUri) {
      setMarkdownBaseUri(parsed.baseUri);
    }
    if (parsed.preferences) {
      if (typeof parsed.preferences.readOnly === 'boolean') {
        isReadOnly = parsed.preferences.readOnly;
      }
      if (typeof parsed.preferences.splitView === 'boolean') {
        isSplitView = parsed.preferences.splitView;
      }
      if (typeof parsed.preferences.showIndex === 'boolean') {
        isOutlineVisible = parsed.preferences.showIndex;
      }
    }
    if (typeof parsed.text === 'string') {
      initialHtml = markdownToHtml(parsed.text);
    }
  } catch {
    // 初期データのパースに失敗した場合は init メッセージ到着まで空ドキュメントで待機する
  }
}

const editor = new Editor({
  element: editorElement,
  extensions: [
    StarterKit.configure({
      codeBlock: false,
      link: false,
    }),
    CustomCodeBlock,
    AdmonitionBlock,
    LivePreviewExtension,
    InlineMath,
    BlockMath,
    Highlight,
    Link.configure({
      openOnClick: false,
      autolink: true,
      isAllowedUri: () => true,
      HTMLAttributes: {
        title: 'Ctrl+クリック (Mac: Cmd+クリック) でリンク先を開く',
      },
    }),
    CustomImage.configure({
      inline: false,
      allowBase64: true,
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    Placeholder.configure({
      placeholder:
        'テキストを入力、または「/」でブロック挿入（見出し・Admonition・表・Mermaid・数式など）...',
    }),
  ],
  content: initialHtml,
  autofocus: false,
  onUpdate: ({ editor: ed }) => {
    updateStats(ed);
    updateOutline();
    if (isProgrammaticUpdate || isReadOnly) {
      return;
    }
    scheduleDocumentSync();
  },
});

/**
 * 見出しインデックスパネルを再描画します。
 */
function updateOutline(): void {
  if (outlinePanel) {
    renderOutline(outlinePanel, editor);
  }
}

/**
 * 現在の表示設定を拡張ホストへ送信し、別ファイル間でも永続化します。
 */
function persistViewPreferences(): void {
  vscode.postMessage({
    type: 'updatePreferences',
    preferences: {
      readOnly: isReadOnly,
      splitView: isSplitView,
      showIndex: isOutlineVisible,
    },
  });
}

// 初回ロード直後に Frontmatter パネル・文字数統計・見出しインデックス・保存済み設定を反映する
isProgrammaticUpdate = true;
try {
  setReadOnly(isReadOnly);
  setSplitView(isSplitView);
  setOutlineVisible(isOutlineVisible);
  updateStats(editor);
  updateOutline();
} finally {
  isProgrammaticUpdate = false;
}

/**
 * エディタの変更内容をデバウンスして Markdown へ変換し、VS Code 拡張ホストへ送信します。
 */
function scheduleDocumentSync(): void {
  if (isReadOnly) {
    return;
  }
  if (syncDebounceTimer) {
    window.clearTimeout(syncDebounceTimer);
  }
  syncDebounceTimer = window.setTimeout(() => {
    const html = editor.getHTML();
    const markdown = htmlToMarkdown(html);
    if (isSplitView && rawEditorEl && document.activeElement !== rawEditorEl) {
      rawEditorEl.value = markdown;
    }
    vscode.postMessage({
      type: 'edit',
      text: markdown,
    });
  }, 150);
}

/**
 * ReadOnly モードを切り替えます。
 */
function setReadOnly(next: boolean): boolean {
  isReadOnly = next;
  const prevProgrammatic = isProgrammaticUpdate;
  isProgrammaticUpdate = true;
  try {
    editor.setEditable(!isReadOnly, false);
    // 選択中の行にある LivePreview 装飾を即座に再評価させる
    editor.view.dispatch(editor.state.tr);
    appEl?.classList.toggle('is-readonly', isReadOnly);
    if (rawEditorEl) {
      rawEditorEl.readOnly = isReadOnly;
    }
    if (isReadOnly) {
      slashMenuEl?.classList.add('hidden');
    }
    if (statusInfoEl) {
      statusInfoEl.innerHTML = isReadOnly
        ? 'ReadOnly Mode'
        : 'WYSIWYG Mode — <code>/</code> でブロック挿入';
    }
    renderFrontmatterPanel();
  } finally {
    isProgrammaticUpdate = prevProgrammatic;
  }
  return isReadOnly;
}

/**
 * 左右分割（左: プレビュー, 右: ローテキストエディタ）表示を切り替えます。
 */
function setSplitView(next: boolean): boolean {
  isSplitView = next;
  mainContainer?.classList.toggle('is-split', isSplitView);
  rawEditorPane?.classList.toggle('hidden', !isSplitView);
  if (isSplitView && rawEditorEl) {
    rawEditorEl.value = htmlToMarkdown(editor.getHTML());
    rawEditorEl.readOnly = isReadOnly;
  }
  return isSplitView;
}

/**
 * 見出しインデックスパネルの表示・非表示を切り替えます。
 */
function setOutlineVisible(next: boolean): boolean {
  isOutlineVisible = next;
  outlinePanel?.classList.toggle('hidden', !isOutlineVisible);
  return isOutlineVisible;
}

rawEditorEl?.addEventListener('input', () => {
  if (isReadOnly) {
    return;
  }
  if (rawSyncDebounceTimer) {
    window.clearTimeout(rawSyncDebounceTimer);
  }
  rawSyncDebounceTimer = window.setTimeout(() => {
    const rawText = rawEditorEl.value;
    isProgrammaticUpdate = true;
    try {
      const html = markdownToHtml(rawText);
      renderFrontmatterPanel();
      editor.commands.setContent(html, { emitUpdate: false });
      updateStats(editor);
      updateOutline();
    } finally {
      isProgrammaticUpdate = false;
    }
    vscode.postMessage({
      type: 'edit',
      text: rawText,
    });
  }, 150);
});

/**
 * ステータスバーの文字数およびパラグラフ数の表示を更新します。
 * @param ed Tiptap Editor インスタンス
 */
function updateStats(ed: Editor): void {
  const text = ed.state.doc.textContent || '';
  const chars = text.length;
  const lines = text ? text.split(/\n/).length : 0;
  if (statusStatsEl) {
    statusStatsEl.textContent = `${chars} 文字`;
    statusStatsEl.title = `文字数: ${chars} / パラグラフ数: ${lines}`;
  }
}

// カラースキーム（Light: 'default', Dark: 'slate'）の初期化と VS Code テーマ連動
let manualThemeOverride = false;

/**
 * VS Code の body クラスから対応するカラースキーム（`'default'` または `'slate'`）を判定します。
 * @returns 判定されたスキーム名
 */
function detectVsCodeScheme(): 'default' | 'slate' {
  return document.body.classList.contains('vscode-light') ||
    document.body.classList.contains('vscode-high-contrast-light')
    ? 'default'
    : 'slate';
}

/**
 * ドキュメントルートにカラースキーム属性を設定し、Mermaid 等へ変更イベントを通知します。
 * @param scheme 適用するスキーム名（`'default'` または `'slate'`）
 */
function applyColorScheme(scheme: 'default' | 'slate'): void {
  document.documentElement.setAttribute('data-md-color-scheme', scheme);
  window.dispatchEvent(new CustomEvent('md-theme-change', { detail: { scheme } }));
}

applyColorScheme(detectVsCodeScheme());

const bodyClassObserver = new MutationObserver(() => {
  if (!manualThemeOverride) {
    applyColorScheme(detectVsCodeScheme());
  }
});
bodyClassObserver.observe(document.body, {
  attributes: true,
  attributeFilter: ['class'],
});

createToolbar(toolbarContainer, tableBannerContainer, editor, {
  onSwitchToText: () => {
    vscode.postMessage({ type: 'switchToText' });
  },
  getCurrentTheme: () => {
    return (
      (document.documentElement.getAttribute('data-md-color-scheme') as 'default' | 'slate') ||
      detectVsCodeScheme()
    );
  },
  onToggleTheme: () => {
    manualThemeOverride = true;
    const current =
      document.documentElement.getAttribute('data-md-color-scheme') || detectVsCodeScheme();
    const next: 'default' | 'slate' = current === 'slate' ? 'default' : 'slate';
    applyColorScheme(next);
    return next;
  },
  getReadOnly: () => isReadOnly,
  onToggleReadOnly: () => {
    const next = setReadOnly(!isReadOnly);
    persistViewPreferences();
    return next;
  },
  getSplitView: () => isSplitView,
  onToggleSplitView: () => {
    const next = setSplitView(!isSplitView);
    persistViewPreferences();
    return next;
  },
  getOutlineVisible: () => isOutlineVisible,
  onToggleOutline: () => {
    const next = setOutlineVisible(!isOutlineVisible);
    persistViewPreferences();
    return next;
  },
});

if (previewPane && editorWrapper) {
  setupTableEdgeControls(previewPane, editorWrapper, editor);
}

setupSlashMenu(
  slashMenuEl,
  editor,
  () => {
    vscode.postMessage({ type: 'pickImage' });
  },
  () => {
    if (getFrontmatter() === null) {
      setFrontmatter('title: ドキュメントタイトル');
    } else {
      setFrontmatter(null);
    }
    renderFrontmatterPanel();
    scheduleDocumentSync();
  }
);

// エディタ内リンクの Ctrl/Cmd + クリック時にカーソル移動を抑止し、外部ブラウザまたは対象ファイルを開く
function resolveClickedLinkHref(target: HTMLElement | null): string | null {
  if (!target) {
    return null;
  }
  const anchor = target.closest('a');
  if (anchor) {
    return anchor.getAttribute('href');
  }
  const linkWidget = target.closest('[data-link-href]');
  if (linkWidget) {
    return linkWidget.getAttribute('data-link-href');
  }
  return null;
}

editorElement.addEventListener(
  'mousedown',
  (e) => {
    const href = resolveClickedLinkHref(e.target as HTMLElement | null);
    if (href && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
    }
  },
  true
);

editorElement.addEventListener(
  'click',
  (e) => {
    const href = resolveClickedLinkHref(e.target as HTMLElement | null);
    if (href && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      vscode.postMessage({ type: 'openLink', href });
    }
  },
  true
);

// クリップボードからの画像貼り付けハンドリング
window.addEventListener('paste', (event: ClipboardEvent) => {
  if (isReadOnly) {
    return;
  }
  const items = event.clipboardData?.items;
  if (!items) {
    return;
  }

  for (const item of Array.from(items)) {
    if (item.type.startsWith('image/')) {
      event.preventDefault();
      const file = item.getAsFile();
      if (file) {
        uploadImageFile(file);
      }
      return;
    }
  }
});

// 画像ファイルのドラッグ＆ドロップハンドリング
window.addEventListener('drop', (event: DragEvent) => {
  if (isReadOnly) {
    return;
  }
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) {
    return;
  }

  for (const file of Array.from(files)) {
    if (file.type.startsWith('image/')) {
      event.preventDefault();
      uploadImageFile(file);
      return;
    }
  }
});

/**
 * 画像ファイルを Base64 文字列に変換し、VS Code 拡張ホストへ保存リクエストを送信します。
 * @param file 貼り付けまたはドロップされた画像ファイル
 */
function uploadImageFile(file: File): void {
  const reader = new FileReader();
  reader.onload = () => {
    const result = reader.result as string;
    const base64 = result.split(',')[1];
    const ext = file.type.split('/')[1] || 'png';
    if (base64) {
      vscode.postMessage({
        type: 'saveImage',
        base64,
        ext,
      });
    }
  };
  reader.readAsDataURL(file);
}

// VS Code 拡張ホストからのメッセージ受信処理
window.addEventListener('message', (event) => {
  const message = event.data;
  switch (message.type) {
    case 'init':
    case 'update': {
      if (message.baseUri) {
        setMarkdownBaseUri(message.baseUri);
      }
      const incomingMd: string = message.text ?? '';
      const currentMd = htmlToMarkdown(editor.getHTML());
      if (incomingMd.trim() === currentMd.trim()) {
        return;
      }
      isProgrammaticUpdate = true;
      try {
        const html = markdownToHtml(incomingMd);
        renderFrontmatterPanel();
        editor.commands.setContent(html, { emitUpdate: false });
        updateStats(editor);
        updateOutline();
        if (isSplitView && rawEditorEl && document.activeElement !== rawEditorEl) {
          rawEditorEl.value = incomingMd;
        }
      } finally {
        isProgrammaticUpdate = false;
      }
      break;
    }

    case 'imageSaved': {
      const { relativePath, webviewUri, alt } = message as {
        relativePath: string;
        webviewUri: string;
        alt: string;
      };
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'image',
          attrs: {
            src: webviewUri,
            alt: alt || 'image',
            'data-raw-src': relativePath,
          },
        })
        .run();
      break;
    }

    case 'togglePreference': {
      const target = message.target as 'readOnly' | 'splitView' | 'showIndex' | undefined;
      if (target === 'readOnly') {
        setReadOnly(!isReadOnly);
      } else if (target === 'splitView') {
        setSplitView(!isSplitView);
      } else if (target === 'showIndex') {
        setOutlineVisible(!isOutlineVisible);
      } else {
        break;
      }
      persistViewPreferences();
      window.dispatchEvent(
        new CustomEvent('md-preference-sync', {
          detail: {
            readOnly: isReadOnly,
            splitView: isSplitView,
            showIndex: isOutlineVisible,
          },
        })
      );
      break;
    }
  }
});

// Webview 準備完了を拡張ホストへ通知する
vscode.postMessage({ type: 'ready' });
