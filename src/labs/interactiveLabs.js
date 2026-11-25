/**
 * 7 大专项深度互动金融实验室渲染器（60FPS 无断触架构）
 * 核心工程优化：滑块控件区与结果图表区彻底分离，拖拽滑块时绝不销毁 <input type="range"> 元素，保证丝滑跟手！
 */

import {
  calcCompoundAndInflation,
  calcMilkTeaValuation,
  calcMarketCompass,
  calcFundFeeDrag,
  calcDcaSmileCurve,
  calcMacroClock,
  calcPortfolioBacktest
} from '../engine/financeMath.js';
import {
  renderLineChart,
  renderCandlestickChart,
  renderDonutChart,
  renderMerrillClockSvg
} from '../charts/svgCharts.js';

function fmtYuan(n) {
  return '¥' + Math.round(n).toLocaleString('zh-CN');
}

export const LAB_META = [
  { id: 'compound', icon: '⏳', title: '复利 & 通胀时光机', desc: '亲眼看通胀怎么偷走奶茶，复利怎么把小钱滚成大雪球', chapter: '第一篇' },
  { id: 'valuation', icon: '🧋', title: '奶茶店 IPO 估值模拟器', desc: '拖动利润、增速与情绪，秒懂 PE、PB、ROE 和泡沫警报', chapter: '第二篇' },
  { id: 'compass', icon: '🧭', title: '市场走向四维推演仪', desc: '拨动基本面/资金面/政策面/情绪面，实时生成 K 线与多空拔河图', chapter: '第三篇' },
  { id: 'fundFee', icon: '🔍', title: '基金费率放大镜', desc: '实测 1.5% 的隐形管理费如何在长期悄悄吃掉三分之一收益', chapter: '第四篇' },
  { id: 'dca', icon: '😊', title: 'ETF 微笑曲线定投实验室', desc: '在 4 种真实牛熊剧本中，PK 一把梭哈 vs 普通定投 vs 智能定投', chapter: '第五篇' },
  { id: 'macroClock', icon: '🌊', title: '央行水龙头与美林时钟', desc: '一拉滑块秒懂加息降息、利率跷跷板与经济四季最佳资产', chapter: '第六篇' },
  { id: 'portfolio', icon: '🧺', title: '全天候资产配置搭配师', desc: '搭配股/债/金/现金比例，一键回测股灾与滞胀并体验再平衡威力', chapter: '第七篇' }
];

export function mountLab(container, labId, onInteract) {
  const notify = () => {
    if (typeof onInteract === 'function') onInteract(labId);
  };

  if (labId === 'compound') return mountCompoundLab(container, notify);
  if (labId === 'valuation') return mountValuationLab(container, notify);
  if (labId === 'compass') return mountCompassLab(container, notify);
  if (labId === 'fundFee') return mountFundFeeLab(container, notify);
  if (labId === 'dca') return mountDcaLab(container, notify);
  if (labId === 'macroClock') return mountMacroClockLab(container, notify);
  if (labId === 'portfolio') return mountPortfolioLab(container, notify);
}

/* --------------------------------------------------------------------------
   实验室 1：复利 & 通胀时光机
   -------------------------------------------------------------------------- */
