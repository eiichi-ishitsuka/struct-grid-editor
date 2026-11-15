import { describe, it, expect, vi } from 'vitest';
import * as avro from 'avsc';
import {
    normalizeBinaryValue,
    parseAvroBuffer,
    parseParquetBuffer,
} from '../../infrastructure/parser/BinaryDocumentParser';

vi.mock('hyparquet', () => ({
    parquetMetadata: vi.fn((_buf: ArrayBuffer) => ({
        num_rows: 3n,
    })),
    parquetReadObjects: vi.fn(async ({ rowEnd }: { rowEnd: number }) => {
        const all = [
            { id: 1n, name: 'Alice', active: true },
            { id: 2n, name: 'Bob', active: false },
            { id: 3n, name: 'Charlie', active: true },
        ];
        return all.slice(0, rowEnd);
    }),
}));

async function createAvroBuffer(records: Array<Record<string, unknown>>): Promise<Uint8Array> {
    const type = avro.Type.forSchema({
        type: 'record',
        name: 'TestRecord',
        fields: [
            { name: 'id', type: 'long' },
            { name: 'name', type: 'string' },
        ],
    });

    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const encoder = new avro.streams.BlockEncoder(type);
        encoder.on('data', (chunk: Buffer) => chunks.push(chunk));
        encoder.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))));
        encoder.on('error', reject);
        for (const record of records) {
            encoder.write(record);
        }
        encoder.end();
    });
}

describe('BinaryDocumentParser', () => {
    /**
     * 【観点】バイナリ固有型（BigInt / Date / Uint8Array / Map）の正規化
     * 【テスト内容】Parquet / Avro に含まれる BigInt・Date・Uint8Array・Map 等の値が JSON 安全なプレーン値へ正規化されることを検証する。
     */
    it('normalizes BigInt, Date, Uint8Array, and Map values into plain JSON-safe values', () => {
        const date = new Date('2026-11-15T00:00:00.000Z');
        const bytes = new Uint8Array([1, 2, 3]);
        const map = new Map<string, unknown>([['k', 42n]]);

        const normalized = normalizeBinaryValue({
            smallBigInt: 123n,
            hugeBigInt: 9007199254740993n,
            date,
            bytes,
            map,
        });

        expect(normalized).toEqual({
            smallBigInt: 123,
            hugeBigInt: '9007199254740993',
            date: '2026-11-15T00:00:00.000Z',
            bytes: Buffer.from(bytes).toString('base64'),
            map: { k: 42 },
        });
    });

    /**
     * 【観点】Apache Avro コンテナファイルの解析と最大行数制限
     * 【テスト内容】Avro バイナリを解析して StructuredDocument が生成され、maxRows を超える場合は isTruncated が true になることを検証する。
     */
    it('parses Apache Avro container buffer and enforces maxRows truncation', async () => {
        const bytes = await createAvroBuffer([
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
            { id: 3, name: 'Charlie' },
        ]);

        const full = await parseAvroBuffer(bytes, 10);
        expect(full.document.format.fileType).toBe('avro');
        expect(full.isTruncated).toBe(false);
        expect(full.document.toTableView()?.rows.length).toBe(3);

        const truncated = await parseAvroBuffer(bytes, 2);
        expect(truncated.isTruncated).toBe(true);
        expect(truncated.document.toTableView()?.rows.length).toBe(2);
    });

    /**
     * 【観点】64bit 整数（Number.MAX_SAFE_INTEGER 超過）を含む Avro ファイルの解析
     * 【テスト内容】Iceberg メタデータ等に含まれる 53bit 超の long 値を含む Avro バイナリが potential precision loss エラーにならず文字列として保持されることを検証する。
     */
    it('parses Avro long values exceeding Number.MAX_SAFE_INTEGER without precision loss error', async () => {
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
        const type = avro.Type.forSchema(
            {
                type: 'record',
                name: 'IcebergEntry',
                fields: [{ name: 'snapshot_id', type: 'long' }],
            },
            { registry: { long: bigIntLongType } }
        );
        const bytes = await new Promise<Uint8Array>((resolve, reject) => {
            const chunks: Buffer[] = [];
            const enc = new avro.streams.BlockEncoder(type);
            enc.on('data', (c: Buffer) => chunks.push(c));
            enc.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))));
            enc.on('error', reject);
            enc.write({ snapshot_id: 8109252850008676207n });
            enc.end();
        });

        const parsed = await parseAvroBuffer(bytes);
        const tv = parsed.document.toTableView();
        expect(tv?.rows.length).toBe(1);
        expect(tv?.rows[0].cells.snapshot_id.value.value).toBe('8109252850008676207');
    });

    /**
     * 【観点】Apache Parquet バイナリの解析と最大行数制限
     * 【テスト内容】Parquet バイナリを解析して BigInt 等が正規化された StructuredDocument が生成され、maxRows 超過時に isTruncated と totalSourceRows が設定されることを検証する。
     */
    it('parses Apache Parquet buffer and reports totalSourceRows and truncation', async () => {
        const dummyBytes = new Uint8Array([0x50, 0x41, 0x52, 0x31]);

        const full = await parseParquetBuffer(dummyBytes, 10);
        expect(full.document.format.fileType).toBe('parquet');
        expect(full.totalSourceRows).toBe(3);
        expect(full.isTruncated).toBe(false);
        expect(full.document.toTableView()?.rows.length).toBe(3);

        const truncated = await parseParquetBuffer(dummyBytes, 2);
        expect(truncated.totalSourceRows).toBe(3);
        expect(truncated.isTruncated).toBe(true);
        expect(truncated.document.toTableView()?.rows.length).toBe(2);
    });
});
