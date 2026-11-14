import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Admonition ブロックで選択可能なタイプ一覧。
 */
export const ADMONITION_TYPES = [
  { value: 'note', label: 'Note (補足)' },
  { value: 'info', label: 'Info (情報)' },
  { value: 'tip', label: 'Tip (ヒント)' },
  { value: 'success', label: 'Success (成功)' },
  { value: 'warning', label: 'Warning (警告)' },
  { value: 'danger', label: 'Danger (危険)' },
  { value: 'question', label: 'Question (質問)' },
  { value: 'example', label: 'Example (例)' },
  { value: 'bug', label: 'Bug (バグ)' },
  { value: 'abstract', label: 'Abstract (概要)' },
  { value: 'failure', label: 'Failure (失敗)' },
  { value: 'quote', label: 'Quote (引用)' },
] as const;

/**
 * Admonition ブロックで選択可能な表示・折りたたみモード一覧。
 */
export const ADMONITION_MODES = [
  { value: '!!!', label: '!!! 固定表示' },
  { value: '???', label: '??? 折りたたみ (閉)' },
  { value: '???+', label: '???+ 折りたたみ (開)' },
] as const;

/**
 * Python-Markdown 形式の Admonition および Details（折りたたみ）ブロックを表現するカスタム Tiptap ノード。
 * `!!! note "Title"` や `??? warning "Collapsible Title"` と 4 スペースインデント本文の編集に対応します。
 */
export const AdmonitionBlock = Node.create({
  name: 'admonition',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      mode: {
        default: '!!!',
        parseHTML: (el) => el.getAttribute('data-admonition-mode') || '!!!',
        renderHTML: (attrs) => ({ 'data-admonition-mode': attrs.mode || '!!!' }),
      },
      admonitionType: {
        default: 'note',
        parseHTML: (el) => el.getAttribute('data-admonition-type') || 'note',
        renderHTML: (attrs) => ({ 'data-admonition-type': attrs.admonitionType || 'note' }),
      },
      title: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-admonition-title') || '',
        renderHTML: (attrs) => ({ 'data-admonition-title': attrs.title ?? '' }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-admonition]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-admonition': 'true',
        class: `admonition-block admonition-${HTMLAttributes['data-admonition-type'] || 'note'}`,
      }),
      0,
    ];
  },

  addKeyboardShortcuts() {
    return {
      // Admonition 内の空段落先頭で Backspace を押した際にブロックを解除して通常段落へ戻す
      Backspace: () => {
        const { state } = this.editor;
        const { selection } = state;
        const { $from, empty } = selection;
        if (!empty || $from.parentOffset !== 0) {
          return false;
        }

        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d);
          if (node.type.name === 'admonition') {
            if (node.childCount === 1 && node.firstChild?.textContent === '') {
              return this.editor.commands.lift('admonition');
            }
          }
        }
        return false;
      },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      let currentNode = node;

      const dom = document.createElement('div');
      const updateWrapperClass = () => {
        const t = currentNode.attrs.admonitionType || 'note';
        dom.className = `admonition-block admonition-${t}`;
        dom.setAttribute('data-admonition', 'true');
        dom.setAttribute('data-admonition-mode', currentNode.attrs.mode || '!!!');
        dom.setAttribute('data-admonition-type', t);
        dom.setAttribute('data-admonition-title', currentNode.attrs.title ?? '');
      };
      updateWrapperClass();

      const header = document.createElement('div');
      header.className = 'admonition-header';
      header.contentEditable = 'false';

      const modeSelect = document.createElement('select');
      modeSelect.className = 'admonition-select admonition-mode-select';
      modeSelect.title = 'Admonition モード (!!! / ??? / ???+)';
      for (const m of ADMONITION_MODES) {
        const opt = document.createElement('option');
        opt.value = m.value;
        opt.textContent = m.label;
        modeSelect.appendChild(opt);
      }
      modeSelect.value = currentNode.attrs.mode || '!!!';

      const typeSelect = document.createElement('select');
      typeSelect.className = 'admonition-select admonition-type-select';
      typeSelect.title = 'Admonition タイプ';
      for (const t of ADMONITION_TYPES) {
        const opt = document.createElement('option');
        opt.value = t.value;
        opt.textContent = t.label;
        typeSelect.appendChild(opt);
      }
      if (
        currentNode.attrs.admonitionType &&
        !ADMONITION_TYPES.some((t) => t.value === currentNode.attrs.admonitionType)
      ) {
        const customOpt = document.createElement('option');
        customOpt.value = currentNode.attrs.admonitionType;
        customOpt.textContent = currentNode.attrs.admonitionType;
        typeSelect.appendChild(customOpt);
      }
      typeSelect.value = currentNode.attrs.admonitionType || 'note';

      const titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.className = 'admonition-title-input';
      titleInput.placeholder = 'タイトル（省略時はタイプ名が使われます）';
      titleInput.value = currentNode.attrs.title ?? '';

      const liftBtn = document.createElement('button');
      liftBtn.type = 'button';
      liftBtn.className = 'admonition-remove-btn';
      liftBtn.textContent = '解除';
      liftBtn.title = 'Admonition枠を解除して通常の段落に戻す';

      header.appendChild(modeSelect);
      header.appendChild(typeSelect);
      header.appendChild(titleInput);
      header.appendChild(liftBtn);

      const contentDOM = document.createElement('div');
      contentDOM.className = 'admonition-body';

      dom.appendChild(header);
      dom.appendChild(contentDOM);

      const updateAttrs = (patch: Record<string, string>) => {
        const pos = typeof getPos === 'function' ? getPos() : undefined;
        if (typeof pos === 'number') {
          editor.commands.command(({ tr }) => {
            tr.setNodeMarkup(pos, undefined, {
              ...currentNode.attrs,
              ...patch,
            });
            return true;
          });
        }
      };

      modeSelect.addEventListener('change', () => {
        updateAttrs({ mode: modeSelect.value });
      });

      typeSelect.addEventListener('change', () => {
        updateAttrs({ admonitionType: typeSelect.value });
      });

      titleInput.addEventListener('change', () => {
        updateAttrs({ title: titleInput.value });
      });

      titleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          updateAttrs({ title: titleInput.value });
          editor.commands.focus();
        }
      });

      liftBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const pos = typeof getPos === 'function' ? getPos() : undefined;
        if (typeof pos === 'number') {
          editor.chain().focus().setTextSelection(pos + 1).lift('admonition').run();
        }
      });

      return {
        dom,
        contentDOM,
        update: (updatedNode) => {
          if (updatedNode.type !== currentNode.type) {
            return false;
          }
          currentNode = updatedNode;
          updateWrapperClass();
          if (modeSelect.value !== (currentNode.attrs.mode || '!!!')) {
            modeSelect.value = currentNode.attrs.mode || '!!!';
          }
          if (typeSelect.value !== (currentNode.attrs.admonitionType || 'note')) {
            typeSelect.value = currentNode.attrs.admonitionType || 'note';
          }
          if (
            document.activeElement !== titleInput &&
            titleInput.value !== (currentNode.attrs.title ?? '')
          ) {
            titleInput.value = currentNode.attrs.title ?? '';
          }
          return true;
        },
        ignoreMutation: (mutation) => {
          return header.contains(mutation.target);
        },
      };
    };
  },
});
