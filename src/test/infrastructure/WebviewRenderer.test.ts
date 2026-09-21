import { describe, it, expect } from 'vitest';
import { WebviewRenderer } from '../../infrastructure/webview/WebviewRenderer';
import { JsonDocumentParser } from '../../infrastructure/parser/JsonDocumentParser';
import { YamlDocumentParser } from '../../infrastructure/parser/YamlDocumentParser';
import { ParseDocumentUseCase } from '../../application/usecase/ParseDocumentUseCase';
import * as fs from 'fs';
import * as path from 'path';

import * as vm from 'vm';

describe('WebviewRenderer', () => {
    const jsonParser = new JsonDocumentParser();
    const yamlParser = new YamlDocumentParser();
    const useCase = new ParseDocumentUseCase([jsonParser, yamlParser]);
    const renderer = new WebviewRenderer();

    it('renders simple-list.json without syntax errors', () => {
        const filePath = path.resolve(__dirname, '../../../samples/json/simple-list.json');
        const text = fs.readFileSync(filePath, 'utf-8');
        const result = useCase.execute(text, 'json');
        const html = renderer.render(result.dto);

        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('spreadsheetTable');

        // Extract script
        const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
        expect(scriptMatch).not.toBeNull();
        const scriptContent = scriptMatch![1];

        try {
            new vm.Script(scriptContent);
        } catch (e: any) {
            console.error('SyntaxError in script:', e.message, e.stack);
            throw e;
        }
    });

    it('renders nested-service.yaml without syntax errors', () => {
        const filePath = path.resolve(__dirname, '../../../samples/yaml/nested-service.yaml');
        const text = fs.readFileSync(filePath, 'utf-8');
        const result = useCase.execute(text, 'yaml');
        const html = renderer.render(result.dto);

        expect(html).toContain('<!DOCTYPE html>');

        const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
        expect(scriptMatch).not.toBeNull();
        expect(() => {
            new vm.Script(scriptMatch![1]);
        }).not.toThrow();
    });

    it('renders k8s-deployment.yaml without syntax errors', () => {
        const filePath = path.resolve(__dirname, '../../../samples/yaml/k8s-deployment.yaml');
        const text = fs.readFileSync(filePath, 'utf-8');
        const result = useCase.execute(text, 'yaml');
        const html = renderer.render(result.dto);

        expect(html).toContain('<!DOCTYPE html>');

        const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
        expect(scriptMatch).not.toBeNull();
        expect(() => {
            new vm.Script(scriptMatch![1]);
        }).not.toThrow();
    });
});
