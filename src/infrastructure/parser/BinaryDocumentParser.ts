import { Readable } from 'stream';
import * as avro from 'avsc';
import { DocumentFormat } from '../../domain/model/DocumentFormat';
import { StructuredDocument } from '../../domain/model/StructuredDocument';
import { TreeNode } from '../../domain/model/TreeNode';

/** バイナリファイル読み込み時のデフォルト最大行数 */
export const DEFAULT_MAX_BINARY_ROWS = 10000;

/**
 * バイナリフォーマット解析結果。
 */
export interface BinaryParseResult {
    /** 生成された StructuredDocument */
    document: StructuredDocument;
    /** 元の総レコード数（取得できる場合） */
    totalSourceRows?: number;
    /** 最大行数制限により一部のみ読み込まれたか */
    isTruncated: boolean;
}

/**
 * Parquet / Avro 固有の JS 値（BigInt, Date, Uint8Array, Map, Prototype付きレコード等）を
 * TreeNode / JSON で安全に扱えるプレーンな値へ正規化します。
 * @param value 正規化対象の値
 * @returns 正規化後の値
 */
export function normalizeBinaryValue(value: unknown): unknown {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === 'bigint') {
        if (value >= BigInt(Number.MIN_SAFE_INTEGER) && value <= BigInt(Number.MAX_SAFE_INTEGER)) {
            return Number(value);
        }
        return value.toString();
    }
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? String(value) : value.toISOString();
    }
    if (value instanceof Uint8Array || Buffer.isBuffer(value)) {
        return Buffer.from(value).toString('base64');
    }
    if (Array.isArray(value)) {
        return value.map(item => normalizeBinaryValue(item));
    }
    if (value instanceof Map) {
        const obj: Record<string, unknown> = {};
        for (const [k, v] of value.entries()) {
            obj[String(k)] = normalizeBinaryValue(v);
        }
        return obj;
    }
    if (typeof value === 'object') {
        const obj: Record<string, unknown> = {};
        for (const key of Object.keys(value)) {
            obj[key] = normalizeBinaryValue((value as Record<string, unknown>)[key]);
        }
        return obj;
    }
    return value;
}

/**
 * Apache Parquet バイナリを解析して StructuredDocument を生成します。
 * @param bytes Parquet ファイルのバイト列
 * @param maxRows 読み込む最大行数（既定: 10000）
 * @returns 解析結果
 */
export async function parseParquetBuffer(
    bytes: Uint8Array,
    maxRows = DEFAULT_MAX_BINARY_ROWS
): Promise<BinaryParseResult> {
    const [{ parquetMetadata, parquetReadObjects }, { compressors }] = await Promise.all([
        import('hyparquet'),
        import('hyparquet-compressors'),
    ]);
    const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    const metadata = parquetMetadata(arrayBuffer);
    const totalSourceRows = Number(metadata.num_rows ?? 0);
    const rowEnd = Math.min(totalSourceRows, maxRows);

    const rawRows = await parquetReadObjects({
        file: {
            byteLength: arrayBuffer.byteLength,
            slice: (start: number, end?: number) => arrayBuffer.slice(start, end),
        },
        compressors,
        rowStart: 0,
        rowEnd,
    });

    const normalizedRows = rawRows.map(row => normalizeBinaryValue(row));
    const root = TreeNode.fromJS(normalizedRows);
    return {
        document: new StructuredDocument(root, DocumentFormat.defaultParquet()),
        totalSourceRows,
        isTruncated: totalSourceRows > maxRows,
    };
}

/**
 * 53bit を超える 64bit 整数（Iceberg の snapshot_id 等）でも精度損失エラーを起こさず
 * BigInt としてデコードするためのカスタム Avro LongType。
 */
const bigIntLongType = avro.types.LongType.__with({
    fromBuffer: (buf: Buffer) => buf.readBigInt64LE(),
    toBuffer: (n: bigint) => {
        const buf = Buffer.alloc(8);
        buf.writeBigInt64LE(BigInt(n));
        return buf;
    },
    fromJSON: (val: unknown) => BigInt(val as string | number | bigint),
    toJSON: (n: bigint) => n.toString(),
    isValid: (n: unknown) => typeof n === 'bigint',
    compare: (n1: bigint, n2: bigint) => (n1 === n2 ? 0 : n1 < n2 ? -1 : 1),
});

/**
 * Apache Avro Object Container File バイナリを解析して StructuredDocument を生成します。
 * @param bytes Avro ファイルのバイト列
 * @param maxRows 読み込む最大行数（既定: 10000）
 * @returns 解析結果
 */
export async function parseAvroBuffer(
    bytes: Uint8Array,
    maxRows = DEFAULT_MAX_BINARY_ROWS
): Promise<BinaryParseResult> {
    return new Promise<BinaryParseResult>((resolve, reject) => {
        const rows: unknown[] = [];
        let isTruncated = false;
        let settled = false;

        const source = Readable.from([Buffer.from(bytes)]);
        const decoder = new avro.streams.BlockDecoder({
            parseHook: (schema: unknown) => {
                (decoder as unknown as { _rType?: avro.Type })._rType = avro.Type.forSchema(schema, {
                    registry: { long: bigIntLongType },
                });
                return schema;
            },
        });

        const finish = () => {
            if (settled) {
                return;
            }
            settled = true;
            const root = TreeNode.fromJS(rows);
            resolve({
                document: new StructuredDocument(root, DocumentFormat.defaultAvro()),
                isTruncated,
            });
        };

        decoder.on('data', (record: unknown) => {
            if (rows.length >= maxRows) {
                isTruncated = true;
                source.unpipe(decoder);
                decoder.destroy();
                finish();
                return;
            }
            rows.push(normalizeBinaryValue(record));
        });

        decoder.on('end', finish);
        decoder.on('close', finish);

        const onError = (err: unknown) => {
            if (settled) {
                return;
            }
            settled = true;
            reject(err instanceof Error ? err : new Error(String(err)));
        };

        source.on('error', onError);
        decoder.on('error', onError);
        source.pipe(decoder);
    });
}
