import { useEffect, useRef } from 'react';

export interface ContextMenuItem {
    label?: string;
    action?: () => void;
    danger?: boolean;
    isSeparator?: boolean;
}

export interface ContextMenuProps {
    items: ContextMenuItem[];
    position: { x: number; y: number } | null;
    onClose: () => void;
}

export function ContextMenu({ items, position, onClose }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!position) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [position, onClose]);

    if (!position || items.length === 0) {
        return null;
    }

    return (
        <div
            id="contextMenu"
            className="context-menu"
            ref={menuRef}
            style={{
                display: 'block',
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
        >
            {items.map((item, index) => {
                if (item.isSeparator) {
                    return <div className="context-menu-separator" key={`sep-${index}`} />;
                }
                return (
                    <div
                        className={`context-menu-item${item.danger ? ' danger' : ''}`}
                        key={`item-${index}-${item.label}`}
                        onClick={event => {
                            event.stopPropagation();
                            onClose();
                            item.action?.();
                        }}
                    >
                        {item.label}
                    </div>
                );
            })}
        </div>
    );
}
