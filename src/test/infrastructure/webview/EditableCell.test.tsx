// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditableCell } from '../../../infrastructure/webview/ui/components/EditableCell';

describe('EditableCell Component', () => {
    afterEach(() => {
        cleanup();
    });

    /** 【観点】初期値を正しく描画し、data 属性を設定すること */
    it('renders displayValue with data attributes', () => {
        const { container } = render(
            <table>
                <tbody>
                    <tr>
                        <EditableCell
                            path="[0].name"
                            colKey="name"
                            rowIndex={0}
                            displayValue="Alice"
                            type="string"
                            onUpdateCell={vi.fn()}
                            onSelectCell={vi.fn()}
                        />
                    </tr>
                </tbody>
            </table>
        );

        const td = container.querySelector('td.col-val');
        expect(td).not.toBeNull();
        expect(td?.textContent).toBe('Alice');
        expect(td?.getAttribute('data-path')).toBe('[0].name');
        expect(td?.getAttribute('data-col-key')).toBe('name');
        expect(td?.getAttribute('data-row-index')).toBe('0');
        expect(td?.getAttribute('contenteditable')).toBe('true');
    });

    /** 【観点】編集中のユーザー入力を React の再描画（props 更新）で上書きしないこと */
    it('preserves user typed text during focus even when displayValue prop updates', () => {
        const onUpdateCell = vi.fn();
        const { container, rerender } = render(
            <table>
                <tbody>
                    <tr>
                        <EditableCell
                            path="[0].name"
                            colKey="name"
                            rowIndex={0}
                            displayValue="Alice"
                            type="string"
                            onUpdateCell={onUpdateCell}
                            onSelectCell={vi.fn()}
                        />
                    </tr>
                </tbody>
            </table>
        );

        const td = container.querySelector('td.col-val') as HTMLTableCellElement;
        expect(td).not.toBeNull();

        // フォーカスしてテキストを変更
        fireEvent.focus(td);
        td.innerText = 'Alicia (typing...)';

        // 外部から props が更新されても、編集中のテキストは上書きされない
        rerender(
            <table>
                <tbody>
                    <tr>
                        <EditableCell
                            path="[0].name"
                            colKey="name"
                            rowIndex={0}
                            displayValue="Alice (from external)"
                            type="string"
                            onUpdateCell={onUpdateCell}
                            onSelectCell={vi.fn()}
                        />
                    </tr>
                </tbody>
            </table>
        );

        expect(td.innerText).toBe('Alicia (typing...)');

        // blur で初めて確定される
        fireEvent.blur(td);
        expect(onUpdateCell).toHaveBeenCalledWith('[0].name', 'Alicia (typing...)');
    });

    /** 【観点】Enter キーで値を確定し、下方向セルへ移動を通知すること */
    it('commits value and triggers navigation on Enter', () => {
        const onUpdateCell = vi.fn();
        const onNavigateAdjacent = vi.fn();

        const { container } = render(
            <table>
                <tbody>
                    <tr>
                        <EditableCell
                            path="[0].name"
                            colKey="name"
                            rowIndex={0}
                            displayValue="Bob"
                            type="string"
                            onUpdateCell={onUpdateCell}
                            onSelectCell={vi.fn()}
                            onNavigateAdjacent={onNavigateAdjacent}
                        />
                    </tr>
                </tbody>
            </table>
        );

        const td = container.querySelector('td.col-val') as HTMLTableCellElement;
        fireEvent.focus(td);
        td.innerText = 'Bobby';

        fireEvent.keyDown(td, { key: 'Enter' });
        expect(onUpdateCell).toHaveBeenCalledWith('[0].name', 'Bobby');
        expect(onNavigateAdjacent).toHaveBeenCalledWith('down');
    });

    /** 【観点】Shift + Tab キーで値を確定し、左方向セルへ移動を通知すること */
    it('commits value and triggers navigation on Shift + Tab', () => {
        const onUpdateCell = vi.fn();
        const onNavigateAdjacent = vi.fn();

        const { container } = render(
            <table>
                <tbody>
                    <tr>
                        <EditableCell
                            path="[0].name"
                            colKey="name"
                            rowIndex={0}
                            displayValue="Charlie"
                            type="string"
                            onUpdateCell={onUpdateCell}
                            onSelectCell={vi.fn()}
                            onNavigateAdjacent={onNavigateAdjacent}
                        />
                    </tr>
                </tbody>
            </table>
        );

        const td = container.querySelector('td.col-val') as HTMLTableCellElement;
        fireEvent.keyDown(td, { key: 'Tab', shiftKey: true });
        expect(onNavigateAdjacent).toHaveBeenCalledWith('left');
    });
});
