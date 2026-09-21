import { GridDataDto, TableViewDto } from '../../application/dto/GridData';

/**
 * GridDataDto を元にスプレッドシート・グリッドUIの完全な HTML 文字列を生成するレンダラー。
 */
export class WebviewRenderer {
    /**
     * グリッドデータ DTO から VS Code Webview 用の HTML 文字列を生成します。
     * @param data 描画対象の GridDataDto
     * @returns 生成された HTML 文字列
     */
    public render(data: GridDataDto): string {
        if (data.error) {
            return this.renderError(data.error);
        }

        const jsonData = JSON.stringify(data).replace(/</g, '\\u003c');


        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StructGridEditor</title>
    <style>
        :root {
            --font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif);
        }
        body {
            font-family: var(--font-family);
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 16px;
            box-sizing: border-box;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
            flex-wrap: wrap;
            gap: 10px;
        }
        .header-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 15px;
            font-weight: 600;
        }
        .badge-format {
            font-size: 11px;
            text-transform: uppercase;
            padding: 2px 8px;
            border-radius: 4px;
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
        }
        .breadcrumb-bar {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            margin-bottom: 12px;
            padding: 6px 12px;
            background-color: var(--vscode-editor-inactiveSelectionBackground, rgba(255, 255, 255, 0.05));
            border-radius: 4px;
            border: 1px solid var(--vscode-panel-border);
            font-family: var(--vscode-editor-font-family, monospace);
        }
        .breadcrumb-link {
            color: var(--vscode-textLink-foreground, #3794ff);
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
        }
        .breadcrumb-link:hover {
            text-decoration: underline;
        }
        .breadcrumb-separator {
            opacity: 0.5;
            user-select: none;
            padding: 0 2px;
        }
        .breadcrumb-current {
            font-weight: 600;
            color: var(--vscode-editor-foreground);
        }
        .toolbar {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
        }
        .search-box {
            padding: 5px 10px;
            font-size: 13px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border, transparent);
            border-radius: 3px;
            outline: none;
            min-width: 180px;
        }
        .search-box:focus {
            border-color: var(--vscode-focusBorder);
        }
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 5px 10px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            transition: background 0.15s ease;
        }
        .btn:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .btn-secondary {
            background-color: var(--vscode-button-secondaryBackground, #3a3d41);
            color: var(--vscode-button-secondaryForeground, #fff);
        }
        .btn-secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground, #45494e);
        }
        .btn-edit-array {
            padding: 3px 10px;
            font-size: 12px;
            background-color: var(--vscode-button-secondaryBackground, #3a3d41);
            color: var(--vscode-button-secondaryForeground, #fff);
            border: 1px solid var(--vscode-button-border, rgba(255, 255, 255, 0.15));
            border-radius: 3px;
            cursor: pointer;
            transition: all 0.15s ease;
        }
        .btn-edit-array:hover {
            background-color: var(--vscode-button-secondaryHoverBackground, #4f545a);
            border-color: var(--vscode-focusBorder);
        }
        .table-container {
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            overflow-x: auto;
            max-height: calc(100vh - 120px);
            background-color: var(--vscode-editor-background);
            position: relative;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        th {
            background-color: var(--vscode-editor-inactiveSelectionBackground, rgba(255, 255, 255, 0.08));
            color: var(--vscode-editor-foreground);
            font-weight: 600;
            padding: 8px 12px;
            text-align: left;
            position: sticky;
            top: 0;
            z-index: 10;
            border-bottom: 1px solid var(--vscode-panel-border);
            border-right: 1px solid var(--vscode-panel-border);
            white-space: nowrap;
        }
        td {
            padding: 6px 12px;
            border-bottom: 1px solid var(--vscode-panel-border);
            border-right: 1px solid var(--vscode-panel-border);
            vertical-align: middle;
        }
        tr:hover td {
            background-color: var(--vscode-list-hoverBackground, rgba(255, 255, 255, 0.04));
        }
        .col-index {
            width: 45px;
            text-align: center;
            color: var(--vscode-descriptionForeground);
            font-size: 12px;
            user-select: none;
            background-color: var(--vscode-editor-background);
        }
        .col-path {
            font-family: var(--vscode-editor-font-family, monospace);
            white-space: nowrap;
            width: 40%;
        }
        .path-connector {
            opacity: 0.5;
            user-select: none;
        }
        .col-type-tag {
            display: inline-block;
            font-size: 10px;
            padding: 1px 5px;
            border-radius: 3px;
            margin-left: 6px;
            font-family: var(--vscode-editor-font-family, monospace);
            font-weight: normal;
            vertical-align: middle;
        }
        .col-type-array { background: rgba(0, 188, 212, 0.2); color: #4dd0e1; border: 1px solid rgba(0, 188, 212, 0.4); }
        .col-type-object { background: rgba(156, 39, 176, 0.2); color: #ba68c8; border: 1px solid rgba(156, 39, 176, 0.4); }
        .col-type-number { background: rgba(33, 150, 243, 0.2); color: #64b5f6; border: 1px solid rgba(33, 150, 243, 0.4); }
        .col-type-boolean { background: rgba(255, 152, 0, 0.2); color: #ffb74d; border: 1px solid rgba(255, 152, 0, 0.4); }
        .col-type-other { background: rgba(76, 175, 80, 0.2); color: #81c784; border: 1px solid rgba(76, 175, 80, 0.4); }
        .col-header-cell {
            user-select: none;
            cursor: grab;
        }
        .col-header-cell:active {
            cursor: grabbing;
        }
        .col-header-label {
            display: inline-block;
            cursor: text;
            padding: 1px 4px;
            border-radius: 3px;
            border: 1px solid transparent;
            transition: all 0.15s ease;
        }
        .col-header-label:hover {
            background-color: var(--vscode-editor-selectionBackground, rgba(255, 255, 255, 0.12));
            border-color: var(--vscode-input-border, rgba(255, 255, 255, 0.25));
        }
        .col-header-label:focus {
            outline: none;
            border-color: var(--vscode-focusBorder, #007fd4);
            background-color: var(--vscode-input-background);
        }
        .path-text {
            display: inline-block;
            cursor: text;
            padding: 1px 4px;
            border-radius: 3px;
            border: 1px solid transparent;
            transition: all 0.15s ease;
        }
        .path-text:hover {
            background-color: var(--vscode-editor-selectionBackground, rgba(255, 255, 255, 0.12));
            border-color: var(--vscode-input-border, rgba(255, 255, 255, 0.25));
        }
        .path-text:focus {
            outline: none;
            border-color: var(--vscode-focusBorder, #007fd4);
            background-color: var(--vscode-input-background);
        }
        .drag-handle {
            cursor: grab;
            user-select: none;
        }
        .drag-handle:active {
            cursor: grabbing;
        }
        tr.dragging, th.dragging {
            opacity: 0.45;
        }
        tr.drag-over-top td {
            border-top: 2px solid var(--vscode-focusBorder, #007fd4) !important;
        }
        tr.drag-over-bottom td {
            border-bottom: 2px solid var(--vscode-focusBorder, #007fd4) !important;
        }
        th.drag-over-left {
            border-left: 2px solid var(--vscode-focusBorder, #007fd4) !important;
        }
        th.drag-over-right {
            border-right: 2px solid var(--vscode-focusBorder, #007fd4) !important;
        }
        .corner-cell {
            cursor: pointer;
            text-align: center;
            user-select: none;
            position: relative;
            background-color: var(--vscode-editor-background);
            transition: background-color 0.15s ease;
        }
        .corner-cell:hover {
            background-color: var(--vscode-list-hoverBackground, rgba(255, 255, 255, 0.12));
        }
        .corner-cell.corner-selected {
            background-color: var(--vscode-editor-selectionBackground, #04395e) !important;
        }
        .corner-icon {
            display: inline-block;
            width: 7px;
            height: 7px;
            border-right: 2px solid var(--vscode-descriptionForeground);
            border-bottom: 2px solid var(--vscode-descriptionForeground);
            opacity: 0.6;
            transform: rotate(45deg) translate(-1px, -1px);
        }
        /* Selected states */
        .cell-selected {
            background-color: var(--vscode-editor-selectionBackground, #04395e) !important;
            outline: 1px solid var(--vscode-focusBorder, #007fd4) !important;
            outline-offset: -1px;
        }
        tr.row-selected td {
            background-color: var(--vscode-editor-selectionBackground, #04395e) !important;
        }
        tr.row-selected td.col-index {
            background-color: var(--vscode-editor-selectionHighlightBackground, #094771) !important;
            color: var(--vscode-editor-foreground);
            font-weight: bold;
        }
        th.col-header-selected {
            background-color: var(--vscode-editor-selectionHighlightBackground, #094771) !important;
            color: var(--vscode-editor-foreground);
        }
        td.col-selected {
            background-color: var(--vscode-editor-selectionBackground, #04395e) !important;
        }
        /* Toast notification */
        .toast-notification {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background-color: var(--vscode-notifications-background, #252526);
            color: var(--vscode-notifications-foreground, #cccccc);
            border: 1px solid var(--vscode-notifications-border, #454545);
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
            padding: 8px 18px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            z-index: 10000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .toast-notification.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        .context-menu-separator {
            height: 1px;
            background-color: var(--vscode-menu-separatorBackground, #454545);
            margin: 4px 0;
        }
        .context-menu {
            position: fixed;
            z-index: 9999;
            background: var(--vscode-menu-background, #252526);
            color: var(--vscode-menu-foreground, #cccccc);
            border: 1px solid var(--vscode-menu-border, #454545);
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            padding: 4px 0;
            font-size: 12px;
            min-width: 140px;
            display: none;
        }
        .context-menu-item {
            padding: 6px 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            transition: background-color 0.1s;
        }
        .context-menu-item:hover {
            background-color: var(--vscode-menu-selectionBackground, #094771);
            color: var(--vscode-menu-selectionForeground, #ffffff);
        }
        .context-menu-item.danger {
            color: var(--vscode-errorForeground, #f48771);
        }
        .context-menu-item.danger:hover {
            background-color: rgba(244, 67, 54, 0.25);
            color: #ff8a80;
        }
        .col-val {
            font-family: var(--vscode-editor-font-family, monospace);
            min-width: 120px;
            cursor: text;
        }
        .col-val:focus {
            outline: 2px solid var(--vscode-focusBorder);
            background-color: var(--vscode-editor-selectionBackground);
        }
        .col-val-array,
        .col-val-object {
            cursor: default;
        }
        .col-actions {
            width: 45px;
            text-align: center;
        }
        .col-add-header {
            width: 36px;
            text-align: center;
            padding: 4px 6px;
        }
        .btn-icon {
            background: none;
            border: none;
            color: var(--vscode-descriptionForeground);
            cursor: pointer;
            font-size: 12px;
            padding: 2px 6px;
            border-radius: 3px;
        }
        .btn-icon:hover {
            color: var(--vscode-errorForeground, #f44336);
            background: var(--vscode-toolbar-hoverBackground, rgba(255, 255, 255, 0.1));
        }
        .add-row-bottom {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            border-top: 1px solid var(--vscode-panel-border);
            background-color: var(--vscode-editor-background);
        }
        .btn-add-plus {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: 4px;
            background-color: var(--vscode-button-secondaryBackground, #3a3d41);
            color: var(--vscode-button-secondaryForeground, #fff);
            border: 1px dashed var(--vscode-panel-border, #555);
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: all 0.15s ease;
        }
        .btn-add-plus:hover {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border-style: solid;
        }
        .btn-add-col {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            border-radius: 3px;
            background-color: var(--vscode-button-secondaryBackground, #3a3d41);
            color: var(--vscode-button-secondaryForeground, #fff);
            border: 1px dashed var(--vscode-panel-border, #555);
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            transition: all 0.15s ease;
        }
        .btn-add-col:hover {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border-style: solid;
        }
        .empty-placeholder {
            padding: 40px 20px;
            text-align: center;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    <div id="app"></div>
    <div id="contextMenu" class="context-menu"></div>
    <div id="toastNotification" class="toast-notification"></div>

    <script>
        const vscode = acquireVsCodeApi();
        const initialData = ${jsonData};

        // State
        const savedState = vscode.getState() || {};
        let customColOrders = savedState.customColOrders || {};
        let customRowOrders = savedState.customRowOrders || {};
        let currentSelection = { type: 'none' };
        let currentMode = initialData.viewMode || 'kv'; // 'table' | 'kv'
        let activeArrayPath = initialData.viewMode === 'table' ? (initialData.tableData?.path ?? '') : null;
        let searchQuery = '';

        function saveCustomOrderState() {
            const st = vscode.getState() || {};
            vscode.setState({
                ...st,
                customColOrders,
                customRowOrders
            });
        }

        function escapeHtml(str) {
            return (str ?? '')
                .toString()
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function getActiveTableView() {
            if (activeArrayPath === null) {
                return null;
            }
            if (activeArrayPath === '' && initialData.tableData) {
                return initialData.tableData;
            }
            const sub = (initialData.subArrays || []).find(s => s.path === activeArrayPath);
            return sub?.tableData || null;
        }

        function getOrderedTableView() {
            const baseView = getActiveTableView();
            if (!baseView) return null;
            const pathKey = activeArrayPath || '__root__';

            let cols = [...baseView.columns];
            const customCols = customColOrders[pathKey];
            if (customCols && Array.isArray(customCols) && customCols.length > 0) {
                const colMap = new Map(cols.map(c => [c.key, c]));
                const ordered = [];
                for (const k of customCols) {
                    if (colMap.has(k)) {
                        ordered.push(colMap.get(k));
                        colMap.delete(k);
                    }
                }
                for (const c of colMap.values()) {
                    ordered.push(c);
                }
                cols = ordered;
            }

            let rows = [...baseView.rows];
            const customRows = customRowOrders[pathKey];
            if (customRows && Array.isArray(customRows) && customRows.length > 0) {
                const rowMap = new Map(rows.map(r => [r.path, r]));
                const ordered = [];
                for (const p of customRows) {
                    if (rowMap.has(p)) {
                        ordered.push(rowMap.get(p));
                        rowMap.delete(p);
                    }
                }
                for (const r of rowMap.values()) {
                    ordered.push(r);
                }
                rows = ordered;
            }

            return {
                ...baseView,
                columns: cols,
                rows: rows
            };
        }

        function getBreadcrumbSegments(rawPath) {
            if (!rawPath) return [];

            const segments = [];
            let workingPath = rawPath;

            // Check if path starts with top-level array index: "[<digits>].<property>"
            if (workingPath.startsWith('[')) {
                const closeBracketIdx = workingPath.indexOf(']');
                if (closeBracketIdx > 1 && workingPath.charAt(closeBracketIdx + 1) === '.') {
                    const idxStr = workingPath.substring(1, closeBracketIdx);
                    if (/^\d+$/.test(idxStr)) {
                        const afterDot = workingPath.substring(closeBracketIdx + 2);
                        const nextDotIdx = afterDot.indexOf('.');
                        const prop = nextDotIdx === -1 ? afterDot : afterDot.substring(0, nextDotIdx);
                        const rest = nextDotIdx === -1 ? '' : afterDot.substring(nextDotIdx + 1);

                        const firstPath = '[' + idxStr + '].' + prop;
                        segments.push({
                            label: prop + '[' + idxStr + ']',
                            path: firstPath
                        });

                        workingPath = rest;
                    }
                }
            }

            if (workingPath) {
                const parts = workingPath.split('.').filter(function(p) { return p.length > 0; });
                let acc = segments.length > 0 ? segments[0].path : '';
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    acc = acc ? (acc + '.' + part) : part;
                    segments.push({
                        label: part,
                        path: acc
                    });
                }
            }

            return segments;
        }

        function renderBreadcrumbs() {
            let html = '';
            const isAtRoot = activeArrayPath === null || activeArrayPath === '';

            if (isAtRoot) {
                html += '<span class="breadcrumb-current">root/</span>';
            } else {
                html += '<span class="breadcrumb-link bc-link" data-path="">root/</span>';

                const segments = getBreadcrumbSegments(activeArrayPath);
                segments.forEach((seg, idx) => {
                    const isLast = idx === segments.length - 1;
                    html += '<span class="breadcrumb-separator">></span>';
                    if (isLast) {
                        html += \`<span class="breadcrumb-current">\${escapeHtml(seg.label)}</span>\`;
                    } else {
                        html += \`<span class="breadcrumb-link bc-link" data-path="\${escapeHtml(seg.path)}">\${escapeHtml(seg.label)}</span>\`;
                    }
                });

                html += \`
                    <button class="btn btn-secondary" style="margin-left: auto; padding: 2px 8px; font-size: 11px;" id="bcBackBtn">
                        ← root/ に戻る
                    </button>
                \`;
            }

            return html;
        }

        function renderApp() {
            const app = document.getElementById('app');
            const tableView = getOrderedTableView();
            const isTableMode = currentMode === 'table' && tableView;

            let html = '';

            // Header
            html += \`
            <div class="header">
                <div class="header-title">
                    <span>StructGridEditor</span>
                    <span class="badge-format">\${initialData.documentType.toUpperCase()}</span>
                    <span style="font-size: 12px; color: var(--vscode-descriptionForeground);">
                        \${isTableMode ? tableView.totalRows + ' 行 (' + tableView.totalColumns + ' 列)' : initialData.totalRows + ' 項目'}
                    </span>
                </div>
                <div class="toolbar">
                    <input type="text" class="search-box" id="searchInput" placeholder="検索..." value="\${escapeHtml(searchQuery)}" />
                    <button class="btn btn-secondary" id="openTextEditorBtn" title="通常のテキストエディタで開く">テキストで開く</button>
                </div>
            </div>
            \`;

            // Always render breadcrumb bar at the top of all views
            html += \`
            <div class="breadcrumb-bar">
                \${renderBreadcrumbs()}
            </div>
            \`;

            // Main Content Area
            if (isTableMode) {
                html += renderTableSpreadsheet(tableView);
            } else {
                html += renderKvGrid(initialData.rows);
            }

            app.innerHTML = html;
            attachEventListeners();
            updateSelectionVisuals();
        }

        // Render Spreadsheet Table View
        function renderTableSpreadsheet(tableView) {
            let thead = '<tr><th class="col-index corner-cell" id="cornerSelectAll" title="すべて選択 (Ctrl+A / Cmd+A)"><span class="corner-icon"></span></th>';
            tableView.columns.forEach((col, colIdx) => {
                const typeClass = col.type === 'array' ? 'array' : col.type === 'object' ? 'object' : col.type === 'number' ? 'number' : col.type === 'boolean' ? 'boolean' : 'other';
                const typeSym = col.type === 'array' ? '[ ]' : col.type === 'object' ? '{ }' : col.type === 'number' ? '1234' : col.type === 'boolean' ? 'T/F' : 'Aa';
                thead += \`
                <th class="col-header-cell" draggable="true" data-col-index="\${colIdx}" data-col-key="\${escapeHtml(col.key)}" title="クリックで列を選択 / ドラッグして移動">
                    <span class="col-header-label" contenteditable="true" spellcheck="false" data-col-key="\${escapeHtml(col.key)}" data-old-label="\${escapeHtml(col.label)}" title="クリックして列名を編集">\${escapeHtml(col.label)}</span>
                    <span class="col-type-tag col-type-\${typeClass}">\${typeSym}</span>
                </th>\`;
            });
            thead += '<th class="col-add-header"><button class="btn-add-col" id="addColBtn" title="一番右に列を挿入">＋</button></th></tr>';

            let tbody = '';
            const q = searchQuery.toLowerCase();

            if (tableView.rows.length === 0) {
                tbody = \`
                <tr>
                    <td colspan="\${tableView.columns.length + 2}" class="empty-placeholder">
                        データがありません
                    </td>
                </tr>\`;
            } else {
                tableView.rows.forEach((row, rowIdx) => {
                    if (q) {
                        const rowText = Object.values(row.cells).map(c => c.displayValue).join(' ').toLowerCase();
                        if (!rowText.includes(q)) {
                            return;
                        }
                    }

                    tbody += \`<tr class="table-row-item" draggable="true" data-row-index="\${rowIdx}" data-row-path="\${escapeHtml(row.path)}">\`;
                    tbody += \`<td class="col-index drag-handle row-header" data-row-index="\${rowIdx}" data-row-path="\${escapeHtml(row.path)}" title="クリックで行を選択 / ドラッグして移動 / 右クリックで削除">\${rowIdx + 1}</td>\`;

                    for (const col of tableView.columns) {
                        const cell = row.cells[col.key];
                        const val = cell ? cell.displayValue : '';
                        const cellPath = cell ? cell.path : \`\${row.path}.\${col.key}\`;
                        const cellType = cell ? cell.type : 'null';

                        if (col.type === 'array' || cellType === 'array') {
                            tbody += \`
                            <td class="col-val col-val-array" data-path="\${escapeHtml(cellPath)}" data-col-key="\${escapeHtml(col.key)}" data-row-index="\${rowIdx}">
                                <button class="btn-edit-array edit-sub-array-btn" data-array-path="\${escapeHtml(cellPath)}" title="編集する">
                                    編集する
                                </button>
                            </td>\`;
                        } else {
                            tbody += \`
                            <td class="col-val" contenteditable="true" data-path="\${escapeHtml(cellPath)}" data-col-key="\${escapeHtml(col.key)}" data-row-index="\${rowIdx}" data-type="\${cellType}">\${escapeHtml(val)}</td>
                            \`;
                        }
                    }

                    tbody += \`
                        <td class="col-add-cell"></td>
                    </tr>\`;
                });
            }

            return \`
            <div class="table-container" id="tableContainer">
                <table id="spreadsheetTable">
                    <thead>\${thead}</thead>
                    <tbody>\${tbody}</tbody>
                </table>
                <div class="add-row-bottom">
                    <button class="btn-add-plus" id="addTableRowBtn" title="行を追加">＋</button>
                </div>
            </div>
            \`;
        }

        // Render Key-Value Grid View (without dedicated type column, icon tag next to path)
        function renderKvGrid(rows) {
            let tbody = '';
            const q = searchQuery.toLowerCase();

            rows.forEach(row => {
                if (q) {
                    const matchPath = row.path.toLowerCase().includes(q) || (row.key || '').toLowerCase().includes(q);
                    const matchVal = (row.displayValue || '').toLowerCase().includes(q);
                    if (!matchPath && !matchVal) {
                        return;
                    }
                }

                const indentPx = Math.max(0, (row.depth - 1) * 16);
                const safeDisplayValue = escapeHtml(row.displayValue);
                const safePath = escapeHtml(row.path);
                const safeKey = escapeHtml(row.key || row.path);
                const isArrayRow = row.type === 'array' || row.isArray;
                const isObjectRow = row.type === 'object' || row.type === 'complex';
                const isNum = row.type === 'number';
                const isBool = row.type === 'boolean';

                const typeClass = isArrayRow ? 'array' : isObjectRow ? 'object' : isNum ? 'number' : isBool ? 'boolean' : 'other';
                const typeSym = isArrayRow ? '[ ]' : isObjectRow ? '{ }' : isNum ? '1234' : isBool ? 'T/F' : 'Aa';

                let valCellHtml = '';
                if (isArrayRow) {
                    valCellHtml = \`
                    <td class="col-val col-val-array">
                        <button class="btn-edit-array edit-array-btn" data-array-path="\${safePath}" title="編集する">
                            編集する
                        </button>
                    </td>\`;
                } else if (isObjectRow && !row.isLeaf) {
                    valCellHtml = '<td class="col-val col-val-object"></td>';
                } else {
                    valCellHtml = \`
                    <td class="col-val" contenteditable="true" data-path="\${safePath}" data-type="\${row.type}">\${safeDisplayValue}</td>
                    \`;
                }

                tbody += \`
                <tr data-id="\${escapeHtml(row.id)}" data-path="\${safePath}">
                    <td class="col-path" style="padding-left: \${indentPx + 10}px;">
                        <span class="path-connector">\${row.depth > 1 ? '└─ ' : ''}</span>
                        <span class="path-text" contenteditable="true" spellcheck="false" data-path="\${safePath}" data-old-key="\${safeKey}" title="クリックしてキー名を編集 / 右クリックでキーを削除">\${safeKey}</span>
                        <span class="col-type-tag col-type-\${typeClass}">\${typeSym}</span>
                    </td>
                    \${valCellHtml}
                </tr>\`;
            });

            return \`
            <div class="table-container">
                <table id="gridTable">
                    <thead>
                        <tr>
                            <th>パス / キー</th>
                            <th>値</th>
                        </tr>
                    </thead>
                    <tbody>
                        \${tbody}
                    </tbody>
                </table>
                <div class="add-row-bottom">
                    <button class="btn-add-plus" id="addKvRowBtn" title="項目を追加">＋</button>
                </div>
            </div>
            \`;
        }

        function attachEventListeners() {
            // Search Input
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    searchQuery = e.target.value;
                    renderApp();
                    const newSearch = document.getElementById('searchInput');
                    if (newSearch) {
                        newSearch.focus();
                        newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
                    }
                });
            }

            // Cell Editing (only editable cells)
            document.querySelectorAll('.col-val[contenteditable="true"]').forEach(cell => {
                cell.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        e.target.blur();
                    }
                });

                cell.addEventListener('blur', (e) => {
                    const path = e.target.getAttribute('data-path');
                    const val = e.target.innerText;
                    vscode.postMessage({
                        command: 'update_cell',
                        path: path,
                        value: val
                    });
                });
            });

            // Delete item / row
            document.querySelectorAll('.delete-btn, .delete-row-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const path = e.target.getAttribute('data-path');
                    if (confirm(\`項目 "\${path}" を削除しますか？\`)) {
                        vscode.postMessage({
                            command: 'delete_row',
                            path: path
                        });
                    }
                });
            });

            // Edit Array Button (in KV mode or nested in Table mode)
            document.querySelectorAll('.edit-array-btn, .edit-sub-array-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const arrayPath = e.currentTarget.getAttribute('data-array-path');
                    activeArrayPath = arrayPath;
                    currentMode = 'table';
                    searchQuery = '';
                    renderApp();
                });
            });

            // Breadcrumb Navigation links
            document.querySelectorAll('.bc-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    const path = e.currentTarget.getAttribute('data-path');
                    if (!path) {
                        // Return to root
                        if (initialData.viewMode === 'table') {
                            activeArrayPath = '';
                            currentMode = 'table';
                        } else {
                            activeArrayPath = null;
                            currentMode = 'kv';
                        }
                    } else {
                        activeArrayPath = path;
                        currentMode = 'table';
                    }
                    searchQuery = '';
                    renderApp();
                });
            });

            const bcBackBtn = document.getElementById('bcBackBtn');
            if (bcBackBtn) {
                bcBackBtn.addEventListener('click', () => {
                    if (initialData.viewMode === 'table') {
                        activeArrayPath = '';
                        currentMode = 'table';
                    } else {
                        activeArrayPath = null;
                        currentMode = 'kv';
                    }
                    searchQuery = '';
                    renderApp();
                });
            }

            // Bottom Add Table Row Button (＋)
            const addTableRowBtn = document.getElementById('addTableRowBtn');
            if (addTableRowBtn) {
                addTableRowBtn.addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'add_table_row',
                        arrayPath: activeArrayPath || ''
                    });
                });
            }

            // Right Add Table Column Button (＋: 一番右に列を挿入)
            const addColBtn = document.getElementById('addColBtn');
            if (addColBtn) {
                addColBtn.addEventListener('click', () => {
                    const tableView = getActiveTableView();
                    const existingKeys = tableView ? tableView.columns.map(c => c.key) : [];
                    let counter = 1;
                    let candidate = 'col' + counter;
                    while (existingKeys.includes(candidate)) {
                        counter++;
                        candidate = 'col' + counter;
                    }

                    vscode.postMessage({
                        command: 'add_table_column',
                        arrayPath: activeArrayPath || '',
                        columnKey: candidate
                    });
                });
            }

            // Column Header Rename (inline editing via contenteditable)
            document.querySelectorAll('.col-header-label').forEach(headerLabel => {
                headerLabel.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        e.target.blur();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        const oldLabel = e.target.getAttribute('data-old-label');
                        e.target.innerText = oldLabel;
                        e.target.blur();
                    }
                });

                headerLabel.addEventListener('blur', (e) => {
                    const oldKey = e.target.getAttribute('data-col-key');
                    const oldLabel = e.target.getAttribute('data-old-label');
                    const newKey = e.target.innerText.trim();

                    if (!newKey || newKey === oldLabel) {
                        e.target.innerText = oldLabel;
                        return;
                    }

                    vscode.postMessage({
                        command: 'rename_table_column',
                        arrayPath: activeArrayPath || '',
                        oldKey: oldKey,
                        newKey: newKey
                    });
                });
            });

            // Bottom Add KV Row Button (＋)
            const addKvRowBtn = document.getElementById('addKvRowBtn');
            if (addKvRowBtn) {
                addKvRowBtn.addEventListener('click', () => {
                    const existingKeys = initialData.rows.map(r => r.path);
                    let baseKey = 'newKey';
                    let counter = 1;
                    while (existingKeys.includes(baseKey)) {
                        baseKey = \`newKey\${counter}\`;
                        counter++;
                    }
                    vscode.postMessage({
                        command: 'add_row',
                        parentPath: '',
                        key: baseKey,
                        value: ''
                    });
                });
            }

            // Open text editor button listener
            const openTextEditorBtn = document.getElementById('openTextEditorBtn');
            if (openTextEditorBtn) {
                openTextEditorBtn.addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'open_text_editor'
                    });
                });
            }

            // Key rename in KV view (.path-text)
            document.querySelectorAll('.path-text[contenteditable="true"]').forEach(el => {
                el.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        el.blur();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        const oldKey = el.getAttribute('data-old-key') || '';
                        el.innerText = oldKey;
                        el.blur();
                    }
                });

                el.addEventListener('blur', () => {
                    const oldKey = el.getAttribute('data-old-key') || '';
                    const newKey = (el.innerText || '').trim();
                    const path = el.getAttribute('data-path') || '';

                    if (!newKey || newKey === oldKey) {
                        el.innerText = oldKey;
                        return;
                    }

                    vscode.postMessage({
                        command: 'rename_key',
                        path: path,
                        newKey: newKey
                    });
                });
            });

            // Context menu element and logic
            const contextMenu = document.getElementById('contextMenu');
            const hideContextMenu = () => {
                if (contextMenu) {
                    contextMenu.style.display = 'none';
                    contextMenu.innerHTML = '';
                }
            };

            function showContextMenu(e, items) {
                if (!contextMenu) return;
                contextMenu.innerHTML = '';
                items.forEach(item => {
                    if (item.isSeparator) {
                        const sep = document.createElement('div');
                        sep.className = 'context-menu-separator';
                        contextMenu.appendChild(sep);
                    } else {
                        const div = document.createElement('div');
                        div.className = 'context-menu-item' + (item.danger ? ' danger' : '');
                        div.innerText = item.label;
                        div.addEventListener('click', (ev) => {
                            ev.stopPropagation();
                            hideContextMenu();
                            item.action();
                        });
                        contextMenu.appendChild(div);
                    }
                });
                contextMenu.style.left = e.clientX + 'px';
                contextMenu.style.top = e.clientY + 'px';
                contextMenu.style.display = 'block';
            }

            // Toast Notification helper
            let toastTimeout = null;
            function showToastMessage(text) {
                const toast = document.getElementById('toastNotification');
                if (!toast) return;
                toast.innerText = text;
                toast.classList.add('show');
                if (toastTimeout) clearTimeout(toastTimeout);
                toastTimeout = setTimeout(() => {
                    toast.classList.remove('show');
                }, 1800);
            }

            // Selection Visuals update
            function updateSelectionVisuals() {
                document.querySelectorAll('.cell-selected, .row-selected, .col-header-selected, .col-selected, .corner-selected').forEach(el => {
                    el.classList.remove('cell-selected', 'row-selected', 'col-header-selected', 'col-selected', 'corner-selected');
                });

                if (currentSelection.type === 'all') {
                    const corner = document.getElementById('cornerSelectAll');
                    if (corner) corner.classList.add('corner-selected');
                    document.querySelectorAll('td.col-val').forEach(td => td.classList.add('cell-selected'));
                } else if (currentSelection.type === 'row') {
                    const row = document.querySelector('tr.table-row-item[data-row-index="' + currentSelection.rowIndex + '"]');
                    if (row) row.classList.add('row-selected');
                } else if (currentSelection.type === 'col') {
                    const th = document.querySelector('th.col-header-cell[data-col-key="' + currentSelection.colKey + '"]');
                    if (th) th.classList.add('col-header-selected');
                    document.querySelectorAll('td.col-val[data-col-key="' + currentSelection.colKey + '"]').forEach(td => {
                        td.classList.add('col-selected');
                    });
                } else if (currentSelection.type === 'cell') {
                    const td = document.querySelector('td.col-val[data-path="' + currentSelection.path + '"]');
                    if (td) td.classList.add('cell-selected');
                }
            }

            // TSV formatting & generation
            function formatTsvValue(val) {
                if (val === null || val === undefined) return '';
                const str = String(val);
                if (str.indexOf('\\t') !== -1 || str.indexOf('\\n') !== -1 || str.indexOf('\\r') !== -1 || str.indexOf('"') !== -1) {
                    return '"' + str.replace(/"/g, '""') + '"';
                }
                return str;
            }

            function generateTsv() {
                const view = getOrderedTableView();
                if (!view) return '';

                if (currentSelection.type === 'all') {
                    const header = view.columns.map(c => formatTsvValue(c.label)).join('\\t');
                    const rows = view.rows.map(r => {
                        return view.columns.map(c => formatTsvValue(r.cells[c.key]?.displayValue ?? '')).join('\\t');
                    }).join('\\n');
                    return header + '\\n' + rows;
                } else if (currentSelection.type === 'row') {
                    const row = view.rows.find(r => r.path === currentSelection.path) || view.rows[currentSelection.rowIndex];
                    if (!row) return '';
                    return view.columns.map(c => formatTsvValue(row.cells[c.key]?.displayValue ?? '')).join('\\t');
                } else if (currentSelection.type === 'col') {
                    return view.rows.map(r => formatTsvValue(r.cells[currentSelection.colKey]?.displayValue ?? '')).join('\\n');
                } else if (currentSelection.type === 'cell') {
                    const cellElem = document.querySelector('td.col-val[data-path="' + currentSelection.path + '"]');
                    return formatTsvValue(cellElem ? cellElem.innerText : '');
                }
                return '';
            }

            async function copySelection(showToast = true) {
                const tsv = generateTsv();
                if (!tsv) return;
                try {
                    await navigator.clipboard.writeText(tsv);
                    if (showToast) showToastMessage('クリップボードにTSV形式でコピーしました');
                } catch (err) {
                    const ta = document.createElement('textarea');
                    ta.value = tsv;
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                    if (showToast) showToastMessage('クリップボードにTSV形式でコピーしました');
                }
            }

            async function cutSelection() {
                if (currentSelection.type === 'none') return;
                await copySelection(false);
                deleteSelection();
                showToastMessage('切り取りました（TSV形式でコピー済み）');
            }

            function deleteSelection() {
                if (currentSelection.type === 'row') {
                    vscode.postMessage({
                        command: 'delete_row',
                        path: currentSelection.path
                    });
                    currentSelection = { type: 'none' };
                    updateSelectionVisuals();
                } else if (currentSelection.type === 'col') {
                    vscode.postMessage({
                        command: 'clear_table_column',
                        arrayPath: activeArrayPath || '',
                        columnKey: currentSelection.colKey
                    });
                    document.querySelectorAll('td.col-val[data-col-key="' + currentSelection.colKey + '"]').forEach(td => {
                        td.innerText = '';
                    });
                } else if (currentSelection.type === 'all') {
                    vscode.postMessage({
                        command: 'clear_table_data',
                        arrayPath: activeArrayPath || ''
                    });
                    document.querySelectorAll('td.col-val').forEach(td => {
                        td.innerText = '';
                    });
                } else if (currentSelection.type === 'cell') {
                    vscode.postMessage({
                        command: 'update_cell',
                        path: currentSelection.path,
                        value: ''
                    });
                    const cellElem = document.querySelector('td.col-val[data-path="' + currentSelection.path + '"]');
                    if (cellElem) cellElem.innerText = '';
                }
            }

            // Top-left Corner Cell Click & Context Menu (全選択)
            const corner = document.getElementById('cornerSelectAll');
            if (corner) {
                corner.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentSelection = { type: 'all' };
                    updateSelectionVisuals();
                });

                corner.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    currentSelection = { type: 'all' };
                    updateSelectionVisuals();

                    showContextMenu(e, [
                        { label: 'すべてコピー (TSV)', action: () => copySelection(true) },
                        { label: 'すべて切り取り', action: () => cutSelection() },
                        { isSeparator: true },
                        { label: '全データをクリア', danger: true, action: () => deleteSelection() }
                    ]);
                });
            }

            // Row Header Click & Context Menu (行選択 / 行削除)
            document.querySelectorAll('.col-index.drag-handle.row-header').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const rowIndex = parseInt(el.getAttribute('data-row-index'), 10);
                    const rowPath = el.getAttribute('data-row-path');
                    currentSelection = { type: 'row', rowIndex, path: rowPath };
                    updateSelectionVisuals();
                });

                el.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const rowIndex = parseInt(el.getAttribute('data-row-index'), 10);
                    const rowPath = el.getAttribute('data-row-path');
                    currentSelection = { type: 'row', rowIndex, path: rowPath };
                    updateSelectionVisuals();

                    showContextMenu(e, [
                        { label: '行をコピー (TSV)', action: () => copySelection(true) },
                        { label: '行を切り取り', action: () => cutSelection() },
                        { isSeparator: true },
                        { label: '行 ' + (rowIndex + 1) + ' を削除', danger: true, action: () => deleteSelection() }
                    ]);
                });
            });

            // Column Header Click & Context Menu (列選択)
            document.querySelectorAll('th.col-header-cell').forEach(th => {
                th.addEventListener('click', (e) => {
                    if (e.target.classList.contains('col-header-label')) {
                        return; // allow inline label editing
                    }
                    e.stopPropagation();
                    const colIndex = parseInt(th.getAttribute('data-col-index'), 10);
                    const colKey = th.getAttribute('data-col-key');
                    currentSelection = { type: 'col', colIndex, colKey };
                    updateSelectionVisuals();
                });

                th.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const colIndex = parseInt(th.getAttribute('data-col-index'), 10);
                    const colKey = th.getAttribute('data-col-key');
                    currentSelection = { type: 'col', colIndex, colKey };
                    updateSelectionVisuals();

                    showContextMenu(e, [
                        { label: '列をコピー (TSV)', action: () => copySelection(true) },
                        { label: '列を切り取り', action: () => cutSelection() },
                        { isSeparator: true },
                        { label: '列の値をクリア', danger: true, action: () => deleteSelection() }
                    ]);
                });
            });

            // Data Cell Click & Context Menu (セル選択)
            document.querySelectorAll('td.col-val').forEach(cell => {
                cell.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const path = cell.getAttribute('data-path');
                    const colKey = cell.getAttribute('data-col-key');
                    const rowIndex = parseInt(cell.getAttribute('data-row-index'), 10);
                    currentSelection = { type: 'cell', path, colKey, rowIndex };
                    updateSelectionVisuals();
                });

                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const path = cell.getAttribute('data-path');
                    const colKey = cell.getAttribute('data-col-key');
                    const rowIndex = parseInt(cell.getAttribute('data-row-index'), 10);

                    if (currentSelection.type !== 'all' && currentSelection.type !== 'row' && currentSelection.type !== 'col') {
                        currentSelection = { type: 'cell', path, colKey, rowIndex };
                        updateSelectionVisuals();
                    }

                    showContextMenu(e, [
                        { label: 'コピー (TSV)', action: () => copySelection(true) },
                        { label: '切り取り', action: () => cutSelection() },
                        { isSeparator: true },
                        { label: 'セルの値をクリア', danger: true, action: () => deleteSelection() }
                    ]);
                });
            });

            // Deselect on outside click
            document.addEventListener('click', (e) => {
                hideContextMenu();
                if (!e.target.closest('#spreadsheetTable') && !e.target.closest('#contextMenu')) {
                    if (currentSelection.type !== 'none') {
                        currentSelection = { type: 'none' };
                        updateSelectionVisuals();
                    }
                }
            });

            // Global Keyboard Shortcuts (Ctrl+C, Ctrl+X, Delete/Backspace, Ctrl+A, Escape)
            document.addEventListener('keydown', (e) => {
                const isEditing = document.activeElement && (
                    document.activeElement.tagName === 'INPUT' ||
                    (document.activeElement.getAttribute('contenteditable') === 'true' && (
                        document.activeElement.classList.contains('col-header-label') ||
                        document.activeElement.classList.contains('path-text')
                    ))
                );
                if (isEditing) return;

                const isCmdOrCtrl = e.ctrlKey || e.metaKey;

                if (isCmdOrCtrl && (e.key === 'c' || e.key === 'C')) {
                    if (currentSelection.type !== 'none') {
                        e.preventDefault();
                        copySelection(true);
                    }
                } else if (isCmdOrCtrl && (e.key === 'x' || e.key === 'X')) {
                    if (currentSelection.type !== 'none') {
                        e.preventDefault();
                        cutSelection();
                    }
                } else if (isCmdOrCtrl && (e.key === 'a' || e.key === 'A')) {
                    if (currentMode === 'table') {
                        e.preventDefault();
                        currentSelection = { type: 'all' };
                        updateSelectionVisuals();
                    }
                } else if (e.key === 'Delete' || e.key === 'Backspace') {
                    const isCellTyping = document.activeElement && document.activeElement.classList.contains('col-val') && document.activeElement.getAttribute('contenteditable') === 'true';
                    if (currentSelection.type !== 'none' && !isCellTyping) {
                        e.preventDefault();
                        deleteSelection();
                    }
                } else if (e.key === 'Escape') {
                    currentSelection = { type: 'none' };
                    updateSelectionVisuals();
                }
            });

            // Right-click on path-text in KV view
            document.querySelectorAll('.path-text').forEach(el => {
                el.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const path = el.getAttribute('data-path');
                    const key = el.getAttribute('data-old-key') || path;
                    showContextMenu(e, [
                        {
                            label: 'キー "' + key + '" を削除',
                            danger: true,
                            action: () => {
                                vscode.postMessage({
                                    command: 'delete_row',
                                    path: path
                                });
                            }
                        }
                    ]);
                });
            });

            // Row Drag & Drop (見た目のみの並び替え: JSON/YAML の順序は変更しない)
            let draggedRowIndex = null;
            document.querySelectorAll('tr.table-row-item').forEach(row => {
                row.addEventListener('dragstart', (e) => {
                    draggedRowIndex = parseInt(row.getAttribute('data-row-index'), 10);
                    row.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                });
                row.addEventListener('dragend', () => {
                    row.classList.remove('dragging');
                    document.querySelectorAll('tr.table-row-item').forEach(r => {
                        r.classList.remove('drag-over-top', 'drag-over-bottom');
                    });
                });
                row.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    const targetIndex = parseInt(row.getAttribute('data-row-index'), 10);
                    if (draggedRowIndex === null || draggedRowIndex === targetIndex) return;

                    const rect = row.getBoundingClientRect();
                    const midY = rect.top + rect.height / 2;
                    if (e.clientY < midY) {
                        row.classList.add('drag-over-top');
                        row.classList.remove('drag-over-bottom');
                    } else {
                        row.classList.add('drag-over-bottom');
                        row.classList.remove('drag-over-top');
                    }
                });
                row.addEventListener('dragleave', () => {
                    row.classList.remove('drag-over-top', 'drag-over-bottom');
                });
                row.addEventListener('drop', (e) => {
                    e.preventDefault();
                    const targetIndex = parseInt(row.getAttribute('data-row-index'), 10);
                    if (draggedRowIndex === null || draggedRowIndex === targetIndex) return;

                    const pathKey = activeArrayPath || '__root__';
                    const view = getOrderedTableView();
                    if (view && view.rows) {
                        const rowPaths = view.rows.map(r => r.path);
                        const [moved] = rowPaths.splice(draggedRowIndex, 1);
                        rowPaths.splice(targetIndex, 0, moved);
                        customRowOrders[pathKey] = rowPaths;
                        saveCustomOrderState();
                        renderApp();
                    }
                    draggedRowIndex = null;
                });
            });

            // Column Drag & Drop (見た目のみの並び替え: JSON/YAML の順序は変更しない)
            let draggedColIndex = null;
            document.querySelectorAll('th.col-header-cell').forEach(th => {
                th.addEventListener('dragstart', (e) => {
                    if (document.activeElement && document.activeElement.classList.contains('col-header-label')) {
                        e.preventDefault();
                        return;
                    }
                    draggedColIndex = parseInt(th.getAttribute('data-col-index'), 10);
                    th.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                });
                th.addEventListener('dragend', () => {
                    th.classList.remove('dragging');
                    document.querySelectorAll('th.col-header-cell').forEach(h => {
                        h.classList.remove('drag-over-left', 'drag-over-right');
                    });
                });
                th.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    const targetIndex = parseInt(th.getAttribute('data-col-index'), 10);
                    if (draggedColIndex === null || draggedColIndex === targetIndex) return;

                    const rect = th.getBoundingClientRect();
                    const midX = rect.left + rect.width / 2;
                    if (e.clientX < midX) {
                        th.classList.add('drag-over-left');
                        th.classList.remove('drag-over-right');
                    } else {
                        th.classList.add('drag-over-right');
                        th.classList.remove('drag-over-left');
                    }
                });
                th.addEventListener('dragleave', () => {
                    th.classList.remove('drag-over-left', 'drag-over-right');
                });
                th.addEventListener('drop', (e) => {
                    e.preventDefault();
                    const targetIndex = parseInt(th.getAttribute('data-col-index'), 10);
                    if (draggedColIndex === null || draggedColIndex === targetIndex) return;

                    const pathKey = activeArrayPath || '__root__';
                    const view = getOrderedTableView();
                    if (view && view.columns) {
                        const colKeys = view.columns.map(c => c.key);
                        const [moved] = colKeys.splice(draggedColIndex, 1);
                        colKeys.splice(targetIndex, 0, moved);
                        customColOrders[pathKey] = colKeys;
                        saveCustomOrderState();
                        renderApp();
                    }
                    draggedColIndex = null;
                });
            });
        }

        // Initialize Render
        renderApp();
    </script>
</body>
</html>`;
    }

    private renderError(error: string): string {
        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
            padding: 24px;
        }
        .error-card {
            border: 1px solid var(--vscode-inputValidation-errorBorder, #f44336);
            background: var(--vscode-inputValidation-errorBackground, rgba(244, 67, 54, 0.1));
            padding: 16px;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="error-card">
        <h3 style="margin-top: 0;">構文エラー</h3>
        <p>${this.escapeHtml(error)}</p>
    </div>
</body>
</html>`;
    }

    private escapeHtml(str: string): string {
        return (str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
