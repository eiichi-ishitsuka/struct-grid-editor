import { IDocumentParser } from '../../domain/port/IDocumentParser';
import { CellPath } from '../../domain/model/CellPath';
import { CellValue } from '../../domain/model/CellValue';

/**
 * オブジェクトまたは配列の指定親パス下に新規ノード（行／要素）を追加するユースケース。
 */
export class AddRowUseCase {
    constructor(private readonly parsers: IDocumentParser[]) {}

    /**
     * 新規行の追加を実行します。
     * @param text 元のファイルテキスト
     * @param fileExtension ファイル拡張子
     * @param parentPathStr 追加先親ノードのパス文字列
     * @param key 新しいキー名
     * @param initialVal 初期値
     * @returns 更新・シリアライズされたテキスト
     */
    public execute(text: string, fileExtension: string, parentPathStr: string = '', key: string = 'newKey', initialVal: any = ''): string {
        const parser = this.parsers.find(p => p.supports(fileExtension));
        if (!parser) {
            throw new Error(`サポートされていないファイル拡張子です: .${fileExtension}`);
        }

        const document = parser.parse(text);
        const parentPath = CellPath.fromString(parentPathStr);
        const cellValue = new CellValue(initialVal);

        const updatedDoc = document.addNode(parentPath, key, cellValue);
        return parser.serialize(updatedDoc);
    }
}

/**
 * テーブルビュー（配列）に新しいデータ行を追加するユースケース。
 */
export class AddTableRowUseCase {
    constructor(private readonly parsers: IDocumentParser[]) {}

    /**
     * テーブル行の追加を実行します。
     * @param text 元のファイルテキスト
     * @param fileExtension ファイル拡張子
     * @param arrayPathStr 対象配列のパス文字列
     * @param newRowData 追加する行データ（省略時は自動推論）
     * @returns 更新・シリアライズされたテキスト
     */
    public execute(text: string, fileExtension: string, arrayPathStr: string = '', newRowData?: any): string {
        const parser = this.parsers.find(p => p.supports(fileExtension));
        if (!parser) {
            throw new Error(`サポートされていないファイル拡張子です: .${fileExtension}`);
        }

        const document = parser.parse(text);
        const arrayPath = CellPath.fromString(arrayPathStr);

        const updatedDoc = document.addTableRow(arrayPath, newRowData);
        return parser.serialize(updatedDoc);
    }
}

/**
 * テーブルビュー（オブジェクト配列）に新しいカラム（プロパティ）を追加するユースケース。
 */
export class AddTableColumnUseCase {
    constructor(private readonly parsers: IDocumentParser[]) {}

    /**
     * テーブルカラムの追加を実行します。
     * @param text 元のファイルテキスト
     * @param fileExtension ファイル拡張子
     * @param arrayPathStr 対象配列のパス文字列
     * @param columnKey 追加するカラムキー名
     * @returns 更新・シリアライズされたテキスト
     */
    public execute(text: string, fileExtension: string, arrayPathStr: string = '', columnKey: string = 'newColumn'): string {
        const parser = this.parsers.find(p => p.supports(fileExtension));
        if (!parser) {
            throw new Error(`サポートされていないファイル拡張子です: .${fileExtension}`);
        }

        const document = parser.parse(text);
        const arrayPath = CellPath.fromString(arrayPathStr);

        const updatedDoc = document.addTableColumn(arrayPath, columnKey);
        return parser.serialize(updatedDoc);
    }
}

/**
 * 指定されたパスのノード（行／要素）を削除するユースケース。
 */
export class DeleteRowUseCase {
    constructor(private readonly parsers: IDocumentParser[]) {}

    /**
     * 行の削除を実行します。
     * @param text 元のファイルテキスト
     * @param fileExtension ファイル拡張子
     * @param pathStr 削除対象ノードのパス文字列
     * @returns 更新・シリアライズされたテキスト
     */
    public execute(text: string, fileExtension: string, pathStr: string): string {
        const parser = this.parsers.find(p => p.supports(fileExtension));
        if (!parser) {
            throw new Error(`サポートされていないファイル拡張子です: .${fileExtension}`);
        }

        const document = parser.parse(text);
        const path = CellPath.fromString(pathStr);

        const updatedDoc = document.deleteNode(path);
        return parser.serialize(updatedDoc);
    }
}

