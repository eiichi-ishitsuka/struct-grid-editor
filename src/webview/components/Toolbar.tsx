import type { ReactNode } from 'react';

export interface ToolbarProps {
    documentType: string;
    itemCount: string;
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    onOpenTextEditor?: () => void;
    hasHeader?: boolean;
    onToggleHeader?: (hasHeader: boolean) => void;
    children?: ReactNode;
}

export function Toolbar({
    documentType,
    itemCount,
    searchQuery,
    onSearchQueryChange,
    onOpenTextEditor,
    hasHeader,
    onToggleHeader,
    children,
}: ToolbarProps) {
    const isDelimited = documentType === 'csv' || documentType === 'tsv';

    return (
        <div className="header">
            <div className="header-title">
                <span>StructGridEditor</span>
                <span className="badge-format">{documentType.toUpperCase()}</span>
                <span className="item-count">{itemCount}</span>
            </div>
            <div className="toolbar">
                {isDelimited && onToggleHeader && (
                    <label
                        className="csv-header-toggle"
                        title="1行目をヘッダー（カラム名）として扱うかどうかを切り替えます"
                    >
                        <input
                            id="csvHeaderToggle"
                            type="checkbox"
                            checked={hasHeader ?? true}
                            onChange={event => onToggleHeader(event.target.checked)}
                        />
                        <span>1行目をヘッダーにする</span>
                    </label>
                )}
                <input
                    id="searchInput"
                    className="search-box"
                    type="search"
                    placeholder="検索..."
                    value={searchQuery}
                    onChange={event => onSearchQueryChange(event.target.value)}
                />
                {children}
                <button
                    className="btn btn-secondary"
                    id="openTextEditorBtn"
                    title="通常のテキストエディタで開く"
                    type="button"
                    onClick={onOpenTextEditor}
                >
                    テキストで開く
                </button>
            </div>
        </div>
    );
}
