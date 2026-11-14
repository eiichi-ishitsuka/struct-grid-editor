import { Node, mergeAttributes, textblockTypeInputRule } from '@tiptap/core';

/**
 * グローバルに読み込まれた Mermaid ランタイムの最小インターフェース。
 */
interface MermaidAPI {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, text: string) => Promise<{ svg: string }>;
}

/**
 * Mermaid インスタンスを保持する Window 拡張型。
 */
interface WindowWithMermaid extends Window {
  __mermaid?: MermaidAPI;
  mermaid?: MermaidAPI;
}

/**
 * グローバル Window オブジェクトから Mermaid API インスタンスを取得します。
 * @returns Mermaid API インスタンス（未読み込み時は undefined）
 */
function getMermaid(): MermaidAPI | undefined {
  const win = window as unknown as WindowWithMermaid;
  return win.__mermaid ?? win.mermaid;
}

let lastMermaidTheme: 'dark' | 'default' | null = null;

/**
 * 現在のカラースキーム（Light / Dark）に合わせて Mermaid を初期化します。
 * @param mmd Mermaid API インスタンス
 */
function ensureMermaidInit(mmd: MermaidAPI): void {
  const scheme = document.documentElement.getAttribute('data-md-color-scheme');
  const isDark =
    scheme === 'slate' ||
    (!scheme &&
      (document.body.classList.contains('vscode-dark') ||
        document.body.classList.contains('vscode-high-contrast')));
  const targetTheme = isDark ? 'dark' : 'default';
  if (lastMermaidTheme !== targetTheme) {
    mmd.initialize({
      startOnLoad: false,
      theme: targetTheme,
      securityLevel: 'strict',
    });
    lastMermaidTheme = targetTheme;
  }
}

let renderCounter = 0;

/**
 * 言語選択ドロップダウンおよび Mermaid ダイアグラムのライブ SVG プレビューを備えたカスタムコードブロック拡張。
 * 言語が `mermaid` の場合は図表をリアルタイム描画し、「ソースを編集」ボタンでコード表示を切り替えられます。
 */
