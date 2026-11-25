import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

import {
  calcCompoundAndInflation,
  calcMilkTeaValuation,
  calcMarketCompass,
  calcFundFeeDrag,
  calcDcaSmileCurve,
  calcMacroClock,
  calcPortfolioBacktest
} from '../src/engine/financeMath.js';

import {
  SIM_ASSETS,
  MARKET_QUARTERS,
  createSimState,
  getPortfolioSnapshot,
  tradeAsset,
  applyPresetAllocation,
  advanceQuarter,
  generateGraduationReport
} from '../src/engine/marketSimulator.js';

import { GLOSSARY, GLOSSARY_CATEGORIES } from '../src/data/glossary.js';
import { CHAPTERS_PART1 } from '../src/data/curriculumPart1.js';
import { CHAPTERS_PART2, MARKET_CHECKLIST_ITEMS } from '../src/data/curriculumPart2.js';
import { LAB_META } from '../src/labs/interactiveLabs.js';
import {
  renderLineChart,
  renderCandlestickChart,
  renderDonutChart,
  renderMerrillClockSvg
} from '../src/charts/svgCharts.js';
import { renderRichEli5Text } from '../src/ui/app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('1. 复利与通胀时光机公式校验', () => {
  const res = calcCompoundAndInflation({
    initial: 10000,
    monthly: 1000,
    annualReturnPct: 8,
    inflationPct: 3,
    years: 20
  });
  assert.equal(res.series.length, 21);
  assert.equal(res.summary.totalPrincipal, 10000 + 1000 * 12 * 20);
  assert.ok(res.summary.investedNominal > res.summary.totalPrincipal);
  assert.ok(res.summary.investedReal < res.summary.investedNominal);
  assert.ok(res.summary.cashReal < res.summary.totalPrincipal);
  assert.ok(res.summary.milkTeaCupsInvest > res.summary.milkTeaCupsCash);
  assert.equal(res.summary.rule72Years, 9);
});

test('2. 奶茶店 IPO 估值模拟器校验（低估 vs 狂热泡沫）', () => {
  const cheap = calcMilkTeaValuation({ annualProfit: 20, growthRatePct: 15, sentimentScore: -40, netAssets: 100 });
  const bubble = calcMilkTeaValuation({ annualProfit: 20, growthRatePct: 15, sentimentScore: 45, netAssets: 100 });
  assert.equal(cheap.roe, 20);
  assert.equal(cheap.verdictTone, 'good');
  assert.equal(bubble.verdictTone, 'danger');
  assert.ok(bubble.marketPE > cheap.marketPE);
  assert.ok(bubble.sharePrice > cheap.sharePrice);
});

test('3. 市场走向四维推演仪与 K 线数据校验', () => {
  const bull = calcMarketCompass({ earnings: 60, liquidity: 50, policy: 40, sentiment: 20 });
  const bear = calcMarketCompass({ earnings: -60, liquidity: -50, policy: -20, sentiment: -80 });
  assert.equal(bull.candles.length, 24);
  assert.equal(bull.bullPower + bull.bearPower, 100);
  assert.ok(bull.bullPower > 50);
  assert.ok(bear.bullPower < 50);
  assert.ok(bull.candles.every((c) => c.high >= c.open && c.high >= c.close && c.low <= c.open && c.low <= c.close && Number.isFinite(c.ma5)));
});

test('4. 基金费率放大镜校验', () => {
  const res = calcFundFeeDrag({ initial: 100000, years: 15, grossReturnPct: 9, activeFeePct: 1.75, indexFeePct: 0.2 });
  assert.ok(res.summary.finalIndex > res.summary.finalActive);
  assert.ok(res.summary.extraKeptByIndex > 50000);
});

test('5. ETF 微笑曲线与倒微笑曲线定投逻辑校验', () => {
  const smile = calcDcaSmileCurve({ scenario: 'smile', monthlyAmount: 1000 });
  assert.equal(smile.summary.lumpReturnPct, 0);
  assert.ok(smile.summary.dcaReturnPct > 15, `微笑曲线定投应显著盈利，实际: ${smile.summary.dcaReturnPct}%`);
  assert.ok(smile.summary.smartReturnPct > smile.summary.dcaReturnPct);

  const inverted = calcDcaSmileCurve({ scenario: 'inverted', monthlyAmount: 1000 });
  assert.equal(inverted.summary.lumpReturnPct, 0);
  assert.ok(inverted.summary.dcaReturnPct < 0, '倒微笑曲线不止盈定投应亏损，起到教学警示作用');
});

