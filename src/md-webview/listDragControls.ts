import { Editor } from '@tiptap/core';
import type { Node as ProseMirrorNode, NodeType } from '@tiptap/pm/model';
import { TextSelection } from '@tiptap/pm/state';

export type ListDropPlacement = 'before' | 'after' | 'inside';

export interface ResolvedListItem {
  pos: number;
  index: number;
  node: ProseMirrorNode;
  parentListPos: number;
  parentListNode: ProseMirrorNode;
}

interface DropTargetState {
  li: HTMLLIElement;
  targetPos: number;
  placement: ListDropPlacement;
}

const INDENT_INSIDE_THRESHOLD_PX = 40;
const HANDLE_GUTTER_TOLERANCE_PX = 56;

function isListNodeType(name: string): boolean {
  return name === 'bulletList' || name === 'orderedList' || name === 'taskList';
}

function isListItemNodeType(name: string): boolean {
  return name === 'listItem' || name === 'taskItem';
}

/**
 * DOM 上の `<li>` 要素に対応する ProseMirror の `listItem` / `taskItem` ノードおよび親リスト情報を解決します。
 */
export function resolveListItemNode(
  editor: Editor,
  li: HTMLLIElement
): ResolvedListItem | null {
  let found: ResolvedListItem | null = null;

  editor.state.doc.descendants((node, pos) => {
    if (found) {
      return false;
    }
    if (isListItemNodeType(node.type.name)) {
      const dom = editor.view.nodeDOM(pos);
      if (dom === li) {
        const $pos = editor.state.doc.resolve(pos);
        found = {
          pos,
          index: $pos.index(),
          node,
          parentListPos: $pos.before(),
          parentListNode: $pos.parent,
        };
        return false;
      }
    }
    return true;
  });

  if (found) {
    return found;
  }

  // フォールバック 1: 親リスト（<ul> / <ol>）DOM から該当リストノードと子インデックスを解決する
  const parentListEl = li.parentElement;
  if (parentListEl && (parentListEl.tagName === 'UL' || parentListEl.tagName === 'OL')) {
    const domSiblings = Array.from(parentListEl.children).filter(
      (el) => el.tagName === 'LI'
    );
    const domIndex = domSiblings.indexOf(li);
    if (domIndex >= 0) {
      editor.state.doc.descendants((node, pos) => {
        if (found) {
          return false;
        }
        if (isListNodeType(node.type.name)) {
          const dom = editor.view.nodeDOM(pos);
          if (dom === parentListEl && domIndex < node.childCount) {
            let itemPos = pos + 1;
            for (let i = 0; i < domIndex; i++) {
              itemPos += node.child(i).nodeSize;
            }
            found = {
              pos: itemPos,
              index: domIndex,
              node: node.child(domIndex),
              parentListPos: pos,
              parentListNode: node,
            };
            return false;
          }
        }
        return true;
      });
    }
  }

  if (found) {
    return found;
  }

  // フォールバック 2: posAtDOM から親の listItem / taskItem を逆引きする
  try {
    const domPos = editor.view.posAtDOM(li, 0);
    const $pos = editor.state.doc.resolve(domPos);
    for (let d = $pos.depth; d >= 1; d--) {
      const node = $pos.node(d);
      if (isListItemNodeType(node.type.name)) {
        const pos = $pos.before(d);
        const $itemPos = editor.state.doc.resolve(pos);
        return {
          pos,
          index: $itemPos.index(),
          node,
          parentListPos: $itemPos.before(),
          parentListNode: $itemPos.parent,
        };
      }
    }
  } catch {
    // 無視
  }

  return null;
}

/**
 * 移動先のリスト種別（`taskList` または `bulletList` / `orderedList`）に合わせて
 * リスト項目ノード（`taskItem` <-> `listItem`）を変換します。
 */
