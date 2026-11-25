/**
 * 金融计算引擎（纯函数模块，方便浏览器运行与 Node 单元测试）
 * 所有公式均对应真实金融逻辑，同时输出便于 ELI5 白话解读的直观指标
 */

/**
 * 1. 复利与通货膨胀时光机计算
 */
export function calcCompoundAndInflation({
  initial = 10000,
  monthly = 1000,
  annualReturnPct = 8,
  inflationPct = 3,
  years = 20,
  milkTeaPrice = 18
}) {
  const r = annualReturnPct / 100;
  const inf = inflationPct / 100;
  const monthlyRate = r / 12;

  const series = [];
  let investedNominal = initial;
  let totalPrincipal = initial;

  for (let y = 0; y <= years; y++) {
    const inflationFactor = Math.pow(1 + inf, y);
    const investedReal = investedNominal / inflationFactor;
    const cashReal = totalPrincipal / inflationFactor;

    series.push({
      year: y,
      principal: Math.round(totalPrincipal),
      investedNominal: Math.round(investedNominal),
      investedReal: Math.round(investedReal),
      cashReal: Math.round(cashReal),
      milkTeaPriceThen: +(milkTeaPrice * inflationFactor).toFixed(1)
    });

    if (y < years) {
      for (let m = 0; m < 12; m++) {
        investedNominal = investedNominal * (1 + monthlyRate) + monthly;
        totalPrincipal += monthly;
      }
    }
  }

  const last = series[series.length - 1];
  const nominalGain = last.investedNominal - last.principal;
  const inflationLossOnCash = last.principal - last.cashReal;
  const milkTeaCupsNow = Math.round(last.principal / milkTeaPrice);
  const milkTeaCupsCash = Math.round(last.cashReal / milkTeaPrice);
  const milkTeaCupsInvest = Math.round(last.investedReal / milkTeaPrice);

  return {
    series,
    summary: {
      totalPrincipal: last.principal,
      investedNominal: last.investedNominal,
      investedReal: last.investedReal,
      cashReal: last.cashReal,
      nominalGain,
      inflationLossOnCash,
      milkTeaPriceFuture: last.milkTeaPriceThen,
      milkTeaCupsNow,
      milkTeaCupsCash,
      milkTeaCupsInvest,
      rule72Years: annualReturnPct > 0 ? +(72 / annualReturnPct).toFixed(1) : Infinity
    }
  };
}

/**
 * 2. 街边奶茶店 IPO 与估值模拟器（PE / PB / ROE 直观化）
 */
export function calcMilkTeaValuation({
  annualProfit = 20, // 万元
  growthRatePct = 15, // 年利润增速 %
  sentimentScore = 0, // -50(极度悲观) ~ 0(理性) ~ +50(狂热炒作)
  netAssets = 100, // 净资产（家当）万元
  totalShares = 10 // 万股
}) {
  // 理性市盈率锚：基础 10 倍 + 增速溢价（类似 PEG ≈ 1 的直觉）
  const fairPE = Math.max(6, Math.min(40, +(10 + growthRatePct * 0.65).toFixed(1)));
  // 市场情绪把估值拉偏：悲观打折，狂热溢价
  const sentimentMultiplier = 1 + (sentimentScore / 100) * 1.1;
  const marketPE = Math.max(3, +(fairPE * sentimentMultiplier).toFixed(1));

  const fairValue = +(annualProfit * fairPE).toFixed(1); // 万元
  const marketCap = +(annualProfit * marketPE).toFixed(1); // 万元
  const sharePrice = +(marketCap / totalShares).toFixed(2); // 元/股
  const fairSharePrice = +(fairValue / totalShares).toFixed(2); // 元/股
  const eps = +(annualProfit / totalShares).toFixed(2); // 每股收益
  const pb = +(marketCap / Math.max(1, netAssets)).toFixed(2); // 市净率
  const roe = +((annualProfit / Math.max(1, netAssets)) * 100).toFixed(1); // 净资产收益率 %
  const peg = growthRatePct > 0 ? +(marketPE / growthRatePct).toFixed(2) : null;

  const ratioToFair = marketCap / Math.max(1, fairValue);
  let verdict = '合理价格';
  let verdictTone = 'neutral';
  let eli5Advice = '大家给这家奶茶店的出价和它赚钱的速度差不多，既不算捡漏，也不算当冤大头。';

  if (ratioToFair < 0.78) {
    verdict = '打折甩卖（低估机会）';
    verdictTone = 'good';
    eli5Advice = `好机会！店里赚钱能力没变，只因为市场情绪悲观，别人愿意打 ${Math.round(ratioToFair * 10)} 折把股份卖给你，回本只要 ${marketPE} 年。`;
  } else if (ratioToFair > 1.35) {
    verdict = '疯狂泡沫（严重高估）';
    verdictTone = 'danger';
    eli5Advice = `危险警报！大家太狂热了，按现在这价格买，要等整整 ${marketPE} 年才靠利润回本！一旦热度退去，股价可能腰斩。`;
  } else if (ratioToFair > 1.15) {
    verdict = '偏贵区域（谨慎追高）';
    verdictTone = 'warning';
    eli5Advice = '店虽然不错，但价格已经透支了未来几年的好消息，这时候冲进去容易买在山顶。';
  }

  return {
    fairPE,
    marketPE,
    fairValue,
    marketCap,
    sharePrice,
    fairSharePrice,
    eps,
    pb,
    roe,
    peg,
    verdict,
    verdictTone,
    eli5Advice
  };
}

