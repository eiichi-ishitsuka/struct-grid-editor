import { Editor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

/**
 * インデックスパネルに表示する見出し情報。
 */
export interface OutlineHeading {
  /** 見出しレベル (1〜6) */
  level: number;
  /** 見出しテキスト */
  text: string;
  /** ProseMirror ドキュメント内のノード開始位置 */
  pos: number;
  /** ドキュメント内の見出し出現インデックス (0始まり) */
  index: number;
}

/**
 * ProseMirror ドキュメントからすべての見出しノードを抽出します。
 * @param doc ProseMirror ドキュメントノード
 * @returns 抽出された見出し情報の配列
 */
export function extractHeadings(doc: ProseMirrorNode): OutlineHeading[] {
  const headings: OutlineHeading[] = [];
  let index = 0;

  doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      const level = Math.min(6, Math.max(1, Number(node.attrs.level) || 1));
      const text = node.textContent.trim() || '(無題)';
      headings.push({
        level,
        text,
        pos,
        index,
      });
      index += 1;
      return false;
    }
    return true;
  });

  return headings;
}

/**
 * 指定された見出し位置へプレビュー画面をスクロールジャンプします。
 * @param editor 対象の Tiptap Editor インスタンス
 * @param heading ジャンプ先の見出し情報
 */
export function jumpToHeading(editor: Editor, heading: OutlineHeading): void {
  const domNode = editor.view.nodeDOM(heading.pos) as HTMLElement | null;
  if (domNode && typeof domNode.scrollIntoView === 'function') {
    domNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  const fallbackNodes = editor.view.dom.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const fallbackEl = fallbackNodes.item(heading.index) as HTMLElement | null;
  if (fallbackEl && typeof fallbackEl.scrollIntoView === 'function') {
    fallbackEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * プレビュー画面右上の見出しインデックスパネルを描画・更新します。
 * @param panel インデックスパネルのコンテナ要素
 * @param editor 対象の Tiptap Editor インスタンス
 * @param onJump 見出しクリック時のカスタムジャンプハンドラ（省略時は既定のスクロールジャンプを実行）
 */
export function renderOutline(
  panel: HTMLElement,
  editor: Editor,
  onJump?: (heading: OutlineHeading) => void
): void {
  const headings = extractHeadings(editor.state.doc);
  panel.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'outline-header';
  header.textContent = 'Index';
  panel.appendChild(header);

  if (headings.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'outline-empty';
    empty.textContent = '見出しがありません';
    panel.appendChild(empty);
    return;
  }

  const list = document.createElement('ul');
  list.className = 'outline-list';

  for (const heading of headings) {
    const item = document.createElement('li');
    item.className = 'outline-list-item';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `outline-item outline-level-${heading.level}`;
    btn.textContent = heading.text;
    btn.title = heading.text;
    btn.setAttribute('data-heading-pos', String(heading.pos));

    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });
    btn.addEventListener('click', () => {
      if (onJump) {
        onJump(heading);
      } else {
        jumpToHeading(editor, heading);
      }
    });

    item.appendChild(btn);
    list.appendChild(item);
  }

  panel.appendChild(list);
}
