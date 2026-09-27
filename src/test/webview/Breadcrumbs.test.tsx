// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Breadcrumbs } from '../../webview/components/Breadcrumbs';

describe('Breadcrumbs Component', () => {
    afterEach(() => {
        cleanup();
    });

    /** 【観点】ルートパス時は root/ のみをカレント表示すること */
    it('renders root as current when path is empty or null', () => {
        const onNavigate = vi.fn();
        const { rerender } = render(<Breadcrumbs activeArrayPath="" onNavigate={onNavigate} />);

        expect(screen.getByText('root/')).not.toBeNull();
        expect(screen.queryByRole('button')).toBeNull();

        rerender(<Breadcrumbs activeArrayPath={null} onNavigate={onNavigate} />);
        expect(screen.getByText('root/')).not.toBeNull();
    });

    /** 【観点】ネストしたパスでパンくずリンクを階層順に生成し、クリックでナビゲートできること */
    it('renders nested path segments and triggers navigation on click', async () => {
        const user = userEvent.setup();
        const onNavigate = vi.fn();
        render(<Breadcrumbs activeArrayPath="users.profile.tags" onNavigate={onNavigate} />);

        // root/ ボタン
        const rootBtn = screen.getByRole('button', { name: 'root/' });
        expect(rootBtn).not.toBeNull();

        // 中間リンク users, profile
        const usersBtn = screen.getByRole('button', { name: 'users' });
        const profileBtn = screen.getByRole('button', { name: 'profile' });
        expect(usersBtn).not.toBeNull();
        expect(profileBtn).not.toBeNull();

        // 末尾 tags はテキスト（リンクではない）
        expect(screen.getByText('tags')).not.toBeNull();
        expect(screen.queryByRole('button', { name: 'tags' })).toBeNull();

        // クリック検証
        await user.click(usersBtn);
        expect(onNavigate).toHaveBeenCalledWith('users');

        await user.click(rootBtn);
        expect(onNavigate).toHaveBeenCalledWith('');
    });
});