/**
 * 3. 股市走向四维罗盘与 K 线/拔河推演
 */
export function calcMarketCompass({
  earnings = 20, // 企业盈利基本面 -100 ~ +100
  liquidity = 20, // 央行资金面 -100 ~ +100
  policy = 10, // 政策面 -100 ~ +100
  sentiment = 0 // 市场情绪面 -100 ~ +100
}) {
  // 权重：基本面 35%，资金面 30%，政策面 15%，情绪面 20%
  const composite = Math.round(
    earnings * 0.35 + liquidity * 0.30 + policy * 0.15 + sentiment * 0.20
  );

  // 市场温度计（0-100℃，情绪和资金权重偏高）
  const rawTemp = 50 + sentiment * 0.32 + liquidity * 0.12 + earnings * 0.08;
  const temperature = Math.max(5, Math.min(98, Math.round(rawTemp)));

  // 多空力量拔河比例（买方力量占比 %）
  const bullPower = Math.max(15, Math.min(85, Math.round(50 + composite * 0.36)));
  const bearPower = 100 - bullPower;

  let regime = '震荡整理市';
  let eli5Summary = '买的人和卖的人势均力敌，指数像在盒子里上下弹跳，适合耐心定投、高抛低吸，别频繁追涨杀跌。';
  let actionHint = '保持均衡仓位，继续按纪律定投宽基 ETF。';

  if (composite >= 45) {
    regime = temperature >= 78 ? '狂热加速牛市（警惕见顶）' : '健康主升浪牛市';
    eli5Summary =
      temperature >= 78
        ? '企业赚钱、钱也多，但街坊邻居都在疯抢股票（温度太高了！），就像气球吹得很大，越往后越要小心突然扎破。'
        : '企业利润在涨、市场不缺钱，大家信心慢慢恢复，这是股市最舒服的"顺风顺水期"。';
    actionHint =
      temperature >= 78
        ? '千万别在此时借钱加仓！可以分批把部分盈利落袋为安，转入债券或现金。'
        : '顺势持有优质宽基和成长资产，让利润奔跑。';
  } else if (composite >= 15) {
    regime = '温和慢牛 / 结构性上涨';
    eli5Summary = '整体风向偏暖，好公司慢慢涨，偶尔有小回调，像爬山一样走两步歇一步。';
    actionHint = '逢回调分批布局，重点看盈利稳健的宽基与行业龙头。';
  } else if (composite <= -40) {
    regime = temperature <= 25 ? '恐慌出清底部区（别人恐惧）' : '主跌浪熊市';
    eli5Summary =
      temperature <= 25
        ? '坏消息满天飞，大家吓得甩卖筹码（市场冰点），但历史证明，优质资产打折最狠的时候往往离黎明不远了。'
        : '企业赚钱变难加上市场缺钱，卖的人远多于买的人，接飞刀很容易受伤。';
    actionHint =
      temperature <= 25
        ? '别一次性梭哈，但可以开始分批小额定投宽基 ETF，悄悄捡打折的便宜货。'
        : '守住现金和国债避风港，耐心等待央行放水或盈利企稳信号。';
  } else if (composite <= -15) {
    regime = '弱势阴跌市';
    eli5Summary = '就像阴雨连绵的天气，缺乏赚钱效应，每次小反弹都容易被套牢盘砸下来。';
    actionHint = '降低高波动股票比例，提高红利、国债和现金占比。';
  }

  // 生成确定性的 24 期 K 线 + 成交量 + 5日均线，直观展现趋势与波动
  const candles = [];
  let price = 3000;
  const drift = composite * 0.65; // 每期趋势方向
  const volBase = 40 + Math.abs(sentiment) * 0.65; // 情绪越极端波动越大

  for (let i = 0; i < 24; i++) {
    // 确定性伪波动波形，保证同一参数下图表稳定可复现
    const wave =
      Math.sin(i * 1.15 + earnings * 0.03) * 0.65 +
      Math.cos(i * 0.72 + liquidity * 0.04) * 0.35;
    const open = price;
    const delta = drift + wave * volBase;
    const close = Math.max(1200, open + delta);
    const wickUp = Math.abs(Math.sin(i * 2.1 + 0.5)) * volBase * 0.6;
    const wickDown = Math.abs(Math.cos(i * 1.7 + 0.3)) * volBase * 0.6;
    const high = Math.max(open, close) + wickUp;
    const low = Math.max(1000, Math.min(open, close) - wickDown);
    const volume = Math.round(
      500 +
        Math.abs(delta) * 4.5 +
        Math.max(0, sentiment) * 3.5 +
        Math.abs(Math.sin(i * 1.4)) * 180
    );

    candles.push({
      index: i + 1,
      open: Math.round(open),
      close: Math.round(close),
      high: Math.round(high),
      low: Math.round(low),
      volume,
      isUp: close >= open
    });
    price = close;
  }

  // 计算 5 期均线（MA5）
  for (let i = 0; i < candles.length; i++) {
    const start = Math.max(0, i - 4);
    let sum = 0;
    for (let j = start; j <= i; j++) sum += candles[j].close;
    candles[i].ma5 = Math.round(sum / (i - start + 1));
  }

  const totalChangePct = +(
    ((candles[candles.length - 1].close - candles[0].open) / candles[0].open) *
    100
  ).toFixed(1);

  return {
    composite,
    temperature,
    bullPower,
    bearPower,
    regime,
    eli5Summary,
    actionHint,
    totalChangePct,
    candles
  };
}

