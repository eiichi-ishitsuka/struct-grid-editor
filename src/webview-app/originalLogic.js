let vscode = window.vscode || { getState: () => ({}), setState: () => {}, postMessage: () => {} };

        let initialData = window.initialData;

        // State
        const savedState = vscode.getState() || {};
        let customColOrders = savedState.customColOrders || {};
        let customRowOrders = savedState.customRowOrders || {};
        let customColWidths = savedState.customColWidths || {};
        let hiddenCols = savedState.hiddenCols || {};
        let sortState = savedState.sortState || {};
        let currentSelection = { type: 'none' };
        let currentMode = savedState.currentMode || initialData.viewMode || 'kv'; // 'table' | 'kv'
        let activeArrayPath = savedState.hasOwnProperty('activeArrayPath') ? savedState.activeArrayPath : (initialData.viewMode === 'table' ? (initialData.tableData?.path ?? '') : null);
        let searchQuery = savedState.searchQuery || '';
        let currentPage = savedState.currentPage || 1;
        const PAGE_SIZE = 100;

        // Validate that activeArrayPath still exists in the newly parsed data
        if (activeArrayPath && activeArrayPath !== '') {
            const sub = (initialData.subArrays || []).find(s => s.path === activeArrayPath);
            if (!sub) {
                // The active array might have been deleted or renamed, fallback to root
                if (initialData.viewMode === 'table') {
                    activeArrayPath = '';
                    currentMode = 'table';
                } else {
                    activeArrayPath = null;
                    currentMode = 'kv';
                }
            }
        }

        function saveCustomOrderState() {
            const st = vscode.getState() || {};
            vscode.setState({
                ...st,
                customColOrders,
                customRowOrders,
                customColWidths,
                hiddenCols,
                sortState,
                currentPage,
                currentMode,
                activeArrayPath,
                searchQuery
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

            const allCols = [...baseView.columns];
            const hidden = hiddenCols[pathKey] || [];
            let cols = allCols.filter(c => !hidden.includes(c.key));

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
            const curSort = sortState[pathKey];
            if (curSort && curSort.colKey && curSort.direction) {
                const sortKey = curSort.colKey;
                const isAsc = curSort.direction === 'asc';
                rows.sort((a, b) => {
                    const cellA = a.cells[sortKey];
                    const cellB = b.cells[sortKey];
                    const valA = cellA ? cellA.displayValue : '';
                    const valB = cellB ? cellB.displayValue : '';
                    const typeA = cellA ? cellA.type : 'string';
                    const typeB = cellB ? cellB.type : 'string';

                    const aEmpty = (valA === '' || valA === null || valA === undefined);
                    const bEmpty = (valB === '' || valB === null || valB === undefined);
                    if (aEmpty && bEmpty) return 0;
                    if (aEmpty) return 1;
                    if (bEmpty) return -1;

                    let cmp = 0;
                    if (typeA === 'number' && typeB === 'number') {
                        const numA = parseFloat(valA);
                        const numB = parseFloat(valB);
                        cmp = (!isNaN(numA) && !isNaN(numB)) ? (numA - numB) : String(valA).localeCompare(String(valB));
                    } else if (typeA === 'boolean' && typeB === 'boolean') {
                        const boolA = String(valA) === 'true' ? 1 : 0;
                        const boolB = String(valB) === 'true' ? 1 : 0;
                        cmp = boolA - boolB;
                    } else {
                        const numA = Number(valA);
                        const numB = Number(valB);
                        if (!isNaN(numA) && !isNaN(numB) && String(valA).trim() !== '' && String(valB).trim() !== '') {
                            cmp = numA - numB;
                        } else {
                            cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
                        }
                    }
                    return isAsc ? cmp : -cmp;
                });
            } else {
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
            }

            return {
                ...baseView,
                columns: cols,
                allColumns: allCols,
                rows: rows
            };
        }

        function getBreadcrumbSegments(rawPath) {
            if (!rawPath) return [];

            const segments = [];
            let workingPath = rawPath;
            let topLevelPrefix = '';

            // Check if path starts with top-level array index: "[<digits>].<property>"
            // Skip the index segment itself; only show the property name onward.
            if (workingPath.startsWith('[')) {
                const closeBracketIdx = workingPath.indexOf(']');
                if (closeBracketIdx > 1 && workingPath.charAt(closeBracketIdx + 1) === '.') {
                    const idxStr = workingPath.substring(1, closeBracketIdx);
                    if (/^\d+$/.test(idxStr)) {
                        // Keep the full prefix for path data, but do NOT push an index segment
                        topLevelPrefix = '[' + idxStr + ']';
                        workingPath = workingPath.substring(closeBracketIdx + 2);
                    }
                }
            }

            if (workingPath) {
                const parts = workingPath.split('.').filter(function(p) { return p.length > 0; });
                let acc = topLevelPrefix;
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
                        html += `<span class="breadcrumb-current">${escapeHtml(seg.label)}</span>`;
                    } else {
                        html += `<span class="breadcrumb-link bc-link" data-path="${escapeHtml(seg.path)}">${escapeHtml(seg.label)}</span>`;
                    }
                });

                html += `
                    <button class="btn btn-secondary" style="margin-left: auto; padding: 2px 8px; font-size: 11px;" id="bcBackBtn">
                        ← root/ に戻る
                    </button>
                `;
            }

            return html;
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

        function renderApp() {
            const app = document.getElementById('app'); if (!app) return;
            const tableView = getOrderedTableView();
            const isTableMode = currentMode === 'table' && tableView;

            let html = '';

            let colVisibilityBtnHtml = '';
            if (isTableMode) {
                const allCols = tableView.allColumns || tableView.columns;
                const pathKey = activeArrayPath || '__root__';
                const hidden = hiddenCols[pathKey] || [];
                const hiddenCount = hidden.length;
                const totalCount = allCols.length;
                const visibleCount = totalCount - hiddenCount;
                colVisibilityBtnHtml = `
                <div class="col-visibility-wrapper">
                    <button class="btn btn-secondary" id="colVisibilityBtn" title="列の表示・非表示を設定">
                        👁 列 (${visibleCount}/${totalCount})
                    </button>
                    <div id="colVisibilityDropdown" class="col-visibility-dropdown" style="display: none;">
                        <div class="col-visibility-title">
                            <span>列の表示切替</span>
                            ${hiddenCount > 0 ? '<button class="btn-link" id="showAllColsBtn">すべて表示</button>' : ''}
                        </div>
                        <div class="col-visibility-list">
                            ${allCols.map(c => {
                                const isChecked = !hidden.includes(c.key);
                                return `
                                <label class="col-visibility-item">
                                    <input type="checkbox" class="col-vis-checkbox" data-col-key="${escapeHtml(c.key)}" ${isChecked ? 'checked' : ''} />
                                    <span>${escapeHtml(c.label)}</span>
                                </label>`;
                            }).join('')}
                        </div>
                    </div>
                </div>
                `;
            }

            // Header
            html += `
            <div class="header">
                <div class="header-title">
                    <span>StructGridEditor</span>
                    <span class="badge-format">${initialData.documentType.toUpperCase()}</span>
                    <span style="font-size: 12px; color: var(--vscode-descriptionForeground);">
                        ${isTableMode ? tableView.totalRows + ' 行 (' + tableView.totalColumns + ' 列)' : initialData.totalRows + ' 項目'}
                    </span>
                </div>
                <div class="toolbar">
                    <input type="text" class="search-box" id="searchInput" placeholder="検索..." value="${escapeHtml(searchQuery)}" />
                    ${colVisibilityBtnHtml}
                    <button class="btn btn-secondary" id="openTextEditorBtn" title="通常のテキストエディタで開く">テキストで開く</button>
                </div>
            </div>
            `;

            // Always render breadcrumb bar at the top of all views
            html += `
            <div class="breadcrumb-bar">
                ${renderBreadcrumbs()}
            </div>
            `;

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
            const pathKey = activeArrayPath || '__root__';
            const widths = customColWidths[pathKey] || {};
            const curSort = sortState[pathKey];

            let thead = '<tr><th class="col-index corner-cell" id="cornerSelectAll" title="すべて選択 (Ctrl+A / Cmd+A)"><span class="corner-icon"></span></th>';
            tableView.columns.forEach((col, colIdx) => {
                const typeClass = col.type === 'array' ? 'array' : col.type === 'object' ? 'object' : col.type === 'number' ? 'number' : col.type === 'boolean' ? 'boolean' : 'other';
                const typeSym = col.type === 'array' ? '[ ]' : col.type === 'object' ? '{ }' : col.type === 'number' ? '1234' : col.type === 'boolean' ? 'T/F' : 'Aa';
                const w = widths[col.key];
                const widthStyle = w ? `width: ${w}px; min-width: ${w}px; max-width: ${w}px;` : '';

                let sortIndicator = '↕';
                let sortClass = 'col-sort-btn';
                let sortTitle = 'クリックして昇順ソート';
                if (curSort && curSort.colKey === col.key) {
                    if (curSort.direction === 'asc') {
                        sortIndicator = '▲';
                        sortClass += ' active asc';
                        sortTitle = '昇順でソート中 (クリックで降順へ)';
                    } else {
                        sortIndicator = '▼';
                        sortClass += ' active desc';
                        sortTitle = '降順でソート中 (クリックでソート解除)';
                    }
                }

                thead += `
                <th class="col-header-cell" style="${widthStyle}" draggable="true" data-col-index="${colIdx}" data-col-key="${escapeHtml(col.key)}" title="クリックで列を選択 / ドラッグして移動">
                    <div class="col-header-inner">
                        <span class="col-header-label" contenteditable="true" spellcheck="false" data-col-key="${escapeHtml(col.key)}" data-old-label="${escapeHtml(col.label)}" title="クリックして列名を編集">${escapeHtml(col.label)}</span>
                        <span class="col-type-tag col-type-${typeClass}">${typeSym}</span>
                        <button class="${sortClass}" data-col-key="${escapeHtml(col.key)}" title="${sortTitle}">${sortIndicator}</button>
                    </div>
                    <div class="col-resizer" data-col-key="${escapeHtml(col.key)}" title="ドラッグして列幅を調整 / ダブルクリックでリセット"></div>
                </th>`;
            });
            thead += '<th class="col-add-header"><button class="btn-add-col" id="addColBtn" title="一番右に列を挿入">＋</button></th></tr>';

            let tbody = '';
            const q = searchQuery.toLowerCase();

            // 検索クエリが存在する場合は行をフィルタリング
            let filteredRows = [];
            if (q) {
                filteredRows = tableView.rows
                    .map((row, originalIndex) => ({ row, originalIndex }))
                    .filter(item => {
                        const rowText = Object.values(item.row.cells).map(c => c.displayValue).join(' ').toLowerCase();
                        return rowText.includes(q);
                    });
            } else {
                filteredRows = tableView.rows.map((row, originalIndex) => ({ row, originalIndex }));
            }

            const totalFilteredRows = filteredRows.length;
            const totalPages = Math.max(1, Math.ceil(totalFilteredRows / PAGE_SIZE));
            if (currentPage > totalPages) {
                currentPage = totalPages;
            }
            if (currentPage < 1) {
                currentPage = 1;
            }

            const startIndex = (currentPage - 1) * PAGE_SIZE;
            const endIndex = Math.min(startIndex + PAGE_SIZE, totalFilteredRows);
            const pageRows = filteredRows.slice(startIndex, endIndex);

            if (totalFilteredRows === 0) {
                tbody = `
                <tr>
                    <td colspan="${tableView.columns.length + 2}" class="empty-placeholder">
                        データがありません
                    </td>
                </tr>`;
            } else {
                pageRows.forEach(item => {
                    const row = item.row;
                    const rowIdx = item.originalIndex;

                    tbody += `<tr class="table-row-item" draggable="true" data-row-index="${rowIdx}" data-row-path="${escapeHtml(row.path)}">`;
                    tbody += `<td class="col-index drag-handle row-header" data-row-index="${rowIdx}" data-row-path="${escapeHtml(row.path)}" title="クリックで行を選択 / ドラッグして移動 / 右クリックで削除">${rowIdx + 1}</td>`;

                    for (const col of tableView.columns) {
                        const w = widths[col.key];
                        const widthStyle = w ? `width: ${w}px; min-width: ${w}px; max-width: ${w}px;` : '';
                        const cell = row.cells[col.key];
                        const val = cell ? cell.displayValue : '';
                        const cellPath = cell ? cell.path : `${row.path}.${col.key}`;
                        const cellType = cell ? cell.type : 'null';

                        if (col.type === 'array' || cellType === 'array') {
                            tbody += `
                            <td class="col-val col-val-array" style="${widthStyle}" data-path="${escapeHtml(cellPath)}" data-col-key="${escapeHtml(col.key)}" data-row-index="${rowIdx}">
                                <button class="btn-edit-array edit-sub-array-btn" data-array-path="${escapeHtml(cellPath)}" title="編集する">
                                    編集する
                                </button>
                            </td>`;
                        } else {
                            tbody += `
                            <td class="col-val" style="${widthStyle}" contenteditable="true" data-path="${escapeHtml(cellPath)}" data-col-key="${escapeHtml(col.key)}" data-row-index="${rowIdx}" data-type="${cellType}">${escapeHtml(val)}</td>
                            `;
                        }
                    }

                    tbody += `
                        <td class="col-add-cell"></td>
                    </tr>`;
                });
            }

            let paginationHtml = '';
            if (totalFilteredRows > PAGE_SIZE) {
                paginationHtml = `
                <div class="pagination-container" id="tablePagination">
                    <div class="pagination-info">
                        <span><strong>${currentPage}</strong> / ${totalPages} ページ</span>
                        <span style="color: var(--vscode-descriptionForeground);">
                            (全 ${totalFilteredRows.toLocaleString()} 件中 ${(startIndex + 1).toLocaleString()} - ${endIndex.toLocaleString()} 件を表示)
                        </span>
                    </div>
                    <div class="pagination-controls">
                        <button class="pagination-btn" id="pageFirstBtn" title="最初のページへ" ${currentPage === 1 ? 'disabled' : ''}>«</button>
                        <button class="pagination-btn" id="pagePrevBtn" title="前のページへ" ${currentPage === 1 ? 'disabled' : ''}>‹ 前へ</button>
                        <button class="pagination-btn" id="pageNextBtn" title="次のページへ" ${currentPage === totalPages ? 'disabled' : ''}>次へ ›</button>
                        <button class="pagination-btn" id="pageLastBtn" title="最後のページへ" ${currentPage === totalPages ? 'disabled' : ''}>»</button>
                        <div class="pagination-page-jump">
                            <span>移動:</span>
                            <input type="number" min="1" max="${totalPages}" class="pagination-input" id="pageJumpInput" value="${currentPage}" />
                            <button class="pagination-btn" id="pageJumpBtn">Go</button>
                        </div>
                    </div>
                </div>`;
            }

            return `
            <div class="table-container" id="tableContainer">
                <table id="spreadsheetTable">
                    <thead>${thead}</thead>
                    <tbody>${tbody}</tbody>
                </table>
                ${paginationHtml}
                <div class="add-row-bottom">
                    <button class="btn-add-plus" id="addTableRowBtn" title="行を追加">＋</button>
                </div>
            </div>
            `;
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
                    valCellHtml = `
                    <td class="col-val col-val-array">
                        <button class="btn-edit-array edit-array-btn" data-array-path="${safePath}" title="編集する">
                            編集する
                        </button>
                    </td>`;
                } else if (isObjectRow && !row.isLeaf) {
                    valCellHtml = '<td class="col-val col-val-object"></td>';
                } else {
                    valCellHtml = `
                    <td class="col-val" contenteditable="true" data-path="${safePath}" data-type="${row.type}">${safeDisplayValue}</td>
                    `;
                }

                tbody += `
                <tr data-id="${escapeHtml(row.id)}" data-path="${safePath}">
                    <td class="col-path" style="padding-left: ${indentPx + 10}px;">
                        <span class="path-connector">${row.depth > 1 ? '└─ ' : ''}</span>
                        <span class="path-text" contenteditable="true" spellcheck="false" data-path="${safePath}" data-old-key="${safeKey}" title="クリックしてキー名を編集 / 右クリックでキーを削除">${safeKey}</span>
                        <span class="col-type-tag col-type-${typeClass}">${typeSym}</span>
                    </td>
                    ${valCellHtml}
                </tr>`;
            });

            return `
            <div class="table-container">
                <table id="gridTable">
                    <thead>
                        <tr>
                            <th>パス / キー</th>
                            <th>値</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tbody}
                    </tbody>
                </table>
                <div class="add-row-bottom">
                    <button class="btn-add-plus" id="addKvRowBtn" title="項目を追加">＋</button>
                </div>
            </div>
            `;
        }

        function attachEventListeners() {
            let isResizing = false;

            // Column Visibility Button & Dropdown
            const colVisibilityBtn = document.getElementById('colVisibilityBtn');
            const colVisibilityDropdown = document.getElementById('colVisibilityDropdown');
            if (colVisibilityBtn && colVisibilityDropdown) {
                colVisibilityBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isVisible = colVisibilityDropdown.style.display !== 'none';
                    colVisibilityDropdown.style.display = isVisible ? 'none' : 'block';
                });

                document.addEventListener('click', (e) => {
                    if (!e.target.closest('#colVisibilityDropdown') && !e.target.closest('#colVisibilityBtn')) {
                        if (colVisibilityDropdown) {
                            colVisibilityDropdown.style.display = 'none';
                        }
                    }
                });
            }

            document.querySelectorAll('.col-vis-checkbox').forEach(cb => {
                cb.addEventListener('change', (e) => {
                    const colKey = cb.getAttribute('data-col-key');
                    const isChecked = cb.checked;
                    const pathKey = activeArrayPath || '__root__';
                    hiddenCols[pathKey] = hiddenCols[pathKey] || [];

                    if (!isChecked) {
                        if (!hiddenCols[pathKey].includes(colKey)) {
                            hiddenCols[pathKey].push(colKey);
                        }
                    } else {
                        hiddenCols[pathKey] = hiddenCols[pathKey].filter(k => k !== colKey);
                    }
                    saveCustomOrderState();

                    const newDropdown = document.getElementById('colVisibilityDropdown');
                    if (newDropdown) {
                        newDropdown.style.display = 'block';
                    }
                });
            });

            const showAllColsBtn = document.getElementById('showAllColsBtn');
            if (showAllColsBtn) {
                showAllColsBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const pathKey = activeArrayPath || '__root__';
                    hiddenCols[pathKey] = [];
                    saveCustomOrderState();

                    showToastMessage('すべての列を再表示しました');
                });
            }

            // Column Sort Buttons
            document.querySelectorAll('.col-sort-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const colKey = btn.getAttribute('data-col-key');
                    const pathKey = activeArrayPath || '__root__';
                    const cur = sortState[pathKey];
                    if (cur && cur.colKey === colKey) {
                        if (cur.direction === 'asc') {
                            sortState[pathKey] = { colKey, direction: 'desc' };
                        } else {
                            delete sortState[pathKey];
                        }
                    } else {
                        sortState[pathKey] = { colKey, direction: 'asc' };
                    }
                    currentPage = 1;
                    saveCustomOrderState();

                });
            });

            // Column Resizer
            document.querySelectorAll('.col-resizer').forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    isResizing = true;

                    const colKey = resizer.getAttribute('data-col-key');
                    const th = resizer.closest('th');
                    const startX = e.clientX;
                    const startWidth = th.offsetWidth;
                    const pathKey = activeArrayPath || '__root__';

                    resizer.classList.add('is-resizing');
                    document.body.style.cursor = 'col-resize';
                    document.body.style.userSelect = 'none';

                    let finalWidth = startWidth;

                    const onMouseMove = (moveEvent) => {
                        const diff = moveEvent.clientX - startX;
                        finalWidth = Math.max(60, startWidth + diff);
                        th.style.width = finalWidth + 'px';
                        th.style.minWidth = finalWidth + 'px';
                        th.style.maxWidth = finalWidth + 'px';
                        document.querySelectorAll('td.col-val[data-col-key="' + colKey + '"]').forEach(td => {
                            td.style.width = finalWidth + 'px';
                            td.style.minWidth = finalWidth + 'px';
                            td.style.maxWidth = finalWidth + 'px';
                        });
                    };

                    const onMouseUp = () => {
                        isResizing = false;
                        resizer.classList.remove('is-resizing');
                        document.body.style.cursor = '';
                        document.body.style.userSelect = '';
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);

                        customColWidths[pathKey] = customColWidths[pathKey] || {};
                        customColWidths[pathKey][colKey] = finalWidth;
                        saveCustomOrderState();
                    };

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                });

                resizer.addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const colKey = resizer.getAttribute('data-col-key');
                    const pathKey = activeArrayPath || '__root__';
                    if (customColWidths[pathKey] && customColWidths[pathKey][colKey]) {
                        delete customColWidths[pathKey][colKey];
                        saveCustomOrderState();

                    }
                });
            });

            // Search Input
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    searchQuery = e.target.value;
                    currentPage = 1;
                    saveCustomOrderState();

                    const newSearch = document.getElementById('searchInput');
                    if (newSearch) {
                        newSearch.focus();
                        newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
                    }
                });
            }

            function selectCellContents(el) {
                if (!el) return;
                try {
                    const range = document.createRange();
                    range.selectNodeContents(el);
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                } catch (err) {
                    // ignore
                }
            }

            function isAllSelected(el) {
                const sel = window.getSelection();
                if (!sel || sel.rangeCount === 0) return false;
                const text = el.innerText || '';
                if (text.length === 0) return true;
                const selText = sel.toString();
                return selText === text || selText.length >= text.length;
            }

            function navigateToAdjacentCell(currentCell, direction) {
                if (!currentCell) return;
                const currentRow = currentCell.closest('tr');
                if (!currentRow) return;

                const colKey = currentCell.getAttribute('data-col-key');
                let targetCell = null;

                if (currentMode === 'table') {
                    if (direction === 'down') {
                        const nextRow = currentRow.nextElementSibling;
                        if (nextRow && nextRow.classList.contains('table-row-item')) {
                            targetCell = Array.from(nextRow.querySelectorAll('td.col-val')).find(td => td.getAttribute('data-col-key') === colKey) || nextRow.querySelector('td.col-val');
                        }
                    } else if (direction === 'up') {
                        const prevRow = currentRow.previousElementSibling;
                        if (prevRow && prevRow.classList.contains('table-row-item')) {
                            targetCell = Array.from(prevRow.querySelectorAll('td.col-val')).find(td => td.getAttribute('data-col-key') === colKey) || prevRow.querySelector('td.col-val');
                        }
                    } else if (direction === 'right') {
                        const cells = Array.from(currentRow.querySelectorAll('td.col-val[contenteditable="true"]'));
                        const cIdx = cells.indexOf(currentCell);
                        if (cIdx >= 0 && cIdx + 1 < cells.length) {
                            targetCell = cells[cIdx + 1];
                        } else {
                            const nextRow = currentRow.nextElementSibling;
                            if (nextRow && nextRow.classList.contains('table-row-item')) {
                                targetCell = nextRow.querySelector('td.col-val[contenteditable="true"]');
                            }
                        }
                    } else if (direction === 'left') {
                        const cells = Array.from(currentRow.querySelectorAll('td.col-val[contenteditable="true"]'));
                        const cIdx = cells.indexOf(currentCell);
                        if (cIdx > 0) {
                            targetCell = cells[cIdx - 1];
                        } else {
                            const prevRow = currentRow.previousElementSibling;
                            if (prevRow && prevRow.classList.contains('table-row-item')) {
                                const prevCells = Array.from(prevRow.querySelectorAll('td.col-val[contenteditable="true"]'));
                                if (prevCells.length > 0) {
                                    targetCell = prevCells[prevCells.length - 1];
                                }
                            }
                        }
                    }
                } else {
                    // KV mode
                    if (direction === 'down' || direction === 'right') {
                        const nextRow = currentRow.nextElementSibling;
                        if (nextRow) {
                            targetCell = nextRow.querySelector('td.col-val[contenteditable="true"]');
                        }
                    } else if (direction === 'up' || direction === 'left') {
                        const prevRow = currentRow.previousElementSibling;
                        if (prevRow) {
                            targetCell = prevRow.querySelector('td.col-val[contenteditable="true"]');
                        }
                    }
                }

                if (targetCell) {
                    currentCell.blur();
                    const targetPath = targetCell.getAttribute('data-path');
                    const targetColKey = targetCell.getAttribute('data-col-key');
                    const targetRowIndex = parseInt(targetCell.getAttribute('data-row-index'), 10);

                    targetCell.focus();
                    selectCellContents(targetCell);

                    currentSelection = {
                        type: 'cell',
                        path: targetPath,
                        colKey: targetColKey,
                        rowIndex: targetRowIndex
                    };
                    updateSelectionVisuals();

                    const st = vscode.getState() || {};
                    vscode.setState({
                        ...st,
                        pendingFocus: {
                            path: targetPath,
                            colKey: targetColKey,
                            rowIndex: targetRowIndex
                        }
                    });
                } else {
                    currentCell.blur();
                }
            }

            // Cell Editing (only editable cells)
            document.querySelectorAll('.col-val[contenteditable="true"]').forEach(cell => {
                cell.addEventListener('keydown', (e) => {
                    const isCmdOrCtrl = e.ctrlKey || e.metaKey;

                    // Ctrl + A / Cmd + A: セル内テキストを全選択
                    if (isCmdOrCtrl && (e.key === 'a' || e.key === 'A')) {
                        e.preventDefault();
                        e.stopPropagation();
                        selectCellContents(cell);
                        return;
                    }

                    // Alt + Enter または Ctrl + Enter: セル内改行
                    if ((e.altKey || (e.ctrlKey && !e.metaKey)) && (e.key === 'Enter' || e.code === 'NumpadEnter')) {
                        e.preventDefault();
                        document.execCommand('insertLineBreak');
                        return;
                    }

                    // Enter / NumpadEnter: 値を確定して下（またはShift+Enterで上）へフォーカス移動
                    if (e.key === 'Enter' || e.code === 'NumpadEnter') {
                        e.preventDefault();
                        if (e.shiftKey) {
                            navigateToAdjacentCell(cell, 'up');
                        } else {
                            navigateToAdjacentCell(cell, 'down');
                        }
                        return;
                    }

                    // Tab: 右（またはShift+Tabで左）へフォーカス移動（元のセルはフォーカス解除）
                    if (e.key === 'Tab') {
                        e.preventDefault();
                        if (e.shiftKey) {
                            navigateToAdjacentCell(cell, 'left');
                        } else {
                            navigateToAdjacentCell(cell, 'right');
                        }
                        return;
                    }

                    // テンキーおよび矢印キーによるセル間移動
                    const hasNewline = (cell.innerText || '').indexOf(String.fromCharCode(10)) !== -1;
                    if (e.key === 'ArrowUp' || e.code === 'Numpad8') {
                        if (isAllSelected(cell) || !hasNewline) {
                            e.preventDefault();
                            navigateToAdjacentCell(cell, 'up');
                        }
                    } else if (e.key === 'ArrowDown' || e.code === 'Numpad2') {
                        if (isAllSelected(cell) || !hasNewline) {
                            e.preventDefault();
                            navigateToAdjacentCell(cell, 'down');
                        }
                    } else if (e.key === 'ArrowLeft' || e.code === 'Numpad4') {
                        if (isAllSelected(cell)) {
                            e.preventDefault();
                            navigateToAdjacentCell(cell, 'left');
                        }
                    } else if (e.key === 'ArrowRight' || e.code === 'Numpad6') {
                        if (isAllSelected(cell)) {
                            e.preventDefault();
                            navigateToAdjacentCell(cell, 'right');
                        }
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
                    if (confirm(`項目 "${path}" を削除しますか？`)) {
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
                    currentPage = 1;
                    saveCustomOrderState();

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
                    currentPage = 1;
                    saveCustomOrderState();

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
                    currentPage = 1;
                    saveCustomOrderState();

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

            // Pagination Event Listeners
            const pageFirstBtn = document.getElementById('pageFirstBtn');
            if (pageFirstBtn) {
                pageFirstBtn.addEventListener('click', () => {
                    currentPage = 1;
                    saveCustomOrderState();

                    const c = document.getElementById('tableContainer');
                    if (c) c.scrollTop = 0;
                });
            }

            const pagePrevBtn = document.getElementById('pagePrevBtn');
            if (pagePrevBtn) {
                pagePrevBtn.addEventListener('click', () => {
                    if (currentPage > 1) {
                        currentPage--;
                        saveCustomOrderState();

                        const c = document.getElementById('tableContainer');
                        if (c) c.scrollTop = 0;
                    }
                });
            }

            const pageNextBtn = document.getElementById('pageNextBtn');
            if (pageNextBtn) {
                pageNextBtn.addEventListener('click', () => {
                    currentPage++;
                    saveCustomOrderState();

                    const c = document.getElementById('tableContainer');
                    if (c) c.scrollTop = 0;
                });
            }

            const pageLastBtn = document.getElementById('pageLastBtn');
            if (pageLastBtn) {
                pageLastBtn.addEventListener('click', () => {
                    currentPage = 999999999;
                    saveCustomOrderState();

                    const c = document.getElementById('tableContainer');
                    if (c) c.scrollTop = 0;
                });
            }

            const pageJumpBtn = document.getElementById('pageJumpBtn');
            const pageJumpInput = document.getElementById('pageJumpInput');
            const handlePageJump = () => {
                if (!pageJumpInput) return;
                const val = parseInt(pageJumpInput.value, 10);
                if (!isNaN(val) && val >= 1) {
                    currentPage = val;
                    saveCustomOrderState();

                    const c = document.getElementById('tableContainer');
                    if (c) c.scrollTop = 0;
                }
            };
            if (pageJumpBtn) {
                pageJumpBtn.addEventListener('click', handlePageJump);
            }
            if (pageJumpInput) {
                pageJumpInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handlePageJump();
                    }
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
                        baseKey = `newKey${counter}`;
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

                    const pathKey = activeArrayPath || '__root__';
                    const hidden = hiddenCols[pathKey] || [];
                    const curSort = sortState[pathKey];

                    const cornerItems = [
                        { label: 'すべてコピー (TSV)', action: () => copySelection(true) },
                        { label: 'すべて切り取り', action: () => cutSelection() }
                    ];

                    if (curSort) {
                        cornerItems.push({
                            label: 'ソートを解除',
                            action: () => {
                                delete sortState[pathKey];
                                saveCustomOrderState();

                            }
                        });
                    }

                    if (hidden.length > 0) {
                        cornerItems.push({
                            label: 'すべての非表示列を再表示 (' + hidden.length + '列)',
                            action: () => {
                                hiddenCols[pathKey] = [];
                                saveCustomOrderState();

                                showToastMessage('すべての列を再表示しました');
                            }
                        });
                    }

                    cornerItems.push(
                        { isSeparator: true },
                        { label: '全データをクリア', danger: true, action: () => deleteSelection() }
                    );

                    showContextMenu(e, cornerItems);
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
                    if (e.target.classList.contains('col-header-label') || e.target.closest('.col-resizer') || e.target.closest('.col-sort-btn')) {
                        return; // allow inline label editing, resizing, or sorting
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

                    const pathKey = activeArrayPath || '__root__';
                    const curSort = sortState[pathKey];
                    const isSortedThis = curSort && curSort.colKey === colKey;
                    const widths = customColWidths[pathKey] || {};
                    const hasCustomWidth = !!widths[colKey];
                    const hidden = hiddenCols[pathKey] || [];

                    const menuItems = [
                        { label: '列をコピー (TSV)', action: () => copySelection(true) },
                        { label: '列を切り取り', action: () => cutSelection() },
                        { isSeparator: true },
                        {
                            label: '昇順でソート (A→Z / 0→9)',
                            action: () => {
                                sortState[pathKey] = { colKey, direction: 'asc' };
                                currentPage = 1;
                                saveCustomOrderState();

                            }
                        },
                        {
                            label: '降順でソート (Z→A / 9→0)',
                            action: () => {
                                sortState[pathKey] = { colKey, direction: 'desc' };
                                currentPage = 1;
                                saveCustomOrderState();

                            }
                        }
                    ];

                    if (isSortedThis) {
                        menuItems.push({
                            label: 'ソートを解除',
                            action: () => {
                                delete sortState[pathKey];
                                saveCustomOrderState();

                            }
                        });
                    }

                    menuItems.push({ isSeparator: true });

                    if (hasCustomWidth) {
                        menuItems.push({
                            label: '列の幅をリセット',
                            action: () => {
                                delete customColWidths[pathKey][colKey];
                                saveCustomOrderState();

                            }
                        });
                    }

                    menuItems.push({
                        label: 'この列を非表示',
                        action: () => {
                            hiddenCols[pathKey] = hiddenCols[pathKey] || [];
                            if (!hiddenCols[pathKey].includes(colKey)) {
                                hiddenCols[pathKey].push(colKey);
                            }
                            if (currentSelection.type === 'col' && currentSelection.colKey === colKey) {
                                currentSelection = { type: 'none' };
                            }
                            saveCustomOrderState();

                            showToastMessage('列 "' + colKey + '" を非表示にしました');
                        }
                    });

                    if (hidden.length > 0) {
                        menuItems.push({
                            label: 'すべての非表示列を再表示 (' + hidden.length + '列)',
                            action: () => {
                                hiddenCols[pathKey] = [];
                                saveCustomOrderState();

                                showToastMessage('すべての列を再表示しました');
                            }
                        });
                    }

                    menuItems.push(
                        { isSeparator: true },
                        { label: '列の値をクリア', danger: true, action: () => deleteSelection() }
                    );

                    showContextMenu(e, menuItems);
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

            // Global Keyboard Shortcuts (Ctrl+C, Ctrl+X, Delete/Backspace, Ctrl+A, Escape, Arrow/Numpad Navigation)
            document.addEventListener('keydown', (e) => {
                const isCellTyping = document.activeElement && document.activeElement.classList.contains('col-val') && document.activeElement.getAttribute('contenteditable') === 'true';
                const isEditing = document.activeElement && (
                    document.activeElement.tagName === 'INPUT' ||
                    (document.activeElement.getAttribute('contenteditable') === 'true' && (
                        document.activeElement.classList.contains('col-header-label') ||
                        document.activeElement.classList.contains('path-text') ||
                        document.activeElement.classList.contains('col-val')
                    ))
                );
                if (isEditing) return;

                // セル選択中（未編集状態）での矢印キー・テンキー移動
                if (currentSelection.type === 'cell' && !isCellTyping) {
                    const currentElem = Array.from(document.querySelectorAll('td.col-val')).find(td => td.getAttribute('data-path') === currentSelection.path);
                    if (currentElem) {
                        if (e.key === 'ArrowDown' || e.code === 'Numpad2' || e.key === 'Enter' || e.code === 'NumpadEnter') {
                            e.preventDefault();
                            if (e.shiftKey && (e.key === 'Enter' || e.code === 'NumpadEnter')) {
                                navigateToAdjacentCell(currentElem, 'up');
                            } else {
                                navigateToAdjacentCell(currentElem, 'down');
                            }
                            return;
                        } else if (e.key === 'ArrowUp' || e.code === 'Numpad8') {
                            e.preventDefault();
                            navigateToAdjacentCell(currentElem, 'up');
                            return;
                        } else if (e.key === 'ArrowRight' || e.code === 'Numpad6' || (e.key === 'Tab' && !e.shiftKey)) {
                            e.preventDefault();
                            navigateToAdjacentCell(currentElem, 'right');
                            return;
                        } else if (e.key === 'ArrowLeft' || e.code === 'Numpad4' || (e.key === 'Tab' && e.shiftKey)) {
                            e.preventDefault();
                            navigateToAdjacentCell(currentElem, 'left');
                            return;
                        }
                    }
                }

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
                    if (currentSelection.type !== 'none') {
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

                    }
                    draggedRowIndex = null;
                });
            });

            // Column Drag & Drop (見た目のみの並び替え: JSON/YAML の順序は変更しない)
            let draggedColIndex = null;
            document.querySelectorAll('th.col-header-cell').forEach(th => {
                th.addEventListener('dragstart', (e) => {
                    if (isResizing) {
                        e.preventDefault();
                        return;
                    }
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

                    }
                    draggedColIndex = null;
                });
            });

            // Restore pending focus (e.g. after Enter, Tab, Arrow key navigation)
            const st = vscode.getState() || {};
            if (st.pendingFocus) {
                const pf = st.pendingFocus;
                let target = null;
                if (pf.path) {
                    target = Array.from(document.querySelectorAll('td.col-val')).find(td => td.getAttribute('data-path') === pf.path);
                }
                if (!target && pf.colKey && pf.rowIndex !== undefined) {
                    target = Array.from(document.querySelectorAll('td.col-val')).find(td => td.getAttribute('data-col-key') === pf.colKey && td.getAttribute('data-row-index') === String(pf.rowIndex));
                }
                if (target) {
                    target.focus();
                    selectCellContents(target);
                    currentSelection = {
                        type: 'cell',
                        path: target.getAttribute('data-path'),
                        colKey: target.getAttribute('data-col-key'),
                        rowIndex: parseInt(target.getAttribute('data-row-index'), 10)
                    };
                    updateSelectionVisuals();
                }
                vscode.setState({ ...st, pendingFocus: undefined });
            }
        }

        // Initialize Render

export function initOriginalLogic(vscodeApi, initData) {
    vscode = vscodeApi;
    window.vscode = vscodeApi;
    initialData = initData;

    // Call renderApp directly
    if (typeof renderApp === 'function') { setTimeout(() => { renderApp(); }, 0); }
}
