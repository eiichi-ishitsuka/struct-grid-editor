import type { ReactNode } from 'react';

export interface ToolbarProps {
    documentType: string;
    itemCount: string;
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    onOpenTextEditor?: () => void;
    children?: ReactNode;
}

export function Toolbar({
    documentType,
    itemCount,
    searchQuery,
    onSearchQueryChange,
    onOpenTextEditor,
    children,
}: ToolbarProps) {
    return (
        <div className="header">
            <div className="header-title">
                <span>StructGridEditor</span>
                <span className="badge-format">{documentType.toUpperCase()}</span>
                <span className="item-count">{itemCount}</span>
            </div>
            <div className="toolbar">
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