/**
 * 4. 基金费率放大镜：主动高费率 vs 指数低费率
 */
export function calcFundFeeDrag({
  initial = 100000,
  years = 15,
  grossReturnPct = 9,
  activeFeePct = 1.75, // 管理费1.2% + 托管费0.2% + 换手冲击等
  indexFeePct = 0.2, // 宽基 ETF 综合费率
  activeBuyFeePct = 1.5
}) {
  const gross = grossReturnPct / 100;
  const activeNetRate = gross - activeFeePct / 100;
  const indexNetRate = gross - indexFeePct / 100;

  const series = [];
  let noFeeVal = initial;
  let indexVal = initial * (1 - 0.0005); // 场内万分之五佣金
  let activeVal = initial * (1 - activeBuyFeePct / 100);

  for (let y = 0; y <= years; y++) {
    series.push({
      year: y,
      noFee: Math.round(noFeeVal),
      indexFund: Math.round(indexVal),
      activeFund: Math.round(activeVal)
    });
    noFeeVal *= 1 + gross;
    indexVal *= 1 + indexNetRate;
    activeVal *= 1 + activeNetRate;
  }

  const last = series[series.length - 1];
  const activeFeeLost = last.noFee - last.activeFund;
  const indexFeeLost = last.noFee - last.indexFund;
  const extraKeptByIndex = last.indexFund - last.activeFund;

  return {
    series,
    summary: {
      finalNoFee: last.noFee,
      finalIndex: last.indexFund,
      finalActive: last.activeFund,
      activeFeeLost,
      indexFeeLost,
      extraKeptByIndex,
      activeDragSharePct: last.noFee > initial ? +((activeFeeLost / (last.noFee - initial)) * 100).toFixed(1) : 0
    }
  };
}

/**
 * 5. ETF 微笑曲线定投实验室
 */