export const CustomCodeBlock = Node.create({
  name: 'codeBlock',
  content: 'text*',
  marks: '',
  group: 'block',
  code: true,
  defining: true,

  addAttributes() {
    return {
      language: {
        default: '',
        parseHTML: (element) => {
          const codeEl = element.querySelector('code');
          const classAttr = codeEl?.getAttribute('class') || element.getAttribute('class') || '';
          const match = classAttr.match(/language-([a-zA-Z0-9_-]+)/);
          return match ? match[1] : element.getAttribute('data-language') || '';
        },
        renderHTML: (attributes) => {
          return {
            'data-language': attributes.language || '',
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const lang = node.attrs.language || '';
    return [
      'pre',
      mergeAttributes(HTMLAttributes, { 'data-language': lang }),
      ['code', lang ? { class: `language-${lang}` } : {}, 0],
    ];
  },

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: /^```([a-zA-Z0-9_-]*)[\s\n]$/,
        type: this.type,
        getAttributes: (match) => ({
          language: match[1] || '',
        }),
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (this.editor.isActive('codeBlock')) {
          return this.editor.commands.insertContent('    ');
        }
        return false;
      },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      let currentNode = node;

      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';

      const header = document.createElement('div');
      header.className = 'code-block-header';
      header.contentEditable = 'false';

      const langSelect = document.createElement('select');
      langSelect.className = 'code-lang-select';
      const languages = [
        { value: '', label: 'Plain Text' },
        { value: 'python', label: 'Python' },
        { value: 'mermaid', label: 'Mermaid (図表)' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'bash', label: 'Bash / Shell' },
        { value: 'json', label: 'JSON' },
        { value: 'yaml', label: 'YAML' },
        { value: 'html', label: 'HTML' },
        { value: 'css', label: 'CSS' },
        { value: 'sql', label: 'SQL' },
        { value: 'go', label: 'Go' },
        { value: 'rust', label: 'Rust' },
        { value: 'java', label: 'Java' },
        { value: 'markdown', label: 'Markdown' },
      ];

      const ensureOption = (langVal: string) => {
        if (langVal && !languages.some((l) => l.value === langVal)) {
          const opt = document.createElement('option');
          opt.value = langVal;
          opt.textContent = langVal;
          langSelect.appendChild(opt);
        }
      };

      for (const l of languages) {
        const opt = document.createElement('option');
        opt.value = l.value;
        opt.textContent = l.label;
        langSelect.appendChild(opt);
      }
      ensureOption(currentNode.attrs.language || '');
      langSelect.value = currentNode.attrs.language || '';

      const actionsRight = document.createElement('div');
      actionsRight.className = 'code-block-actions';

      const toggleCodeBtn = document.createElement('button');
      toggleCodeBtn.type = 'button';
      toggleCodeBtn.className = 'code-toggle-btn';
      toggleCodeBtn.textContent = 'ソースを編集';

      actionsRight.appendChild(toggleCodeBtn);
      header.appendChild(langSelect);
      header.appendChild(actionsRight);

      const pre = document.createElement('pre');
      pre.className = 'code-block-pre';
      const code = document.createElement('code');
      pre.appendChild(code);

      const mermaidPreview = document.createElement('div');
      mermaidPreview.className = 'mermaid-preview-container hidden';
      mermaidPreview.contentEditable = 'false';

      wrapper.appendChild(header);
      wrapper.appendChild(pre);
      wrapper.appendChild(mermaidPreview);

      let showCodeForMermaid = false;
      let renderTimer: number | undefined;
      let lastRenderedSource = '';

      const updateVisibility = () => {
        const isMermaid = (currentNode.attrs.language || '').toLowerCase() === 'mermaid';
        if (!isMermaid) {
          mermaidPreview.classList.add('hidden');
          toggleCodeBtn.classList.add('hidden');
          pre.classList.remove('hidden');
          return;
        }

        toggleCodeBtn.classList.remove('hidden');
        mermaidPreview.classList.remove('hidden');
        if (showCodeForMermaid) {
          pre.classList.remove('hidden');
          toggleCodeBtn.textContent = 'ソースを隠す';
        } else {
          pre.classList.add('hidden');
          toggleCodeBtn.textContent = 'ソースを編集';
        }
      };

      const executeMermaidRender = async (source: string) => {
        const mmd = getMermaid();
        if (!mmd) {
          mermaidPreview.innerHTML = '<div class="mermaid-empty">Mermaidを読み込み中...</div>';
          return;
        }
        try {
          ensureMermaidInit(mmd);
          const id = `mermaid-svg-${++renderCounter}`;
          const { svg } = await mmd.render(id, source);
          lastRenderedSource = source;
          mermaidPreview.innerHTML = svg;
        } catch (err) {
          mermaidPreview.innerHTML = `<div class="mermaid-error">Mermaid構文エラー: ${
            err instanceof Error ? err.message : String(err)
          }</div>`;
        }
      };

      const renderMermaidDiagram = (immediate = false) => {
        updateVisibility();
        const isMermaid = (currentNode.attrs.language || '').toLowerCase() === 'mermaid';
        if (!isMermaid) {
          return;
        }

        const source = currentNode.textContent.trim();
        if (!source) {
          lastRenderedSource = '';
          mermaidPreview.innerHTML =
            '<div class="mermaid-empty">Mermaid記法を入力してください（クリックで編集）</div>';
          return;
        }

        if (source === lastRenderedSource && mermaidPreview.querySelector('svg')) {
          return;
        }

        if (renderTimer) {
          window.clearTimeout(renderTimer);
        }

        if (immediate) {
          void executeMermaidRender(source);
        } else {
          renderTimer = window.setTimeout(() => {
            void executeMermaidRender(source);
          }, 80);
        }
      };

      const onMermaidReady = () => {
        if ((currentNode.attrs.language || '').toLowerCase() === 'mermaid') {
          lastRenderedSource = '';
          renderMermaidDiagram(true);
        }
      };
      window.addEventListener('mermaid-ready', onMermaidReady);
      window.addEventListener('md-theme-change', onMermaidReady);

      const focusCodeBlock = () => {
        const pos = typeof getPos === 'function' ? getPos() : undefined;
        if (typeof pos === 'number') {
          window.requestAnimationFrame(() => {
            editor.chain().focus().setTextSelection(pos + 1).run();
          });
        }
      };

      toggleCodeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showCodeForMermaid = !showCodeForMermaid;
        updateVisibility();
        if (showCodeForMermaid) {
          focusCodeBlock();
        }
      });

      mermaidPreview.addEventListener('click', (e) => {
        e.preventDefault();
        if (!showCodeForMermaid) {
          showCodeForMermaid = true;
          updateVisibility();
          focusCodeBlock();
        }
      });

      langSelect.addEventListener('change', (e) => {
        e.stopPropagation();
        const pos = typeof getPos === 'function' ? getPos() : undefined;
        if (typeof pos === 'number') {
          editor.commands.command(({ tr }) => {
            tr.setNodeMarkup(pos, undefined, {
              ...currentNode.attrs,
              language: langSelect.value,
            });
            return true;
          });
        }
      });

      // 初回マウント時に即座に描画を実行する
      renderMermaidDiagram(true);

      return {
        dom: wrapper,
        contentDOM: code,
        update: (updatedNode) => {
          if (updatedNode.type !== currentNode.type) {
            return false;
          }
          currentNode = updatedNode;
          ensureOption(currentNode.attrs.language || '');
          if (langSelect.value !== (currentNode.attrs.language || '')) {
            langSelect.value = currentNode.attrs.language || '';
          }
          renderMermaidDiagram(false);
          return true;
        },
        destroy: () => {
          window.removeEventListener('mermaid-ready', onMermaidReady);
          window.removeEventListener('md-theme-change', onMermaidReady);
        },
        stopEvent: (event) => {
          const target = event.target as globalThis.Node | null;
          if (!target) {
            return false;
          }
          return header.contains(target) || mermaidPreview.contains(target);
        },
        ignoreMutation: (mutation) => {
          if (mutation.type === 'selection') {
            return false;
          }
          // `code` 要素外の DOM 変更（`pre` の表示切替や `mermaidPreview` 内の SVG 描画など）は ProseMirror の再パース対象から除外する
          return !code.contains(mutation.target);
        },
      };
    };
  },
});
