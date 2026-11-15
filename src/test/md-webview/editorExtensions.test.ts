// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { CustomCodeBlock } from '../../md-webview/mermaidExtension';
import { AdmonitionBlock } from '../../md-webview/admonitionExtension';
import { InlineMath, BlockMath } from '../../md-webview/mathExtension';
import { LivePreviewExtension } from '../../md-webview/livePreviewExtension';
import { createToolbar } from '../../md-webview/toolbar';
import { renderOutline } from '../../md-webview/outline';
import { markdownToHtml, htmlToMarkdown } from '../../md-webview/markdownCodec';

const mockMermaid = {
  initialize: vi.fn(),
  render: vi.fn().mockResolvedValue({ svg: '<svg class="mock-mermaid-svg"></svg>' }),
};

describe('Tiptap Editor Extensions Integration', () => {
  let container: HTMLElement;

  beforeEach(() => {
    (window as unknown as { __mermaid: typeof mockMermaid }).__mermaid = mockMermaid;
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  function createTestEditor(initialMarkdown: string) {
    const html = markdownToHtml(initialMarkdown);
    return new Editor({
      element: container,
      extensions: [
        StarterKit.configure({ codeBlock: false, link: false }),
        Link.configure({
          openOnClick: false,
          autolink: true,
          isAllowedUri: () => true,
        }),
        CustomCodeBlock,
        AdmonitionBlock,
        LivePreviewExtension,
        InlineMath,
        BlockMath,
      ],
      content: html,
    });
  }

  /**
   * 【観点】Mermaidコードブロックのソース編集表示切り替え動作
   * 【テスト内容】Mermaid言語指定のコードブロックで「ソースを編集」ボタンをクリックした際、NodeViewがリセットされることなくコード領域の表示・非表示が切り替わることを検証する。
   */
  it('toggles Mermaid source editor visibility when clicking the edit source button without resetting NodeView', () => {
    const md = '```mermaid\nflowchart LR\n    A --> B\n```\n';
    const editor = createTestEditor(md);

    const pre = container.querySelector('.code-block-pre') as HTMLElement;
    const toggleBtn = container.querySelector('.code-toggle-btn') as HTMLButtonElement;

    expect(pre).toBeTruthy();
    expect(toggleBtn).toBeTruthy();

    expect(pre.classList.contains('hidden')).toBe(true);
    expect(toggleBtn.textContent).toBe('ソースを編集');

    toggleBtn.click();

    expect(pre.classList.contains('hidden')).toBe(false);
    expect(toggleBtn.textContent).toBe('ソースを隠す');

    toggleBtn.click();
    expect(pre.classList.contains('hidden')).toBe(true);
    expect(toggleBtn.textContent).toBe('ソースを編集');

    editor.destroy();
  });

  /**
   * 【観点】通常言語（Python）コードブロックの常時ソース表示
   * 【テスト内容】Python言語のコードブロックではソースコード領域が常時表示され、Mermaid用のソース切り替えボタンが非表示になることを検証する。
   */
  it('keeps Python code block source always visible and hides Mermaid toggle button', () => {
    const md = '```python\nprint("hello")\n```\n';
    const editor = createTestEditor(md);

    const pre = container.querySelector('.code-block-pre') as HTMLElement;
    const toggleBtn = container.querySelector('.code-toggle-btn') as HTMLButtonElement;
    const langSelect = container.querySelector('.code-lang-select') as HTMLSelectElement;

    expect(langSelect.value).toBe('python');
    expect(pre.classList.contains('hidden')).toBe(false);
    expect(toggleBtn.classList.contains('hidden')).toBe(true);

    editor.destroy();
  });

  /**
   * 【観点】Admonition拡張NodeViewのヘッダーUIによる属性更新とシリアライズ反映
   * 【テスト内容】Admonitionブロックのモード・タイプ・タイトル入力欄を変更した際、ノード属性が更新され、対応するMarkdown記法（??? warning "タイトル"）として出力されることを検証する。
   */
  it('renders Admonition NodeView and updates attributes via header controls', () => {
    const md = '!!! note "初期タイトル"\n    Admonitionの中身\n';
    const editor = createTestEditor(md);

    const admonitionEl = container.querySelector('.admonition-block') as HTMLElement;
    const modeSelect = container.querySelector('.admonition-mode-select') as HTMLSelectElement;
    const typeSelect = container.querySelector('.admonition-type-select') as HTMLSelectElement;
    const titleInput = container.querySelector('.admonition-title-input') as HTMLInputElement;

    expect(admonitionEl).toBeTruthy();
    expect(modeSelect.value).toBe('!!!');
    expect(typeSelect.value).toBe('note');
    expect(titleInput.value).toBe('初期タイトル');

    modeSelect.value = '???';
    modeSelect.dispatchEvent(new Event('change'));
    typeSelect.value = 'warning';
    typeSelect.dispatchEvent(new Event('change'));
    titleInput.value = '変更後のタイトル';
    titleInput.dispatchEvent(new Event('change'));

    const serialized = htmlToMarkdown(editor.getHTML());
    expect(serialized).toBe('??? warning "変更後のタイトル"\n    Admonitionの中身\n');

    editor.destroy();
  });

  /**
   * 【観点】KaTeX数式ノードのDOM描画とMarkdownシリアライズ保持
   * 【テスト内容】インライン数式とブロック数式がKaTeXによってDOM描画され、かつエディタからHTML経由でMarkdownへ変換した際に数式が欠落せず保持されることを検証する。
   */
  it('renders KaTeX inline and block math nodes with katex output', () => {
    const md = 'インライン $a^2 + b^2 = c^2$ とブロック:\n\n$$\n\\frac{1}{2}\n$$\n';
    const editor = createTestEditor(md);

    const inlineNode = container.querySelector('.math-inline-node') as HTMLElement;
    const blockNode = container.querySelector('.math-block-node') as HTMLElement;

    expect(inlineNode).toBeTruthy();
    expect(blockNode).toBeTruthy();
    expect(inlineNode.querySelector('.katex')).toBeTruthy();
    expect(blockNode.querySelector('.katex-display')).toBeTruthy();

    const serialized = htmlToMarkdown(editor.getHTML());
    expect(serialized).toBe(md);

    editor.destroy();
  });

  /**
   * 【観点】カーソル位置に応じたMarkdown記法マーカーの動的表示（Live Preview）
   * 【テスト内容】見出しや太字箇所にカーソルが当たっている時のみ ## や ** の構文マーカーが表示され、カーソルが外れると非表示になることを検証する。
   */
  it('reveals Markdown syntax markers (#, **) only on the active cursor line/mark', () => {
    const md = '## セクション見出し\n\n通常の段落と **太字テキスト** です。\n';
    const editor = createTestEditor(md);

    editor.commands.setTextSelection(2);
    let headingMarker = container.querySelector('.md-syntax-heading');
    expect(headingMarker).toBeTruthy();
    expect(headingMarker?.textContent).toBe('## ');

    editor.commands.setTextSelection(14);
    headingMarker = container.querySelector('.md-syntax-heading');
    expect(headingMarker).toBeNull();
    expect(container.querySelector('.md-syntax-bold')).toBeNull();

    editor.commands.setTextSelection(22);
    const boldMarkers = container.querySelectorAll('.md-syntax-bold');
    expect(boldMarkers.length).toBe(2);
    expect(boldMarkers[0].textContent).toBe('**');
    expect(boldMarkers[1].textContent).toBe('**');

    editor.destroy();
  });

  /**
   * 【観点】ツールバーによるライト（default）・ダーク（slate）テーマ切り替え
   * 【テスト内容】上部ツールバーのテーマ切り替えボタンを押下した際、data-md-color-scheme属性とボタンラベルがLight/Dark間で正しく切り替わることを検証する。
   */
  it('switches color scheme between Light (default) and Dark (slate) via toolbar', () => {
    const editor = createTestEditor('# Theme Test\n');
    const toolbarEl = document.createElement('div');
    const tableBannerEl = document.createElement('div');

    let scheme: 'default' | 'slate' = 'slate';
    document.documentElement.setAttribute('data-md-color-scheme', scheme);

    createToolbar(toolbarEl, tableBannerEl, editor, {
      onSwitchToText: vi.fn(),
      getCurrentTheme: () => scheme,
      onToggleTheme: () => {
        scheme = scheme === 'slate' ? 'default' : 'slate';
        document.documentElement.setAttribute('data-md-color-scheme', scheme);
        return scheme;
      },
    });

    const buttons = toolbarEl.querySelectorAll('button');
    expect(buttons.length).toBe(2);
    const themeBtn = buttons[0];
    expect(themeBtn.textContent).toBe('Theme: Dark (Slate)');

    themeBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(document.documentElement.getAttribute('data-md-color-scheme')).toBe('default');
    expect(themeBtn.textContent).toBe('Theme: Light (Default)');

    editor.destroy();
  });

  /**
   * 【観点】相対パスリンク（../.agents/...）の href 属性保持と Live Preview マーカーへの data-link-href 付与
   * 【テスト内容】ドット始まりや親ディレクトリ参照を含む相対パスリンクが Tiptap Link 拡張によって欠落せず保持され、カーソル接触時の構文マーカーにも data-link-href 属性が付与されることを検証する。
   */
  it('preserves relative file links and attaches data-link-href to link syntax markers', () => {
    const md = '参照: [.agents/rules/ai-development-workflow.md](../.agents/rules/ai-development-workflow.md)\n';
    const editor = createTestEditor(md);

    const anchor = container.querySelector('a') as HTMLAnchorElement | null;
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute('href')).toBe('../.agents/rules/ai-development-workflow.md');

    editor.commands.setTextSelection(6);
    const linkMarkers = container.querySelectorAll('.md-syntax-link');
    expect(linkMarkers.length).toBe(2);
    expect(linkMarkers[1].getAttribute('data-link-href')).toBe(
      '../.agents/rules/ai-development-workflow.md'
    );

    editor.destroy();
  });

  /**
   * 【観点】ReadOnly モード時の Live Preview 構文マーカー非表示
   * 【テスト内容】editor.setEditable(false) の状態で見出しや太字行にカーソルを置いても、## や ** などの rawtext 構文マーカーが表示されないことを検証する。
   */
  it('hides Markdown syntax markers when editor is in ReadOnly mode', () => {
    const md = '## 見出し\n\n**太字** のテキスト\n';
    const editor = createTestEditor(md);

    editor.setEditable(false);
    editor.commands.setTextSelection(2);
    expect(container.querySelector('.md-syntax-heading')).toBeNull();

    editor.commands.setTextSelection(10);
    expect(container.querySelector('.md-syntax-bold')).toBeNull();

    editor.destroy();
  });

  /**
   * 【観点】ツールバーの ReadOnly / 左右分割 / Index トグル初期値と切り替え動作
   * 【テスト内容】ReadOnly(OFF)・左右分割(OFF)・Index(ON) の各トグルボタンが初期状態で表示され、クリックで状態が切り替わることを検証する。
   */
  it('renders ReadOnly, SplitView, and Index toggles with expected defaults and toggles state', () => {
    const editor = createTestEditor('# Toggle Test\n');
    const toolbarEl = document.createElement('div');
    const tableBannerEl = document.createElement('div');

    let readOnly = false;
    let splitView = false;
    let outlineVisible = true;

    createToolbar(toolbarEl, tableBannerEl, editor, {
      onSwitchToText: vi.fn(),
      getCurrentTheme: () => 'default',
      onToggleTheme: () => 'default',
      getReadOnly: () => readOnly,
      onToggleReadOnly: () => {
        readOnly = !readOnly;
        return readOnly;
      },
      getSplitView: () => splitView,
      onToggleSplitView: () => {
        splitView = !splitView;
        return splitView;
      },
      getOutlineVisible: () => outlineVisible,
      onToggleOutline: () => {
        outlineVisible = !outlineVisible;
        return outlineVisible;
      },
    });

    const spacer = toolbarEl.querySelector('.toolbar-spacer') as HTMLElement;
    const roBtn = toolbarEl.querySelector('.toolbar-toggle-readonly') as HTMLButtonElement;
    const splitBtn = toolbarEl.querySelector('.toolbar-toggle-split') as HTMLButtonElement;
    const outlineBtn = toolbarEl.querySelector('.toolbar-toggle-outline') as HTMLButtonElement;

    // トグルはスペーサーの後ろ（右揃え）に配置される
    expect(spacer.compareDocumentPosition(roBtn) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    expect(roBtn.textContent).toBe('Read Mode: OFF');
    expect(roBtn.classList.contains('active')).toBe(false);
    expect(splitBtn.textContent).toBe('Split View: OFF');
    expect(splitBtn.classList.contains('active')).toBe(false);
    expect(outlineBtn.textContent).toBe('Show Index: ON');
    expect(outlineBtn.classList.contains('active')).toBe(true);

    roBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    splitBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    outlineBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(roBtn.textContent).toBe('Read Mode: ON');
    expect(roBtn.classList.contains('active')).toBe(true);
    expect(splitBtn.textContent).toBe('Split View: ON');
    expect(splitBtn.classList.contains('active')).toBe(true);
    expect(outlineBtn.textContent).toBe('Show Index: OFF');
    expect(outlineBtn.classList.contains('active')).toBe(false);

    editor.destroy();
  });

  /**
   * 【観点】Index パネルの見出し一覧描画とクリックによる見出しジャンプ
   * 【テスト内容】ドキュメント内の見出しが Index パネルに一覧表示され、項目クリックで対象見出し要素へスクロールジャンプすることを検証する。
   */
  it('renders heading index list and scrolls to heading on click', () => {
    const md = '# タイトル\n\n本文\n\n## セクション1\n\n### サブセクション\n';
    const editor = createTestEditor(md);
    const panel = document.createElement('aside');

    renderOutline(panel, editor);

    const items = panel.querySelectorAll('.outline-item');
    expect(items.length).toBe(3);
    expect(items[0].textContent).toBe('タイトル');
    expect(items[0].classList.contains('outline-level-1')).toBe(true);
    expect(items[1].textContent).toBe('セクション1');
    expect(items[1].classList.contains('outline-level-2')).toBe(true);
    expect(items[2].textContent).toBe('サブセクション');
    expect(items[2].classList.contains('outline-level-3')).toBe(true);

    const h2 = container.querySelector('h2') as HTMLElement;
    const scrollIntoViewMock = vi.fn();
    h2.scrollIntoView = scrollIntoViewMock;

    (items[1] as HTMLButtonElement).click();
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    editor.destroy();
  });
});