test('6. 美林投资时钟四季象限与利率跷跷板校验', () => {
  const recovery = calcMacroClock({ gdpGrowth: 5.5, cpiInflation: 2.0, interestRate: 2.0 });
  const overheat = calcMacroClock({ gdpGrowth: 6.0, cpiInflation: 4.5, interestRate: 4.0 });
  const stagflation = calcMacroClock({ gdpGrowth: 2.5, cpiInflation: 5.0, interestRate: 5.0 });
  const recession = calcMacroClock({ gdpGrowth: 2.0, cpiInflation: 1.0, interestRate: 1.5 });

  assert.equal(recovery.phase, 'recovery');
  assert.equal(overheat.phase, 'overheat');
  assert.equal(stagflation.phase, 'stagflation');
  assert.equal(recession.phase, 'recession');

  // 利率跷跷板：低利率债价 > 100，高利率债价 < 100
  assert.ok(recession.bondPrice > 100);
  assert.ok(stagflation.bondPrice < 100);
});

test('7. 资产配置压力测试校验（分散配置显著降低股灾回撤）', () => {
  const allStock = calcPortfolioBacktest({ weights: { stocks: 100, bonds: 0, gold: 0, cash: 0 }, rebalance: true });
  const balanced = calcPortfolioBacktest({ weights: { stocks: 40, bonds: 40, gold: 15, cash: 5 }, rebalance: true });
  const crashStock = allStock.results.find((r) => r.id === 'crashRecovery');
  const crashBalanced = balanced.results.find((r) => r.id === 'crashRecovery');

  assert.ok(crashBalanced.maxDrawdownPct < crashStock.maxDrawdownPct - 15);
  assert.equal(
    balanced.weightsPct.stocks + balanced.weightsPct.bonds + balanced.weightsPct.gold + balanced.weightsPct.cash,
    100
  );
});

test('8. 10 年（40 季度）市场实战沙盒全流程与毕业报告校验', () => {
  assert.equal(MARKET_QUARTERS.length, 40);
  assert.equal(SIM_ASSETS.length, 5);

  const sim = createSimState(100000);
  applyPresetAllocation(sim, { broadEtf: 40, techEtf: 10, dividend: 15, bondEtf: 20, goldEtf: 10 });
  tradeAsset(sim, 'broadEtf', 'buy', 1000);
  tradeAsset(sim, 'techEtf', 'sell', 500);

  for (let i = 0; i < 40; i++) {
    advanceQuarter(sim);
  }
  assert.equal(sim.finished, true);
  assert.equal(sim.history.length, 41);

  const snap = getPortfolioSnapshot(sim);
  assert.ok(Number.isFinite(snap.totalValue) && snap.totalValue > 100000);

  const report = generateGraduationReport(sim);
  assert.ok(report.score >= 30 && report.score <= 100);
  assert.ok(report.beatCash, '合理配置的 10 年组合应跑赢纯现金');
  assert.ok(report.beatXiaoming, '合理配置的 10 年组合应跑赢追涨杀跌小明');
});

