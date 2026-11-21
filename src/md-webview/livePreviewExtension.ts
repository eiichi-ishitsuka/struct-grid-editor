import { Extension, markInputRule } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

const livePreviewPluginKey = new PluginKey('livePreviewExtension');

/**
 * Markdown 記法マーカー表示用のインライン DOM ウィジェット要素を生成します。
 * @param text 表示する Markdown 記法記号（`# `, `**` など）
 * @param extraClass 追加で付与する CSS クラス名
 * @returns 生成された span 要素
 */
function createSyntaxWidget(text: string, extraClass = ''): HTMLElement {
  const span = document.createElement('span');
  span.className = `md-syntax-marker ${extraClass}`.trim();
  span.textContent = text;
  return span;
}

/**
 * カーソル位置に連動して Markdown 記法マーカーを動的に表示する Live Preview 拡張。
 * - カーソルが置かれている見出し行に `# `, `## `, `### ` 等を表示します。
 * - 引用ブロック内のアクティブ段落に `> ` を表示します。
 * - カーソルが接しているインライン装飾（太字・斜体・取消線・インラインコード・リンク）の前後に記法記号を表示します。
 * - 見出し先頭での `#` キーおよび `Backspace` キーによる見出しレベル変更をサポートします。
 */
export const LivePreviewExtension = Extension.create({
  name: 'livePreviewExtension',

  addInputRules() {
    const linkType = this.editor.schema.marks.link;
    if (!linkType) {
      return [];
    }
    return [
      markInputRule({
        find: /\[([^\]]+)\]\(([^)\s]+)\)$/,
        type: linkType,
        getAttributes: (match) => ({
          href: match[2],
        }),
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      // 見出し先頭で '#' を入力した際に見出しレベルを1段階下げる (# -> ## -> ###)
      '#': () => {
        const { state } = this.editor;
        const { selection } = state;
        const { $from, empty } = selection;
        if (!empty || $from.parentOffset !== 0) {
          return false;
        }

        if ($from.parent.type.name === 'heading') {
          const currentLevel = Number($from.parent.attrs.level) || 1;
          if (currentLevel < 6) {
            return this.editor
              .chain()
              .focus()
              .setHeading({ level: (currentLevel + 1) as 1 | 2 | 3 | 4 | 5 | 6 })
              .run();
          }
        }
        return false;
      },

      // 見出し先頭で Backspace を押した際に見出しレベルを1段階上げる、または段落へ戻す
      Backspace: () => {
        const { state } = this.editor;
        const { selection } = state;
        const { $from, empty } = selection;
        if (!empty || $from.parentOffset !== 0) {
          return false;
        }

        if ($from.parent.type.name === 'heading') {
          const currentLevel = Number($from.parent.attrs.level) || 1;
          if (currentLevel > 1) {
            return this.editor
              .chain()
              .focus()
              .setHeading({ level: (currentLevel - 1) as 1 | 2 | 3 | 4 | 5 | 6 })
              .run();
          } else {
            return this.editor.chain().focus().setParagraph().run();
          }
        }
        return false;
      },
    };
  },

  addProseMirrorPlugins() {
    const editor = this.editor;
    return [
      new Plugin({
        key: livePreviewPluginKey,
        props: {
          decorations: (state) => {
            if (!editor.isEditable) {
              return DecorationSet.empty;
            }
            const { doc, selection } = state;
            const { $from, from, to } = selection;
            if ($from.depth === 0) {
              return DecorationSet.empty;
            }
            const decorations: Decoration[] = [];
            const addedMarkKeys = new Set<string>();

            // 1. アクティブブロックの記法マーカー表示（見出し `# `、引用 `> `）
            const parent = $from.parent;
            const parentStart = $from.start();
            const parentNodePos = $from.before();

            if (parent.isTextblock) {
              decorations.push(
                Decoration.node(parentNodePos, parentNodePos + parent.nodeSize, {
                  class: 'is-active-line',
                })
              );
            }

            if (parent.type.name === 'heading') {
              const level = Number(parent.attrs.level) || 1;
              const hashes = '#'.repeat(level) + ' ';
              decorations.push(
                Decoration.widget(
                  parentStart,
                  () => createSyntaxWidget(hashes, 'md-syntax-heading'),
                  { side: -1, key: `heading-prefix-${level}` }
                )
              );
            }

            // 引用ブロック内にカーソルがある場合の `> ` マーカー表示
            for (let d = $from.depth; d > 0; d--) {
              if ($from.node(d).type.name === 'blockquote' && parent.type.name === 'paragraph') {
                decorations.push(
                  Decoration.widget(
                    parentStart,
                    () => createSyntaxWidget('> ', 'md-syntax-quote'),
                    { side: -1, key: 'blockquote-prefix' }
                  )
                );
                break;
              }
            }

            // 2. アクティブなインライン装飾の記法マーカー表示 (**bold**, *italic*, ~~strike~~, `code`, [text](url))
            if (parent.isTextblock) {
              const blockEnd = $from.end();
              const markSyntaxMap: Record<
                string,
                { open: string; close: (attrs: Record<string, unknown>) => string }
              > = {
                bold: { open: '**', close: () => '**' },
                italic: { open: '*', close: () => '*' },
                strike: { open: '~~', close: () => '~~' },
                code: { open: '`', close: () => '`' },
                link: {
                  open: '[',
                  close: (attrs) => `](${typeof attrs?.href === 'string' ? attrs.href : ''})`,
                },
              };

              // 現在のテキストブロック内でカーソルが接している装飾範囲を走査する
              doc.nodesBetween(parentStart, blockEnd, (node, pos) => {
                if (!node.isText || node.marks.length === 0) {
                  return;
                }

                const nodeStart = pos;
                const nodeEnd = pos + node.nodeSize;

                const isCursorTouching =
                  (from >= nodeStart && from <= nodeEnd) ||
                  (to >= nodeStart && to <= nodeEnd) ||
                  (from <= nodeStart && to >= nodeEnd);

                if (!isCursorTouching) {
                  return;
                }

                for (const mark of node.marks) {
                  const syntax = markSyntaxMap[mark.type.name];
                  if (!syntax) {
                    continue;
                  }

                  // 同一ブロック内で連続する同一マークの開始・終了位置を特定する
                  let spanStart = nodeStart;
                  let spanEnd = nodeEnd;

                  doc.nodesBetween(parentStart, blockEnd, (sibling, sPos) => {
                    if (!sibling.isText) {
                      return;
                    }
                    const sEnd = sPos + sibling.nodeSize;
                    if (mark.isInSet(sibling.marks)) {
                      if (sEnd === spanStart) {
                        spanStart = sPos;
                      }
                      if (sPos === spanEnd) {
                        spanEnd = sEnd;
                      }
                    }
                  });

                  const openKey = `mark-open-${mark.type.name}-${spanStart}`;
                  const closeKey = `mark-close-${mark.type.name}-${spanEnd}`;

                  if (!addedMarkKeys.has(openKey)) {
                    addedMarkKeys.add(openKey);
                    const linkHref =
                      mark.type.name === 'link' && typeof mark.attrs?.href === 'string'
                        ? mark.attrs.href
                        : '';
                    decorations.push(
                      Decoration.widget(
                        spanStart,
                        () => {
                          const w = createSyntaxWidget(syntax.open, `md-syntax-${mark.type.name}`);
                          if (linkHref) {
                            w.setAttribute('data-link-href', linkHref);
                          }
                          return w;
                        },
                        { side: -1, key: openKey }
                      )
                    );
                    decorations.push(
                      Decoration.widget(
                        spanEnd,
                        () => {
                          const w = createSyntaxWidget(
                            syntax.close(mark.attrs as Record<string, unknown>),
                            `md-syntax-${mark.type.name}`
                          );
                          if (linkHref) {
                            w.setAttribute('data-link-href', linkHref);
                          }
                          return w;
                        },
                        { side: 1, key: closeKey }
                      )
                    );
                  }
                }
              });
            }

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});
