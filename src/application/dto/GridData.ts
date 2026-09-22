/**
 * テーブルビューのカラム情報 DTO。
 */
export interface TableColumnDto {
    /** カラムのキー名 */
    key: string;
    /** カラムの表示名 */
    label: string;
    /** データ型 */
    type?: string;
    /** 型シンボル表示（例: "1234", "Aa", "[ ]" 等） */
    typeSymbol?: string;
}

/**
 * テーブルビューの個別セル DTO。
 */
export interface TableCellDto {
    /** セルの絶対アクセスパス */
    path: string;
    /** セルの生の値 */
    value: any;
    /** UI表示用の整形済み文字列 */
    displayValue: string;
    /** セルのデータ型 */
    type: string;
}

/**
 * テーブルビューの1行データ DTO。
 */
export interface TableRowDto {
    /** 行インデックス */
    index: number;
    /** 行のパス */
    path: string;
    /** カラムキーをキーとするセルデータのマップ */
    cells: Record<string, TableCellDto>;
}

/**
 * テーブルビュー全体のデータ DTO。
 */
export interface TableViewDto {
    /** テーブルの基点となる配列のパス */
    path: string;
    /** カラム定義リスト */
    columns: TableColumnDto[];
    /** 行データリスト */
    rows: TableRowDto[];
    /** 総行数 */
    totalRows: number;
    /** 総カラム数 */
    totalColumns: number;
    /** オブジェクト配列であるか（false の場合はプリミティブ配列） */
    isObjectArray: boolean;
}

/**
 * ドキュメント内に存在するサブ配列情報 DTO。
 */
export interface SubArrayInfoDto {
    /** 配列のアクセスパス */
    path: string;
    /** 配列の表示ラベル */
    label: string;
    /** 配列の要素数 */
    length: number;
    /** オブジェクト配列であるか */
    isObjectArray: boolean;
    /** テーブルデータ（任意） */
    tableData?: TableViewDto;
}

/**
 * スプレッドシート／Key-Value グリッド描画用に Webview へ渡される行データ DTO。
 */
export interface GridRowDto {
    /** 行の一意識別子 */
    id: string;
    /** ノードへのアクセスパス（例: "users[0].name"） */
    path: string;
    /** プロパティ名またはインデックス */
    key: string;
    /** 生の値 */
    value: any;
    /** UI表示用の整形済み文字列 */
    displayValue: string;
    /** データ型 */
    type: string;
    /** 階層の深さ（0起点） */
    depth: number;
    /** 末端の値（リーフ）であるかどうか */
    isLeaf: boolean;
    /** 配列ノードであるかどうか */
    isArray?: boolean;
    /** 配列の場合の要素数 */
    arrayLength?: number;
    /** サブ配列へのドリルダウンパス */
    subArrayPath?: string;
}

/**
 * Webview に渡されるグリッド全体のデータ DTO。
 */
export interface GridDataDto {
    /** ドキュメント形式 ('json', 'yaml' または 'jsonl') */
    documentType: 'json' | 'yaml' | 'jsonl';
    /** 現在の表示モード ('table' または 'kv') */
    viewMode: 'table' | 'kv';
    /** Key-Value 表示時の行リスト */
    rows: GridRowDto[];
    /** 総行数 */
    totalRows: number;
    /** テーブルビュー表示時のデータ */
    tableData?: TableViewDto;
    /** ドキュメント内のサブ配列一覧 */
    subArrays?: SubArrayInfoDto[];
    /** 解析エラー等のメッセージ（存在する場合） */
    error?: string;
}