/**
 * テーブルビューのカラム名を変更するユースケース。
 */
export class RenameTableColumnUseCase {
    constructor(private readonly parsers: IDocumentParser[]) {}

    /**
     * カラム名の変更を実行します。
     * @param text 元のファイルテキスト
     * @param fileExtension ファイル拡張子
     * @param arrayPathStr 対象配列のパス文字列
     * @param oldKey 変更元のカラム名
     * @param newKey 変更後の新しいカラム名
     * @returns 更新・シリアライズされたテキスト
     */
    public execute(
        text: string,
        fileExtension: string,
        arrayPathStr: string,
        oldKey: string,
        newKey: string
    ): string {
        const parser = this.parsers.find(p => p.supports(fileExtension));
        if (!parser) {
            throw new Error(`サポートされていないファイル拡張子です: .${fileExtension}`);
        }

        const document = parser.parse(text);
        const arrayPath = CellPath.fromString(arrayPathStr);

        const updatedDoc = document.renameTableColumn(arrayPath, oldKey, newKey);
        return parser.serialize(updatedDoc);
    }
}

/**
 * オブジェクト内のプロパティキー名を変更するユースケース。
 */
export class RenameKeyUseCase {
    constructor(private readonly parsers: IDocumentParser[]) {}

    /**
     * キー名の変更を実行します。
     * @param text 元のファイルテキスト
     * @param fileExtension ファイル拡張子
     * @param pathStr 対象ノードのパス文字列
     * @param newKey 新しいキー名
     * @returns 更新・シリアライズされたテキスト
     */
    public execute(
        text: string,
        fileExtension: string,
        pathStr: string,
        newKey: string
    ): string {
        const parser = this.parsers.find(p => p.supports(fileExtension));
        if (!parser) {
            throw new Error(`サポートされていないファイル拡張子です: .${fileExtension}`);
        }

        const document = parser.parse(text);
        const path = CellPath.fromString(pathStr);

        const updatedDoc = document.renameNodeKey(path, newKey);
        return parser.serialize(updatedDoc);
    }
}

/**
 * テーブルビュー内の行を並び替えるユースケース。
 */
export class MoveTableRowUseCase {
    constructor(private readonly parsers: IDocumentParser[]) {}

    /**
     * 行の並び替えを実行します。
     * @param text 元のファイルテキスト
     * @param fileExtension ファイル拡張子
     * @param arrayPathStr 対象配列のパス文字列
     * @param fromIndex 移動元インデックス
     * @param toIndex 移動先インデックス
     * @returns 更新・シリアライズされたテキスト
     */
    public execute(
        text: string,
        fileExtension: string,
        arrayPathStr: string,
        fromIndex: number,
        toIndex: number
    ): string {
        const parser = this.parsers.find(p => p.supports(fileExtension));
        if (!parser) {
            throw new Error(`サポートされていないファイル拡張子です: .${fileExtension}`);
        }

        const document = parser.parse(text);
        const arrayPath = CellPath.fromString(arrayPathStr);

        const updatedDoc = document.moveTableRow(arrayPath, fromIndex, toIndex);
        return parser.serialize(updatedDoc);
    }
}

/**
 * テーブルビュー内のカラム順序を並び替えるユースケース。
 */
export class MoveTableColumnUseCase {
    constructor(private readonly parsers: IDocumentParser[]) {}

    /**
     * カラムの並び替えを実行します。
     * @param text 元のファイルテキスト
     * @param fileExtension ファイル拡張子
     * @param arrayPathStr 対象配列のパス文字列
     * @param fromIndex 移動元カラムインデックス
     * @param toIndex 移動先カラムインデックス
     * @returns 更新・シリアライズされたテキスト
     */
    public execute(
        text: string,
        fileExtension: string,
        arrayPathStr: string,
        fromIndex: number,
        toIndex: number
    ): string {
        const parser = this.parsers.find(p => p.supports(fileExtension));
        if (!parser) {
            throw new Error(`サポートされていないファイル拡張子です: .${fileExtension}`);
        }

        const document = parser.parse(text);
        const arrayPath = CellPath.fromString(arrayPathStr);

        const updatedDoc = document.moveTableColumn(arrayPath, fromIndex, toIndex);
        return parser.serialize(updatedDoc);
    }
}