function convertItemForList(
  itemNode: ProseMirrorNode,
  targetListType: NodeType
): ProseMirrorNode {
  const schema = targetListType.schema;
  if (targetListType.name === 'taskList') {
    if (itemNode.type.name === 'taskItem') {
      return itemNode;
    }
    const taskItemType = schema.nodes.taskItem;
    if (taskItemType) {
      return taskItemType.create({ checked: false }, itemNode.content, itemNode.marks);
    }
  } else {
    if (itemNode.type.name === 'listItem') {
      return itemNode;
    }
    const listItemType = schema.nodes.listItem;
    if (listItemType) {
      return listItemType.create(null, itemNode.content, itemNode.marks);
    }
  }
  return itemNode;
}

/**
 * リスト項目ノード内に既にネストされた子リストが存在する場合、最初の子リスト情報を返します。
 */
function findFirstChildList(
  itemNode: ProseMirrorNode,
  itemPos: number
): { listNode: ProseMirrorNode; listPos: number } | null {
  let result: { listNode: ProseMirrorNode; listPos: number } | null = null;
  itemNode.forEach((child, offset) => {
    if (result) {
      return;
    }
    if (isListNodeType(child.type.name)) {
      result = {
        listNode: child,
        listPos: itemPos + 1 + offset,
      };
    }
  });
  return result;
}

/**
 * 同一リスト内の隣接項目へドラッグした際に元の位置と同じ（No-Op）にならないよう、
 * ドロップ方向を補正します。
 */
function resolveEffectivePlacementByPos(
  editor: Editor,
  sourcePos: number,
  targetPos: number,
  rawPlacement: ListDropPlacement
): ListDropPlacement {
  if (rawPlacement === 'inside') {
    return 'inside';
  }
  const sourceNode = editor.state.doc.nodeAt(sourcePos);
  const targetNode = editor.state.doc.nodeAt(targetPos);
  if (!sourceNode || !targetNode) {
    return rawPlacement;
  }
  const $source = editor.state.doc.resolve(sourcePos);
  const $target = editor.state.doc.resolve(targetPos);
  if ($source.before() === $target.before()) {
    const sourceEnd = sourcePos + sourceNode.nodeSize;
    const targetEnd = targetPos + targetNode.nodeSize;
    if (rawPlacement === 'before' && targetPos === sourceEnd) {
      return 'after';
    }
    if (rawPlacement === 'after' && sourcePos === targetEnd) {
      return 'before';
    }
  }
  return rawPlacement;
}

/**
 * ProseMirror のドキュメント位置（`sourcePos` -> `targetPos`, `placement`）を指定してリスト項目を移動します。
 * 同一リスト内の並び替え、別リストへの移動（`listItem` <-> `taskItem` 自動変換含む）、
 * および別階層への移動（子階層化・親階層への引き上げ）のすべてに対応します。
 *
 * @returns 移動トランザクションが適用された場合は `true`、無効または変化なしの場合は `false`
 */
