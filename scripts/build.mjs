/**
 * 零依赖单文件构建脚本
 * 将 src/ 下的样式与全部 ES 模块编译打包为可直接双击浏览器打开的 index.html（无 file:// CORS 限制）
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// 按依赖拓扑顺序排列模块
const MODULE_ORDER = [
  'src/data/glossary.js',
  'src/data/curriculumPart1.js',
  'src/data/curriculumPart2.js',
  'src/engine/financeMath.js',
  'src/engine/marketSimulator.js',
  'src/charts/svgCharts.js',
  'src/labs/interactiveLabs.js',
  'src/labs/tenYearSandbox.js',
  'src/ui/app.js'
];

function stripImportsAndExports(code) {
  // 移除多行或单行 import 语句
  let out = code.replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '');
  // 将 export const / export function / export let 转为普通声明
  out = out.replace(/^export\s+(?=(const|let|var|function|class)\b)/gm, '');
  return out;
}

export function buildSingleFile() {
  const css = fs.readFileSync(path.join(rootDir, 'src/styles/main.css'), 'utf8');

  const chunks = MODULE_ORDER.map((relPath) => {
    const raw = fs.readFileSync(path.join(rootDir, relPath), 'utf8');
    return `/* === MODULE: ${relPath} === */\n${stripImportsAndExports(raw)}`;
  });

  const bundledJs = `(() => {\n'use strict';\n${chunks.join('\n\n')}\n})();`;

  // 构建期语法校验：使用 Node vm.Script 确认打包后的 JS 零语法/重名错误
  try {
    new vm.Script(bundledJs, { filename: 'bundle.js' });
  } catch (err) {
    console.error('❌ 打包 JS 语法校验失败：', err);
    process.exit(1);
  }

  const html = `<!DOCTYPE html>
<html lang="zh-CN" data-theme="light" data-market-color="cn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>零基础投资冒险学院 · ELI5 大白话交互金融实验室</title>
  <style>
${css}
  </style>
</head>
<body>
  <div class="app-shell">
    <div id="sidebar-overlay" class="sidebar-overlay"></div>
    <aside id="app-sidebar" class="sidebar" aria-label="课程导航"></aside>

    <div class="main-area">
      <header class="topbar">
        <div class="topbar-left">
          <button id="mobile-menu-btn" class="mobile-menu-btn" aria-label="打开菜单">☰</button>
          <div id="app-breadcrumb" class="breadcrumb"></div>
        </div>
        <div class="topbar-actions">
          <button id="toggle-market-color" class="pill-btn" title="切换中国 A 股红涨绿跌或欧美绿涨红跌习惯">🔴🟢 红涨绿跌 (A股)</button>
          <button id="quick-glossary-btn" class="pill-btn" title="打开 ELI5 金融大白话词典">📖 查术语</button>
          <button id="toggle-theme" class="pill-btn" title="切换浅色或深色主题">🌙 深色</button>
        </div>
      </header>

      <main id="app-main" class="content-container"></main>
    </div>
  </div>

  <!-- ELI5 术语点击即懂弹窗 -->
  <div id="glossary-modal" class="modal-backdrop" role="dialog" aria-modal="true">
    <div id="glossary-modal-body" class="modal-card"></div>
  </div>

  <!-- 轻提示 Toast -->
  <div id="app-toast" class="toast" role="status" aria-live="polite"></div>

  <script>
${bundledJs}
  </script>
</body>
</html>
`;

  const outPath = path.join(rootDir, 'index.html');
  fs.writeFileSync(outPath, html, 'utf8');
  const sizeKb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
  console.log(`✅ 构建成功！已生成独立可交互单文件：${outPath}（${sizeKb} KB）`);
  return { outPath, sizeKb };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildSingleFile();
}