export function calcDcaSmileCurve({ scenario = 'smile', monthlyAmount = 1000 }) {
  // 24 个月的标准净值剧本（起点均为 1.00）
  const scripts = {
    smile: {
      name: '经典微笑曲线（先暴跌 40% 再涨回原价）',
      desc: '市场先一路腰斩般下跌，最后刚好涨回起点 1.00。猜猜看：定投和一把梭哈谁赚钱？',
      prices: [
        1.0, 0.94, 0.86, 0.78, 0.72, 0.66, 0.62, 0.58, 0.56, 0.58, 0.61, 0.64,
        0.68, 0.72, 0.76, 0.80, 0.84, 0.87, 0.90, 0.93, 0.95, 0.97, 0.99, 1.0
      ]
    },
    inverted: {
      name: '倒微笑曲线（先大涨后跌回原价）',
      desc: '开局顺风顺水大涨 45%，引诱大家高位不断加仓，最后又跌回起点，警示"要懂得高位止盈"！',
      prices: [
        1.0, 1.06, 1.12, 1.2, 1.28, 1.35, 1.42, 1.46, 1.44, 1.39, 1.34, 1.29,
        1.24, 1.2, 1.16, 1.13, 1.1, 1.08, 1.06, 1.04, 1.03, 1.02, 1.01, 1.0
      ]
    },
    volatileUp: {
      name: '震荡慢牛（走两步退一步，最终涨 35%）',
      desc: '真实股市最常见的健康走势：过程中有好几次吓人的回撤，但长期重心不断抬高。',
      prices: [
        1.0, 0.96, 1.02, 1.08, 1.03, 0.97, 1.05, 1.12, 1.16, 1.09, 1.06, 1.14,
        1.19, 1.15, 1.21, 1.26, 1.2, 1.18, 1.24, 1.28, 1.25, 1.3, 1.32, 1.35
      ]
    },
    deepBear: {
      name: '漫长深熊（从 1.0 跌到 0.65）',
      desc: '检验极端逆风情况：虽然市场跌了 35%，但定投如何靠摊低成本把亏损砍掉一半？',
      prices: [
        1.0, 0.96, 0.93, 0.89, 0.86, 0.84, 0.81, 0.78, 0.76, 0.74, 0.73, 0.71,
        0.7, 0.69, 0.68, 0.68, 0.67, 0.67, 0.66, 0.66, 0.66, 0.65, 0.65, 0.65
      ]
    }
  };

  const selected = scripts[scenario] || scripts.smile;
  const prices = selected.prices;
  const totalBudget = monthlyAmount * prices.length;

  let dcaShares = 0;
  let dcaInvested = 0;
  let smartShares = 0;
  let smartInvested = 0;
  const lumpShares = totalBudget / prices[0];

  const series = [];
  let dcaBreakevenMonth = null;

  for (let i = 0; i < prices.length; i++) {
    const p = prices[i];
    // 普通定投：每月固定买
    dcaShares += monthlyAmount / p;
    dcaInvested += monthlyAmount;
    const dcaValue = dcaShares * p;
    const dcaAvgCost = dcaInvested / dcaShares;

    // 智能低估定投：跌得多买1.5倍，涨得多只买0.5倍
    const mult = p <= 0.85 ? 1.5 : p >= 1.2 ? 0.5 : 1.0;
    const smartBuy = monthlyAmount * mult;
    smartShares += smartBuy / p;
    smartInvested += smartBuy;
    const smartValue = smartShares * p;

    const lumpValue = lumpShares * p;

    if (i > 4 && dcaBreakevenMonth === null && dcaValue >= dcaInvested && prices[i] < prices[0]) {
      dcaBreakevenMonth = i + 1;
    }

    series.push({
      month: i + 1,
      price: p,
      dcaAvgCost: +dcaAvgCost.toFixed(3),
      dcaReturnPct: +(((dcaValue - dcaInvested) / dcaInvested) * 100).toFixed(1),
      smartReturnPct: +(((smartValue - smartInvested) / smartInvested) * 100).toFixed(1),
      lumpReturnPct: +(((lumpValue - totalBudget) / totalBudget) * 100).toFixed(1),
      dcaValue: Math.round(dcaValue),
      dcaInvested: Math.round(dcaInvested),
      smartValue: Math.round(smartValue),
      smartInvested: Math.round(smartInvested),
      lumpValue: Math.round(lumpValue)
    });
  }

  const last = series[series.length - 1];
  return {
    meta: selected,
    series,
    summary: {
      finalPrice: prices[prices.length - 1],
      dcaAvgCost: last.dcaAvgCost,
      dcaInvested: last.dcaInvested,
      dcaValue: last.dcaValue,
      dcaReturnPct: last.dcaReturnPct,
      smartInvested: last.smartInvested,
      smartValue: last.smartValue,
      smartReturnPct: last.smartReturnPct,
      lumpInvested: totalBudget,
      lumpValue: last.lumpValue,
      lumpReturnPct: last.lumpReturnPct,
      dcaBreakevenMonth
    }
  };
}

