#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const testDir = path.resolve(__dirname, '..', 'src', 'test');
const outputFile = path.resolve(__dirname, '..', 'docs', 'test-specifications.md');

function findTestFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of list) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            results = results.concat(findTestFiles(fullPath));
        } else if (item.isFile() && item.name.endsWith('.test.ts')) {
            results.push(fullPath);
        }
    }
    return results;
}

function parseTestFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relPath = path.relative(path.resolve(__dirname, '..'), filePath);

    // Extract suite title
    const suiteMatch = content.match(/(?:describe|suite)\s*\(\s*['"`](.*?)['"`]/);
    const suiteTitle = suiteMatch ? suiteMatch[1] : path.basename(filePath, '.test.ts');

    // Extract test cases with JSDoc
    // Pattern matches: /** ... */ followed by it(...) or test(...)
    const testPattern = /\/\*\*([\s\S]*?)\*\/\s*(?:it|test)\s*\(\s*['"`](.*?)['"`]/g;
    const cases = [];

    let match;
    while ((match = testPattern.exec(content)) !== null) {
        const docComment = match[1];
        const testName = match[2];

        let perspective = '';
        let details = '';

        const perspectiveMatch = docComment.match(/【観点】\s*([^\n\r*]+)/);
        if (perspectiveMatch) {
            perspective = perspectiveMatch[1].trim();
        }

        const detailsMatch = docComment.match(/【テスト内容】\s*([\s\S]*?)(?=(?:\*\/|\* @|\* 【|$))/);
        if (detailsMatch) {
            details = detailsMatch[1]
                .replace(/\r?\n\s*\*\s*/g, ' ')
                .trim();
        }

        cases.push({
            name: testName,
            perspective: perspective || '未記載',
            details: details || '未記載',
        });
    }

    return {
        file: relPath,
        suite: suiteTitle,
        cases,
    };
}

function generateMarkdown(suites) {
    const totalSuites = suites.length;
    const totalTests = suites.reduce((acc, s) => acc + s.cases.length, 0);

    let md = `# テスト仕様書 (Test Specifications)\n\n`;
    md += `本ドキュメントは、\`src/test/\` 配下のテストコード（JSDoc / docstring）から自動抽出・生成されたテスト仕様一覧です。\n\n`;
    md += `- **総テストスイート数**: ${totalSuites}\n`;
    md += `- **総テストケース数**: ${totalTests}\n`;
    md += `- **生成スクリプト**: \`scripts/generate-test-docs.js\` (\`npm run doc\` にて自動更新)\n\n`;

    md += `## 目次\n\n`;
    suites.forEach((s, idx) => {
        const anchor = s.suite.toLowerCase().replace(/[^a-z0-9\-_]+/g, '-');
        md += `${idx + 1}. [${s.suite} (${s.cases.length}件)](#${anchor})\n`;
    });
    md += `\n---\n\n`;

    suites.forEach((s, idx) => {
        md += `## ${idx + 1}. ${s.suite}\n\n`;
        md += `- **テストファイル**: [\`${s.file}\`](../${s.file})\n`;
        md += `- **ケース数**: ${s.cases.length}\n\n`;

        if (s.cases.length === 0) {
            md += `*テストケースが検出されませんでした。*\n\n`;
            return;
        }

        md += `| # | テストケース名 | 観点 | テスト内容（検証内容） |\n`;
        md += `| :--- | :--- | :--- | :--- |\n`;

        s.cases.forEach((c, cIdx) => {
            // Escape pipe characters for markdown tables
            const safeName = c.name.replace(/\|/g, '\\|');
            const safePerspective = c.perspective.replace(/\|/g, '\\|');
            const safeDetails = c.details.replace(/\|/g, '\\|');

            md += `| ${cIdx + 1} | \`${safeName}\` | ${safePerspective} | ${safeDetails} |\n`;
        });

        md += `\n`;
    });

    return md;
}

function main() {
    const testFiles = findTestFiles(testDir).sort();
    const suites = testFiles.map(parseTestFile);

    const markdown = generateMarkdown(suites);
    fs.writeFileSync(outputFile, markdown, 'utf-8');

    console.log(`Successfully generated test specifications: ${outputFile} (${suites.reduce((acc, s) => acc + s.cases.length, 0)} tests)`);
}

main();