export function moveListItemByPos(
  editor: Editor,
  sourcePos: number,
  targetPos: number,
  placement: ListDropPlacement
): boolean {
  if (!editor.isEditable || sourcePos === targetPos) {
    return false;
  }

  const doc = editor.state.doc;
  const sourceNode = doc.nodeAt(sourcePos);
  const targetNode = doc.nodeAt(targetPos);
  if (
    !sourceNode ||
    !targetNode ||
    !isListItemNodeType(sourceNode.type.name) ||
    !isListItemNodeType(targetNode.type.name)
  ) {
    return false;
  }

  const sourceEnd = sourcePos + sourceNode.nodeSize;
  // 親アイテムを自身の子孫アイテムへ移動することは不可
  if (targetPos >= sourcePos && targetPos < sourceEnd) {
    return false;
  }

  const $source = doc.resolve(sourcePos);
  const $target = doc.resolve(targetPos);
  const sourceParentListPos = $source.before();
  const sourceParentListNode = $source.parent;
  const targetParentListPos = $target.before();
  const targetParentListNode = $target.parent;

  let insertPos: number;
  let nodeToInsert: ProseMirrorNode;
  let targetDestinationListPos: number;

  if (placement === 'inside') {
    const existingChildList = findFirstChildList(targetNode, targetPos);
    if (existingChildList) {
      targetDestinationListPos = existingChildList.listPos;
      nodeToInsert = convertItemForList(sourceNode, existingChildList.listNode.type);
      insertPos = existingChildList.listPos + 1;
    } else {
      targetDestinationListPos = -1;
      const newListType = targetParentListNode.type;
      const convertedItem = convertItemForList(sourceNode, newListType);
      nodeToInsert = newListType.create(null, [convertedItem]);
      insertPos = targetPos + targetNode.nodeSize - 1;
    }
  } else {
    targetDestinationListPos = targetParentListPos;
    nodeToInsert = convertItemForList(sourceNode, targetParentListNode.type);
    insertPos =
      placement === 'before' ? targetPos : targetPos + targetNode.nodeSize;
  }

  const isSameList = targetDestinationListPos === sourceParentListPos;

  // 同一リスト内で元の位置と変わらないドロップは履歴を汚さないようスキップ
  if (isSameList && (insertPos === sourcePos || insertPos === sourceEnd)) {
    return false;
  }

  // 移動元リストに項目が1つしかなく、別のリストへ移動する場合は空リストを残さないよう親リストごと削除する
  const deleteEntireSourceList =
    !isSameList && sourceParentListNode.childCount === 1;
  const deleteFrom = deleteEntireSourceList ? sourceParentListPos : sourcePos;
  const deleteTo = deleteEntireSourceList
    ? sourceParentListPos + sourceParentListNode.nodeSize
    : sourceEnd;

  if (insertPos > deleteFrom && insertPos < deleteTo) {
    return false;
  }

  try {
    const tr = editor.state.tr;
    let newItemPos: number;

    if (insertPos <= deleteFrom) {
      tr.insert(insertPos, nodeToInsert);
      const delta = nodeToInsert.nodeSize;
      tr.delete(deleteFrom + delta, deleteTo + delta);
      newItemPos = insertPos;
    } else {
      tr.insert(insertPos, nodeToInsert);
      tr.delete(deleteFrom, deleteTo);
      newItemPos = insertPos - (deleteTo - deleteFrom);
    }

    const safeSelectionPos = Math.min(
      Math.max(1, newItemPos + 1),
      tr.doc.content.size
    );
    tr.setSelection(TextSelection.near(tr.doc.resolve(safeSelectionPos)));
    tr.scrollIntoView();
    editor.view.dispatch(tr);
    return true;
  } catch (err) {
    console.error('[listDrag] Failed to move list item:', err);
    return false;
  }
}

/**
 * DOM 上の `sourceLi` を `targetLi` の指定位置（`'before'` | `'after'` | `'inside'`）へ移動します。
 */
export function moveListItem(
  editor: Editor,
  sourceLi: HTMLLIElement,
  targetLi: HTMLLIElement,
  placement: ListDropPlacement
): boolean {
  if (!editor.isEditable || sourceLi === targetLi || sourceLi.contains(targetLi)) {
    return false;
  }
  const source = resolveListItemNode(editor, sourceLi);
  const target = resolveListItemNode(editor, targetLi);
  if (!source || !target) {
    return false;
  }
  return moveListItemByPos(editor, source.pos, target.pos, placement);
}

/**
 * リスト項目の1行目（ネストされた子リストを除いた先頭行）の矩形を取得します。
 */
function getListItemFirstLineRect(li: HTMLLIElement): DOMRect {
  const firstParagraph = li.querySelector(
    ':scope > p, :scope > div > p'
  ) as HTMLElement | null;
  if (firstParagraph) {
    const rect = firstParagraph.getBoundingClientRect();
    if (rect.height > 0) {
      return rect;
    }
  }
  const labelEl = li.querySelector(':scope > label') as HTMLElement | null;
  if (labelEl) {
    const rect = labelEl.getBoundingClientRect();
    if (rect.height > 0) {
      return rect;
    }
  }
  const liRect = li.getBoundingClientRect();
  return new DOMRect(
    liRect.left,
    liRect.top,
    liRect.width,
    Math.min(liRect.height || 26, 28)
  );
}

