import { Editor } from '@tiptap/core';

/**
 * スラッシュコマンドメニュー（`/`）の各項目定義。
 */
export interface SlashItem {
  /** 項目の識別子 */
  id: string;
  /** メニューに表示するタイトル */
  title: string;
  /** メニューに表示する補足説明 */
  desc: string;
  /** アイコンバッジに表示する短い記号ラベル */
  icon: string;
  /** 絞り込み検索用のキーワード一覧 */
  keywords: string[];
  /** 項目選択時に実行されるアクション */
  run: (editor: Editor) => void;
}

/**
 * エディタ内で `/` を入力した際にポップアップ表示されるスラッシュコマンドメニューを初期化します。
 * @param menuEl スラッシュメニューのコンテナ DOM 要素
 * @param editor 対象の Tiptap Editor インスタンス
 * @param onPickImage 画像挿入選択時に呼び出されるコールバック
 * @param onToggleFrontmatter YAML Frontmatter 欄の追加・表示切り替えコールバック
 */
export function setupSlashMenu(
  menuEl: HTMLElement,
  editor: Editor,
  onPickImage: () => void,
  onToggleFrontmatter?: () => void
): void {
  const items: SlashItem[] = [
    {
      id: 'h1',
      title: '見出し 1',
      desc: '大見出しセクション (#)',
      icon: 'H1',
      keywords: ['h1', 'heading1', 'みだし', 'title'],
      run: (ed) => ed.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      id: 'h2',
      title: '見出し 2',
      desc: '中見出しセクション (##)',
      icon: 'H2',
      keywords: ['h2', 'heading2', 'みだし'],
      run: (ed) => ed.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      id: 'h3',
      title: '見出し 3',
      desc: '小見出しセクション (###)',
      icon: 'H3',
      keywords: ['h3', 'heading3', 'みだし'],
      run: (ed) => ed.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      id: 'task',
      title: 'タスクリスト / To-Do',
      desc: 'チェックボックス付きリスト (- [ ])',
      icon: '[x]',
      keywords: ['task', 'todo', 'checkbox', 'たすく', 'ちぇっく'],
      run: (ed) => ed.chain().focus().toggleTaskList().run(),
    },
    {
      id: 'bullet',
      title: '箇条書きリスト',
      desc: 'シンプルな箇条書き (-)',
      icon: '-',
      keywords: ['bullet', 'list', 'ul', 'りすと'],
      run: (ed) => ed.chain().focus().toggleBulletList().run(),
    },
    {
      id: 'ordered',
      title: '番号付きリスト',
      desc: '連番リスト (1.)',
      icon: '1.',
      keywords: ['number', 'ordered', 'ol', 'ばんごう'],
      run: (ed) => ed.chain().focus().toggleOrderedList().run(),
    },
    {
      id: 'table',
      title: 'テーブル (表)',
      desc: '3×3 のMarkdownテーブルを挿入',
      icon: 'TBL',
      keywords: ['table', 'grid', 'ひょう', 'てーぶる'],
      run: (ed) =>
        ed.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      id: 'code',
      title: 'コードブロック',
      desc: 'シンタックス付きコードブロック (```)',
      icon: '</>',
      keywords: ['code', 'pre', 'こーど'],
      run: (ed) => ed.chain().focus().toggleCodeBlock().run(),
    },
    {
      id: 'mermaid',
      title: 'Mermaid ダイアグラム',
      desc: 'フローチャート・シーケンス図のライブプレビュー',
      icon: 'MMD',
      keywords: ['mermaid', 'diagram', 'chart', '図', 'まーめいど'],
      run: (ed) =>
        ed
          .chain()
          .focus()
          .insertContent({
            type: 'codeBlock',
            attrs: { language: 'mermaid' },
            content: [
              {
                type: 'text',
                text: 'flowchart LR\n    Start["開始"] --> Process["処理"]\n    Process --> End["完了"]',
              },
            ],
          })
          .run(),
    },
    {
      id: 'mathBlock',
      title: '数式ブロック (KaTeX)',
      desc: 'LaTeX ディスプレイ数式 ($$...$$)',
      icon: '$$',
      keywords: ['math', 'katex', 'latex', 'すうしき'],
      run: (ed) =>
        ed
          .chain()
          .focus()
          .insertContent({
            type: 'blockMath',
            attrs: { latex: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}' },
          })
          .run(),
    },
    {
      id: 'mathInline',
      title: 'インライン数式 (KaTeX)',
      desc: '文中のLaTeX数式 ($...$)',
      icon: '$x$',
      keywords: ['inline', 'math', 'latex', 'すうしき'],
      run: (ed) =>
        ed
          .chain()
          .focus()
          .insertContent({
            type: 'inlineMath',
            attrs: { latex: 'E = mc^2' },
          })
          .run(),
    },
    {
      id: 'image',
      title: '画像を挿入',
      desc: 'ローカル画像ファイルを選択して挿入',
      icon: 'IMG',
      keywords: ['image', 'picture', 'img', 'がぞう'],
      run: () => onPickImage(),
    },
    {
      id: 'admonitionNote',
      title: 'Admonition (Note)',
      desc: '補足ボックス (!!! note)',
      icon: '!!!',
      keywords: ['admonition', 'note', 'info', 'callout', 'ほそく'],
      run: (ed) =>
        ed
          .chain()
          .focus()
          .insertContent({
            type: 'admonition',
            attrs: { mode: '!!!', admonitionType: 'note', title: 'Note' },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: '補足内容を入力' }] }],
          })
          .run(),
    },
    {
      id: 'admonitionWarning',
      title: 'Admonition (Warning)',
      desc: '警告ボックス (!!! warning)',
      icon: 'WARN',
      keywords: ['admonition', 'warning', 'danger', 'caution', 'けいこく'],
      run: (ed) =>
        ed
          .chain()
          .focus()
          .insertContent({
            type: 'admonition',
            attrs: { mode: '!!!', admonitionType: 'warning', title: 'Warning' },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: '注意事項を入力' }] }],
          })
          .run(),
    },
    {
      id: 'admonitionDetails',
      title: '折りたたみボックス (Details)',
      desc: '折りたたみ Admonition (??? info)',
      icon: '???',
      keywords: ['details', 'collapsible', 'fold', 'admonition', 'おりたたみ'],
      run: (ed) =>
        ed
          .chain()
          .focus()
          .insertContent({
            type: 'admonition',
            attrs: { mode: '???', admonitionType: 'info', title: '詳細を表示' },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: '折りたたまれた内容' }] }],
          })
          .run(),
    },
    {
      id: 'frontmatter',
      title: 'YAML Frontmatter',
      desc: '先頭のYAMLメタデータ欄を追加・表示切替',
      icon: 'YML',
      keywords: ['frontmatter', 'yaml', 'meta', 'メタデータ'],
      run: () => onToggleFrontmatter?.(),
    },
    {
      id: 'quote',
      title: '引用ブロック',
      desc: 'テキストの引用 (>)',
      icon: '>',
      keywords: ['quote', 'blockquote', 'いんよう'],
      run: (ed) => ed.chain().focus().toggleBlockquote().run(),
    },
    {
      id: 'hr',
      title: '区切り線',
      desc: '水平ディバイダー (---)',
      icon: '---',
      keywords: ['hr', 'divider', 'line', 'くぎり'],
      run: (ed) => ed.chain().focus().setHorizontalRule().run(),
    },
  ];

  let isOpen = false;
  let selectedIndex = 0;
  let slashRange: { from: number; to: number } | null = null;
  let filteredItems: SlashItem[] = [...items];

  const closeMenu = () => {
    isOpen = false;
    slashRange = null;
    menuEl.classList.add('hidden');
  };

  const executeSelected = (item: SlashItem) => {
    if (slashRange) {
      editor.chain().focus().deleteRange(slashRange).run();
    }
    closeMenu();
    item.run(editor);
  };

  const renderMenu = () => {
    menuEl.innerHTML = '';
    if (filteredItems.length === 0) {
      closeMenu();
      return;
    }

    const header = document.createElement('div');
    header.className = 'slash-menu-header';
    header.textContent = 'ブロックを挿入 (↑↓で選択, Enterで決定)';
    menuEl.appendChild(header);

    filteredItems.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = `slash-item ${idx === selectedIndex ? 'selected' : ''}`;

      const icon = document.createElement('div');
      icon.className = 'slash-item-icon';
      icon.textContent = item.icon;

      const textWrap = document.createElement('div');
      textWrap.className = 'slash-item-text';

      const title = document.createElement('div');
      title.className = 'slash-item-title';
      title.textContent = item.title;

      const desc = document.createElement('div');
      desc.className = 'slash-item-desc';
      desc.textContent = item.desc;

      textWrap.appendChild(title);
      textWrap.appendChild(desc);
      row.appendChild(icon);
      row.appendChild(textWrap);

      row.addEventListener('mousedown', (e) => {
        e.preventDefault();
        executeSelected(item);
      });

      menuEl.appendChild(row);
    });
  };

  editor.on('update', () => {
    checkSlashTrigger();
  });

  editor.on('selectionUpdate', () => {
    if (isOpen) {
      checkSlashTrigger();
    }
  });

  function checkSlashTrigger(): void {
    const { state } = editor;
    const { selection } = state;
    if (!selection.empty) {
      closeMenu();
      return;
    }

    const { $from } = selection;
    if ($from.parent.type.name !== 'paragraph') {
      closeMenu();
      return;
    }

    const textBefore = $from.parent.textBetween(0, $from.parentOffset, '\n', '\0');
    const match = textBefore.match(/(?:^|\s)\/([a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF]*)$/);
    if (!match) {
      closeMenu();
      return;
    }

    const query = match[1].toLowerCase();
    const slashStartOffset = textBefore.lastIndexOf('/');
    const fromPos = $from.start() + slashStartOffset;
    const toPos = $from.pos;

    slashRange = { from: fromPos, to: toPos };
    filteredItems = items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.keywords.some((k) => k.includes(query))
    );

    if (filteredItems.length === 0) {
      closeMenu();
      return;
    }

    selectedIndex = Math.min(selectedIndex, filteredItems.length - 1);
    isOpen = true;
    menuEl.classList.remove('hidden');

    const coords = editor.view.coordsAtPos(fromPos);
    menuEl.style.top = `${Math.min(window.innerHeight - 280, coords.bottom + 6)}px`;
    menuEl.style.left = `${Math.max(16, Math.min(window.innerWidth - 300, coords.left))}px`;

    renderMenu();
  }

  window.addEventListener(
    'keydown',
    (e) => {
      if (!isOpen) {
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        selectedIndex = (selectedIndex + 1) % filteredItems.length;
        renderMenu();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        selectedIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
        renderMenu();
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        if (filteredItems[selectedIndex]) {
          executeSelected(filteredItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
      }
    },
    true
  );

  document.addEventListener('mousedown', (e) => {
    if (isOpen && !menuEl.contains(e.target as Node)) {
      closeMenu();
    }
  });
}
