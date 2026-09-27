import {
    useCallback,
    useEffect,
    useRef,
    type CSSProperties,
    type KeyboardEvent,
    type MouseEvent,
} from 'react';
import type { GridNavigationDirection } from '../hooks/useKeyboardNavigation';

export interface EditableCellProps {
    path: string;
    colKey: string;
    rowIndex: number;
    displayValue: string;
    type?: string;
    className?: string;
    style?: CSSProperties;
    isSelected?: boolean;
    onUpdateCell: (path: string, value: string) => void;
    onSelectCell: (rowIndex: number, colKey: string, path: string) => void;
    onNavigateAdjacent?: (direction: GridNavigationDirection) => void;
    onContextMenu?: (event: MouseEvent<HTMLTableCellElement>) => void;
}

function selectCellContents(element: HTMLElement | null) {
    if (!element) {
        return;
    }
    try {
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    } catch {
        // ignore
    }
}

function isAllSelected(element: HTMLElement | null): boolean {
    if (!element) {
        return false;
    }
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        return false;
    }
    const selectedText = selection.toString();
    const cellText = element.innerText ?? '';
    return selectedText.length > 0 && selectedText === cellText;
}

export function EditableCell({
    path,
    colKey,
    rowIndex,
    displayValue,
    type = 'string',
    className = 'col-val',
    style,
    isSelected = false,
    onUpdateCell,
    onSelectCell,
    onNavigateAdjacent,
    onContextMenu,
}: EditableCellProps) {
    const cellRef = useRef<HTMLTableCellElement>(null);
    const isEditingRef = useRef(false);

    // 編集中のユーザー入力を React の再描画で上書きしないよう ref で保護する
    useEffect(() => {
        if (!isEditingRef.current && cellRef.current) {
            if (cellRef.current.innerText !== displayValue) {
                cellRef.current.innerText = displayValue;
            }
        }
    }, [displayValue]);

    const commitChange = useCallback(() => {
        if (!cellRef.current) {
            return;
        }
        const currentValue = cellRef.current.innerText ?? '';
        if (currentValue !== displayValue) {
            onUpdateCell(path, currentValue);
        }
    }, [displayValue, onUpdateCell, path]);

    const handleFocus = useCallback(() => {
        isEditingRef.current = true;
    }, []);

    const handleBlur = useCallback(() => {
        isEditingRef.current = false;
        commitChange();
    }, [commitChange]);

    const handleKeyDown = useCallback((event: KeyboardEvent<HTMLTableCellElement>) => {
        const isCmdOrCtrl = event.ctrlKey || event.metaKey;

        // Ctrl + A / Cmd + A: セル内テキストを全選択
        if (isCmdOrCtrl && (event.key === 'a' || event.key === 'A')) {
            event.preventDefault();
            event.stopPropagation();
            selectCellContents(cellRef.current);
            return;
        }

        // Alt + Enter または Ctrl + Enter: セル内改行
        if ((event.altKey || (event.ctrlKey && !event.metaKey)) && (event.key === 'Enter' || event.code === 'NumpadEnter')) {
            event.preventDefault();
            document.execCommand('insertLineBreak');
            return;
        }

        // Enter / NumpadEnter: 値を確定して上下セルへ移動
        if (event.key === 'Enter' || event.code === 'NumpadEnter') {
            event.preventDefault();
            commitChange();
            onNavigateAdjacent?.(event.shiftKey ? 'up' : 'down');
            return;
        }

        // Tab: 値を確定して左右セルへ移動
        if (event.key === 'Tab') {
            event.preventDefault();
            commitChange();
            onNavigateAdjacent?.(event.shiftKey ? 'left' : 'right');
            return;
        }

        // 矢印キー移動 (全選択中、または単一行セルでの移動)
        const cellText = cellRef.current?.innerText ?? '';
        const hasNewline = cellText.includes('\n');
        const allSelected = isAllSelected(cellRef.current);

        if (event.key === 'ArrowUp' || event.code === 'Numpad8') {
            if (allSelected || !hasNewline) {
                event.preventDefault();
                commitChange();
                onNavigateAdjacent?.('up');
            }
        } else if (event.key === 'ArrowDown' || event.code === 'Numpad2') {
            if (allSelected || !hasNewline) {
                event.preventDefault();
                commitChange();
                onNavigateAdjacent?.('down');
            }
        } else if (event.key === 'ArrowLeft' || event.code === 'Numpad4') {
            if (allSelected) {
                event.preventDefault();
                commitChange();
                onNavigateAdjacent?.('left');
            }
        } else if (event.key === 'ArrowRight' || event.code === 'Numpad6') {
            if (allSelected) {
                event.preventDefault();
                commitChange();
                onNavigateAdjacent?.('right');
            }
        }
    }, [commitChange, onNavigateAdjacent]);

    return (
        <td
            ref={cellRef}
            className={className}
            style={style}
            contentEditable={true}
            suppressContentEditableWarning={true}
            data-path={path}
            data-col-key={colKey}
            data-row-index={rowIndex}
            data-type={type}
            tabIndex={0}
            onClick={() => onSelectCell(rowIndex, colKey, path)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onContextMenu={onContextMenu}
        >
            {displayValue}
        </td>
    );
}
