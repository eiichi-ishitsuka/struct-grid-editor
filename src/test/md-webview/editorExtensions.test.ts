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
        StarterKit.configure({ codeBlock: false }),
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
});
