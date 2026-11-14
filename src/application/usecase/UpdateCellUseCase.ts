import { IDocumentParser, DocumentParseOptions } from '../../domain/port/IDocumentParser';
import { CellPath } from '../../domain/model/CellPath';
import { CellValue } from '../../domain/model/CellValue';

/**
 * 指定されたパスのセル値を更新し、元の書式を保持したままシリアライズされたテキストを生成するユースケース。
 */
export class UpdateCellUseCase {
    constructor(private readonly parsers: IDocumentParser[]) {}

    /**
     * セル値の更新を実行します。
     * @param text 元のファイルテキスト
     * @param fileExtension ファイル拡張子（例: "json", "yaml", "csv", "tsv"）
     * @param pathStr 更新対象セルのアクセスパス文字列
     * @param rawValue ユーザーが入力した新しい値の文字列
     * @param options 解析オプション（CSV/TSV のヘッダー有無等）
     * @returns 更新・シリアライズされたテキスト
     */
    public execute(
        text: string,
        fileExtension: string,
        pathStr: string,
        rawValue: string,
        options?: DocumentParseOptions
    ): string {
        const parser = this.parsers.find(p => p.supports(fileExtension));
        if (!parser) {
            throw new Error(`サポートされていないファイル拡張子です: .${fileExtension}`);
        }

        const document = parser.parse(text, options);
        const path = CellPath.fromString(pathStr);
        const cellValue = CellValue.fromInputString(rawValue);

        const updatedDoc = document.updateCell(path, cellValue);
        return parser.serialize(updatedDoc);
    }
}