/**
 * 6. 宏观水龙头与美林投资时钟计算
 */
export function calcMacroClock({
  gdpGrowth = 5.0, // 经济增速 %（阈值 ~4.5%）
  cpiInflation = 2.0, // 物价通胀 %（阈值 ~3.0%）
  interestRate = 3.0 // 基准利率 %（中性 ~3.0%）
}) {
  const highGrowth = gdpGrowth >= 4.5;
  const highInflation = cpiInflation >= 3.0;

  let phase = 'recovery';
  let phaseName = '春季·复苏期';
  let bestAsset = '股票 / 宽基 ETF';
  let eli5Story =
    '经济开始热身加速，但物价还没涨起来，央行也乐意继续开着水龙头。企业利润噌噌涨、借钱又便宜，股市最爱这种春天！';

  // 各类资产顺风指数（0-100）
  let scores = { stocks: 88, bonds: 62, gold: 45, cash: 30 };

  if (highGrowth && highInflation) {
    phase = 'overheat';
    phaseName = '夏季·过热期';
    bestAsset = '大宗商品 / 黄金 / 资源股';
    eli5Story =
      '经济火热到发烫，大家抢东西把物价炒高了！央行不得不拧紧利率水龙头降温。这时候原材料和黄金最值钱，债券因为怕加息会挨打。';
    scores = { stocks: 64, bonds: 26, gold: 90, cash: 55 };
  } else if (!highGrowth && highInflation) {
    phase = 'stagflation';
    phaseName = '秋季·滞胀期';
    bestAsset = '现金（货币基金） + 黄金';
    eli5Story =
      '最难受的季节：东西越来越贵（通胀高），但大家生意不好做（经济慢）。股市和债市都头疼，拿着现金吃高利息+黄金抗通胀最稳妥！';
    scores = { stocks: 28, bonds: 38, gold: 80, cash: 88 };
  } else if (!highGrowth && !highInflation) {
    phase = 'recession';
    phaseName = '冬季·衰退期';
    bestAsset = '国债（债券基金）';
    eli5Story =
      '天气冷了，生意清淡、物价低迷。央行为了救经济会猛降利率放水！利率一降，手里提前买好的高息国债瞬间变成香饽饽，价格大涨。';
    scores = { stocks: 42, bonds: 92, gold: 66, cash: 52 };
  }

  // 利率跷跷板模拟（假设一张剩余 8 年期国债，基准中性利率 3%）
  const rateDelta = interestRate - 3.0;
  // 久期约 7 年：利率每降 1%，债价大约涨 7%
  const bondPrice = +(100 * (1 - rateDelta * 0.07)).toFixed(1);
  // 利率高低对股票估值乘数的影响
  const stockLiquidityEffect = Math.round(-rateDelta * 6);

  return {
    phase,
    phaseName,
    bestAsset,
    eli5Story,
    scores,
    bondPrice,
    stockLiquidityEffect,
    rateDelta: +rateDelta.toFixed(2)
  };
}

/**
 * 7. 资产配置与多情景压力测试回测
 */
