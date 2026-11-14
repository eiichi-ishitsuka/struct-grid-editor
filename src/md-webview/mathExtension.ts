import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';
import katex from 'katex';

/**
 * 指定された HTML 要素に KaTeX で LaTeX 数式を描画します。
 * @param el 描画先の HTML 要素
 * @param latex 描画する LaTeX 数式文字列
 * @param displayMode ブロック（ディスプレイ）数式として描画する場合は true
 */
function renderLatexToElement(el: HTMLElement, latex: string, displayMode: boolean): void {
  if (!latex.trim()) {
    el.innerHTML = `<span class="math-placeholder">${
      displayMode ? '$$ 数式ブロック (クリックで編集) $$' : '$数式$'
    }</span>`;
    return;
  }
  try {
    katex.render(latex, el, {
      displayMode,
      throwOnError: false,
      output: 'html',
    });
  } catch {
    el.textContent = latex;
  }
}

/**
 * インライン数式（`$...$`）を KaTeX で描画・編集するカスタム Tiptap ノード。
 */
export const InlineMath = Node.create({
  name: 'inlineMath',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: 'E = mc^2',
        parseHTML: (element) => element.getAttribute('data-latex') || element.textContent || '',
        renderHTML: (attributes) => ({
          'data-math-inline': 'true',
          'data-latex': attributes.latex,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-math-inline]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { class: 'math-inline-node' }),
      `$${node.attrs.latex || ''}$`,
    ];
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /\$([^$\n]+)\$$/,
        type: this.type,
        getAttributes: (match) => ({
          latex: match[1],
        }),
      }),
    ];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      let currentNode = node;
      const dom = document.createElement('span');
      dom.className = 'math-inline-node';
      dom.title = 'クリックして数式 (LaTeX) を編集';

      const preview = document.createElement('span');
      preview.className = 'math-inline-preview';
      dom.appendChild(preview);

      renderLatexToElement(preview, currentNode.attrs.latex, false);

      dom.addEventListener('click', (e) => {
        e.stopPropagation();
        openMathEditorPopover(
          dom,
          currentNode.attrs.latex,
          false,
          (newLatex) => {
            const pos = typeof getPos === 'function' ? getPos() : undefined;
            if (typeof pos === 'number') {
              editor.commands.command(({ tr }) => {
                tr.setNodeMarkup(pos, undefined, { latex: newLatex });
                return true;
              });
            }
          }
        );
      });

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type !== currentNode.type) {
            return false;
          }
          currentNode = updatedNode;
          renderLatexToElement(preview, currentNode.attrs.latex, false);
          return true;
        },
      };
    };
  },
});

/**
 * ブロック数式（`$$...$$`）を KaTeX で描画・編集するカスタム Tiptap ノード。
 */
export const BlockMath = Node.create({
  name: 'blockMath',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
        parseHTML: (element) => element.getAttribute('data-latex') || element.textContent || '',
        renderHTML: (attributes) => ({
          'data-math-block': 'true',
          'data-latex': attributes.latex,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-math-block]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { class: 'math-block-node' }),
      `$$${node.attrs.latex || ''}$$`,
    ];
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /^\$\$([^$]*)\$\$$/,
        type: this.type,
        getAttributes: (match) => ({
          latex: match[1] || '',
        }),
      }),
    ];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      let currentNode = node;
      const dom = document.createElement('div');
      dom.className = 'math-block-node';
      dom.title = 'クリックして数式ブロック (LaTeX) を編集';

      const preview = document.createElement('div');
      preview.className = 'math-block-preview';
      dom.appendChild(preview);

      renderLatexToElement(preview, currentNode.attrs.latex, true);

      dom.addEventListener('click', (e) => {
        e.stopPropagation();
        openMathEditorPopover(
          dom,
          currentNode.attrs.latex,
          true,
          (newLatex) => {
            const pos = typeof getPos === 'function' ? getPos() : undefined;
            if (typeof pos === 'number') {
              editor.commands.command(({ tr }) => {
                tr.setNodeMarkup(pos, undefined, { latex: newLatex });
                return true;
              });
            }
          }
        );
      });

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type !== currentNode.type) {
            return false;
          }
          currentNode = updatedNode;
          renderLatexToElement(preview, currentNode.attrs.latex, true);
          return true;
        },
      };
    };
  },
});

/**
 * 数式ノードをクリックした際に LaTeX ソース編集用のポップオーバーを表示します。
 * @param anchor ポップオーバーの位置基準となる DOM 要素
 * @param initialValue 初期表示する LaTeX 文字列
 * @param isBlock ブロック数式かどうか（true の場合は複数行テキストエリアを表示）
 * @param onSave 確定時に新しい LaTeX 文字列を受け取るコールバック
 */
function openMathEditorPopover(
  anchor: HTMLElement,
  initialValue: string,
  isBlock: boolean,
  onSave: (val: string) => void
): void {
  const existing = document.querySelector('.math-editor-popover');
  if (existing) {
    existing.remove();
  }

  const popover = document.createElement('div');
  popover.className = 'math-editor-popover';

  const label = document.createElement('div');
  label.className = 'math-editor-label';
  label.textContent = isBlock
    ? 'LaTeX 数式ブロック (Ctrl+Enterで確定)'
    : 'LaTeX インライン数式 (Enterで確定)';

  const input = isBlock
    ? document.createElement('textarea')
    : document.createElement('input');
  input.className = 'math-editor-input';
  input.value = initialValue;

  const btnRow = document.createElement('div');
  btnRow.className = 'math-editor-actions';

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'math-btn-primary';
  saveBtn.textContent = '適用';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'math-btn-secondary';
  cancelBtn.textContent = '閉じる';

  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(saveBtn);

  popover.appendChild(label);
  popover.appendChild(input);
  popover.appendChild(btnRow);

  document.body.appendChild(popover);

  const rect = anchor.getBoundingClientRect();
  popover.style.top = `${Math.min(window.innerHeight - 160, rect.bottom + 6)}px`;
  popover.style.left = `${Math.max(12, Math.min(window.innerWidth - 340, rect.left))}px`;

  input.focus();
  input.select();

  const commit = () => {
    onSave(input.value);
    popover.remove();
  };

  saveBtn.addEventListener('click', commit);
  cancelBtn.addEventListener('click', () => popover.remove());

  input.addEventListener('keydown', (e) => {
    const ke = e as KeyboardEvent;
    if (ke.key === 'Escape') {
      e.preventDefault();
      popover.remove();
    } else if (ke.key === 'Enter' && (!isBlock || ke.ctrlKey || ke.metaKey)) {
      e.preventDefault();
      commit();
    }
  });
}