function mountCompoundLab(container, notify) {
  const state = { initial: 20000, monthly: 1500, annualReturnPct: 8, inflationPct: 3, years: 20 };

  container.innerHTML = `
    <div class="lab-panel">
      <div class="lab-header">
        <div>
          <span class="lab-badge">🧪 互动实验室 1</span>
          <h3 style="margin:6px 0 4px;">⏳ 复利 & 通胀时光机</h3>
          <p style="margin:0;font-size:13.5px;color:var(--text-secondary);">自由拖动滑块，实时对比"钱生钱"与"只存现金"到底能买多少杯 18 元的奶茶！</p>
        </div>
        <div class="stat-card" style="padding:8px 14px;">
          <div class="stat-label">72 法则资产翻倍周期</div>
          <div class="stat-value" id="cmp-r72" style="font-size:16px;color:var(--brand);"></div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:16px;">
        <div>
          <div class="control-group">
            <div class="control-label"><span>初始本金</span><span class="control-value" data-val="initial"></span></div>
            <input type="range" data-k="initial" min="0" max="200000" step="5000" value="${state.initial}">
          </div>
          <div class="control-group">
            <div class="control-label"><span>每月定投存入</span><span class="control-value" data-val="monthly"></span></div>
            <input type="range" data-k="monthly" min="0" max="10000" step="200" value="${state.monthly}">
          </div>
          <div class="control-group">
            <div class="control-label"><span>投资年限（滚雪球的坡有多长）</span><span class="control-value" data-val="years"></span></div>
            <input type="range" data-k="years" min="3" max="35" step="1" value="${state.years}">
          </div>
        </div>
        <div>
          <div class="control-group">
            <div class="control-label"><span>预期年化收益率（宽基长期约 7%~10%）</span><span class="control-value" data-val="annualReturnPct"></span></div>
            <input type="range" data-k="annualReturnPct" min="0" max="15" step="0.5" value="${state.annualReturnPct}">
          </div>
          <div class="control-group">
            <div class="control-label"><span>长期年均通胀率（通常约 2%~3.5%）</span><span class="control-value" data-val="inflationPct"></span></div>
            <input type="range" data-k="inflationPct" min="0" max="7" step="0.5" value="${state.inflationPct}">
          </div>
          <div class="eli5-box" id="cmp-milktea" style="margin:8px 0 0;padding:12px 14px;font-size:13px;"></div>
        </div>
      </div>

      <div id="lab-output"></div>
    </div>
  `;

  const output = container.querySelector('#lab-output');
  const update = () => {
    const res = calcCompoundAndInflation(state);
    const s = res.summary;
    container.querySelector('[data-val="initial"]').textContent = fmtYuan(state.initial);
    container.querySelector('[data-val="monthly"]').textContent = `${fmtYuan(state.monthly)}/月`;
    container.querySelector('[data-val="years"]').textContent = `${state.years} 年`;
    container.querySelector('[data-val="annualReturnPct"]').textContent = `${state.annualReturnPct}%`;
    container.querySelector('[data-val="inflationPct"]').textContent = `${state.inflationPct}%`;
    container.querySelector('#cmp-r72').textContent = s.rule72Years === Infinity ? '∞' : `${s.rule72Years} 年翻倍`;
    container.querySelector('#cmp-milktea').innerHTML = `
      <strong>🧋 奶茶购买力实测：</strong>${state.years} 年后，一杯现在 18 元的奶茶将涨到 <strong>${s.milkTeaPriceFuture} 元</strong>！<br>
      同样攒下 ${fmtYuan(s.totalPrincipal)}：纯存现金缩水到只能买 <strong>${s.milkTeaCupsCash.toLocaleString()} 杯</strong>，而坚持复利投资能买到 <strong>${s.milkTeaCupsInvest.toLocaleString()} 杯</strong>！
    `;

    const chart = renderLineChart({
      labels: res.series.map((d) => `第${d.year}年`),
      series: [
        { name: '复利投资账户（名义金额）', color: '#4f46e5', values: res.series.map((d) => d.investedNominal), fill: true },
        { name: '复利真实购买力（扣通胀）', color: '#059669', values: res.series.map((d) => d.investedReal) },
        { name: '累计投入本金', color: '#94a3b8', values: res.series.map((d) => d.principal), dashed: true },
        { name: '纯存现金真实购买力', color: '#dc2626', values: res.series.map((d) => d.cashReal), dashed: true }
      ]
    });

    output.innerHTML = `
      <div class="grid-4" style="margin-bottom:16px;">
        <div class="stat-card">
          <div class="stat-label">累计掏腰包本金</div>
          <div class="stat-value">${fmtYuan(s.totalPrincipal)}</div>
          <div class="stat-sub">辛苦攒下的老本</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">复利账户最终金额</div>
          <div class="stat-value" style="color:var(--brand);">${fmtYuan(s.investedNominal)}</div>
          <div class="stat-sub">其中复利白赚 ${fmtYuan(s.nominalGain)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">复利真实购买力</div>
          <div class="stat-value" style="color:var(--success);">${fmtYuan(s.investedReal)}</div>
          <div class="stat-sub">扣除通胀后折合今天的钱</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">纯存现金被通胀偷走</div>
          <div class="stat-value" style="color:var(--danger);">-${fmtYuan(s.inflationLossOnCash)}</div>
          <div class="stat-sub">实际购买力仅剩 ${fmtYuan(s.cashReal)}</div>
        </div>
      </div>
      ${chart}
    `;
  };

  container.querySelectorAll('input[type="range"]').forEach((el) => {
    el.addEventListener('input', (e) => {
      state[e.target.dataset.k] = Number(e.target.value);
      notify();
      update();
    });
  });
  update();
}

/* --------------------------------------------------------------------------
   实验室 2：奶茶店 IPO 估值模拟器
   -------------------------------------------------------------------------- */