export function calcPortfolioBacktest({
  weights = { stocks: 50, bonds: 30, gold: 10, cash: 10 },
  initialCapital = 100000,
  rebalance = true
}) {
  // 归一化权重
  const sumW =
    (weights.stocks || 0) +
    (weights.bonds || 0) +
    (weights.gold || 0) +
    (weights.cash || 0);
  const norm =
    sumW > 0
      ? {
          stocks: (weights.stocks || 0) / sumW,
          bonds: (weights.bonds || 0) / sumW,
          gold: (weights.gold || 0) / sumW,
          cash: (weights.cash || 0) / sumW
        }
      : { stocks: 0.25, bonds: 0.25, gold: 0.25, cash: 0.25 };

  // 4 种典型 5 年历史风格剧本（每年各资产收益率 %）
  const scenarios = [
    {
      id: 'crashRecovery',
      name: '金融危机深V修复（先暴跌后反弹）',
      desc: '第1-2年股市腰斩、国债黄金护盘，第3-5年强力反弹。检验组合抗跌与再平衡威力！',
      years: [
        { stocks: -38, bonds: 11, gold: 16, cash: 3 },
        { stocks: -12, bonds: 6, gold: 14, cash: 2 },
        { stocks: 28, bonds: 2, gold: 8, cash: 2 },
        { stocks: 22, bonds: 3, gold: -4, cash: 2.5 },
        { stocks: 16, bonds: 4, gold: 5, cash: 2.5 }
      ]
    },
    {
      id: 'stagflation',
      name: '高通胀加息周期（股债承压）',
      desc: '物价飙升、央行持续加息，股票债券齐跌，黄金和现金发挥压舱石作用。',
      years: [
        { stocks: -18, bonds: -7, gold: 18, cash: 4 },
        { stocks: -10, bonds: -4, gold: 15, cash: 5 },
        { stocks: 6, bonds: 2, gold: 9, cash: 4.5 },
        { stocks: 14, bonds: 7, gold: 4, cash: 3.5 },
        { stocks: 12, bonds: 6, gold: 3, cash: 3 }
      ]
    },
    {
      id: 'techBull',
      name: '科技与经济大牛市',
      desc: '经济蓬勃发展、股市一路高歌猛进，检验进攻弹性。',
      years: [
        { stocks: 22, bonds: 3, gold: 4, cash: 2 },
        { stocks: 30, bonds: 1, gold: -2, cash: 2 },
        { stocks: -8, bonds: 5, gold: 7, cash: 2.5 },
        { stocks: 26, bonds: 2, gold: 5, cash: 2.5 },
        { stocks: 18, bonds: 3, gold: 3, cash: 2.5 }
      ]
    },
    {
      id: 'sideways',
      name: '五年宽幅震荡市（上下坐电梯）',
      desc: '股市涨一年跌一年原地踏步，看多元配置+每年再平衡如何悄悄赚出"再平衡红利"。',
      years: [
        { stocks: 24, bonds: -1, gold: -5, cash: 2.5 },
        { stocks: -22, bonds: 9, gold: 14, cash: 2.5 },
        { stocks: 20, bonds: 1, gold: -3, cash: 2.5 },
        { stocks: -18, bonds: 8, gold: 12, cash: 2.5 },
        { stocks: 16, bonds: 3, gold: 4, cash: 2.5 }
      ]
    }
  ];

  const results = scenarios.map((sc) => {
    let holdings = {
      stocks: initialCapital * norm.stocks,
      bonds: initialCapital * norm.bonds,
      gold: initialCapital * norm.gold,
      cash: initialCapital * norm.cash
    };
    let peak = initialCapital;
    let maxDrawdown = 0;
    const curve = [initialCapital];

    for (const yr of sc.years) {
      holdings.stocks *= 1 + yr.stocks / 100;
      holdings.bonds *= 1 + yr.bonds / 100;
      holdings.gold *= 1 + yr.gold / 100;
      holdings.cash *= 1 + yr.cash / 100;

      const total = holdings.stocks + holdings.bonds + holdings.gold + holdings.cash;
      curve.push(Math.round(total));
      if (total > peak) peak = total;
      const dd = ((peak - total) / peak) * 100;
      if (dd > maxDrawdown) maxDrawdown = dd;

      // 每年底自动再平衡：卖出涨太多的，补买跌便宜的
      if (rebalance) {
        holdings = {
          stocks: total * norm.stocks,
          bonds: total * norm.bonds,
          gold: total * norm.gold,
          cash: total * norm.cash
        };
      }
    }

    const finalValue = curve[curve.length - 1];
    const totalReturnPct = +(((finalValue - initialCapital) / initialCapital) * 100).toFixed(1);
    const cagrPct = +((Math.pow(finalValue / initialCapital, 1 / 5) - 1) * 100).toFixed(1);

    return {
      id: sc.id,
      name: sc.name,
      desc: sc.desc,
      curve,
      finalValue,
      totalReturnPct,
      cagrPct,
      maxDrawdownPct: +maxDrawdown.toFixed(1)
    };
  });

  // 风险画像判断
  const stockPct = Math.round(norm.stocks * 100);
  let profile = '稳健平衡型（攻守兼备）';
  if (stockPct >= 75) profile = '激进进取型（高弹性、需能承受大回撤）';
  else if (stockPct <= 25) profile = '保守防御型（睡得香、但长期增值较慢）';

  return {
    weightsPct: {
      stocks: Math.round(norm.stocks * 100),
      bonds: Math.round(norm.bonds * 100),
      gold: Math.round(norm.gold * 100),
      cash: Math.round(norm.cash * 100)
    },
    profile,
    results
  };
}
