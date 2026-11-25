/**
 * 第八篇毕业级实战沙盒（10年穿越牛熊模拟器）+ 现实世界市场走向 5 步实战分析工具
 */

import {
  SIM_ASSETS,
  MARKET_QUARTERS,
  createSimState,
  getPortfolioSnapshot,
  tradeAsset,
  applyPresetAllocation,
  advanceQuarter,
  generateGraduationReport
} from '../engine/marketSimulator.js';
import { MARKET_CHECKLIST_ITEMS } from '../data/curriculumPart2.js';
import { renderLineChart, renderDonutChart } from '../charts/svgCharts.js';

function fmtSimYuan(n) {
  return '¥' + Math.round(n).toLocaleString('zh-CN');
}

// 保持沙盒会话状态，切换页面回来不丢失进度
let sharedSimState = createSimState(100000);

export function mountTenYearSandbox(container, onFinish) {
  const render = () => {
    const state = sharedSimState;
    const snap = getPortfolioSnapshot(state);
    const currentQ = MARKET_QUARTERS[Math.min(state.quarterIndex, MARKET_QUARTERS.length - 1)];
    const prevQ = state.quarterIndex > 0 ? MARKET_QUARTERS[state.quarterIndex - 1] : null;
    const progressPct = Math.round((state.quarterIndex / MARKET_QUARTERS.length) * 100);

    const chartHtml = renderLineChart({
      labels: state.history.map((h) => h.label),
      height: 235,
      series: [
        { name: '你的投资组合总资产', color: '#4f46e5', values: state.history.map((h) => h.portfolioValue), fill: true },
        { name: '全仓宽基ETF基准', color: '#059669', values: state.history.map((h) => h.broadBenchmark), dashed: true },
        { name: '追涨杀跌小明(反面)', color: '#dc2626', values: state.history.map((h) => h.fomoXiaomingBenchmark), dashed: true },
        { name: '纯存现金基准', color: '#94a3b8', values: state.history.map((h) => h.cashOnlyBenchmark), dashed: true }
      ]
    });

    let reportHtml = '';
    if (state.finished) {
      const rep = generateGraduationReport(state);
      if (typeof onFinish === 'function') onFinish(rep);
      reportHtml = `
        <div class="card" style="border:2px solid var(--brand);background:var(--brand-soft);margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
            <div>
              <div style="font-size:12.5px;font-weight:700;color:var(--brand);">🎓 10 年投资长跑毕业体检报告</div>
              <h2 style="margin:4px 0;">${rep.badge}</h2>
              <p style="margin:0;font-size:14px;max-width:640px;">${rep.summary}</p>
            </div>
            <div style="text-align:center;background:var(--bg-surface);padding:14px 22px;border-radius:14px;border:1px solid var(--border-color);">
              <div style="font-size:12px;color:var(--text-muted);">综合投资素养评分</div>
              <div style="font-size:32px;font-weight:900;color:var(--brand);font-family:var(--font-mono);">${rep.score}</div>
            </div>
          </div>

          <div class="grid-4" style="margin-top:16px;">
            <div class="stat-card" style="background:var(--bg-surface);">
              <div class="stat-label">最终总资产 / 累计投入</div>
              <div class="stat-value" style="font-size:17px;">${fmtSimYuan(rep.finalValue)}</div>
              <div class="stat-sub">本金 ${fmtSimYuan(rep.totalDeposited)} · 净赚 ${fmtSimYuan(rep.totalProfit)}</div>
            </div>
            <div class="stat-card" style="background:var(--bg-surface);">
              <div class="stat-label">总收益率 / 估算年化</div>
              <div class="stat-value ${rep.totalReturnPct >= 0 ? 'text-up' : 'text-down'}" style="font-size:17px;">${rep.totalReturnPct >= 0 ? '+' : ''}${rep.totalReturnPct}%</div>
              <div class="stat-sub">近似年化 ${rep.approxAnnualizedPct >= 0 ? '+' : ''}${rep.approxAnnualizedPct}%</div>
            </div>
            <div class="stat-card" style="background:var(--bg-surface);">
              <div class="stat-label">过程最大回撤</div>
              <div class="stat-value" style="font-size:17px;color:${rep.maxDrawdownPct <= 20 ? 'var(--success)' : 'var(--warning)'};">-${rep.maxDrawdownPct}%</div>
              <div class="stat-sub">恐慌割肉 ${rep.panicSellCount} 次 · 追高 ${rep.fomoBuyCount} 次</div>
            </div>
            <div class="stat-card" style="background:var(--bg-surface);">
              <div class="stat-label">PK 三大基准结果</div>
              <div style="font-size:12.5px;line-height:1.7;margin-top:2px;">
                ${rep.beatCash ? '✅' : '❌'} 跑赢纯现金 (${fmtSimYuan(rep.cashOnlyBenchmark)})<br>
                ${rep.beatXiaoming ? '✅' : '❌'} 跑赢追涨小明 (${fmtSimYuan(rep.fomoXiaomingBenchmark)})<br>
                ${rep.beatBroad ? '✅' : '⚖️'} 对比宽基躺平 (${fmtSimYuan(rep.broadBenchmark)})
              </div>
            </div>
          </div>

          <div style="margin-top:16px;">
            <button class="btn btn-primary" id="sim-restart-btn">🔄 再开启一轮新的 10 年挑战</button>
          </div>
        </div>
      `;
    }

    const tempColor =
      currentQ.temp >= 75 ? 'var(--danger)' : currentQ.temp <= 28 ? 'var(--success)' : 'var(--brand)';

    container.innerHTML = `
      <div>
        <div class="hero-card" style="padding:24px 28px;margin-bottom:18px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px;">
            <div>
              <div class="hero-tag">🎮 第八篇 · 毕业级综合实战演练</div>
              <h1 class="hero-title" style="font-size:24px;">10 年穿越牛熊全景市场模拟器</h1>
              <p style="margin:0;font-size:14px;">初始资金 ¥100,000，每季度新增 ¥3,000 工资结余。运用学到的估值、ETF、宏观周期与资产配置知识，走完 40 个季度（10年）完整牛熊大周期！</p>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button class="btn btn-ghost-light btn-sm" id="sim-toggle-eli5">${state.showEli5Advisor ? '💡 隐藏 ELI5 锦囊（高手模式）' : '💡 开启 ELI5 导师锦囊'}</button>
              <button class="btn btn-ghost-light btn-sm" id="sim-reset-top">🔄 重新开始</button>
            </div>
          </div>
          <div style="margin-top:14px;">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;opacity:0.9;">
              <span>当前进度：${state.finished ? '已完成全部 40 个季度！' : `${currentQ.label}（${currentQ.phase}）`}</span>
              <span>${state.quarterIndex} / 40 季度 (${progressPct}%)</span>
            </div>
            <div class="progress-bar-track" style="background:rgba(255,255,255,0.22);">
              <div class="progress-bar-fill" style="width:${progressPct}%;background:#fbbf24;"></div>
            </div>
          </div>
        </div>

        ${reportHtml}

        <!-- 核心资产面板 -->
        <div class="grid-4" style="margin-bottom:16px;">
          <div class="stat-card">
            <div class="stat-label">账户总资产</div>
            <div class="stat-value" style="color:var(--brand);">${fmtSimYuan(snap.totalValue)}</div>
            <div class="stat-sub">累计本金 ${fmtSimYuan(state.totalDeposited)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">累计总盈亏</div>
            <div class="stat-value ${snap.totalProfit >= 0 ? 'text-up' : 'text-down'}">${snap.totalProfit >= 0 ? '+' : ''}${fmtSimYuan(snap.totalProfit)}</div>
            <div class="stat-sub">总收益率 ${snap.totalReturnPct >= 0 ? '+' : ''}${snap.totalReturnPct}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">可用现金（货币基金）</div>
            <div class="stat-value">${fmtSimYuan(snap.cash)}</div>
            <div class="stat-sub">占总资产 ${Math.round((snap.cash / Math.max(1, snap.totalValue)) * 100)}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">🌡️ 当前市场温度 / 宽基 PE</div>
            <div class="stat-value" style="color:${tempColor};">${currentQ.temp}℃ <span style="font-size:14px;color:var(--text-secondary);">/ ${currentQ.pe}倍</span></div>
            <div class="stat-sub">GDP ${currentQ.gdp}% · CPI ${currentQ.cpi}% · 利率 ${currentQ.rate}%</div>
          </div>
        </div>

        <!-- 季度新闻与 ELI5 锦囊 -->
        <div class="sim-news-banner">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px;">
            <strong>📰 ${state.finished ? '十年终章回顾' : `${currentQ.label} 市场情报简报`} · 【${currentQ.phase}】</strong>
            ${
              !state.finished
                ? `<div style="display:flex;gap:8px;flex-wrap:wrap;">
                     <button class="btn btn-primary btn-sm" id="sim-next-q">▶ 推进 1 个季度</button>
                     <button class="btn btn-outline btn-sm" id="sim-next-year">⏩ 快进 1 年 (4季度)</button>
                   </div>`
                : ''
            }
          </div>
          <p style="margin:0 0 8px;font-size:14px;">${currentQ.news}</p>
          ${
            state.showEli5Advisor
              ? `<div style="font-size:13px;color:var(--eli5-accent);background:var(--bg-surface);padding:9px 12px;border-radius:8px;border:1px dashed var(--eli5-border);">
                   <strong>🧒 ELI5 导师锦囊：</strong>${currentQ.eli5Tip}
                 </div>`
              : ''
          }
        </div>

        <!-- 交易与一键配置面板 -->
        ${
          !state.finished
            ? `
          <div class="card" style="margin-bottom:18px;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
              <div>
                <h3 style="margin:0 0 2px;">💼 资产买卖与一键调仓</h3>
                <div style="font-size:12.5px;color:var(--text-muted);">每次可按 ¥10,000 或全仓买卖，也可一键切换经典全天候配置！</div>
              </div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                <button class="btn btn-outline btn-sm" data-alloc="balanced">⚖️ 一键平衡(宽基40/红利15/国债25/金10/现10)</button>
                <button class="btn btn-outline btn-sm" data-alloc="aggressive">🚀 一键进取(宽基45/科技35/金10/现10)</button>
                <button class="btn btn-outline btn-sm" data-alloc="defense">🛡️ 一键防御(红利15/国债40/金20/现25)</button>
              </div>
            </div>

            <!-- 自动定投设置条 -->
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 14px;background:var(--bg-subtle);border-radius:10px;margin-bottom:14px;font-size:13px;">
              <label style="display:flex;align-items:center;gap:6px;font-weight:700;cursor:pointer;">
                <input type="checkbox" id="sim-dca-toggle" ${state.autoDcaEnabled ? 'checked' : ''}>
                每季度 ¥3,000 结余自动定投到：
              </label>
              <select id="sim-dca-target" style="padding:5px 10px;border-radius:8px;border:1px solid var(--border-strong);background:var(--bg-surface);">
                ${SIM_ASSETS.map(
                  (a) =>
                    `<option value="${a.id}" ${state.autoDcaTarget === a.id ? 'selected' : ''}>${a.name}</option>`
                ).join('')}
              </select>
              <span style="color:var(--text-muted);font-size:12px;">（关闭则自动存入现金/货币基金）</span>
            </div>

            <div class="asset-row header">
              <div>资产名称与特性</div>
              <div>当前净值</div>
              <div>上季涨跌</div>
              <div>持有市值 (占比)</div>
              <div>快捷买卖操作</div>
            </div>
            ${SIM_ASSETS.map((a) => {
              const val = snap.breakdown[a.id] || 0;
              const pctShare = Math.round((val / Math.max(1, snap.totalValue)) * 100);
              const lastChg = prevQ ? prevQ.returns[a.id] : 0;
              return `
                <div class="asset-row">
                  <div>
                    <div style="font-weight:800;display:flex;align-items:center;gap:6px;">
                      <span class="legend-dot" style="background:${a.color}"></span>${a.name}
                      <span style="font-size:11px;padding:1px 6px;border-radius:999px;background:var(--bg-subtle);color:var(--text-muted);font-weight:600;">${a.riskLevel}风险</span>
                    </div>
                    <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${a.eli5}</div>
                  </div>
                  <div style="font-family:var(--font-mono);font-weight:700;">¥${state.prices[a.id].toFixed(2)}</div>
                  <div style="font-family:var(--font-mono);font-weight:700;" class="${lastChg > 0 ? 'text-up' : lastChg < 0 ? 'text-down' : ''}">
                    ${prevQ ? `${lastChg > 0 ? '+' : ''}${lastChg}%` : '—'}
                  </div>
                  <div style="font-family:var(--font-mono);">
                    <strong>${fmtSimYuan(val)}</strong> <span style="font-size:12px;color:var(--text-muted);">(${pctShare}%)</span>
                  </div>
                  <div class="trade-btns">
                    <button class="trade-btn buy" data-trade="buy" data-id="${a.id}" data-amt="10000">+买1万</button>
                    <button class="trade-btn buy" data-trade="buy" data-id="${a.id}" data-amt="30000">+买3万</button>
                    <button class="trade-btn sell" data-trade="sell" data-id="${a.id}" data-amt="10000">-卖1万</button>
                    <button class="trade-btn sell" data-trade="sell" data-id="${a.id}" data-amt="all">清仓</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `
            : ''
        }

        <!-- 净值走势对比图 + 当前持仓环形图 -->
        <div class="grid-2" style="align-items:stretch;">
          <div class="card" style="margin:0;">
            <h3 style="margin:0 0 10px;">📈 你的资产曲线 vs 三大真实市场基准</h3>
            ${chartHtml}
          </div>
          <div class="card" style="margin:0;display:flex;flex-direction:column;justify-content:center;">
            <h3 style="margin:0 0 12px;">🍩 当前资产配置结构</h3>
            ${renderDonutChart([
              ...SIM_ASSETS.map((a) => ({
                label: a.shortName,
                value: snap.breakdown[a.id] || 0,
                color: a.color
              })),
              { label: '现金/货基', value: snap.cash, color: '#64748b' }
            ])}
          </div>
        </div>
      </div>
    `;

    // 绑定所有交互事件
    container.querySelector('#sim-next-q')?.addEventListener('click', () => {
      advanceQuarter(sharedSimState);
      render();
    });
    container.querySelector('#sim-next-year')?.addEventListener('click', () => {
      for (let i = 0; i < 4 && !sharedSimState.finished; i++) advanceQuarter(sharedSimState);
      render();
    });
    container.querySelector('#sim-toggle-eli5')?.addEventListener('click', () => {
      sharedSimState.showEli5Advisor = !sharedSimState.showEli5Advisor;
      render();
    });
    const doReset = () => {
      sharedSimState = createSimState(100000);
      render();
    };
    container.querySelector('#sim-reset-top')?.addEventListener('click', doReset);
    container.querySelector('#sim-restart-btn')?.addEventListener('click', doReset);

    container.querySelector('#sim-dca-toggle')?.addEventListener('change', (e) => {
      sharedSimState.autoDcaEnabled = e.target.checked;
    });
    container.querySelector('#sim-dca-target')?.addEventListener('change', (e) => {
      sharedSimState.autoDcaTarget = e.target.value;
    });

    container.querySelectorAll('[data-trade]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const action = btn.dataset.trade;
        const amt = btn.dataset.amt === 'all' ? 999999999 : Number(btn.dataset.amt);
        tradeAsset(sharedSimState, id, action, amt);
        render();
      });
    });

    const presetMap = {
      balanced: { broadEtf: 40, techEtf: 0, dividend: 15, bondEtf: 25, goldEtf: 10 },
      aggressive: { broadEtf: 45, techEtf: 35, dividend: 0, bondEtf: 0, goldEtf: 10 },
      defense: { broadEtf: 0, techEtf: 0, dividend: 15, bondEtf: 40, goldEtf: 20 }
    };
    container.querySelectorAll('[data-alloc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        applyPresetAllocation(sharedSimState, presetMap[btn.dataset.alloc]);
        render();
      });
    });
  };

  render();
}

/* --------------------------------------------------------------------------
   现实世界实战工具：市场走向 5 步检查清单（分析真实股市/ETF 决策罗盘）
   -------------------------------------------------------------------------- */
export function mountMarketChecklist(container) {
  const answers = {};

  const render = () => {
    const answeredCount = Object.keys(answers).length;
    const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
    const hasVeto = answers['chk-product'] === -3;

    let conclusionHtml = `
      <div class="stat-card" style="text-align:center;padding:20px;">
        已完成 <strong>${answeredCount} / ${MARKET_CHECKLIST_ITEMS.length}</strong> 步检查——全部勾选后，系统将为你生成大白话实操策略建议！
      </div>
    `;

    if (answeredCount === MARKET_CHECKLIST_ITEMS.length) {
      let title = '⚖️ 震荡均衡期：坚持纪律定投 + 股债平衡';
      let color = 'var(--brand)';
      let advice =
        '当前多空信号交织，既不是超级黄金坑，也不是狂热大泡沫。最舒服的做法是保持核心宽基 ETF 定投，搭配国债与黄金稳住心神，不猜短期涨跌。';

      if (hasVeto) {
        title = '🛑 红灯一票否决：立即暂停下单！';
        color = 'var(--danger)';
        advice =
          '无论大盘看起来多诱人，永远不要用急用钱、借来的钱去买高波动资产，也绝对不要追高溢价飙升的炒作 ETF！先守住本金安全线！';
      } else if (totalScore >= 5) {
        title = '🟢 罕见顺风黄金区：分批布局宽基与优质成长！';
        color = 'var(--success)';
        advice =
          '宏观、估值与情绪多个雷达同时亮起绿灯！不要畏手畏脚，可以按计划提高每月宽基 ETF 定投额度或分批建仓，同时预留 10%~20% 债券/现金防意外黑天鹅。';
      } else if (totalScore <= -3) {
        title = '🟠 高危逆风警示区：收紧进攻仓位、切入防守！';
        color = 'var(--warning)';
        advice =
          '大环境逆风或估值/情绪过热！千万别在此时听信消息追高加仓。建议把部分高风险股票/行业 ETF 盈利分批落袋为安，转向短债、国债 ETF、黄金 ETF 或货币基金等待下次打折季。';
      }

      conclusionHtml = `
        <div class="card" style="border:2px solid ${color};">
          <div style="font-size:12.5px;font-weight:700;color:${color};">📋 你的实时市场分析结论（综合得分：${totalScore > 0 ? '+' : ''}${totalScore}）</div>
          <h3 style="margin:6px 0 8px;color:${color};">${title}</h3>
          <p style="margin:0;font-size:14.5px;">${advice}</p>
        </div>
      `;
    }

    container.innerHTML = `
      <div>
        <div class="hero-card" style="padding:24px 28px;margin-bottom:20px;">
          <div class="hero-tag">📋 实操武器库 · 下单前 60 秒自检</div>
          <h1 class="hero-title" style="font-size:24px;">现实市场走向 5 步分析决策清单</h1>
          <p style="margin:0;font-size:14px;">每次你在现实生活里看新闻心动想买股票、基金或 ETF 之前，打开这份清单逐项打勾——用理性系统彻底告别冲动追涨杀跌！</p>
        </div>

        ${MARKET_CHECKLIST_ITEMS.map(
          (item) => `
          <div class="card" style="margin-bottom:14px;">
            <div style="font-size:12.5px;font-weight:800;color:var(--brand);margin-bottom:4px;">${item.step}</div>
            <div style="font-size:15.5px;font-weight:700;margin-bottom:6px;">${item.question}</div>
            <div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">💡 ELI5 提示：${item.eli5Hint}</div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${item.options
                .map((opt) => {
                  const selected = answers[item.id] === opt.score;
                  return `
                  <button class="quiz-option ${selected ? 'correct' : ''}" data-chk="${item.id}" data-score="${opt.score}" style="margin-top:0;">
                    <span>${selected ? '✅' : '⭕'}</span>
                    <span>${opt.label}</span>
                  </button>
                `;
                })
                .join('')}
            </div>
          </div>
        `
        ).join('')}

        ${conclusionHtml}
      </div>
    `;

    container.querySelectorAll('[data-chk]').forEach((btn) => {
      btn.addEventListener('click', () => {
        answers[btn.dataset.chk] = Number(btn.dataset.score);
        render();
      });
    });
  };

  render();
}
