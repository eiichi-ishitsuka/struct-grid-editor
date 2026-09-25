import type { ReactNode } from 'react';

interface ToolbarProps {
    documentType: string;
    itemCount: string;
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    children?: ReactNode;
}

export function Toolbar({ documentType, itemCount, searchQuery, onSearchQueryChange, children }: ToolbarProps) {
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
            </div>
        </div>
    );
}
