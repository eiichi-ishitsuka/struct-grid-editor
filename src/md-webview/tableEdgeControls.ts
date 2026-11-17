import { Editor } from '@tiptap/core';

type EdgeDirection = 'left' | 'right' | 'top' | 'bottom';

interface ActiveEdgeTarget {
  cell: HTMLTableCellElement;
  table: HTMLTableElement;
  direction: EdgeDirection;
}

const EDGE_THRESHOLD_PX = 10;

const DIRECTION_LABELS: Record<EdgeDirection, string> = {
  left: '左に列を追加',
  right: '右に列を追加',
  top: '上に行を追加',
  bottom: '下に行を追加',
};

/**
 * セルの 4 辺のうち、ポインターが境界付近にある最も近い辺を判定します。
 */
function detectCellEdge(
  cell: HTMLTableCellElement,
  clientX: number,
  clientY: number
): EdgeDirection | null {
  const rect = cell.getBoundingClientRect();
  const maxHorizThreshold = Math.min(EDGE_THRESHOLD_PX, rect.width / 3);
  const maxVertThreshold = Math.min(EDGE_THRESHOLD_PX, rect.height / 3);

  const candidates: Array<{ dir: EdgeDirection; dist: number }> = [];
  const distTop = Math.abs(clientY - rect.top);
  const distBottom = Math.abs(rect.bottom - clientY);
  const distLeft = Math.abs(clientX - rect.left);
  const distRight = Math.abs(rect.right - clientX);

  if (distTop <= maxVertThreshold) {
    candidates.push({ dir: 'top', dist: distTop });
  }
  if (distBottom <= maxVertThreshold) {
    candidates.push({ dir: 'bottom', dist: distBottom });
  }
  if (distLeft <= maxHorizThreshold) {
    candidates.push({ dir: 'left', dist: distLeft });
  }
  if (distRight <= maxHorizThreshold) {
    candidates.push({ dir: 'right', dist: distRight });
  }

  if (candidates.length === 0) {
    return null;
  }
  candidates.sort((a, b) => a.dist - b.dist);
  return candidates[0].dir;
}

/**
 * テーブルセルの上下左右の境界線ホバーで `+` ボタンを浮かび上がらせ、
 * クリックで該当位置に行または列を追加できるオーバーレイ UI をセットアップします。
 *
 * @param previewPane オーバーレイを描画する親コンテナ（`position: relative`）
 * @param scrollWrapper エディタのスクロールコンテナ
 * @param editor 対象の Tiptap Editor インスタンス
 * @returns クリーンアップ関数
 */
export function setupTableEdgeControls(
  previewPane: HTMLElement,
  scrollWrapper: HTMLElement,
  editor: Editor
): () => void {
  const guideEl = document.createElement('div');
  guideEl.className = 'table-edge-guide hidden';
  guideEl.setAttribute('aria-hidden', 'true');

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'table-edge-add-btn hidden';
  addBtn.textContent = '+';

  previewPane.appendChild(guideEl);
  previewPane.appendChild(addBtn);

  let currentTarget: ActiveEdgeTarget | null = null;

  const hideControls = () => {
    currentTarget = null;
    guideEl.classList.add('hidden');
    addBtn.classList.add('hidden');
  };

  const positionControls = (target: ActiveEdgeTarget) => {
    const paneRect = previewPane.getBoundingClientRect();
    const cellRect = target.cell.getBoundingClientRect();
    const tableRect = target.table.getBoundingClientRect();

    let btnX = 0;
    let btnY = 0;

    if (target.direction === 'left' || target.direction === 'right') {
      const edgeX = target.direction === 'left' ? cellRect.left : cellRect.right;
      btnX = edgeX - paneRect.left;
      btnY = cellRect.top + cellRect.height / 2 - paneRect.top;

      guideEl.style.left = `${btnX - 1}px`;
      guideEl.style.top = `${tableRect.top - paneRect.top}px`;
      guideEl.style.width = '2px';
      guideEl.style.height = `${tableRect.height}px`;
    } else {
      const edgeY = target.direction === 'top' ? cellRect.top : cellRect.bottom;
      btnX = cellRect.left + cellRect.width / 2 - paneRect.left;
      btnY = edgeY - paneRect.top;

      guideEl.style.left = `${tableRect.left - paneRect.left}px`;
      guideEl.style.top = `${btnY - 1}px`;
      guideEl.style.width = `${tableRect.width}px`;
      guideEl.style.height = '2px';
    }

    // プレビュー領域の端に近すぎる場合でもボタンが切れないよう位置をクランプ
    const clampedX = Math.max(12, Math.min(paneRect.width - 12, btnX));
    const clampedY = Math.max(12, Math.min(paneRect.height - 12, btnY));

    addBtn.style.left = `${clampedX}px`;
    addBtn.style.top = `${clampedY}px`;
    addBtn.title = DIRECTION_LABELS[target.direction];
    addBtn.setAttribute('aria-label', DIRECTION_LABELS[target.direction]);

    guideEl.classList.remove('hidden');
    addBtn.classList.remove('hidden');
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!editor.isEditable) {
      hideControls();
      return;
    }

    const eventTarget = e.target as globalThis.Node | null;
    if (eventTarget && addBtn.contains(eventTarget)) {
      return;
    }

    const cell =
      eventTarget instanceof Element
        ? (eventTarget.closest('td, th') as HTMLTableCellElement | null)
        : null;
    if (!cell) {
      hideControls();
      return;
    }

    const table = cell.closest('table') as HTMLTableElement | null;
    if (!table) {
      hideControls();
      return;
    }

    const direction = detectCellEdge(cell, e.clientX, e.clientY);
    if (!direction) {
      hideControls();
      return;
    }

    currentTarget = { cell, table, direction };
    positionControls(currentTarget);
  };

  const handleMouseLeave = (e: MouseEvent) => {
    const related = e.relatedTarget as globalThis.Node | null;
    if (related && addBtn.contains(related)) {
      return;
    }
    hideControls();
  };

  const handleAddClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentTarget || !editor.isEditable) {
      return;
    }

    const { cell, direction } = currentTarget;
    let pos: number;
    try {
      pos = editor.view.posAtDOM(cell, 0);
    } catch {
      hideControls();
      return;
    }

    const chain = editor.chain().focus().setTextSelection(pos);
    switch (direction) {
      case 'left':
        chain.addColumnBefore().run();
        break;
      case 'right':
        chain.addColumnAfter().run();
        break;
      case 'top':
        chain.addRowBefore().run();
        break;
      case 'bottom':
        chain.addRowAfter().run();
        break;
    }

    hideControls();
  };

  addBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
  });
  addBtn.addEventListener('click', handleAddClick);
  scrollWrapper.addEventListener('mousemove', handleMouseMove);
  scrollWrapper.addEventListener('mouseleave', handleMouseLeave);
  scrollWrapper.addEventListener('scroll', hideControls);

  return () => {
    addBtn.removeEventListener('click', handleAddClick);
    scrollWrapper.removeEventListener('mousemove', handleMouseMove);
    scrollWrapper.removeEventListener('mouseleave', handleMouseLeave);
    scrollWrapper.removeEventListener('scroll', hideControls);
    guideEl.remove();
    addBtn.remove();
  };
}