function mountValuationLab(container, notify) {
  const state = { annualProfit: 25, growthRatePct: 15, sentimentScore: 0, netAssets: 120 };

  container.innerHTML = `
    <div class="lab-panel">
      <div class="lab-header">
        <div>
          <span class="lab-badge">🧪 互动实验室 2</span>
          <h3 style="margin:6px 0 4px;">🧋 "阿强奶茶" IPO 估值模拟器</h3>
          <p style="margin:0;font-size:13.5px;color:var(--text-secondary);">假设阿强奶茶总共发行 10 万股。试着调整店里赚钱能力与市场情绪，秒懂股价、PE、PB、ROE 怎么互动！</p>
        </div>
        <div id="val-verdict" style="padding:8px 14px;border-radius:10px;font-weight:800;font-size:13.5px;"></div>
      </div>

      <div class="grid-2" style="margin-bottom:16px;">
        <div>
          <div class="control-group">
            <div class="control-label"><span>奶茶店年净利润（赚钱硬实力）</span><span class="control-value" data-val="annualProfit"></span></div>
            <input type="range" data-k="annualProfit" min="5" max="100" step="5" value="${state.annualProfit}">
          </div>
          <div class="control-group">
            <div class="control-label"><span>预计未来年利润增速</span><span class="control-value" data-val="growthRatePct"></span></div>
            <input type="range" data-k="growthRatePct" min="0" max="45" step="5" value="${state.growthRatePct}">
          </div>
        </div>
        <div>
          <div class="control-group">
            <div class="control-label"><span>店里净家当（净资产）</span><span class="control-value" data-val="netAssets"></span></div>
            <input type="range" data-k="netAssets" min="40" max="300" step="10" value="${state.netAssets}">
          </div>
          <div class="control-group">
            <div class="control-label"><span>市场情绪（小狗跑在主人前面还是后面）</span><span class="control-value" data-val="sentimentScore"></span></div>
            <input type="range" data-k="sentimentScore" min="-50" max="50" step="5" value="${state.sentimentScore}">
          </div>
        </div>
      </div>

      <div id="lab-output"></div>
    </div>
  `;

  const output = container.querySelector('#lab-output');
  const verdictEl = container.querySelector('#val-verdict');

  const update = () => {
    const v = calcMilkTeaValuation(state);
    const sentimentText =
      state.sentimentScore <= -25
        ? '极度恐慌抛售'
        : state.sentimentScore < -5
        ? '市场偏冷悲观'
        : state.sentimentScore <= 10
        ? '理性平静'
        : state.sentimentScore <= 30
        ? '热门追捧'
        : '全网疯狂炒作';

    container.querySelector('[data-val="annualProfit"]').textContent = `${state.annualProfit} 万元/年`;
    container.querySelector('[data-val="growthRatePct"]').textContent = `+${state.growthRatePct}% / 年`;
    container.querySelector('[data-val="netAssets"]').textContent = `${state.netAssets} 万元`;
    container.querySelector('[data-val="sentimentScore"]').textContent = `${sentimentText} (${state.sentimentScore > 0 ? '+' : ''}${state.sentimentScore})`;

    const toneMap = {
      good: 'background:var(--success-soft);color:var(--success);border:1px solid var(--success);',
      danger: 'background:var(--danger-soft);color:var(--danger);border:1px solid var(--danger);',
      warning: 'background:var(--warning-soft);color:var(--warning);border:1px solid var(--warning);',
      neutral: 'background:var(--brand-soft);color:var(--brand);border:1px solid var(--brand);'
    };
    verdictEl.style.cssText = `padding:8px 14px;border-radius:10px;font-weight:800;font-size:13.5px;${toneMap[v.verdictTone]}`;
    verdictEl.textContent = `估值诊断：${v.verdict}`;

    output.innerHTML = `
      <div class="grid-4" style="margin-bottom:14px;">
        <div class="stat-card">
          <div class="stat-label">当前市场股价 / 理性价</div>
          <div class="stat-value" style="color:var(--brand);">¥${v.sharePrice}</div>
          <div class="stat-sub">理性参考价：¥${v.fairSharePrice}（总市值 ${v.marketCap} 万）</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">市盈率 PE（几年回本）</div>
          <div class="stat-value">${v.marketPE} 倍</div>
          <div class="stat-sub">理性参考 PE：${v.fairPE} 倍${v.peg !== null ? ` · PEG ${v.peg}` : ''}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">市净率 PB（按家当几倍卖）</div>
          <div class="stat-value">${v.pb} 倍</div>
          <div class="stat-sub">${v.pb < 1 ? '低于净家当（破净）' : '高于净家当（含品牌溢价）'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">净资产收益率 ROE（赚钱效率）</div>
          <div class="stat-value" style="color:${v.roe >= 15 ? 'var(--success)' : 'var(--text-primary)'};">${v.roe}%</div>
          <div class="stat-sub">${v.roe >= 15 ? '🌟 超过 15%！巴菲特式印钞机' : '普通生意水平'}</div>
        </div>
      </div>

      <div class="eli5-box" style="margin:0;">
        <div class="eli5-box-title">💡 ELI5 投资人一眼看穿</div>
        <p style="margin:0;font-size:14px;">${v.eli5Advice}</p>
      </div>
    `;
  };

  container.querySelectorAll('input[type="range"]').forEach((el) => {
    el.addEventListener('input', (e) => {
      state[e.target.dataset.k] = Number(e.target.value);
      notify();
      update();
    });
  });
  update();
}

/* --------------------------------------------------------------------------
   实验室 3：市场走向四维推演仪 + K线/多空拔河
   -------------------------------------------------------------------------- */
