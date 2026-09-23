import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    alias: {
      'vscode': path.resolve(__dirname, 'src/test/__mocks__/vscode.ts'),
    },
    exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/out/**',
        '**/src/ui-test/**',
        '**/src/test/extension.test.ts',
    ]
  }
});
