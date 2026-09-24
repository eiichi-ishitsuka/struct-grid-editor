import { describe, it, expect } from 'vitest';
import { CellPath } from '../../domain/model/CellPath';

describe('CellPath', () => {
    /**
     * 【観点】空文字列のパース処理と境界値動作の確認
     * 【テスト内容】空文字列を与えた際に、セグメント配列が空となり、文字列化しても空文字に戻ることを検証する。
     */
    it('parses empty string to empty segments', () => {
        const path = CellPath.fromString('');
        expect(path.segments).toEqual([]);
        expect(path.toString()).toBe('');
    });

    /**
     * 【観点】単一プロパティ名（ルート直下のキー）のパース処理の確認
     * 【テスト内容】単一の文字列キーを与えた際、セグメント配列にその文字列1件のみが格納され、正しく文字列化されることを検証する。
     */
    it('parses simple property name', () => {
        const path = CellPath.fromString('name');
        expect(path.segments).toEqual(['name']);
        expect(path.toString()).toBe('name');
    });

    /**
     * 【観点】ドット記法（ネスト構造）のパース処理と階層深度（depth）計算の確認
     * 【テスト内容】'user.address.city' のような複数階層のパスを与えた際、各プロパティ名に分解され、depthが階層数（3）と一致することを検証する。
     */
    it('parses nested dot-notation paths', () => {
        const path = CellPath.fromString('user.address.city');
        expect(path.segments).toEqual(['user', 'address', 'city']);
        expect(path.toString()).toBe('user.address.city');
        expect(path.depth).toBe(3);
    });

    /**
     * 【観点】配列インデックス記法（`[n]`）を含む複合パスのパース処理の確認
     * 【テスト内容】'items[0].tags[2].label' のようにオブジェクトと配列添字が混在するパスを与えた際、添字が数値型セグメントとして正確に抽出されることを検証する。
     */
    it('parses array indexed paths', () => {
        const path = CellPath.fromString('items[0].tags[2].label');
        expect(path.segments).toEqual(['items', 0, 'tags', 2, 'label']);
        expect(path.toString()).toBe('items[0].tags[2].label');
    });

    /**
     * 【観点】親子パスの関係性判定（parent, append, isChildOf, equals）の確認
     * 【テスト内容】パスにセグメントを追加（append）した際に、正しい子パスが生成され、親子関係判定（isChildOf）やparentプロパティの等価性が正しく機能することを検証する。
     */
    it('handles parent, append, and child relations', () => {
        const parent = CellPath.fromString('user.address');
        const child = parent.append('zip');

        expect(child.toString()).toBe('user.address.zip');
        expect(child.isChildOf(parent)).toBe(true);
        expect(parent.isChildOf(child)).toBe(false);
        expect(child.parent?.equals(parent)).toBe(true);
    });
});