function mountCompassLab(container, notify) {
  const state = { earnings: 35, liquidity: 30, policy: 20, sentiment: 10 };
  const presets = [
    { name: '🚀 慢牛起飞', v: { earnings: 45, liquidity: 40, policy: 30, sentiment: 10 } },
    { name: '🔥 狂热泡沫顶', v: { earnings: 35, liquidity: 20, policy: 0, sentiment: 90 } },
    { name: '❄️ 恐慌熊市底', v: { earnings: -40, liquidity: -35, policy: -10, sentiment: -85 } },
    { name: '🌊 政策救市拐点', v: { earnings: -15, liquidity: 70, policy: 80, sentiment: -40 } }
  ];

  container.innerHTML = `
    <div class="lab-panel">
      <div class="lab-header">
        <div>
          <span class="lab-badge">🧪 互动实验室 3</span>
          <h3 style="margin:6px 0 4px;">🧭 股市走向四维推演仪（含实时 K 线与拔河图）</h3>
          <p style="margin:0;font-size:13.5px;color:var(--text-secondary);">拨动决定大盘走势的四个开关，或点一键预设剧本，直观感受多空力量如何画出 K 线走势！</p>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${presets.map((p, idx) => `<button class="btn btn-outline btn-sm" data-preset="${idx}">${p.name}</button>`).join('')}
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:14px;">
        <div>
          <div class="control-group">
            <div class="control-label"><span>1. 基本面（企业整体盈利增长）</span><span class="control-value" data-val="earnings"></span></div>
            <input type="range" data-k="earnings" min="-100" max="100" step="5" value="${state.earnings}">
          </div>
          <div class="control-group">
            <div class="control-label"><span>2. 资金面（央行放水降息 vs 加息抽水）</span><span class="control-value" data-val="liquidity"></span></div>
            <input type="range" data-k="liquidity" min="-100" max="100" step="5" value="${state.liquidity}">
          </div>
        </div>
        <div>
          <div class="control-group">
            <div class="control-label"><span>3. 政策面（减税鼓励 vs 监管收紧）</span><span class="control-value" data-val="policy"></span></div>
            <input type="range" data-k="policy" min="-100" max="100" step="5" value="${state.policy}">
          </div>
          <div class="control-group">
            <div class="control-label"><span>4. 情绪面（恐慌冰点 -100 ~ +100 狂热追高）</span><span class="control-value" data-val="sentiment"></span></div>
            <input type="range" data-k="sentiment" min="-100" max="100" step="5" value="${state.sentiment}">
          </div>
        </div>
      </div>

      <div id="lab-output"></div>
    </div>
  `;

  const output = container.querySelector('#lab-output');
  const update = () => {
    for (const k of ['earnings', 'liquidity', 'policy', 'sentiment']) {
      container.querySelector(`[data-val="${k}"]`).textContent = `${state[k] > 0 ? '+' : ''}${state[k]}`;
    }
    const res = calcMarketCompass(state);
    const chartHtml = renderCandlestickChart(res.candles);
    const tempColor =
      res.temperature >= 75 ? 'var(--danger)' : res.temperature <= 28 ? 'var(--success)' : 'var(--brand)';

    output.innerHTML = `
      <div class="grid-3" style="margin-bottom:14px;">
        <div class="stat-card">
          <div class="stat-label">综合市场状态判定</div>
          <div class="stat-value" style="font-size:17px;">${res.regime}</div>
          <div class="stat-sub">模拟阶段涨跌幅：<strong class="${res.totalChangePct >= 0 ? 'text-up' : 'text-down'}">${res.totalChangePct >= 0 ? '+' : ''}${res.totalChangePct}%</strong></div>
        </div>
        <div class="stat-card">
          <div class="stat-label">🌡️ 市场情绪温度计</div>
          <div class="stat-value" style="color:${tempColor};">${res.temperature} ℃</div>
          <div class="stat-sub">${res.temperature >= 75 ? '过热烫手！警惕泡沫' : res.temperature <= 28 ? '冰点打折！留意机会' : '体温正常区间'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">🪢 多空拔河力量比</div>
          <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin:4px 0;">
            <span class="text-up">买方(多头) ${res.bullPower}%</span>
            <span class="text-down">卖方(空头) ${res.bearPower}%</span>
          </div>
          <div style="height:10px;border-radius:999px;overflow:hidden;display:flex;background:var(--border-color);">
            <div style="width:${res.bullPower}%;background:var(--market-up);"></div>
            <div style="width:${res.bearPower}%;background:var(--market-down);"></div>
          </div>
        </div>
      </div>

      ${chartHtml}

      <div class="eli5-box" style="margin:14px 0 0;">
        <div class="eli5-box-title">🎙️ 天气预报员 ELI5 解读</div>
        <p style="margin:0 0 6px;font-size:14px;">${res.eli5Summary}</p>
        <p style="margin:0;font-size:13.5px;font-weight:700;color:var(--brand);">👉 应对思路：${res.actionHint}</p>
      </div>
    `;
  };

  container.querySelectorAll('input[type="range"]').forEach((el) => {
    el.addEventListener('input', (e) => {
      state[e.target.dataset.k] = Number(e.target.value);
      notify();
      update();
    });
  });
  container.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = presets[Number(btn.dataset.preset)];
      Object.assign(state, p.v);
      for (const [k, val] of Object.entries(p.v)) {
        const input = container.querySelector(`input[data-k="${k}"]`);
        if (input) input.value = String(val);
      }
      notify();
      update();
    });
  });
  update();
}

/* --------------------------------------------------------------------------
   实验室 4：基金费率放大镜
   -------------------------------------------------------------------------- */
