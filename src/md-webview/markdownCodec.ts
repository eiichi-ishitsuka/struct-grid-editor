import { marked } from 'marked';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

let currentBaseUri = '';
let currentFrontmatter: string | null = null;

/**
 * 相対パスの画像解決に使用する Webview のベース URI を設定します。
 * @param baseUri ドキュメント親ディレクトリの Webview URI 文字列
 */
export function setMarkdownBaseUri(baseUri: string): void {
  currentBaseUri = baseUri.replace(/\/$/, '');
}

/**
 * 現在保持されている YAML Frontmatter の文字列を取得します。
 * @returns Frontmatter 文字列（存在しない場合は null）
 */
export function getFrontmatter(): string | null {
  return currentFrontmatter;
}

/**
 * YAML Frontmatter の文字列を更新します。
 * @param yaml 設定する YAML 文字列（削除する場合は null）
 */
export function setFrontmatter(yaml: string | null): void {
  currentFrontmatter = yaml !== null ? yaml : null;
}

/**
 * Markdown 内の画像パスを Webview 上で表示可能な URI に解決します。
 * 外部 URL や data URI はそのまま返し、相対パスはベース URI と結合します。
 * @param rawSrc Markdown 内に記述された元の画像パス
 * @returns 解決済みの画像 URI
 */
export function resolveImageSrc(rawSrc: string): string {
  if (!rawSrc) {
    return '';
  }
  if (
    rawSrc.startsWith('http://') ||
    rawSrc.startsWith('https://') ||
    rawSrc.startsWith('data:') ||
    rawSrc.startsWith('vscode-webview-resource:') ||
    rawSrc.includes('vscode-resource.vscode-cdn.net')
  ) {
    return rawSrc;
  }
  if (!currentBaseUri) {
    return rawSrc;
  }
  const cleaned = rawSrc.replace(/^\.\//, '');
  return `${currentBaseUri}/${cleaned}`;
}

/**
 * HTML 属性値として安全に埋め込めるよう特殊文字をエスケープします。
 * @param str エスケープ対象の文字列
 * @returns エスケープ後の文字列
 */
function escapeHtmlAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Markdown 文字列の先頭から YAML Frontmatter（`---` で囲まれた領域）と本文を分離抽出します。
 * @param md 入力 Markdown 全文
 * @returns 分離された Frontmatter（存在しない場合は null）と本文オブジェクト
 */
export function extractYamlFrontmatter(md: string): {
  frontmatter: string | null;
  body: string;
} {
  const match = md.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    return { frontmatter: null, body: md };
  }
  return {
    frontmatter: match[1],
    body: md.slice(match[0].length),
  };
}

/**
 * Python-Markdown 形式の Admonition / Details ブロック（`!!!` / `???` / `???+` と 4 スペースインデント本文）を
 * Tiptap 用のカスタム HTML 要素（`<div data-admonition="true">`）へ前処理変換します。
 * @param md 入力 Markdown 文字列
 * @returns Admonition が HTML 要素に置換された文字列
 */
