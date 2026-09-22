import { IDocumentParser } from '../../domain/port/IDocumentParser';
import { TableView } from '../../domain/model/TableView';
import { CellPath } from '../../domain/model/CellPath';
import { StructuredDocument } from '../../domain/model/StructuredDocument';
import { GridDataDto, GridRowDto, TableViewDto, TableCellDto, SubArrayInfoDto } from '../dto/GridData';

/**
 * ソーステキストを解析し、Webview描画用のデータ構造（DTO）に変換するユースケース。
 */
export class ParseDocumentUseCase {
    constructor(private readonly parsers: IDocumentParser[]) {}

    /**
     * ソーステキストとファイル拡張子からドキュメントを解析し、GridDataDto を生成します。
     * @param text ソーステキスト文字列
     * @param fileExtension ファイル拡張子（例: "json", "yaml"）
     * @returns 生成された DTO と内部のドキュメントインスタンス
     */
    public execute(text: string, fileExtension: string): { dto: GridDataDto; doc?: StructuredDocument } {
        const parser = this.parsers.find(p => p.supports(fileExtension));
        if (!parser) {
            const cleanExt = fileExtension.toLowerCase().replace(/^\./, '');
            const docType = cleanExt.includes('ya') ? 'yaml' : (cleanExt === 'jsonl' || cleanExt === 'ndjson' ? 'jsonl' : 'json');
            return {
                dto: {
                    documentType: docType,
                    viewMode: 'kv',
                    rows: [],
                    totalRows: 0,
                    error: `サポートされていないファイル拡張子です: .${fileExtension}`,
                },
            };
        }

        try {
            const document = parser.parse(text);
            const isRootArray = document.isArrayRoot();

            let tableData: TableViewDto | undefined;
            if (isRootArray) {
                const rootTableView = document.toTableView();
                if (rootTableView) {
                    tableData = this.toTableViewDto(rootTableView);
                }
            }

            // ドリルダウン表示をサポートするため、ドキュメント内の全サブ配列を探索
            const subArraysInfo: SubArrayInfoDto[] = [];
            const subArrays = document.findSubArrays();
            for (const sub of subArrays) {
                const tv = document.toTableView(CellPath.fromString(sub.path));
                if (tv) {
                    subArraysInfo.push({
                        path: sub.path,
                        label: sub.label,
                        length: sub.length,
                        isObjectArray: sub.isObjectArray,
                        tableData: this.toTableViewDto(tv),
                    });
                }
            }

            // 中間ノードも含めて平坦化（KV表示時にオブジェクトノードをツリー行として表示）
            const flatRows = document.toFlatRows({
                includeIntermediateNodes: true,
                collapseArrays: true,
            });
            const rows: GridRowDto[] = flatRows.map(row => {
                const isArrayRow = row.value.type === 'array' || row.nodeType === 'array';
                const isObjectRow = row.nodeType === 'object';

                return {
                    id: row.id,
                    path: row.displayPath,
                    key: String(row.key),
                    value: row.value.value,
                    displayValue: row.value.toDisplayString(),
                    type: isArrayRow ? 'array' : (isObjectRow ? 'object' : row.value.type),
                    depth: row.depth,
                    isLeaf: row.isLeaf,
                    isArray: isArrayRow,
                    subArrayPath: isArrayRow ? row.displayPath : undefined,
                };
            });

            return {
                dto: {
                    documentType: document.format.fileType,
                    viewMode: isRootArray ? 'table' : 'kv',
                    rows,
                    totalRows: isRootArray && tableData ? tableData.totalRows : rows.length,
                    tableData,
                    subArrays: subArraysInfo,
                },
                doc: document,
            };
        } catch (e: any) {
            const cleanExt = fileExtension.toLowerCase().replace(/^\./, '');
            const docType = cleanExt.includes('ya') ? 'yaml' : (cleanExt === 'jsonl' || cleanExt === 'ndjson' ? 'jsonl' : 'json');
            return {
                dto: {
                    documentType: docType,
                    viewMode: 'kv',
                    rows: [],
                    totalRows: 0,
                    error: e?.message ?? 'ドキュメントの解析に失敗しました',
                },
            };
        }
    }

    private toTableViewDto(tableView: TableView): TableViewDto {
        return {
            path: tableView.path.toString(),
            columns: tableView.columns.map(c => ({
                key: c.key,
                label: c.label,
                type: c.type,
                typeSymbol: c.typeSymbol,
            })),
            rows: tableView.rows.map(r => {
                const cells: Record<string, TableCellDto> = {};
                for (const col of tableView.columns) {
                    const cell = r.cells[col.key];
                    if (cell) {
                        cells[col.key] = {
                            path: cell.path.toString(),
                            value: cell.value.value,
                            displayValue: cell.value.toDisplayString(),
                            type: cell.value.type,
                        };
                    }
                }
                return {
                    index: r.index,
                    path: r.path.toString(),
                    cells,
                };
            }),
            totalRows: tableView.totalRows,
            totalColumns: tableView.totalColumns,
            isObjectArray: tableView.isObjectArray,
        };
    }
}