test('9. 课程体系、测验与全站 [[术语]] 引用 100% 完整性校验', () => {
  const chapters = [...CHAPTERS_PART1, ...CHAPTERS_PART2];
  assert.equal(chapters.length, 7);

  const lessons = chapters.flatMap((c) => c.lessons);
  assert.equal(lessons.length, 24);
  assert.equal(MARKET_CHECKLIST_ITEMS.length, 5);

  const validLabIds = new Set(LAB_META.map((m) => m.id));
  const glossaryRegex = /\[\[([a-zA-Z0-9_-]+)\|([^\]]+)\]\]/g;

  for (const lesson of lessons) {
    assert.ok(lesson.eli5Story.length > 20, `缺少 ELI5 故事: ${lesson.id}`);
    assert.ok(Array.isArray(lesson.howItWorks) && lesson.howItWorks.length >= 2);
    assert.ok(lesson.proBridge.length > 15);
    assert.ok(lesson.pitfall.length > 15);
    assert.ok(lesson.quiz && lesson.quiz.options.length >= 3);
    assert.ok(lesson.quiz.correctIndex >= 0 && lesson.quiz.correctIndex < lesson.quiz.options.length);
    if (lesson.labId) {
      assert.ok(validLabIds.has(lesson.labId), `无效实验室 ID: ${lesson.labId}`);
    }

    // 检查所有 [[id|label]] 术语引用是否都存在于 GLOSSARY 中
    const combined = [lesson.eli5Story, ...lesson.howItWorks, lesson.proBridge, lesson.pitfall].join('\n');
    let match;
    while ((match = glossaryRegex.exec(combined)) !== null) {
      const termId = match[1];
      assert.ok(GLOSSARY[termId], `课程 ${lesson.id} 引用了不存在的术语 ID: ${termId}`);
    }
  }

  // 检查词典本身完整性
  const glossaryKeys = Object.keys(GLOSSARY);
  assert.ok(glossaryKeys.length >= 50, `词典应至少包含 50 条术语，实际: ${glossaryKeys.length}`);
  for (const [id, entry] of Object.entries(GLOSSARY)) {
    assert.ok(GLOSSARY_CATEGORIES.includes(entry.category), `词条 ${id} 分类无效: ${entry.category}`);
    assert.ok(entry.eli5 && entry.analogy && entry.tip);
  }

  // 校验富文本渲染函数安全转义与术语胶囊输出
  const rendered = renderRichEli5Text('测试 <script> **加粗** [[etf|ETF]]');
  assert.ok(rendered.includes('&lt;script&gt;'));
  assert.ok(rendered.includes('<strong>加粗</strong>'));
  assert.ok(rendered.includes('data-glossary="etf"'));
});

test('10. SVG 图表组件渲染无 NaN 校验', () => {
  const line = renderLineChart({
    labels: ['1月', '2月', '3月'],
    series: [{ name: '测试', color: '#4f46e5', values: [100, 120, 115], fill: true }]
  });
  const compass = calcMarketCompass({ earnings: 20, liquidity: 20, policy: 10, sentiment: 0 });
  const candle = renderCandlestickChart(compass.candles);
  const donut = renderDonutChart([
    { label: '股票', value: 60, color: '#4f46e5' },
    { label: '债券', value: 40, color: '#059669' }
  ]);
  const clock = renderMerrillClockSvg('recovery');

  for (const svg of [line, candle, donut, clock]) {
    assert.ok(svg.includes('<svg'));
    assert.ok(!svg.includes('NaN'), 'SVG 渲染结果不应出现 NaN');
    assert.ok(!svg.includes('undefined'), 'SVG 渲染结果不应出现 undefined');
  }
});

test('11. 单文件构建产物 index.html 完整性与语法校验', () => {
  const htmlPath = path.join(rootDir, 'index.html');
  assert.ok(fs.existsSync(htmlPath), 'index.html 必须存在');
  const html = fs.readFileSync(htmlPath, 'utf8');

  for (const domId of ['app-sidebar', 'app-main', 'glossary-modal', 'app-toast', 'toggle-market-color', 'toggle-theme']) {
    assert.ok(html.includes(`id="${domId}"`), `index.html 缺少核心 DOM 容器 #${domId}`);
  }

  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(scriptMatch, 'index.html 应包含内联脚本');
  const jsCode = scriptMatch[1];
  assert.doesNotMatch(jsCode, /^\s*import\s+/m, '打包产物中不应残留 ESM import 语句');
  assert.doesNotMatch(jsCode, /^\s*export\s+/m, '打包产物中不应残留 ESM export 语句');

  // 使用 vm.Script 校验完整打包脚本可无错编译
  assert.doesNotThrow(() => new vm.Script(jsCode, { filename: 'index.html' }));
});

test('12. 打包产物防回归校验：滑块更新绝不重建控件导致断触', () => {
  const labSrc = fs.readFileSync(path.join(rootDir, 'src/labs/interactiveLabs.js'), 'utf8');
  assert.ok(labSrc.includes('id="lab-output"'), '实验室应使用独立的 #lab-output 容器局部更新');
  const appSrc = fs.readFileSync(path.join(rootDir, 'src/ui/app.js'), 'utf8');
  assert.ok(appSrc.includes('id="glossary-grid"'), '词典搜索应局部更新 #glossary-grid，保护中文输入法焦点');
});