function mountFundFeeLab(container, notify) {
  const state = { initial: 100000, years: 15, grossReturnPct: 9, activeFeePct: 1.75, indexFeePct: 0.2 };

  container.innerHTML = `
    <div class="lab-panel">
      <div class="lab-header">
        <div>
          <span class="lab-badge">🧪 互动实验室 4</span>
          <h3 style="margin:6px 0 4px;">🔍 基金费率放大镜：蚂蚁是怎么啃掉利润的？</h3>
          <p style="margin:0;font-size:13.5px;color:var(--text-secondary);">假设两只基金底层投资水平完全一样，只比较费率差异，拖动滑块实测复利差距！</p>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:14px;">
        <div>
          <div class="control-group">
            <div class="control-label"><span>一次性投入本金</span><span class="control-value" data-val="initial"></span></div>
            <input type="range" data-k="initial" min="10000" max="500000" step="10000" value="${state.initial}">
          </div>
          <div class="control-group">
            <div class="control-label"><span>持有年限</span><span class="control-value" data-val="years"></span></div>
            <input type="range" data-k="years" min="3" max="30" step="1" value="${state.years}">
          </div>
        </div>
        <div>
          <div class="control-group">
            <div class="control-label"><span>市场毛年化收益率</span><span class="control-value" data-val="grossReturnPct"></span></div>
            <input type="range" data-k="grossReturnPct" min="4" max="14" step="0.5" value="${state.grossReturnPct}">
          </div>
          <div class="control-group">
            <div class="control-label"><span>高费率主动基金综合年费</span><span class="control-value" data-val="activeFeePct"></span></div>
            <input type="range" data-k="activeFeePct" min="0.5" max="2.5" step="0.05" value="${state.activeFeePct}">
          </div>
        </div>
      </div>

      <div id="lab-output"></div>
    </div>
  `;

  const output = container.querySelector('#lab-output');
  const update = () => {
    container.querySelector('[data-val="initial"]').textContent = fmtYuan(state.initial);
    container.querySelector('[data-val="years"]').textContent = `${state.years} 年`;
    container.querySelector('[data-val="grossReturnPct"]').textContent = `${state.grossReturnPct}%`;
    container.querySelector('[data-val="activeFeePct"]').textContent = `${state.activeFeePct}%/年`;

    const res = calcFundFeeDrag(state);
    const s = res.summary;
    const chart = renderLineChart({
      labels: res.series.map((d) => `第${d.year}年`),
      series: [
        { name: '理论无费率收益', color: '#94a3b8', values: res.series.map((d) => d.noFee), dashed: true },
        { name: `低费率宽基 ETF (${state.indexFeePct}%/年)`, color: '#059669', values: res.series.map((d) => d.indexFund), fill: true },
        { name: `高费率主动基金 (${state.activeFeePct}%/年 + 申购费)`, color: '#dc2626', values: res.series.map((d) => d.activeFund) }
      ]
    });

    output.innerHTML = `
      <div class="grid-3" style="margin-bottom:14px;">
        <div class="stat-card">
          <div class="stat-label">低费率宽基 ETF 最终到手</div>
          <div class="stat-value" style="color:var(--success);">${fmtYuan(s.finalIndex)}</div>
          <div class="stat-sub">仅支付极少费率 ${fmtYuan(s.indexFeeLost)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">高费率主动基金最终到手</div>
          <div class="stat-value" style="color:var(--danger);">${fmtYuan(s.finalActive)}</div>
          <div class="stat-sub">被费率悄悄吃掉 ${fmtYuan(s.activeFeeLost)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">选低费率 ETF 白白多留住</div>
          <div class="stat-value" style="color:var(--brand);">+${fmtYuan(s.extraKeptByIndex)}</div>
          <div class="stat-sub">相当于吞噬了毛利润的 ${s.activeDragSharePct}%</div>
        </div>
      </div>
      ${chart}
    `;
  };

  container.querySelectorAll('input[type="range"]').forEach((el) => {
    el.addEventListener('input', (e) => {
      state[e.target.dataset.k] = Number(e.target.value);
      notify();
      update();
    });
  });
  update();
}

/* --------------------------------------------------------------------------
   实验室 5：ETF 微笑曲线定投实验室
   -------------------------------------------------------------------------- */
