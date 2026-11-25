/**
 * 自研零依赖响应式 SVG 图表组件库
 * 专门针对投资教学优化：清晰坐标轴、数值标签、平滑网格、自动适配浅色/深色与红涨绿跌主题
 */

function formatShortNum(n) {
  if (Math.abs(n) >= 100000000) return (n / 100000000).toFixed(1) + '亿';
  if (Math.abs(n) >= 10000) return (n / 10000).toFixed(1) + '万';
  return String(Math.round(n));
}

/**
 * 通用多折线/面积对比图
 * @param {Object} opts
 * @param {string[]} opts.labels X轴标签
 * @param {Array<{name:string, color:string, values:number[], dashed?:boolean, fill?:boolean}>} opts.series
 * @param {number} [opts.height=240]
 * @param {Function} [opts.valueFormatter]
 */
export function renderLineChart({
  labels,
  series,
  height = 240,
  valueFormatter = formatShortNum,
  zeroLine = false
}) {
  const width = 680;
  const padL = 56;
  const padR = 20;
  const padT = 18;
  const padB = 34;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const allVals = series.flatMap((s) => s.values);
  if (zeroLine) allVals.push(0);
  let minV = Math.min(...allVals);
  let maxV = Math.max(...allVals);
  if (minV === maxV) {
    minV -= 1;
    maxV += 1;
  }
  const padRange = (maxV - minV) * 0.08;
  minV -= padRange;
  maxV += padRange;

  const count = Math.max(1, labels.length);
  const xOf = (i) => padL + (count === 1 ? plotW / 2 : (i / (count - 1)) * plotW);
  const yOf = (v) => padT + plotH - ((v - minV) / (maxV - minV)) * plotH;

  // 水平网格线（5 条）
  let gridSvg = '';
  for (let i = 0; i <= 4; i++) {
    const ratio = i / 4;
    const val = maxV - ratio * (maxV - minV);
    const y = padT + ratio * plotH;
    gridSvg += `
      <line x1="${padL}" y1="${y.toFixed(1)}" x2="${width - padR}" y2="${y.toFixed(1)}"
            stroke="var(--border-color)" stroke-dasharray="3 3" stroke-width="1" />
      <text x="${padL - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end"
            fill="var(--text-muted)" font-size="11" font-family="var(--font-mono)">${valueFormatter(val)}</text>
    `;
  }

  // 零轴强调线
  let zeroSvg = '';
  if (zeroLine && minV < 0 && maxV > 0) {
    const zy = yOf(0);
    zeroSvg = `<line x1="${padL}" y1="${zy.toFixed(1)}" x2="${width - padR}" y2="${zy.toFixed(1)}" stroke="var(--text-muted)" stroke-width="1.2" />`;
  }

  // X 轴稀疏标签（最多显示 7 个，防止拥挤）
  let xLabelsSvg = '';
  const step = Math.max(1, Math.ceil(count / 6));
  for (let i = 0; i < count; i += step) {
    const x = xOf(i);
    xLabelsSvg += `<text x="${x.toFixed(1)}" y="${height - 10}" text-anchor="middle" fill="var(--text-muted)" font-size="11">${labels[i]}</text>`;
  }
  if ((count - 1) % step !== 0 && count > 1) {
    const x = xOf(count - 1);
    xLabelsSvg += `<text x="${x.toFixed(1)}" y="${height - 10}" text-anchor="middle" fill="var(--text-muted)" font-size="11">${labels[count - 1]}</text>`;
  }

  // 折线与面积
  let linesSvg = '';
  for (const s of series) {
    if (!s.values.length) continue;
    const pts = s.values.map((v, i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(' ');
    if (s.fill) {
      const areaPts = `${xOf(0).toFixed(1)},${(padT + plotH).toFixed(1)} ${pts} ${xOf(s.values.length - 1).toFixed(1)},${(padT + plotH).toFixed(1)}`;
      linesSvg += `<polygon points="${areaPts}" fill="${s.color}" fill-opacity="0.11" />`;
    }
    linesSvg += `
      <polyline points="${pts}" fill="none" stroke="${s.color}"
                stroke-width="${s.dashed ? 2 : 2.8}"
                ${s.dashed ? 'stroke-dasharray="6 4"' : ''}
                stroke-linecap="round" stroke-linejoin="round" />
    `;
    // 末端圆点与数值气泡
    const lastIdx = s.values.length - 1;
    const lx = xOf(lastIdx);
    const ly = yOf(s.values[lastIdx]);
    linesSvg += `<circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="4" fill="${s.color}" stroke="var(--bg-surface)" stroke-width="2" />`;
  }

  const legendHtml = series
    .map(
      (s) =>
        `<span class="legend-item"><span class="legend-dot" style="background:${s.color}"></span>${s.name}</span>`
    )
    .join('');

  return `
    <div class="chart-wrap">
      <div class="chart-legend">${legendHtml}</div>
      <svg viewBox="0 0 ${width} ${height}" width="100%" style="display:block;height:auto;">
        ${gridSvg}
        ${zeroSvg}
        ${xLabelsSvg}
        ${linesSvg}
      </svg>
    </div>
  `;
}

/**
 * K 线 + 5日均线 + 成交量综合图（自动响应红涨绿跌 / 绿涨红跌 CSS 变量）
 */
export function renderCandlestickChart(candles) {
  const width = 680;
  const height = 270;
  const padL = 52;
  const padR = 16;
  const padT = 16;
  const priceH = 165;
  const volTop = padT + priceH + 20;
  const volH = 52;
  const plotW = width - padL - padR;

  const minP = Math.min(...candles.map((c) => c.low)) * 0.985;
  const maxP = Math.max(...candles.map((c) => c.high)) * 1.015;
  const maxVol = Math.max(...candles.map((c) => c.volume), 1);

  const stepW = plotW / candles.length;
  const barW = Math.max(5, Math.min(14, stepW * 0.58));

  const yPrice = (p) => padT + priceH - ((p - minP) / Math.max(1, maxP - minP)) * priceH;

  let gridSvg = '';
  for (let i = 0; i <= 3; i++) {
    const val = maxP - (i / 3) * (maxP - minP);
    const y = padT + (i / 3) * priceH;
    gridSvg += `
      <line x1="${padL}" y1="${y.toFixed(1)}" x2="${width - padR}" y2="${y.toFixed(1)}" stroke="var(--border-color)" stroke-dasharray="3 3" />
      <text x="${padL - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" fill="var(--text-muted)" font-size="10.5" font-family="var(--font-mono)">${Math.round(val)}</text>
    `;
  }

  let barsSvg = '';
  const maPts = [];

  candles.forEach((c, idx) => {
    const cx = padL + idx * stepW + stepW / 2;
    const color = c.isUp ? 'var(--market-up)' : 'var(--market-down)';
    const yHigh = yPrice(c.high);
    const yLow = yPrice(c.low);
    const yOpen = yPrice(c.open);
    const yClose = yPrice(c.close);
    const bodyTop = Math.min(yOpen, yClose);
    const bodyH = Math.max(2, Math.abs(yClose - yOpen));

    // 上下影线与实体
    barsSvg += `
      <line x1="${cx.toFixed(1)}" y1="${yHigh.toFixed(1)}" x2="${cx.toFixed(1)}" y2="${yLow.toFixed(1)}" stroke="${color}" stroke-width="1.5" />
      <rect x="${(cx - barW / 2).toFixed(1)}" y="${bodyTop.toFixed(1)}" width="${barW.toFixed(1)}" height="${bodyH.toFixed(1)}" fill="${color}" rx="1.5" />
    `;

    // 成交量柱
    const vh = (c.volume / maxVol) * volH;
    barsSvg += `
      <rect x="${(cx - barW / 2).toFixed(1)}" y="${(volTop + volH - vh).toFixed(1)}" width="${barW.toFixed(1)}" height="${vh.toFixed(1)}" fill="${color}" fill-opacity="0.45" rx="1" />
    `;

    maPts.push(`${cx.toFixed(1)},${yPrice(c.ma5).toFixed(1)}`);
  });

  const maLine = `<polyline points="${maPts.join(' ')}" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linejoin="round" />`;

  return `
    <div class="chart-wrap">
      <div class="chart-legend">
        <span class="legend-item"><span class="legend-dot" style="background:var(--market-up)"></span>阳线（买方占优）</span>
        <span class="legend-item"><span class="legend-dot" style="background:var(--market-down)"></span>阴线（卖方占优）</span>
        <span class="legend-item"><span class="legend-dot" style="background:#f59e0b"></span>5期均线 (MA5 趋势线)</span>
        <span class="legend-item" style="margin-left:auto;color:var(--text-muted)">下方柱子 = 成交量</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" width="100%" style="display:block;height:auto;">
        ${gridSvg}
        <text x="${padL - 8}" y="${volTop + 12}" text-anchor="end" fill="var(--text-muted)" font-size="10">成交量</text>
        ${barsSvg}
        ${maLine}
      </svg>
    </div>
  `;
}

/**
 * 环形资产占比图（SVG Donut）
 */
export function renderDonutChart(items) {
  const size = 180;
  const cx = 90;
  const cy = 90;
  const r = 64;
  const circ = 2 * Math.PI * r;
  const total = items.reduce((s, x) => s + Math.max(0, x.value), 0) || 1;

  let offset = 0;
  const segments = items
    .filter((x) => x.value > 0)
    .map((item) => {
      const frac = item.value / total;
      const dash = frac * circ;
      const seg = `
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
                stroke="${item.color}" stroke-width="22"
                stroke-dasharray="${dash.toFixed(2)} ${(circ - dash).toFixed(2)}"
                stroke-dashoffset="${(-offset).toFixed(2)}"
                transform="rotate(-90 ${cx} ${cy})" />
      `;
      offset += dash;
      return seg;
    })
    .join('');

  const legend = items
    .map((x) => {
      const pct = Math.round((Math.max(0, x.value) / total) * 100);
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;font-size:13px;padding:4px 0;">
          <span class="legend-item"><span class="legend-dot" style="background:${x.color}"></span>${x.label}</span>
          <strong style="font-family:var(--font-mono)">${pct}%</strong>
        </div>
      `;
    })
    .join('');

  return `
    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;justify-content:center;">
      <svg viewBox="0 0 ${size} ${size}" width="160" height="160" style="flex-shrink:0;">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border-color)" stroke-width="22" />
        ${segments}
        <text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="var(--text-muted)" font-size="11">资产配置</text>
        <text x="${cx}" y="${cy + 14}" text-anchor="middle" fill="var(--text-primary)" font-size="14" font-weight="800">100%</text>
      </svg>
      <div style="flex:1;min-width:160px;">${legend}</div>
    </div>
  `;
}

/**
 * 美林投资时钟 SVG 四象限可视化罗盘
 */
export function renderMerrillClockSvg(activePhase) {
  const quads = [
    { id: 'recovery', x: 165, y: 15, title: '🌸 春季·复苏', sub: '经济强 + 通胀低', asset: '首选：股票/ETF', color: '#4f46e5' },
    { id: 'overheat', x: 165, y: 125, title: '☀️ 夏季·过热', sub: '经济强 + 通胀高', asset: '首选：商品/黄金', color: '#d97706' },
    { id: 'stagflation', x: 15, y: 125, title: '🍂 秋季·滞胀', sub: '经济弱 + 通胀高', asset: '首选：现金+黄金', color: '#dc2626' },
    { id: 'recession', x: 15, y: 15, title: '❄️ 冬季·衰退', sub: '经济弱 + 通胀低', asset: '首选：国债/债基', color: '#059669' }
  ];

  const boxes = quads
    .map((q) => {
      const isAct = q.id === activePhase;
      return `
        <g>
          <rect x="${q.x}" y="${q.y}" width="140" height="100" rx="14"
                fill="${isAct ? q.color : 'var(--bg-surface)'}"
                fill-opacity="${isAct ? 0.16 : 1}"
                stroke="${isAct ? q.color : 'var(--border-color)'}"
                stroke-width="${isAct ? 2.8 : 1.2}" />
          <text x="${q.x + 70}" y="${q.y + 32}" text-anchor="middle" font-size="13.5" font-weight="800"
                fill="${isAct ? q.color : 'var(--text-primary)'}">${q.title}</text>
          <text x="${q.x + 70}" y="${q.y + 54}" text-anchor="middle" font-size="11"
                fill="var(--text-secondary)">${q.sub}</text>
          <text x="${q.x + 70}" y="${q.y + 78}" text-anchor="middle" font-size="11.5" font-weight="700"
                fill="${q.color}">${q.asset}</text>
        </g>
      `;
    })
    .join('');

  return `
    <svg viewBox="0 0 320 240" width="100%" style="max-width:360px;display:block;margin:0 auto;">
      ${boxes}
      <circle cx="160" cy="120" r="18" fill="var(--bg-surface)" stroke="var(--border-strong)" stroke-width="1.5" />
      <text x="160" y="124" text-anchor="middle" font-size="10.5" font-weight="800" fill="var(--text-primary)">时钟</text>
    </svg>
  `;
}
