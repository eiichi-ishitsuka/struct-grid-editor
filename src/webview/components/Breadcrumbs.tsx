interface BreadcrumbSegment {
    label: string;
    path: string;
}

export interface BreadcrumbsProps {
    activeArrayPath: string | null;
    onNavigate: (path: string) => void;
}

function getBreadcrumbSegments(rawPath: string): BreadcrumbSegment[] {
    if (!rawPath) {
        return [];
    }

    let workingPath = rawPath;
    let topLevelPrefix = '';
    if (workingPath.startsWith('[')) {
        const closeBracketIndex = workingPath.indexOf(']');
        const index = workingPath.slice(1, closeBracketIndex);
        if (closeBracketIndex > 1 && workingPath[closeBracketIndex + 1] === '.' && /^\d+$/.test(index)) {
            topLevelPrefix = `[${index}]`;
            workingPath = workingPath.slice(closeBracketIndex + 2);
        }
    }

    let currentPath = topLevelPrefix;
    return workingPath
        .split('.')
        .filter(Boolean)
        .map(label => {
            currentPath = currentPath ? `${currentPath}.${label}` : label;
            return { label, path: currentPath };
        });
}

export function Breadcrumbs({ activeArrayPath, onNavigate }: BreadcrumbsProps) {
    const isRoot = activeArrayPath === null || activeArrayPath === '';
    const segments = activeArrayPath ? getBreadcrumbSegments(activeArrayPath) : [];

    return (
        <nav className="breadcrumb-bar" aria-label="現在の配列パス">
            {isRoot ? (
                <span className="breadcrumb-current">root/</span>
            ) : (
                <>
                    <button className="breadcrumb-link" type="button" onClick={() => onNavigate('')}>root/</button>
                    {segments.map((segment, index) => {
                        const isLast = index === segments.length - 1;
                        return (
                            <span key={segment.path}>
                                <span className="breadcrumb-separator" aria-hidden="true">&gt;</span>
                                {isLast ? (
                                    <span className="breadcrumb-current">{segment.label}</span>
                                ) : (
                                    <button className="breadcrumb-link" type="button" onClick={() => onNavigate(segment.path)}>
                                        {segment.label}
                                    </button>
                                )}
                            </span>
                        );
                    })}
                </>
            )}
        </nav>
    );
}