/**
 * ネストされた子リスト（`<ul>` / `<ol>`）の領域を除外した、その `<li>` 自身の行領域矩形を返します。
 */
function getListItemOwnRect(li: HTMLLIElement): DOMRect {
  const liRect = li.getBoundingClientRect();
  const childList = li.querySelector(
    ':scope > ul, :scope > ol, :scope > div > ul, :scope > div > ol'
  ) as HTMLElement | null;
  if (childList) {
    const childRect = childList.getBoundingClientRect();
    if (childRect.top > liRect.top) {
      return new DOMRect(
        liRect.left,
        liRect.top,
        liRect.width,
        childRect.top - liRect.top
      );
    }
  }
  return liRect;
}

/**
 * ホバー時にポインター座標から対象 `<li>` 要素を特定します。
 */
function findHoverListItemAtPoint(
  editorDom: HTMLElement,
  clientX: number,
  clientY: number
): HTMLLIElement | null {
  const allItems = Array.from(editorDom.querySelectorAll('li')) as HTMLLIElement[];
  let bestMatch: HTMLLIElement | null = null;
  let bestDist = Infinity;

  for (const li of allItems) {
    const ownRect = getListItemOwnRect(li);
    if (
      clientX < ownRect.left - HANDLE_GUTTER_TOLERANCE_PX ||
      clientX > ownRect.right + HANDLE_GUTTER_TOLERANCE_PX
    ) {
      continue;
    }
    if (clientY >= ownRect.top && clientY <= ownRect.bottom) {
      bestMatch = li;
      bestDist = 0;
    } else if (bestDist > 0) {
      const dist = Math.min(
        Math.abs(clientY - ownRect.top),
        Math.abs(clientY - ownRect.bottom)
      );
      if (dist <= 8 && dist < bestDist) {
        bestDist = dist;
        bestMatch = li;
      }
    }
  }
  return bestMatch;
}

/**
 * ドラッグ中にポインター座標から最も適切なドロップ先 `<li>` を特定します。
 * 同一リスト内だけでなく別リスト・別階層の `<li>` も対象とし、隙間や左右余白でもターゲットを失わないようにします。
 */
function findDropTargetListItem(
  editorDom: HTMLElement,
  dragSourceLi: HTMLLIElement,
  clientY: number
): HTMLLIElement | null {
  const candidates = Array.from(editorDom.querySelectorAll('li')).filter(
    (li) => li !== dragSourceLi && !dragSourceLi.contains(li)
  ) as HTMLLIElement[];

  if (candidates.length === 0) {
    return null;
  }

  let bestMatch: HTMLLIElement | null = null;
  let bestDist = Infinity;

  for (const li of candidates) {
    const ownRect = getListItemOwnRect(li);
    let dist = 0;
    if (clientY < ownRect.top) {
      dist = ownRect.top - clientY;
    } else if (clientY > ownRect.bottom) {
      dist = clientY - ownRect.bottom;
    }
    if (dist <= bestDist) {
      bestDist = dist;
      bestMatch = li;
    }
  }

  return bestMatch;
}

/**
 * ターゲット `<li>` とポインター座標からドロップ位置（`'before'` | `'after'` | `'inside'`）を判定します。
 */
export function detectDropPlacement(
  targetLi: HTMLLIElement,
  clientX: number,
  clientY: number,
  dragStartX?: number
): ListDropPlacement {
  const firstLineRect = getListItemFirstLineRect(targetLi);
  const ownRect = getListItemOwnRect(targetLi);
  const liRect = targetLi.getBoundingClientRect();
  const midY = firstLineRect.top + firstLineRect.height / 2;

  if (clientY < midY) {
    return 'before';
  }

  const insideTopThreshold = firstLineRect.top + firstLineRect.height * 0.6;
  const indentedPastTarget = clientX >= liRect.left + INDENT_INSIDE_THRESHOLD_PX;
  const draggedRightEnough =
    dragStartX === undefined || clientX >= dragStartX + INDENT_INSIDE_THRESHOLD_PX;
  const withinTargetInsideBand =
    clientY >= insideTopThreshold && clientY <= ownRect.bottom + 8;

  if (indentedPastTarget && draggedRightEnough && withinTargetInsideBand) {
    return 'inside';
  }
  return 'after';
}