function preprocessAdmonitions(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;

  const headerRegex = /^(!!!|\?\?\?\+?)\s+([a-zA-Z0-9_-]+)(?:\s+"([^"]*)")?\s*$/;

  while (i < lines.length) {
    const line = lines[i];
    const match = line.match(headerRegex);
    if (match) {
      const mode = match[1];
      const adType = match[2].toLowerCase();
      const title = match[3] !== undefined ? match[3] : '';
      i++;

      const bodyLines: string[] = [];
      while (i < lines.length) {
        const nextLine = lines[i];
        if (nextLine.startsWith('    ')) {
          bodyLines.push(nextLine.slice(4));
          i++;
        } else if (nextLine.startsWith('\t')) {
          bodyLines.push(nextLine.slice(1));
          i++;
        } else if (nextLine.trim() === '') {
          // 空行の後にまだインデントされた行が続くかを先読み判定する
          let lookahead = i + 1;
          while (lookahead < lines.length && lines[lookahead].trim() === '') {
            lookahead++;
          }
          if (
            lookahead < lines.length &&
            (lines[lookahead].startsWith('    ') || lines[lookahead].startsWith('\t'))
          ) {
            bodyLines.push('');
            i++;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      const innerMd = bodyLines.join('\n').trim();
      const innerHtml = innerMd ? markdownFragmentToHtml(innerMd) : '<p></p>';
      out.push(
        `\n<div data-admonition="true" data-admonition-mode="${escapeHtmlAttr(
          mode
        )}" data-admonition-type="${escapeHtmlAttr(
          adType
        )}" data-admonition-title="${escapeHtmlAttr(title)}">${innerHtml}</div>\n`
      );
    } else {
      out.push(line);
      i++;
    }
  }

  return out.join('\n');
}

/**
 * Frontmatter を除いた Markdown 本文フラグメントを Tiptap エディタ用の HTML に変換します。
 * @param md Markdown 本文文字列
 * @returns 変換後の HTML 文字列
 */
function markdownFragmentToHtml(md: string): string {
  if (!md.trim()) {
    return '<p></p>';
  }

  // コードブロック内の $ や !!! が数式や Admonition として誤変換されないよう一時退避する
  const codePlaceholders: string[] = [];
  let processed = md.replace(/```([\s\S]*?)```/g, (match) => {
    const idx = codePlaceholders.length;
    codePlaceholders.push(match);
    return `@@CODEBLOCK_${idx}@@`;
  });

  // Admonition ブロックを再帰的に変換する
  processed = preprocessAdmonitions(processed);

  // ブロック数式 $$...$$ を <div data-math-block="true" data-latex="...">$$</div> に変換する
  processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (_m, latex) => {
    return `\n\n<div data-math-block="true" data-latex="${escapeHtmlAttr(latex.trim())}">$$</div>\n\n`;
  });

  // インライン数式 $...$ を <span data-math-inline="true" data-latex="...">$</span> に変換する
  processed = processed.replace(/(?<!\$)\$([^$\n]+?)\$(?!\$)/g, (_m, latex) => {
    return `<span data-math-inline="true" data-latex="${escapeHtmlAttr(latex.trim())}">$</span>`;
  });

  // 退避していたコードブロックを復元する
  processed = processed.replace(/@@CODEBLOCK_(\d+)@@/g, (_m, idx) => {
    return codePlaceholders[Number(idx)];
  });

  const rawHtml = marked.parse(processed, {
    gfm: true,
    breaks: false,
    async: false,
  }) as string;

  // タスクリストと画像パスを Tiptap のスキーマに合わせて DOM 正規化する
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');

  // 標準 GFM タスクリストを Tiptap の <ul data-type="taskList"><li data-type="taskItem"> 構造に変換する
  doc.querySelectorAll('ul').forEach((ul) => {
    const items = Array.from(ul.children).filter((el) => el.tagName === 'LI');
    let taskCount = 0;

    items.forEach((li) => {
      const checkbox = li.querySelector(
        ':scope > input[type="checkbox"], :scope > p > input[type="checkbox"]'
      ) as HTMLInputElement | null;
      if (checkbox) {
        taskCount++;
        const checked = checkbox.checked || checkbox.hasAttribute('checked');
        li.setAttribute('data-type', 'taskItem');
        li.setAttribute('data-checked', checked ? 'true' : 'false');
        checkbox.remove();
        const hasParagraph = li.querySelector(':scope > p') !== null;
        if (!hasParagraph) {
          const p = doc.createElement('p');
          while (li.firstChild) {
            const child = li.firstChild;
            if (
              child.nodeType === Node.ELEMENT_NODE &&
              ((child as Element).tagName === 'UL' || (child as Element).tagName === 'OL')
            ) {
              break;
            }
            p.appendChild(child);
          }
          li.insertBefore(p, li.firstChild);
        }
      }
    });

    if (taskCount === 0) {
      return;
    }

    if (taskCount === items.length) {
      ul.setAttribute('data-type', 'taskList');
      return;
    }

    // 通常の箇条書きとタスクリストが空行を挟んで連続し marked により単一 <ul> に統合された場合、
    // Tiptap のスキーマ（ul vs ul[data-type="taskList"]）に合わせて連続グループごとに分割する
    const parent = ul.parentNode;
    if (!parent) {
      return;
    }
    let currentList: HTMLUListElement | null = null;
    let currentIsTask: boolean | null = null;

    items.forEach((li) => {
      const isTask = li.getAttribute('data-type') === 'taskItem';
      if (!currentList || currentIsTask !== isTask) {
        currentList = doc.createElement('ul');
        if (isTask) {
          currentList.setAttribute('data-type', 'taskList');
        }
        parent.insertBefore(currentList, ul);
        currentIsTask = isTask;
      }
      currentList.appendChild(li);
    });
    ul.remove();
  });

  // 相対画像パスを Webview URI に解決しつつ元の相対パスを data-raw-src 属性に保持する
  doc.querySelectorAll('img').forEach((img) => {
    const rawSrc = img.getAttribute('src') || '';
    img.setAttribute('data-raw-src', rawSrc);
    img.setAttribute('src', resolveImageSrc(rawSrc));
  });

  return doc.body.innerHTML;
}

/**
 * YAML Frontmatter を含む Markdown ドキュメント全文を Tiptap 用の HTML 文字列へ変換します。
 * @param md 入力 Markdown 全文
 * @returns Tiptap エディタに設定する HTML 文字列
 */
export function markdownToHtml(md: string): string {
  const { frontmatter, body } = extractYamlFrontmatter(md);
  currentFrontmatter = frontmatter;
  return markdownFragmentToHtml(body);
}

/**
 * リスト要素（`<ul>` / `<ol>`）を 4 スペースインデント規約に従って Markdown 文字列へシリアライズします。
 * @param listEl 対象のリスト DOM 要素
 * @param indentLevel ネスト階層レベル（0 がトップレベル）
 * @param turndown インライン変換用の Turndown インスタンス
 * @returns シリアライズされたリストの Markdown 文字列
 */
function serializeIndentedMarkdownList(
  listEl: HTMLElement,
  indentLevel: number,
  turndown: TurndownService
): string {
  const isOrdered = listEl.tagName === 'OL';
  const isTaskList = listEl.getAttribute('data-type') === 'taskList';
  const baseIndent = '    '.repeat(indentLevel);
  const startNum = Number(listEl.getAttribute('start') || 1);

  const items = Array.from(listEl.children).filter((c) => c.tagName === 'LI') as HTMLElement[];
  const lines: string[] = [];

  items.forEach((li, index) => {
    let prefix = '- ';
    if (isTaskList || li.getAttribute('data-type') === 'taskItem') {
      const checked =
        li.getAttribute('data-checked') === 'true' ||
        (li.querySelector('input[type="checkbox"]') as HTMLInputElement | null)?.checked;
      prefix = checked ? '- [x] ' : '- [ ] ';
    } else if (isOrdered) {
      prefix = `${startNum + index}. `;
    }

    // ネストされた子リストと現在のリスト項目の本文を分離する
    const clone = li.cloneNode(true) as HTMLElement;
    const nestedLists: HTMLElement[] = [];
    Array.from(clone.children).forEach((child) => {
      if (child.tagName === 'UL' || child.tagName === 'OL') {
        nestedLists.push(child as HTMLElement);
        child.remove();
      } else if (child.tagName === 'DIV') {
        Array.from(child.children).forEach((grandChild) => {
          if (grandChild.tagName === 'UL' || grandChild.tagName === 'OL') {
            nestedLists.push(grandChild as HTMLElement);
            grandChild.remove();
          }
        });
      }
    });

    const itemTextMd = turndown
      .turndown(clone.innerHTML)
      .trim()
      .replace(/\n+/g, `\n${baseIndent}    `);

    lines.push(`${baseIndent}${prefix}${itemTextMd}`);

    for (const nested of nestedLists) {
      lines.push(serializeIndentedMarkdownList(nested, indentLevel + 1, turndown));
    }
  });

  return lines.join('\n');
}

/**
 * Tiptap エディタが出力した HTML を GFM / Python-Markdown 互換の Markdown 文字列へ変換します。
 * 保持されている YAML Frontmatter がある場合は先頭に付与して返します。
 * @param html Tiptap エディタの HTML 文字列
 * @returns 正規化された Markdown 文字列
 */
export function htmlToMarkdown(html: string): string {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
  });

  turndown.use(gfm);

  // 4 スペースインデントのネストリストおよびトップレベルリスト前の空行を保証するルール
  turndown.addRule('indentedList', {
    filter: (node) => {
      if (node.nodeName !== 'UL' && node.nodeName !== 'OL') {
        return false;
      }
      const parent = node.parentElement;
      return !parent || (parent.tagName !== 'LI' && parent.parentElement?.tagName !== 'LI');
    },
    replacement: (_content, node) => {
      const listMd = serializeIndentedMarkdownList(node as HTMLElement, 0, turndown);
      return `\n\n${listMd}\n\n`;
    },
  });

  // Admonition ブロック（!!! / ??? / ???+ と 4 スペースインデント本文）のシリアライズルール
  turndown.addRule('admonitionBlock', {
    filter: (node) => {
      return (
        node.nodeName === 'DIV' &&
        ((node as HTMLElement).hasAttribute('data-admonition') ||
          (node as HTMLElement).classList.contains('admonition-block'))
      );
    },
    replacement: (_content, node) => {
      const el = node as HTMLElement;
      const mode = el.getAttribute('data-admonition-mode') || '!!!';
      const adType = el.getAttribute('data-admonition-type') || 'note';
      const title = (el.getAttribute('data-admonition-title') || '').trim();

      const bodyEl = (el.querySelector('.admonition-body') as HTMLElement) || el;
      const innerMd = turndown.turndown(bodyEl.innerHTML).trim();

      const header = title
        ? `${mode} ${adType} "${title.replace(/"/g, '\\"')}"`
        : `${mode} ${adType}`;

      const indentedBody = (innerMd || '')
        .split('\n')
        .map((line) => (line.trim() === '' ? '' : `    ${line}`))
        .join('\n');

      return `\n\n${header}\n${indentedBody || '    '}\n\n`;
    },
  });

  // ブロック数式（$$...$$）のシリアライズルール
  turndown.addRule('blockMath', {
    filter: (node) => {
      return (
        node.nodeName === 'DIV' &&
        ((node as HTMLElement).hasAttribute('data-math-block') ||
          (node as HTMLElement).classList.contains('math-block-node'))
      );
    },
    replacement: (_content, node) => {
      const latex = (node as HTMLElement).getAttribute('data-latex') || '';
      return `\n\n$$\n${latex.trim()}\n$$\n\n`;
    },
  });

  // インライン数式（$...$）のシリアライズルール
  turndown.addRule('inlineMath', {
    filter: (node) => {
      return (
        node.nodeName === 'SPAN' &&
        ((node as HTMLElement).hasAttribute('data-math-inline') ||
          (node as HTMLElement).classList.contains('math-inline-node'))
      );
    },
    replacement: (_content, node) => {
      const latex = (node as HTMLElement).getAttribute('data-latex') || '';
      return `$${latex.trim()}$`;
    },
  });

  // 言語属性付きコードブロックのシリアライズルール
  turndown.addRule('customCodeBlock', {
    filter: (node) => {
      return node.nodeName === 'PRE' && node.firstChild?.nodeName === 'CODE';
    },
    replacement: (_content, node) => {
      const pre = node as HTMLElement;
      const code = pre.querySelector('code') as HTMLElement;
      const langFromAttr = pre.getAttribute('data-language') || '';
      const classAttr = code?.getAttribute('class') || '';
      const match = classAttr.match(/language-([a-zA-Z0-9_-]+)/);
      const lang = langFromAttr || (match ? match[1] : '');
      const text = code ? code.textContent || '' : pre.textContent || '';
      return `\n\n\`\`\`${lang}\n${text.replace(/\n$/, '')}\n\`\`\`\n\n`;
    },
  });

  // 画像の元の相対パス（data-raw-src）を保持して出力するルール
  turndown.addRule('preserveRawImageSrc', {
    filter: 'img',
    replacement: (_content, node) => {
      const img = node as HTMLElement;
      const alt = img.getAttribute('alt') || '';
      const rawSrc = img.getAttribute('data-raw-src') || img.getAttribute('src') || '';
      const title = img.getAttribute('title');
      const titlePart = title ? ` "${title}"` : '';
      return rawSrc ? `![${alt}](${rawSrc}${titlePart})` : '';
    },
  });

  // GFM テーブルのシリアライズルール
  turndown.addRule('tiptapTable', {
    filter: 'table',
    replacement: (_content, node) => {
      const table = node as HTMLTableElement;
      const rows = Array.from(table.querySelectorAll('tr'));
      if (rows.length === 0) {
        return '';
      }

      const matrix: string[][] = rows.map((tr) => {
        const cells = Array.from(tr.querySelectorAll('th, td'));
        return cells.map((cell) => {
          const cellHtml = cell.innerHTML
            .replace(/<\/p>\s*<p>/gi, '<br>')
            .replace(/<\/?p>/gi, '');
          const cellMd = turndown
            .turndown(cellHtml)
            .replace(/\n+/g, ' ')
            .replace(/\|/g, '\\|')
            .trim();
          return cellMd || ' ';
        });
      });

      const colCount = Math.max(...matrix.map((r) => r.length), 1);
      const padRow = (r: string[]) => {
        const copy = [...r];
        while (copy.length < colCount) {
          copy.push(' ');
        }
        return `| ${copy.join(' | ')} |`;
      };

      const headerLine = padRow(matrix[0]);
      const separatorLine = `| ${Array(colCount).fill('---').join(' | ')} |`;
      const bodyLines = matrix.slice(1).map(padRow);

      return `\n\n${[headerLine, separatorLine, ...bodyLines].join('\n')}\n\n`;
    },
  });

  const bodyMd = turndown.turndown(html).trim();
  const frontmatterPrefix =
    currentFrontmatter !== null ? `---\n${currentFrontmatter.trim()}\n---\n\n` : '';

  if (!bodyMd && !frontmatterPrefix) {
    return '';
  }
  return `${frontmatterPrefix}${bodyMd}\n`;
}
