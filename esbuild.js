const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

function copyMdWebviewAssets() {
	fs.mkdirSync('dist/md-webview', { recursive: true });
	if (fs.existsSync('src/md-webview/styles.css')) {
		fs.copyFileSync('src/md-webview/styles.css', 'dist/md-webview/styles.css');
	}
	const mermaidMin = path.resolve('node_modules/mermaid/dist/mermaid.min.js');
	if (fs.existsSync(mermaidMin)) {
		const mmdCode = fs.readFileSync(mermaidMin, 'utf8');
		fs.writeFileSync(
			'dist/md-webview/mermaid.js',
			`${mmdCode}\nwindow.__mermaid = window.mermaid;\nwindow.dispatchEvent(new CustomEvent('mermaid-ready'));\n`
		);
	}
	const katexDist = path.resolve('node_modules/katex/dist');
	if (fs.existsSync(katexDist)) {
		fs.copyFileSync(path.join(katexDist, 'katex.min.css'), 'dist/md-webview/katex.min.css');
		const fontsSrc = path.join(katexDist, 'fonts');
		const fontsDest = path.resolve('dist/md-webview/fonts');
		if (fs.existsSync(fontsSrc)) {
			fs.mkdirSync(fontsDest, { recursive: true });
			for (const file of fs.readdirSync(fontsSrc)) {
				fs.copyFileSync(path.join(fontsSrc, file), path.join(fontsDest, file));
			}
		}
	}
}

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

/**
 * @type {import('esbuild').Plugin}
 */
const mdWebviewAssetsPlugin = {
	name: 'md-webview-assets',
	setup(build) {
		build.onEnd(() => {
			copyMdWebviewAssets();
		});
	},
};

async function main() {
	const extensionContext = await esbuild.context({
		entryPoints: ['src/extension.ts'],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [
			esbuildProblemMatcherPlugin,
		],
	});
	const webviewContext = await esbuild.context({
		entryPoints: ['src/webview/main.tsx'],
		bundle: true,
		format: 'iife',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'browser',
		outfile: 'dist/webview/main.js',
		logLevel: 'silent',
		plugins: [esbuildProblemMatcherPlugin],
	});
	const mdWebviewContext = await esbuild.context({
		entryPoints: ['src/md-webview/index.ts'],
		bundle: true,
		format: 'iife',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'browser',
		outfile: 'dist/md-webview/index.js',
		logLevel: 'silent',
		plugins: [mdWebviewAssetsPlugin, esbuildProblemMatcherPlugin],
	});
	const contexts = [extensionContext, webviewContext, mdWebviewContext];

	if (watch) {
		await Promise.all(contexts.map(context => context.watch()));
	} else {
		for (const context of contexts) {
			await context.rebuild();
			await context.dispose();
		}
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
