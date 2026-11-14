// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  markdownToHtml,
  htmlToMarkdown,
  extractYamlFrontmatter,
  getFrontmatter,
  setFrontmatter,
  setMarkdownBaseUri,
  resolveImageSrc,
} from '../../md-webview/markdownCodec';

describe('markdownCodec - Markdown <-> HTML Codec', () => {
  beforeEach(() => {
    setMarkdownBaseUri('https://file+.vscode-resource.vscode-cdn.net/workspace/docs');
    setFrontmatter(null);
  });

  describe('YAML Frontmatter', () => {
    /**
     * 【観点】YAML Frontmatterと本文の分離抽出
     * 【テスト内容】先頭に --- で囲まれたYAMLメタデータを持つMarkdownから、Frontmatter部分と本文部分が正確に分離されることを検証する。
     */
    it('extracts YAML frontmatter and body accurately', () => {
      const md = `---
title: テストドキュメント
description: 互換テスト
---

# 見出し1

本文テキスト`;

      const { frontmatter, body } = extractYamlFrontmatter(md);
      expect(frontmatter).toBe('title: テストドキュメント\ndescription: 互換テスト');
      expect(body.trim()).toBe('# 見出し1\n\n本文テキスト');
    });

    /**
     * 【観点】YAML Frontmatterのラウンドトリップ保持
     * 【テスト内容】markdownToHtmlおよびhtmlToMarkdownの双方向変換を経ても、先頭のYAML Frontmatterが水平線に変換されず完全に保持されることを検証する。
     */
    it('preserves YAML frontmatter through markdownToHtml and htmlToMarkdown round-trip', () => {
      const md = `---
title: Sample Doc
tags:
  - docs
  - wysiwyg
---

# メインタイトル

段落テキストです。
`;
      const html = markdownToHtml(md);
      expect(getFrontmatter()).toContain('title: Sample Doc');
      expect(html).not.toContain('<hr>');

      const roundTripped = htmlToMarkdown(html);
      expect(roundTripped).toBe(md);
    });
  });

  describe('Admonitions (!!! / ??? / ???+)', () => {
    /**
     * 【観点】標準Admonitionブロックの双方向変換
     * 【テスト内容】!!! note "タイトル" と4スペースインデント本文からなるAdmonition記法がHTML属性付き要素へ変換され、再シリアライズ時に元の4スペースインデント記法へ復元されることを検証する。
     */
    it('converts !!! note with custom title to HTML and back to 4-space indented Markdown', () => {
      const md = `!!! note "補足タイトル"\n    これはAdmonitionの本文です。\n`;
      const html = markdownToHtml(md);

      expect(html).toContain('data-admonition="true"');
      expect(html).toContain('data-admonition-mode="!!!"');
      expect(html).toContain('data-admonition-type="note"');
      expect(html).toContain('data-admonition-title="補足タイトル"');

      const outMd = htmlToMarkdown(html);
      expect(outMd).toBe(md);
    });

    /**
     * 【観点】折りたたみAdmonition（??? / ???+）およびタイトル省略記法の双方向変換
     * 【テスト内容】??? warning と ???+ tip（タイトル省略）の記法がそれぞれ正しいモード・タイプ属性としてパースされ、元のMarkdownへ正確に復元されることを検証する。
     */
    it('converts collapsible ??? warning and ???+ tip blocks accurately', () => {
      const md = `??? warning "折りたたみ警告"\n    注意すべき内容です。\n\n???+ tip\n    タイトル省略形式のヒントです。\n`;
      const html = markdownToHtml(md);

      expect(html).toContain('data-admonition-mode="???"');
      expect(html).toContain('data-admonition-type="warning"');
      expect(html).toContain('data-admonition-mode="???+"');
      expect(html).toContain('data-admonition-type="tip"');

      const outMd = htmlToMarkdown(html);
      expect(outMd).toBe(md);
    });
  });

  describe('Python-Markdown Lists (4-space indentation & Task Lists)', () => {
    /**
     * 【観点】ネストされた箇条書きリストの4スペースインデント出力
     * 【テスト内容】親子構造を持つ箇条書きリストが、Python-Markdown規約に準拠した4スペースインデントで再シリアライズされることを検証する。
     */
    it('serializes nested bullet lists with 4-space indentation', () => {
      const md = `- 親項目 1\n    - 子項目 1.1\n    - 子項目 1.2\n- 親項目 2\n`;
      const html = markdownToHtml(md);
      const outMd = htmlToMarkdown(html);
      expect(outMd).toBe(md);
    });

    /**
     * 【観点】段落直後のトップレベルリスト前の空行強制
     * 【テスト内容】段落の直後に配置されたリスト要素が、Markdown出力時に必ず空行（2つの改行）を挟んで出力されることを検証する。
     */
    it('enforces a blank line before top-level lists following a paragraph', () => {
      const html = '<p>先行する段落</p><ul><li><p>リスト1</p></li><li><p>リスト2</p></li></ul>';
      const outMd = htmlToMarkdown(html);
      expect(outMd).toBe('先行する段落\n\n- リスト1\n- リスト2\n');
    });

    /**
     * 【観点】GFMタスクリストのチェック状態保持
     * 【テスト内容】チェック済み（- [x]）および未チェック（- [ ]）のタスクリスト項目がTiptap形式のHTMLに変換され、再シリアライズ時に元の状態が保持されることを検証する。
     */
    it('preserves GFM task list checked and unchecked states', () => {
      const md = `- [x] 完了したタスク\n- [ ] 未完了のタスク\n`;
      const html = markdownToHtml(md);

      expect(html).toContain('data-type="taskList"');
      expect(html).toContain('data-checked="true"');
      expect(html).toContain('data-checked="false"');

      const outMd = htmlToMarkdown(html);
      expect(outMd).toBe(md);
    });
  });

  describe('Code Blocks (Python & Mermaid) and Math Protection', () => {
    /**
     * 【観点】コードブロック内の特殊記号（$・!!!）の誤変換防止と言語属性保持
     * 【テスト内容】Python等のフェンス付きコードブロック内に含まれる $ 記号や !!! 文字列が数式やAdmonitionに誤変換されず、そのまま保持されることを検証する。
     */
    it('preserves Python and Mermaid fenced code blocks without mangling $ or !!! inside code', () => {
      const md = '```python\ndef calc(x: int) -> str:\n    # $not_math$ and !!! not_admonition\n    return f"cost is ${x}"\n```\n';
      const html = markdownToHtml(md);

      expect(html).not.toContain('data-math-inline');
      expect(html).not.toContain('data-admonition');
      expect(html).toContain('class="language-python"');

      const outMd = htmlToMarkdown(html);
      expect(outMd).toBe(md);
    });
  });

  describe('KaTeX Math (Inline & Block)', () => {
    /**
     * 【観点】インライン数式とブロック数式の双方向変換
     * 【テスト内容】文中の $...$ および独立ブロックの $$...$$ 数式が専用のHTML要素に変換され、消失することなく元のLaTeX記法へ再シリアライズされることを検証する。
     */
    it('converts inline math $...$ and block math $$...$$ and round-trips cleanly', () => {
      const md = `文中の数式 $E = mc^2$ です。\n\n$$\n\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}\n$$\n`;
      const html = markdownToHtml(md);

      expect(html).toContain('data-math-inline="true"');
      expect(html).toContain('data-math-block="true"');

      const outMd = htmlToMarkdown(html);
      expect(outMd).toBe(md);
    });
  });

  describe('GFM Tables', () => {
    /**
     * 【観点】GFMテーブルのパースと再シリアライズ
     * 【テスト内容】MarkdownテーブルがHTMLのtable要素へ変換され、編集後もパイプ区切りのGFMテーブル形式に正しく復元されることを検証する。
     */
    it('parses and serializes GFM tables cleanly', () => {
      const md = `| 項目 | 状態 | 説明 |\n| --- | --- | --- |\n| Editor | OK | 正常動作 |\n| Table | OK | GFM準拠 |\n`;
      const html = markdownToHtml(md);
      const outMd = htmlToMarkdown(html);
      expect(outMd).toBe(md);
    });
  });

  describe('Image Path Resolution', () => {
    /**
     * 【観点】ローカル相対画像パスのWebview URI変換と元パスの保持
     * 【テスト内容】相対パスの画像記法が表示用のWebview URIに変換されつつ、data-raw-src属性によって保存時には元の相対パスへ復元されることを検証する。
     */
    it('resolves relative image paths to webview URIs while keeping original path in Markdown', () => {
      const md = `![スクリーンショット](assets/demo.png)\n`;
      const html = markdownToHtml(md);

      expect(html).toContain(
        'src="https://file+.vscode-resource.vscode-cdn.net/workspace/docs/assets/demo.png"'
      );
      expect(html).toContain('data-raw-src="assets/demo.png"');

      const outMd = htmlToMarkdown(html);
      expect(outMd).toBe(md);
    });

    /**
     * 【観点】外部URL画像のパス無変換維持
     * 【テスト内容】https:// で始まる外部画像URLはベースURIの付与を行わず、そのままのURLが返されることを検証する。
     */
    it('leaves external https image URLs untouched', () => {
      expect(resolveImageSrc('https://example.com/pic.png')).toBe('https://example.com/pic.png');
    });
  });
});