function mountDcaLab(container, notify) {
  const state = { scenario: 'smile', monthlyAmount: 1000 };
  const tabs = [
    { id: 'smile', label: '😊 经典微笑曲线' },
    { id: 'inverted', label: '😟 倒微笑警示' },
    { id: 'volatileUp', label: '📈 震荡慢牛' },
    { id: 'deepBear', label: '🐻 漫长深熊' }
  ];

  container.innerHTML = `
    <div class="lab-panel">
      <div class="lab-header">
        <div>
          <span class="lab-badge">🧪 互动实验室 5</span>
          <h3 style="margin:6px 0 4px;">😊 ETF 微笑曲线定投实验室（24 个月实测）</h3>
          <p id="dca-desc" style="margin:0;font-size:13.5px;color:var(--text-secondary);"></p>
        </div>
        <div class="seg-tabs">
          ${tabs.map((t) => `<button class="seg-tab ${state.scenario === t.id ? 'active' : ''}" data-sc="${t.id}">${t.label}</button>`).join('')}
        </div>
      </div>

      <div class="control-group" style="max-width:400px;">
        <div class="control-label"><span>每月固定定投金额</span><span class="control-value" data-val="monthlyAmount"></span></div>
        <input type="range" id="dca-amt" min="500" max="5000" step="500" value="${state.monthlyAmount}">
      </div>

      <div id="lab-output"></div>
    </div>
  `;

  const output = container.querySelector('#lab-output');
  const update = () => {
    container.querySelector('[data-val="monthlyAmount"]').textContent = `${fmtYuan(state.monthlyAmount)}/月`;
    container.querySelectorAll('[data-sc]').forEach((b) => {
      b.classList.toggle('active', b.dataset.sc === state.scenario);
    });

    const res = calcDcaSmileCurve(state);
    const s = res.summary;
    container.querySelector('#dca-desc').textContent = res.meta.desc;

    const labels = res.series.map((d) => `${d.month}月`);
    const priceChart = renderLineChart({
      labels,
      height: 210,
      valueFormatter: (v) => v.toFixed(2),
      series: [
        { name: 'ETF 市场价格走势', color: '#4f46e5', values: res.series.map((d) => d.price), fill: true },
        { name: '普通定投平均持仓成本线', color: '#d97706', values: res.series.map((d) => d.dcaAvgCost), dashed: true }
      ]
    });
    const retChart = renderLineChart({
      labels,
      height: 210,
      zeroLine: true,
      valueFormatter: (v) => `${v > 0 ? '+' : ''}${Math.round(v)}%`,
      series: [
        { name: '普通定投收益率 (%)', color: '#059669', values: res.series.map((d) => d.dcaReturnPct) },
        { name: '智能低估加倍定投 (%)', color: '#9333ea', values: res.series.map((d) => d.smartReturnPct) },
        { name: '期初一把梭哈收益率 (%)', color: '#dc2626', values: res.series.map((d) => d.lumpReturnPct), dashed: true }
      ]
    });

    const fmtRet = (r) => `<span class="${r >= 0 ? 'text-up' : 'text-down'}">${r >= 0 ? '+' : ''}${r}%</span>`;
    output.innerHTML = `
      <div class="grid-3" style="margin-bottom:14px;">
        <div class="stat-card">
          <div class="stat-label">期初一把梭哈最终收益</div>
          <div class="stat-value">${fmtRet(s.lumpReturnPct)}</div>
          <div class="stat-sub">投入 ${fmtYuan(s.lumpInvested)} → 市值 ${fmtYuan(s.lumpValue)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">每月普通定投最终收益</div>
          <div class="stat-value">${fmtRet(s.dcaReturnPct)}</div>
          <div class="stat-sub">均价摊低至 ${s.dcaAvgCost} 元 · 市值 ${fmtYuan(s.dcaValue)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">智能低估定投（跌深买1.5倍）</div>
          <div class="stat-value">${fmtRet(s.smartReturnPct)}</div>
          <div class="stat-sub">投入 ${fmtYuan(s.smartInvested)} → 市值 ${fmtYuan(s.smartValue)}</div>
        </div>
      </div>

      <div class="grid-2">
        <div>
          <div style="font-size:12.5px;font-weight:700;margin-bottom:6px;">📉 ETF 价格 vs 定投平均成本线（黄线越低于蓝线赚越多！）</div>
          ${priceChart}
        </div>
        <div>
          <div style="font-size:12.5px;font-weight:700;margin-bottom:6px;">🏁 三种策略实时收益率 PK（%）</div>
          ${retChart}
        </div>
      </div>

      <div class="eli5-box" style="margin:14px 0 0;">
        <div class="eli5-box-title">💡 实验结论拆解</div>
        <p style="margin:0;font-size:14px;">
          ${
            state.scenario === 'smile'
              ? `看神奇的一幕：价格最后仅仅涨回起点 1.00 元（一把梭哈一分没赚 0%），但坚持定投的人在第 <strong>${s.dcaBreakevenMonth || 16} 个月</strong>市场还跌着的时候就已经提前回本，最终怒赚 <strong>+${s.dcaReturnPct}%</strong>！智能低估定投更是高达 <strong>+${s.smartReturnPct}%</strong>！`
              : state.scenario === 'inverted'
              ? '警惕！如果先大涨后跌回原价，定投在山顶买了很多贵筹码，最后反而是亏钱的！所以定投不是无脑永久不卖，<strong>山顶过热时要分批止盈</strong>！'
              : state.scenario === 'volatileUp'
              ? '在单边慢牛中，因为前期价格便宜，期初一把梭哈总收益最高；但普通打工族本来就没有期初一大笔钱，定投依然稳稳斩获了丰厚正收益！'
              : '即使市场遭遇惨烈的单边深熊暴跌 35%，坚持定投靠不断拉低均价，把亏损幅度硬生生砍掉了近一半，只要未来市场回暖就能比梭哈者早一倍时间解套！'
          }
        </p>
      </div>
    `;
  };

  container.querySelectorAll('[data-sc]').forEach((b) => {
    b.addEventListener('click', () => {
      state.scenario = b.dataset.sc;
      notify();
      update();
    });
  });
  container.querySelector('#dca-amt')?.addEventListener('input', (e) => {
    state.monthlyAmount = Number(e.target.value);
    notify();
    update();
  });
  update();
}

/* --------------------------------------------------------------------------
   实验室 6：央行水龙头与美林时钟
   -------------------------------------------------------------------------- */
