import type { KeyboardEvent, MouseEvent } from 'react';
import type { GridRowDto } from '../../../../application/dto/GridData';
import { EditableCell } from './EditableCell';
import { ValueTypeTag } from './ValueTypeTag';

interface KvGridProps {
    rows: GridRowDto[];
    searchQuery: string;
    onUpdateCell?: (path: string, value: string) => void;
    onRenameKey?: (path: string, oldKey: string, newKey: string) => void;
    onAddKvRow?: () => void;
    onNavigateArray?: (arrayPath: string) => void;
    onKeyContextMenu?: (event: MouseEvent<HTMLSpanElement>, row: GridRowDto) => void;
    onCellContextMenu?: (event: MouseEvent<HTMLTableCellElement>, path: string) => void;
}

export function KvGrid({
    rows,
    searchQuery,
    onUpdateCell,
    onRenameKey,
    onAddKvRow,
    onNavigateArray,
    onKeyContextMenu,
    onCellContextMenu,
}: KvGridProps) {
    const normalizedQuery = searchQuery.toLowerCase();
    const visibleRows = rows.filter(row => {
        if (!normalizedQuery) {
            return true;
        }
        return row.path.toLowerCase().includes(normalizedQuery)
            || row.key.toLowerCase().includes(normalizedQuery)
            || row.displayValue.toLowerCase().includes(normalizedQuery);
    });

    const handleKeyBlur = (row: GridRowDto, element: HTMLElement) => {
        const newKey = (element.innerText || '').trim();
        const oldKey = row.key || row.path;
        if (!newKey || newKey === oldKey) {
            element.innerText = oldKey;
            return;
        }
        onRenameKey?.(row.path, oldKey, newKey);
    };

    const handleKeyKeyDown = (event: KeyboardEvent<HTMLSpanElement>, oldKey: string) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            (event.target as HTMLElement).blur();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            const target = event.target as HTMLElement;
            target.innerText = oldKey;
            target.blur();
        }
    };

    return (
        <div className="table-container">
            <table id="gridTable">
                <thead><tr><th>パス / キー</th><th>値</th></tr></thead>
                <tbody>
                    {visibleRows.length === 0 ? (
                        <tr><td className="empty-placeholder" colSpan={2}>データがありません</td></tr>
                    ) : visibleRows.map((row, index) => {
                        const isArray = row.type === 'array' || row.isArray;
                        const isObject = row.type === 'object' || row.type === 'complex';
                        const safeKey = row.key || row.path;

                        let valCell;
                        if (isArray) {
                            valCell = (
                                <td className="col-val col-val-array">
                                    <button
                                        className="btn-edit-array edit-array-btn"
                                        data-array-path={row.path}
                                        title="編集する"
                                        type="button"
                                        onClick={() => onNavigateArray?.(row.path)}
                                    >
                                        編集する
                                    </button>
                                </td>
                            );
                        } else if (isObject && !row.isLeaf) {
                            valCell = <td className="col-val col-val-object" />;
                        } else {
                            valCell = (
                                <EditableCell
                                    path={row.path}
                                    colKey={row.key}
                                    rowIndex={index}
                                    displayValue={row.displayValue}
                                    type={row.type}
                                    className="col-val"
                                    onUpdateCell={(path, val) => onUpdateCell?.(path, val)}
                                    onSelectCell={() => {}}
                                    onContextMenu={event => onCellContextMenu?.(event, row.path)}
                                />
                            );
                        }

                        return (
                            <tr data-id={row.id} data-path={row.path} key={row.id}>
                                <td className="col-path" style={{ paddingLeft: `${Math.max(0, row.depth - 1) * 16 + 10}px` }}>
                                    <span className="path-connector">{row.depth > 1 ? '└─ ' : ''}</span>
                                    <span
                                        className="path-text"
                                        contentEditable={true}
                                        suppressContentEditableWarning={true}
                                        data-path={row.path}
                                        data-old-key={safeKey}
                                        title="クリックしてキー名を編集 / 右クリックでキーを削除"
                                        onBlur={event => handleKeyBlur(row, event.currentTarget)}
                                        onKeyDown={event => handleKeyKeyDown(event, safeKey)}
                                        onContextMenu={event => onKeyContextMenu?.(event, row)}
                                    >
                                        {safeKey}
                                    </span>
                                    <ValueTypeTag type={row.type} />
                                </td>
                                {valCell}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="add-row-bottom">
                <button
                    className="btn-add-plus"
                    id="addKvRowBtn"
                    title="項目を追加"
                    type="button"
                    onClick={onAddKvRow}
                >
                    ＋
                </button>
            </div>
        </div>
    );
}
