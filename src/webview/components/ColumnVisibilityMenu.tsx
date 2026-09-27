import { useState } from 'react';
import type { TableColumnDto } from '../../application/dto/GridData';

export interface ColumnVisibilityMenuProps {
    columns: TableColumnDto[];
    hiddenColumns: string[];
    onHiddenColumnsChange: (columnKeys: string[]) => void;
}

export function ColumnVisibilityMenu({ columns, hiddenColumns, onHiddenColumnsChange }: ColumnVisibilityMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const visibleCount = columns.length - hiddenColumns.length;

    const toggleColumn = (columnKey: string) => {
        const nextHiddenColumns = hiddenColumns.includes(columnKey)
            ? hiddenColumns.filter(key => key !== columnKey)
            : [...hiddenColumns, columnKey];
        onHiddenColumnsChange(nextHiddenColumns);
    };

    return (
        <div className="col-visibility-wrapper">
            <button
                id="colVisibilityBtn"
                className="btn btn-secondary"
                type="button"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(open => !open)}
            >
                👁 列 ({visibleCount}/{columns.length})
            </button>
            {isOpen && (
                <div id="colVisibilityDropdown" className="col-visibility-dropdown">
                    <div className="col-visibility-title">
                        <span>列の表示切替</span>
                        {hiddenColumns.length > 0 && (
                            <button className="btn-link" type="button" onClick={() => onHiddenColumnsChange([])}>
                                すべて表示
                            </button>
                        )}
                    </div>
                    <div className="col-visibility-list">
                        {columns.map(column => (
                            <label className="col-visibility-item" key={column.key}>
                                <input
                                    type="checkbox"
                                    checked={!hiddenColumns.includes(column.key)}
                                    onChange={() => toggleColumn(column.key)}
                                />
                                <span>{column.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