function mountMacroClockLab(container, notify) {
  const state = { gdpGrowth: 5.5, cpiInflation: 2.0, interestRate: 2.5 };

  container.innerHTML = `
    <div class="lab-panel">
      <div class="lab-header">
        <div>
          <span class="lab-badge">🧪 互动实验室 6</span>
          <h3 style="margin:6px 0 4px;">🌊 央行水龙头与美林投资时钟交互罗盘</h3>
          <p style="margin:0;font-size:13.5px;color:var(--text-secondary);">拖动经济增长、物价通胀与利率水龙头，立刻看懂世界上的大资金正在往哪个池子里涌！</p>
        </div>
        <div class="stat-card" style="padding:8px 14px;">
          <div class="stat-label">当前所处经济季节</div>
          <div class="stat-value" id="macro-phase" style="font-size:16px;color:var(--brand);"></div>
        </div>
      </div>

      <div class="grid-2" style="align-items:center;">
        <div>
          <div class="control-group">
            <div class="control-label"><span>📈 经济增长速度 (GDP)</span><span class="control-value" data-val="gdpGrowth"></span></div>
            <input type="range" data-k="gdpGrowth" min="1" max="8" step="0.5" value="${state.gdpGrowth}">
          </div>
          <div class="control-group">
            <div class="control-label"><span>🔥 物价上涨速度 (CPI 通胀)</span><span class="control-value" data-val="cpiInflation"></span></div>
            <input type="range" data-k="cpiInflation" min="0" max="7" step="0.5" value="${state.cpiInflation}">
          </div>
          <div class="control-group">
            <div class="control-label"><span>🚰 央行基准利率水龙头（中性 3.0%）</span><span class="control-value" data-val="interestRate"></span></div>
            <input type="range" data-k="interestRate" min="0.5" max="6.0" step="0.25" value="${state.interestRate}">
          </div>
          <div class="stat-card" id="macro-bond-box" style="margin-top:12px;"></div>
        </div>

        <div id="macro-clock-svg"></div>
      </div>

      <div id="lab-output"></div>
    </div>
  `;

  const output = container.querySelector('#lab-output');
  const update = () => {
    container.querySelector('[data-val="gdpGrowth"]').textContent = `${state.gdpGrowth.toFixed(1)}% ${state.gdpGrowth >= 4.5 ? '(偏强)' : '(偏弱)'}`;
    container.querySelector('[data-val="cpiInflation"]').textContent = `${state.cpiInflation.toFixed(1)}% ${state.cpiInflation >= 3.0 ? '(高通胀)' : '(温和)'}`;
    container.querySelector('[data-val="interestRate"]').textContent = `${state.interestRate.toFixed(2)}% ${state.interestRate < 3 ? '(放水宽松)' : state.interestRate > 3 ? '(加息紧缩)' : '(中性)'}`;

    const res = calcMacroClock(state);
    container.querySelector('#macro-phase').textContent = res.phaseName;
    container.querySelector('#macro-clock-svg').innerHTML = renderMerrillClockSvg(res.phase);
    container.querySelector('#macro-bond-box').innerHTML = `
      <div class="stat-label">⚖️ 利率跷跷板实测（面值 100 元的 8 年期老国债现价）</div>
      <div style="display:flex;align-items:baseline;gap:12px;margin-top:4px;flex-wrap:wrap;">
        <span class="stat-value" style="color:${res.bondPrice >= 100 ? 'var(--market-up)' : 'var(--market-down)'};">¥${res.bondPrice}</span>
        <span style="font-size:12.5px;color:var(--text-secondary);">利率相对中性变动 ${res.rateDelta > 0 ? '+' : ''}${res.rateDelta}% → 债价反向变动 ${(res.bondPrice - 100).toFixed(1)}%</span>
      </div>
    `;

    const bars = [
      { label: '股票 / 宽基 ETF', score: res.scores.stocks, color: '#4f46e5' },
      { label: '国债 / 债券 ETF', score: res.scores.bonds, color: '#059669' },
      { label: '黄金 / 大宗商品', score: res.scores.gold, color: '#d97706' },
      { label: '现金 / 货币基金', score: res.scores.cash, color: '#64748b' }
    ];

    output.innerHTML = `
      <div style="margin-top:16px;">
        <div style="font-size:13px;font-weight:700;margin-bottom:8px;">四大资产当前顺风指数（最优资产：<span style="color:var(--brand);">${res.bestAsset}</span>）</div>
        <div class="grid-2">
          ${bars
            .map(
              (b) => `
            <div>
              <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:4px;">
                <span>${b.label}</span><strong>${b.score} 分</strong>
              </div>
              <div class="progress-bar-track" style="height:10px;">
                <div style="height:100%;width:${b.score}%;background:${b.color};border-radius:999px;transition:width 0.3s;"></div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <div class="eli5-box" style="margin:16px 0 0;">
        <div class="eli5-box-title">🎙️ 宏观大白话解码</div>
        <p style="margin:0;font-size:14px;">${res.eli5Story}</p>
      </div>
    `;
  };

  container.querySelectorAll('input[type="range"]').forEach((el) => {
    el.addEventListener('input', (e) => {
      state[e.target.dataset.k] = Number(e.target.value);
      notify();
      update();
    });
  });
  update();
}

/* --------------------------------------------------------------------------
   实验室 7：全天候资产配置搭配师
   -------------------------------------------------------------------------- */
function mountPortfolioLab(container, notify) {
  const state = { stocks: 50, bonds: 30, gold: 10, cash: 10, rebalance: true };
  const presets = [
    { name: '⚡ 激进满仓股 (95/0/0/5)', v: { stocks: 95, bonds: 0, gold: 0, cash: 5 } },
    { name: '⚖️ 经典股债平衡 (60/30/5/5)', v: { stocks: 60, bonds: 30, gold: 5, cash: 5 } },
    { name: '🛡️ 达利欧全天候 (35/45/15/5)', v: { stocks: 35, bonds: 45, gold: 15, cash: 5 } },
    { name: '🐢 稳健防跌型 (20/55/10/15)', v: { stocks: 20, bonds: 55, gold: 10, cash: 15 } }
  ];

  container.innerHTML = `
    <div class="lab-panel">
      <div class="lab-header">
        <div>
          <span class="lab-badge">🧪 互动实验室 7</span>
          <h3 style="margin:6px 0 4px;">🧺 个人资产配置搭配师 & 极端行情压力测试</h3>
          <p style="margin:0;font-size:13.5px;color:var(--text-secondary);">自由调配四类资产权重（自动折算 100%），用 ¥100,000 一键在四大极端 5 年历史剧本里压力测试！</p>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${presets.map((p, idx) => `<button class="btn btn-outline btn-sm" data-preset="${idx}">${p.name}</button>`).join('')}
        </div>
      </div>

      <div class="grid-2" style="align-items:center;margin-bottom:18px;">
        <div>
          <div class="control-group">
            <div class="control-label"><span>🚀 股票 / 宽基 ETF 权重</span><span class="control-value" data-val="stocks"></span></div>
            <input type="range" data-k="stocks" min="0" max="100" step="5" value="${state.stocks}">
          </div>
          <div class="control-group">
            <div class="control-label"><span>🛡️ 国债 / 纯债基金 权重</span><span class="control-value" data-val="bonds"></span></div>
            <input type="range" data-k="bonds" min="0" max="100" step="5" value="${state.bonds}">
          </div>
          <div class="control-group">
            <div class="control-label"><span>🪙 黄金 ETF 权重</span><span class="control-value" data-val="gold"></span></div>
            <input type="range" data-k="gold" min="0" max="100" step="5" value="${state.gold}">
          </div>
          <div class="control-group">
            <div class="control-label"><span>💵 现金 / 货币基金 权重</span><span class="control-value" data-val="cash"></span></div>
            <input type="range" data-k="cash" min="0" max="100" step="5" value="${state.cash}">
          </div>
          <label style="display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:700;cursor:pointer;margin-top:8px;">
            <input type="checkbox" id="rebal-chk" ${state.rebalance ? 'checked' : ''} style="width:16px;height:16px;">
            开启「每年底自动动态再平衡」（自动高抛低吸恢复原比例）
          </label>
        </div>
        <div id="port-donut"></div>
      </div>

      <div id="lab-output"></div>
    </div>
  `;

  const output = container.querySelector('#lab-output');
  const donutBox = container.querySelector('#port-donut');

  const update = () => {
    const res = calcPortfolioBacktest({
      weights: { stocks: state.stocks, bonds: state.bonds, gold: state.gold, cash: state.cash },
      rebalance: state.rebalance
    });
    const w = res.weightsPct;

    container.querySelector('[data-val="stocks"]').textContent = `${w.stocks}%`;
    container.querySelector('[data-val="bonds"]').textContent = `${w.bonds}%`;
    container.querySelector('[data-val="gold"]').textContent = `${w.gold}%`;
    container.querySelector('[data-val="cash"]').textContent = `${w.cash}%`;

    donutBox.innerHTML = `
      ${renderDonutChart([
        { label: '股票 / 宽基 ETF', value: w.stocks, color: '#4f46e5' },
        { label: '国债 / 纯债基金', value: w.bonds, color: '#059669' },
        { label: '黄金 ETF', value: w.gold, color: '#d97706' },
        { label: '现金 / 货币基金', value: w.cash, color: '#64748b' }
      ])}
      <div style="text-align:center;margin-top:12px;font-size:13px;font-weight:700;color:var(--brand);">
        当前组合风格：${res.profile}
      </div>
    `;

    output.innerHTML = `
      <div class="grid-2">
        ${res.results
          .map(
            (r) => `
          <div class="stat-card" style="background:var(--bg-surface);">
            <div style="font-weight:800;font-size:14px;margin-bottom:4px;">${r.name}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">${r.desc}</div>
            <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px;">
              <div>
                <div class="stat-label">5 年后最终资产</div>
                <div class="stat-value" style="font-size:18px;">${fmtYuan(r.finalValue)}</div>
              </div>
              <div>
                <div class="stat-label">总收益 / 年化</div>
                <div style="font-family:var(--font-mono);font-weight:800;font-size:14px;" class="${r.totalReturnPct >= 0 ? 'text-up' : 'text-down'}">
                  ${r.totalReturnPct >= 0 ? '+' : ''}${r.totalReturnPct}% (${r.cagrPct >= 0 ? '+' : ''}${r.cagrPct}%/年)
                </div>
              </div>
              <div>
                <div class="stat-label">最大回撤（最惨浮亏）</div>
                <div style="font-family:var(--font-mono);font-weight:800;font-size:14px;color:${r.maxDrawdownPct > 25 ? 'var(--danger)' : 'var(--success)'};">
                  -${r.maxDrawdownPct}%
                </div>
              </div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  };

  container.querySelectorAll('input[type="range"]').forEach((el) => {
    el.addEventListener('input', (e) => {
      state[e.target.dataset.k] = Number(e.target.value);
      notify();
      update();
    });
  });
  container.querySelector('#rebal-chk')?.addEventListener('change', (e) => {
    state.rebalance = e.target.checked;
    notify();
    update();
  });
  container.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = presets[Number(btn.dataset.preset)];
      Object.assign(state, p.v);
      for (const [k, val] of Object.entries(p.v)) {
        const input = container.querySelector(`input[data-k="${k}"]`);
        if (input) input.value = String(val);
      }
      notify();
      update();
    });
  });
  update();
}