/**
 * 箇条書き（`-`）、番号付きリスト（`1.`）、チェックリスト（`- [ ]`）の各項目に
 * ホバー時のドラッグハンドル（`⋮⋮`）を表示し、同一リスト内の並び替えおよび
 * 別リスト・別階層へのドラッグ＆ドロップ移動を提供するオーバーレイ UI をセットアップします。
 *
 * @param previewPane オーバーレイを描画する親コンテナ（`position: relative`）
 * @param scrollWrapper エディタのスクロールコンテナ
 * @param editor 対象の Tiptap Editor インスタンス
 * @returns クリーンアップ関数
 */
export function setupListDragControls(
  previewPane: HTMLElement,
  scrollWrapper: HTMLElement,
  editor: Editor
): () => void {
  const handleBtn = document.createElement('button');
  handleBtn.type = 'button';
  handleBtn.className = 'list-drag-handle hidden';
  handleBtn.textContent = '⋮⋮';
  handleBtn.title = 'ドラッグして並び替え（右へドラッグで子階層へ移動）';
  handleBtn.setAttribute('aria-label', 'ドラッグしてリスト項目を並び替え');

  const dropGuide = document.createElement('div');
  dropGuide.className = 'list-drop-guide hidden';
  dropGuide.setAttribute('aria-hidden', 'true');

  // ProseMirror 管理下の <li> 属性を直接書き換えると MutationObserver により DOM が再生成されるため、
  // ドラッグ中アイテムのハイライトも previewPane 上のオーバーレイ要素で描画する
  const dragHighlight = document.createElement('div');
  dragHighlight.className = 'list-drag-highlight hidden';
  dragHighlight.setAttribute('aria-hidden', 'true');

  previewPane.appendChild(dragHighlight);
  previewPane.appendChild(handleBtn);
  previewPane.appendChild(dropGuide);

  let hoveredLi: HTMLLIElement | null = null;
  let dragSourceLi: HTMLLIElement | null = null;
  let dragSourcePos = -1;
  let dragStartX: number | undefined;
  let currentDropTarget: DropTargetState | null = null;

  const hideHandle = () => {
    if (dragSourceLi) {
      return;
    }
    hoveredLi = null;
    handleBtn.classList.add('hidden');
  };

  const hideDropGuide = () => {
    currentDropTarget = null;
    dropGuide.classList.add('hidden');
    dropGuide.classList.remove('is-inside');
  };

  const positionHandle = (li: HTMLLIElement) => {
    const paneRect = previewPane.getBoundingClientRect();
    const liRect = li.getBoundingClientRect();
    const firstLineRect = getListItemFirstLineRect(li);

    const isTaskItem =
      li.getAttribute('data-type') === 'taskItem' ||
      li.parentElement?.getAttribute('data-type') === 'taskList';

    const offsetLeft = isTaskItem ? 14 : 24;
    const rawX = liRect.left - paneRect.left - offsetLeft;
    const rawY = firstLineRect.top + firstLineRect.height / 2 - paneRect.top;

    const clampedX = Math.max(12, Math.min(paneRect.width - 12, rawX));
    const clampedY = Math.max(12, Math.min(paneRect.height - 12, rawY));

    handleBtn.style.left = `${clampedX}px`;
    handleBtn.style.top = `${clampedY}px`;
    handleBtn.classList.remove('hidden');
  };

  const positionDropGuide = (target: DropTargetState) => {
    const paneRect = previewPane.getBoundingClientRect();
    const liRect = target.li.getBoundingClientRect();
    const firstLineRect = getListItemFirstLineRect(target.li);

    let guideTop = 0;
    let guideLeft = liRect.left - paneRect.left;
    let guideWidth = Math.max(40, liRect.width);

    if (target.placement === 'before') {
      guideTop = liRect.top - paneRect.top;
      dropGuide.classList.remove('is-inside');
    } else if (target.placement === 'inside') {
      guideTop = firstLineRect.bottom - paneRect.top;
      guideLeft += 24;
      guideWidth = Math.max(40, guideWidth - 24);
      dropGuide.classList.add('is-inside');
    } else {
      guideTop = liRect.bottom - paneRect.top;
      dropGuide.classList.remove('is-inside');
    }

    dropGuide.style.left = `${guideLeft}px`;
    dropGuide.style.top = `${guideTop - 1}px`;
    dropGuide.style.width = `${guideWidth}px`;
    dropGuide.classList.remove('hidden');
  };

  const startDrag = (li: HTMLLIElement, startClientX: number) => {
    const resolved = resolveListItemNode(editor, li);
    if (!resolved) {
      return;
    }

    hoveredLi = li;
    dragSourceLi = li;
    dragSourcePos = resolved.pos;
    dragStartX = startClientX;

    const paneRect = previewPane.getBoundingClientRect();
    const liRect = li.getBoundingClientRect();
    dragHighlight.style.left = `${liRect.left - paneRect.left - 4}px`;
    dragHighlight.style.top = `${liRect.top - paneRect.top}px`;
    dragHighlight.style.width = `${Math.max(40, liRect.width + 8)}px`;
    dragHighlight.style.height = `${Math.max(20, liRect.height)}px`;
    dragHighlight.classList.remove('hidden');

    handleBtn.classList.add('is-dragging');
    document.body.classList.add('is-list-dragging');
    positionHandle(li);
    hideDropGuide();
  };

  const endDrag = () => {
    dragSourceLi = null;
    dragSourcePos = -1;
    dragStartX = undefined;
    dragHighlight.classList.add('hidden');
    handleBtn.classList.remove('is-dragging');
    document.body.classList.remove('is-list-dragging');
    hideDropGuide();
    hideHandle();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!editor.isEditable) {
      hideHandle();
      return;
    }
    if (dragSourceLi) {
      return;
    }

    const eventTarget = e.target as globalThis.Node | null;
    if (eventTarget && handleBtn.contains(eventTarget)) {
      return;
    }

    // 表示中のドラッグハンドル付近へマウスを移動している最中はハンドルを維持する
    if (hoveredLi && !handleBtn.classList.contains('hidden')) {
      const btnRect = handleBtn.getBoundingClientRect();
      if (
        btnRect.width > 0 &&
        e.clientX >= btnRect.left - 12 &&
        e.clientX <= btnRect.right + 16 &&
        e.clientY >= btnRect.top - 8 &&
        e.clientY <= btnRect.bottom + 8
      ) {
        return;
      }
    }

    const editorDom = editor.view.dom as HTMLElement;
    let li: HTMLLIElement | null = null;

    if (
      eventTarget instanceof Element &&
      eventTarget.tagName !== 'UL' &&
      eventTarget.tagName !== 'OL'
    ) {
      const closestLi = eventTarget.closest('li') as HTMLLIElement | null;
      if (closestLi && editorDom.contains(closestLi)) {
        li = closestLi;
      }
    }

    if (!li) {
      li = findHoverListItemAtPoint(editorDom, e.clientX, e.clientY);
    }

    if (!li) {
      hideHandle();
      return;
    }

    // ドキュメント全体でリスト項目が1つしかない場合は移動先がないためハンドルを出さない
    if (editorDom.querySelectorAll('li').length <= 1) {
      hideHandle();
      return;
    }

    hoveredLi = li;
    positionHandle(li);
  };

  const handleWindowMouseMove = (e: MouseEvent) => {
    if (!dragSourceLi || dragSourcePos < 0) {
      return;
    }
    if (!editor.isEditable) {
      endDrag();
      return;
    }

    const editorDom = editor.view.dom as HTMLElement;
    const targetLi = findDropTargetListItem(editorDom, dragSourceLi, e.clientY);
    if (!targetLi || targetLi === dragSourceLi || dragSourceLi.contains(targetLi)) {
      hideDropGuide();
      return;
    }

    const resolvedTarget = resolveListItemNode(editor, targetLi);
    if (!resolvedTarget) {
      hideDropGuide();
      return;
    }

    const rawPlacement = detectDropPlacement(
      targetLi,
      e.clientX,
      e.clientY,
      dragStartX
    );
    const placement = resolveEffectivePlacementByPos(
      editor,
      dragSourcePos,
      resolvedTarget.pos,
      rawPlacement
    );

    currentDropTarget = {
      li: targetLi,
      targetPos: resolvedTarget.pos,
      placement,
    };
    positionDropGuide(currentDropTarget);
  };

  const handleWindowMouseUp = () => {
    if (!dragSourceLi) {
      return;
    }
    const sourcePos = dragSourcePos;
    const target = currentDropTarget;
    endDrag();

    if (target && sourcePos >= 0 && sourcePos !== target.targetPos) {
      moveListItemByPos(editor, sourcePos, target.targetPos, target.placement);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && dragSourceLi) {
      e.preventDefault();
      endDrag();
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0 || !editor.isEditable || !hoveredLi) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    startDrag(hoveredLi, e.clientX);
  };

  // バレットマーカー（•）や番号（1.）の左ガター領域を直接掴んでドラッグ開始することも可能にする
  const handleWrapperMouseDown = (e: MouseEvent) => {
    if (e.button !== 0 || !editor.isEditable || dragSourceLi) {
      return;
    }
    const eventTarget = e.target as globalThis.Node | null;
    if (eventTarget && handleBtn.contains(eventTarget)) {
      return;
    }

    const editorDom = editor.view.dom as HTMLElement;
    const li = findHoverListItemAtPoint(editorDom, e.clientX, e.clientY);
    if (!li) {
      return;
    }
    const liRect = li.getBoundingClientRect();
    if (
      e.clientX < liRect.left - 2 &&
      e.clientX >= liRect.left - HANDLE_GUTTER_TOLERANCE_PX
    ) {
      e.preventDefault();
      e.stopPropagation();
      startDrag(li, e.clientX);
    }
  };

  const handleMouseLeave = (e: MouseEvent) => {
    if (dragSourceLi) {
      return;
    }
    const related = e.relatedTarget as globalThis.Node | null;
    if (related && handleBtn.contains(related)) {
      return;
    }
    hideHandle();
  };

  const handleScroll = () => {
    if (dragSourceLi) {
      endDrag();
    } else {
      hideHandle();
    }
  };

  handleBtn.addEventListener('mousedown', handleMouseDown);
  scrollWrapper.addEventListener('mousedown', handleWrapperMouseDown);
  scrollWrapper.addEventListener('mousemove', handleMouseMove);
  scrollWrapper.addEventListener('mouseleave', handleMouseLeave);
  scrollWrapper.addEventListener('scroll', handleScroll);
  window.addEventListener('mousemove', handleWindowMouseMove, true);
  window.addEventListener('mouseup', handleWindowMouseUp, true);
  window.addEventListener('pointerup', handleWindowMouseUp, true);
  window.addEventListener('keydown', handleKeyDown);

  return () => {
    handleBtn.removeEventListener('mousedown', handleMouseDown);
    scrollWrapper.removeEventListener('mousedown', handleWrapperMouseDown);
    scrollWrapper.removeEventListener('mousemove', handleMouseMove);
    scrollWrapper.removeEventListener('mouseleave', handleMouseLeave);
    scrollWrapper.removeEventListener('scroll', handleScroll);
    window.removeEventListener('mousemove', handleWindowMouseMove, true);
    window.removeEventListener('mouseup', handleWindowMouseUp, true);
    window.removeEventListener('pointerup', handleWindowMouseUp, true);
    window.removeEventListener('keydown', handleKeyDown);
    document.body.classList.remove('is-list-dragging');
    dragHighlight.remove();
    handleBtn.remove();
    dropGuide.remove();
  };
}
