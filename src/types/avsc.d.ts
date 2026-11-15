declare module 'avsc' {
    import type { Duplex } from 'stream';

    export class Type {
        public static forSchema(schema: unknown, opts?: Record<string, unknown>): Type;
    }

    export namespace types {
        export class LongType {
            public static __with(methods: {
                fromBuffer: (buf: Buffer) => bigint;
                toBuffer: (val: bigint) => Buffer;
                fromJSON: (val: unknown) => bigint;
                toJSON: (val: bigint) => number | string;
                isValid: (val: unknown) => boolean;
                compare: (a: bigint, b: bigint) => number;
            }): unknown;
        }
    }

    export namespace streams {
        export class BlockDecoder extends Duplex {
            constructor(opts?: Record<string, unknown>);
        }
        export class BlockEncoder extends Duplex {
            constructor(type: Type, opts?: Record<string, unknown>);
        }
    }
}
