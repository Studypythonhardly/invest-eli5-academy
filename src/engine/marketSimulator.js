/**
 * 毕业级实战引擎：10年（40个季度）穿越牛熊全景市场模拟器
 * 让学习者把股票、ETF、基金、债券、黄金、宏观经济与资产配置融会贯通
 */

export const SIM_ASSETS = [
  {
    id: 'broadEtf',
    name: '全市场宽基 ETF',
    shortName: '宽基ETF',
    category: '指数基金',
    color: '#4f46e5',
    riskLevel: '中高',
    eli5: '打包了全市场最强的 300 家大公司，相当于买下整个国家的经济平均分，适合做压舱核心。'
  },
  {
    id: 'techEtf',
    name: 'AI与科技成长 ETF',
    shortName: '科技ETF',
    category: '行业ETF',
    color: '#9333ea',
    riskLevel: '高',
    eli5: '高弹性选手！牛市和降息期涨得最猛，但估值太高或加息时跌起来也最吓人。'
  },
  {
    id: 'dividend',
    name: '红利价值蓝筹股',
    shortName: '红利蓝筹',
    category: '稳健个股组合',
    color: '#0891b2',
    riskLevel: '中',
    eli5: '像家门口稳赚不赔的水电超市，每年稳定发分红，熊市抗跌，牛市涨得慢些。'
  },
  {
    id: 'bondEtf',
    name: '十年期国债 ETF',
    shortName: '国债ETF',
    category: '债券',
    color: '#059669',
    riskLevel: '低',
    eli5: '借钱给国家，稳健收息。央行降息或股市大跌时它往往逆势上涨，是股市的"安全气囊"。'
  },
  {
    id: 'goldEtf',
    name: '黄金 ETF',
    shortName: '黄金ETF',
    category: '避险商品',
    color: '#d97706',
    riskLevel: '中',
    eli5: '千年硬通货！物价飞涨（通胀）或世界动荡黑天鹅来临时，大家都会抢黄金避险。'
  }
];

/**
 * 10 年（40 季度）真实感经济与市场周期剧本
 * 每季度提供：宏观指标、新闻事件、ELI5 导师提示、各资产季度涨跌幅(%)
 */
export const MARKET_QUARTERS = [
  // 第1年：温和复苏起点（估值便宜，适合建仓）
  {
    q: 1, label: '第1年 Q1', phase: '复苏初期', gdp: 4.8, cpi: 1.6, rate: 2.5, temp: 32, pe: 11.2,
    news: '经济刚走出低谷，工厂订单悄悄回暖，但街坊邻居刚被前两年熊市吓怕了，没人敢谈股票。',
    eli5Tip: '市场温度只有 32℃、宽基 PE 仅 11 倍，属于"打折甩卖"区间！这时候分批买宽基 ETF 和红利股，长期胜率很高。',
    returns: { broadEtf: 3.5, techEtf: 5.2, dividend: 2.8, bondEtf: 1.4, goldEtf: 0.8, cash: 0.6 }
  },
  {
    q: 2, label: '第1年 Q2', phase: '复苏初期', gdp: 5.1, cpi: 1.8, rate: 2.5, temp: 38, pe: 11.8,
    news: '上市公司中报出炉：头部企业利润增速超预期，但成交量仍温和。',
    eli5Tip: '基本面开始变好，但散户还没冲进来，属于舒服的"慢牛起步期"，耐心持有或继续定投。',
    returns: { broadEtf: 5.4, techEtf: 8.5, dividend: 3.6, bondEtf: 0.8, goldEtf: -0.5, cash: 0.6 }
  },
  {
    q: 3, label: '第1年 Q3', phase: '温和复苏', gdp: 5.3, cpi: 2.0, rate: 2.25, temp: 44, pe: 12.4,
    news: '央行小幅降息 0.25% 呵护经济，宣布保持流动性合理充裕。',
    eli5Tip: '央行把水龙头拧松了一点！低利率对股票（尤其是科技成长）和国债都是双双利好。',
    returns: { broadEtf: 6.2, techEtf: 11.0, dividend: 3.2, bondEtf: 2.6, goldEtf: 2.1, cash: 0.55 }
  },
  {
    q: 4, label: '第1年 Q4', phase: '温和复苏', gdp: 5.5, cpi: 2.1, rate: 2.25, temp: 49, pe: 13.0,
    news: '年底消费旺季数据亮眼，宽基指数全年温和上涨，市场情绪回到中性。',
    eli5Tip: '第一年平平稳稳，记得领分红！此时不贵也不便宜，保持你的核心资产配置比例。',
    returns: { broadEtf: 4.1, techEtf: 6.4, dividend: 4.5, bondEtf: 1.1, goldEtf: 1.2, cash: 0.55 }
  },

  // 第2年：震荡蓄势（倒春寒考验耐心）
  {
    q: 5, label: '第2年 Q1', phase: '复苏震荡', gdp: 5.2, cpi: 2.3, rate: 2.25, temp: 43, pe: 12.3,
    news: '海外贸易摩擦传闻突发，股市遭遇一波"倒春寒"急跌，社交媒体开始喊狼来了。',
    eli5Tip: '短期噪音吓唬人！经济基本面没坏，这种突然回撤往往是给定投者送便宜筹码的"黄金坑"。',
    returns: { broadEtf: -6.8, techEtf: -11.5, dividend: -2.1, bondEtf: 2.4, goldEtf: 4.5, cash: 0.55 }
  },
  {
    q: 6, label: '第2年 Q2', phase: '复苏震荡', gdp: 5.4, cpi: 2.2, rate: 2.25, temp: 47, pe: 12.9,
    news: '贸易谈判缓和，科技行业发布新一代 AI 生产力应用，资金重新涌入成长板块。',
    eli5Tip: '情绪修复很快！刚才在 Q1 恐慌割肉的人又踏空了，有国债和黄金垫底的组合稳稳扛住了波动。',
    returns: { broadEtf: 7.5, techEtf: 14.2, dividend: 3.4, bondEtf: 0.4, goldEtf: -1.8, cash: 0.55 }
  },
  {
    q: 7, label: '第2年 Q3', phase: '稳健扩张', gdp: 5.7, cpi: 2.4, rate: 2.25, temp: 55, pe: 13.8,
    news: '全市场企业盈利连续 5 个季度正增长，基金发行开始回暖。',
    eli5Tip: '市场温度 55℃，属于标准健康状态。不要因为涨了 15% 就急着清仓，好行情往往才到半山腰。',
    returns: { broadEtf: 6.8, techEtf: 10.6, dividend: 4.2, bondEtf: 0.5, goldEtf: 1.0, cash: 0.55 }
  },
  {
    q: 8, label: '第2年 Q4', phase: '稳健扩张', gdp: 5.9, cpi: 2.6, rate: 2.25, temp: 62, pe: 14.9,
    news: '年底券商纷纷唱多明年牛市，科技 ETF 全年大涨，开始有人晒翻倍收益截图。',
    eli5Tip: '温度升到 62℃，开始有点热了！如果你手里科技 ETF 涨太多占比失衡，可以适度"再平衡"把一部分利润挪到稳健资产。',
    returns: { broadEtf: 7.9, techEtf: 15.8, dividend: 3.9, bondEtf: -0.6, goldEtf: 1.8, cash: 0.55 }
  },

  // 第3年：牛市主升浪与 FOMO 诱惑
  {
    q: 9, label: '第3年 Q1', phase: '全面牛市', gdp: 6.1, cpi: 2.9, rate: 2.25, temp: 71, pe: 16.5,
    news: '成交量暴增！新股民排队开户，办公室午休全在聊哪只科技股明天涨停。',
    eli5Tip: '温度突破 70℃！记住"菜市场大妈定律"：连平时不看盘的人都在教你炒股时，千万别再盲目追高加仓！',
    returns: { broadEtf: 10.5, techEtf: 19.4, dividend: 5.1, bondEtf: -1.8, goldEtf: 2.4, cash: 0.55 }
  },
  {
    q: 10, label: '第3年 Q2', phase: '狂热泡沫', gdp: 6.2, cpi: 3.4, rate: 2.5, temp: 84, pe: 19.2,
    news: '物价开始明显抬头（CPI 破 3%），央行首次小幅加息提示风险，但狂热的股市完全不理会，继续狂飙！',
    eli5Tip: '警钟长鸣！温度 84℃（极度贪婪）+ 央行开始拧水龙头！这时候正是老手分批止盈、落袋为安的黄金窗口。',
    returns: { broadEtf: 11.8, techEtf: 22.5, dividend: 4.8, bondEtf: -2.9, goldEtf: 5.6, cash: 0.65 }
  },
  {
    q: 11, label: '第3年 Q3', phase: '泡沫见顶', gdp: 5.8, cpi: 4.1, rate: 3.0, temp: 91, pe: 21.6,
    news: '宽基 PE 飙破 21 倍，某些亏损科技股都能翻三倍；与此同时 CPI 突破 4%，央行宣布大幅加息抗通胀。',
    eli5Tip: '91℃ 沸腾顶峰！美林时钟已经转到"夏季过热→秋季滞胀"边缘。如果你还满仓高估值科技股，下个季度可能会非常痛！',
    returns: { broadEtf: 4.2, techEtf: 7.5, dividend: 2.1, bondEtf: -3.5, goldEtf: 7.2, cash: 0.75 }
  },
  {
    q: 12, label: '第3年 Q4', phase: '泡沫破裂', gdp: 5.1, cpi: 4.6, rate: 3.75, temp: 65, pe: 17.8,
    news: '高估值终于扛不住连续加息！科技龙头业绩增速稍逊预期，引发获利盘踩踏暴跌。',
    eli5Tip: '这就是"杀估值"！水龙头被猛拧紧，泡沫破得比涨得还快。好在提前换到现金、黄金或红利的资金躲过一劫。',
    returns: { broadEtf: -12.4, techEtf: -23.5, dividend: -3.2, bondEtf: -2.4, goldEtf: 6.1, cash: 0.9 }
  },

  // 第4年：高通胀滞胀 & 暴力加息（最考验配置的一年）
  {
    q: 13, label: '第4年 Q1', phase: '滞胀承压', gdp: 4.2, cpi: 5.2, rate: 4.5, temp: 46, pe: 14.9,
    news: '能源与食品涨价潮席卷全球，CPI 飙升至 5.2%，央行放狠话：不压下通胀绝不停止加息！',
    eli5Tip: '典型的"秋季滞胀"：经济放缓 + 通胀高烧。股票和长债都受压，只有黄金和吃高利息的现金稳如泰山！',
    returns: { broadEtf: -9.8, techEtf: -16.2, dividend: -1.5, bondEtf: -3.2, goldEtf: 8.5, cash: 1.1 }
  },
  {
    q: 14, label: '第4年 Q2', phase: '滞胀承压', gdp: 3.8, cpi: 5.0, rate: 5.0, temp: 36, pe: 13.4,
    news: '利率飙至 5% 高位，房贷与企业借钱成本大增，股市成交量腰斩。',
    eli5Tip: '注意看：现金/货基年化利息已经高达 5%！同时股市估值被砸回了合理偏低区，别乱借钱，保留子弹。',
    returns: { broadEtf: -6.5, techEtf: -10.8, dividend: 1.2, bondEtf: -1.4, goldEtf: 4.2, cash: 1.25 }
  },
  {
    q: 15, label: '第4年 Q3', phase: '衰退前夜', gdp: 3.3, cpi: 4.2, rate: 5.0, temp: 29, pe: 12.1,
    news: '通胀终于见顶回落，但高利率的后遗症显现：多家高负债中小企业裁员，市场担心经济衰退。',
    eli5Tip: '关键转折信号！通胀开始降、加息快到头了！历史上加息终点附近，正是提前布局"国债 ETF"吃未来降息大肉的好时机。',
    returns: { broadEtf: -5.2, techEtf: -7.4, dividend: -1.8, bondEtf: 2.1, goldEtf: 2.8, cash: 1.25 }
  },
  {
    q: 16, label: '第4年 Q4', phase: '恐慌探底', gdp: 2.9, cpi: 3.4, rate: 4.75, temp: 22, pe: 10.6,
    news: '海外某中型银行爆雷引发黑天鹅恐慌！全球股市遭遇无差别抛售，媒体标题全是"世界末日"。',
    eli5Tip: '温度 22℃，宽基 PE 跌到 10.6 倍！国债和黄金大涨充当安全气囊。记住：最恐慌的冬天，往往藏着未来 3 年最便宜的筹码！',
    returns: { broadEtf: -10.5, techEtf: -13.8, dividend: -4.2, bondEtf: 6.4, goldEtf: 7.8, cash: 1.15 }
  },

  // 第5年：冬季衰退 → 央行放水救市（微笑曲线底部）
  {
    q: 17, label: '第5年 Q1', phase: '衰退救市', gdp: 2.8, cpi: 2.5, rate: 4.0, temp: 18, pe: 9.8,
    news: '央行紧急降息 0.75% 稳定金融市场！但大家心理阴影还在，股市继续小幅阴跌磨底。',
    eli5Tip: '18℃ 历史冰点！国债大涨（利率跷跷板效应完美上演！）。此时把赚了不少钱的国债/现金分批换成便宜的宽基 ETF，就是教科书级逆向再平衡！',
    returns: { broadEtf: -3.2, techEtf: -4.5, dividend: 1.5, bondEtf: 5.8, goldEtf: 3.1, cash: 1.0 }
  },
  {
    q: 18, label: '第5年 Q2', phase: '政策底现', gdp: 3.2, cpi: 2.0, rate: 3.25, temp: 26, pe: 10.5,
    news: '央行再度降息，财政推出大规模减税和基建刺激，股市放量收出长阳线！',
    eli5Tip: '水龙头重新拧开了！资金面拐点 + 极低估值 = 熊转牛的经典组合，坚持定投的人离回本盈利只差一步！',
    returns: { broadEtf: 8.6, techEtf: 13.5, dividend: 5.4, bondEtf: 4.2, goldEtf: 1.4, cash: 0.8 }
  },
  {
    q: 19, label: '第5年 Q3', phase: '春意萌动', gdp: 3.9, cpi: 1.8, rate: 2.75, temp: 35, pe: 11.4,
    news: '利率回到低位，购房与企业贷款需求复苏，宽基指数连续两个季度反弹。',
    eli5Tip: '美林时钟正式转回"春季复苏"！国债已经赚够了降息红利，可以适当把重心移回宽基 ETF 和优质股票。',
    returns: { broadEtf: 7.9, techEtf: 12.1, dividend: 4.8, bondEtf: 2.5, goldEtf: -0.6, cash: 0.7 }
  },
  {
    q: 20, label: '第5年 Q4', phase: '复苏确认', gdp: 4.5, cpi: 1.9, rate: 2.5, temp: 44, pe: 12.3,
    news: '十年旅程过半！企业盈利重回正增长，坚持度过寒冬的理性投资者净值创出新高。',
    eli5Tip: '半程复盘时刻：看看你在第 3 年狂热时有没有守住利润、第 4-5 年恐慌时有没有敢于低吸？',
    returns: { broadEtf: 6.4, techEtf: 9.2, dividend: 4.1, bondEtf: 1.2, goldEtf: 0.5, cash: 0.6 }
  },

  // 第6-7年：新科技浪潮与结构性慢牛
  {
    q: 21, label: '第6年 Q1', phase: '健康扩张', gdp: 4.9, cpi: 2.1, rate: 2.5, temp: 50, pe: 13.1,
    news: '机器人与新能源技术商业化落地，制造业效率提升，市场呈现温和普涨。',
    eli5Tip: '低通胀+稳增长的"金发姑娘经济"（不冷不热刚刚好），核心持有宽基+科技成长最舒服。',
    returns: { broadEtf: 5.8, techEtf: 10.4, dividend: 3.6, bondEtf: 0.9, goldEtf: 1.2, cash: 0.6 }
  },
  {
    q: 22, label: '第6年 Q2', phase: '健康扩张', gdp: 5.1, cpi: 2.2, rate: 2.5, temp: 54, pe: 13.6,
    news: '上市公司分红比例创历史新高，高股息红利板块受到险资和养老金追捧。',
    eli5Tip: '好公司不仅股价涨，还年年给你发现金分红，这就是"躺着收租"的魅力。',
    returns: { broadEtf: 4.2, techEtf: 5.8, dividend: 6.2, bondEtf: 0.8, goldEtf: 0.4, cash: 0.6 }
  },
  {
    q: 23, label: '第6年 Q3', phase: '中继洗盘', gdp: 4.8, cpi: 2.3, rate: 2.5, temp: 45, pe: 12.8,
    news: '市场担心科技股短期涨幅过大，出现了一波健康的 8% 获利回吐洗盘。',
    eli5Tip: '牛市多急跌！只要盈利和流动性逻辑没破，中继洗盘反而是调整持仓的好机会。',
    returns: { broadEtf: -4.8, techEtf: -8.6, dividend: -0.9, bondEtf: 1.6, goldEtf: 2.5, cash: 0.6 }
  },
  {
    q: 24, label: '第6年 Q4', phase: '重拾升势', gdp: 5.2, cpi: 2.4, rate: 2.5, temp: 53, pe: 13.7,
    news: '科技巨头财报全面超预期，证明 AI 真金白银赚到了利润，股市迅速收复失地。',
    eli5Tip: '看清了吗？真正决定股价长期高度的是"企业能不能持续赚更多利润"，而不是短期涨跌噪音。',
    returns: { broadEtf: 7.1, techEtf: 13.4, dividend: 3.8, bondEtf: 0.4, goldEtf: -0.8, cash: 0.6 }
  },
  {
    q: 25, label: '第7年 Q1', phase: '加速上行', gdp: 5.5, cpi: 2.7, rate: 2.5, temp: 63, pe: 15.0,
    news: '居民储蓄开始搬家进入基金和 ETF，全市场交易日渐活跃。',
    eli5Tip: '场外资金源源不断进场，享受趋势红利的同时，悄悄把止盈线刻在心里。',
    returns: { broadEtf: 8.2, techEtf: 14.5, dividend: 4.4, bondEtf: -0.5, goldEtf: 1.6, cash: 0.6 }
  },
  {
    q: 26, label: '第7年 Q2', phase: '偏热警戒', gdp: 5.7, cpi: 3.1, rate: 2.75, temp: 74, pe: 16.9,
    news: '物价再次站上 3%，央行小幅上调利率 0.25% 预防过热，但股市仍惯性冲高。',
    eli5Tip: '似曾相识的画面！温度 74℃，记得第 3 年的教训吗？别等到 90℃ 才想起来收网。',
    returns: { broadEtf: 9.4, techEtf: 16.2, dividend: 3.5, bondEtf: -1.6, goldEtf: 4.0, cash: 0.7 }
  },
  {
    q: 27, label: '第7年 Q3', phase: '高位震荡', gdp: 5.3, cpi: 3.5, rate: 3.25, temp: 77, pe: 17.6,
    news: '热门题材轮番炒作，市场分化严重：垃圾概念股暴涨暴跌，优质蓝筹纹丝不动。',
    eli5Tip: '高位剧烈震荡往往意味着资金意见分歧很大。主动降一点高风险科技仓位，给组合系上安全带。',
    returns: { broadEtf: 2.1, techEtf: 4.5, dividend: 1.8, bondEtf: -1.9, goldEtf: 3.8, cash: 0.8 }
  },
  {
    q: 28, label: '第7年 Q4', phase: '地缘黑天鹅', gdp: 4.6, cpi: 3.8, rate: 3.25, temp: 48, pe: 14.8,
    news: '国际地缘冲突突然升级，原油与黄金瞬间飙升，全球风险资产集体跳水！',
    eli5Tip: '这就是为什么资产配置里永远要留一小块"黄金 ETF"！你平时嫌它不生息，关键时刻它就是救命稻草。',
    returns: { broadEtf: -9.5, techEtf: -14.0, dividend: -3.5, bondEtf: 1.8, goldEtf: 11.2, cash: 0.8 }
  },

  // 第8年：消化震荡与再平衡的胜利
  {
    q: 29, label: '第8年 Q1', phase: '震荡磨底', gdp: 4.3, cpi: 3.3, rate: 3.25, temp: 40, pe: 13.5,
    news: '冲突局势逐步可控，市场消化恐慌情绪，但整体缺乏明确主线，进入无聊的箱体震荡。',
    eli5Tip: '无聊的震荡市最容易让人手痒瞎折腾。少盯盘、坚持定投、靠红利和债息慢慢滚雪球！',
    returns: { broadEtf: -2.4, techEtf: -3.8, dividend: 2.6, bondEtf: 1.9, goldEtf: -1.5, cash: 0.8 }
  },
  {
    q: 30, label: '第8年 Q2', phase: '温和修复', gdp: 4.5, cpi: 2.8, rate: 3.0, temp: 45, pe: 13.9,
    news: '油价回落带动通胀降温，央行小幅降息 0.25%，股市与债市温和双涨。',
    eli5Tip: '通胀警报解除，货币空间又打开了！股债均衡配置迎来了最惬意的"双收季"。',
    returns: { broadEtf: 5.1, techEtf: 7.4, dividend: 3.8, bondEtf: 2.2, goldEtf: 0.8, cash: 0.75 }
  },
  {
    q: 31, label: '第8年 Q3', phase: '结构分化', gdp: 4.7, cpi: 2.4, rate: 2.75, temp: 49, pe: 14.2,
    news: '低费率宽基 ETF 规模首次超越主动公募基金，越来越多普通人拥抱指数化投资。',
    eli5Tip: '长期来看，低费率宽基 ETF 跑赢了绝大多数高收费主动基金，省下来的管理费都在替你复利！',
    returns: { broadEtf: 4.6, techEtf: 6.2, dividend: 3.5, bondEtf: 1.7, goldEtf: 1.1, cash: 0.7 }
  },
  {
    q: 32, label: '第8年 Q4', phase: '稳步抬升', gdp: 4.9, cpi: 2.3, rate: 2.75, temp: 54, pe: 14.6,
    news: '全年波澜不惊，但复利的力量让坚持持有的人不知不觉又赚了双位数。',
    eli5Tip: '投资不是百米冲刺，是马拉松。平淡年份能稳稳拿住，比牛市里惊心动魄更珍贵。',
    returns: { broadEtf: 5.2, techEtf: 8.1, dividend: 4.1, bondEtf: 1.1, goldEtf: 1.5, cash: 0.7 }
  },

  // 第9-10年：慢牛收官与复利绽放
  {
    q: 33, label: '第9年 Q1', phase: '慢牛延续', gdp: 5.0, cpi: 2.2, rate: 2.5, temp: 57, pe: 15.1,
    news: '新一轮全球产业升级提速，宽基指数创出十年新高！',
    eli5Tip: '还记得第 1 年 3000 点附近的犹豫吗？站在第 9 年回头看，当年那些吓人的回调都变成了曲线上的小波纹。',
    returns: { broadEtf: 6.3, techEtf: 10.2, dividend: 4.0, bondEtf: 1.4, goldEtf: 1.0, cash: 0.65 }
  },
  {
    q: 34, label: '第9年 Q2', phase: '短暂回调', gdp: 4.8, cpi: 2.4, rate: 2.5, temp: 48, pe: 14.3,
    news: '中报季部分消费股不及预期，大盘小幅回调 4%，市场情绪迅速降温。',
    eli5Tip: '正常的季节性呼吸而已，现在的你已经能淡定看懂基本面，不会被一点风吹草动吓跑了！',
    returns: { broadEtf: -3.8, techEtf: -5.4, dividend: -0.6, bondEtf: 1.5, goldEtf: 2.2, cash: 0.65 }
  },
  {
    q: 35, label: '第9年 Q3', phase: '稳健上行', gdp: 5.1, cpi: 2.3, rate: 2.5, temp: 56, pe: 15.0,
    news: '养老金与长期资金持续入市，市场波动率明显下降，走出经典慢牛节奏。',
    eli5Tip: '复利曲线进入最迷人的"后半段加速期"——本金基数变大了，哪怕涨 5% 赚的绝对金额也很可观！',
    returns: { broadEtf: 6.1, techEtf: 9.5, dividend: 4.5, bondEtf: 1.0, goldEtf: 1.3, cash: 0.65 }
  },
  {
    q: 36, label: '第9年 Q4', phase: '稳健上行', gdp: 5.2, cpi: 2.4, rate: 2.5, temp: 60, pe: 15.5,
    news: '进入最后一个投资年度前夕，你的资产雪球已经滚得比十年前大得多。',
    eli5Tip: '临近收官，记得检查你的风险敞口：如果明天就要用这笔钱买房或退休，应该逐步提高稳健资产比例！',
    returns: { broadEtf: 5.4, techEtf: 7.8, dividend: 4.2, bondEtf: 0.9, goldEtf: 1.8, cash: 0.65 }
  },
  {
    q: 37, label: '第10年 Q1', phase: '收官之年', gdp: 5.0, cpi: 2.6, rate: 2.5, temp: 62, pe: 15.8,
    news: '最后一年开局顺利，科技与红利携手上涨。',
    eli5Tip: '稳住节奏，不要在最后几百米冲刺时乱改策略。',
    returns: { broadEtf: 4.8, techEtf: 7.2, dividend: 3.9, bondEtf: 0.8, goldEtf: 1.2, cash: 0.65 }
  },
  {
    q: 38, label: '第10年 Q2', phase: '收官波动', gdp: 4.7, cpi: 2.8, rate: 2.75, temp: 52, pe: 14.9,
    news: '海外利率小幅波动，股市回踩均线后企稳，国债与黄金提供稳稳支撑。',
    eli5Tip: '多元化配置就像一艘装满水密舱的大船，风浪再大也能平稳靠岸。',
    returns: { broadEtf: -3.1, techEtf: -5.2, dividend: 1.1, bondEtf: 1.1, goldEtf: 2.6, cash: 0.7 }
  },
  {
    q: 39, label: '第10年 Q3', phase: '稳步收官', gdp: 4.9, cpi: 2.5, rate: 2.5, temp: 57, pe: 15.4,
    news: '企业三季报稳健增长，市场稳步回升。',
    eli5Tip: '还剩最后一个季度！做好最后的仓位审视，准备迎接你的十年毕业体检报告。',
    returns: { broadEtf: 5.0, techEtf: 7.6, dividend: 3.8, bondEtf: 1.2, goldEtf: 1.1, cash: 0.65 }
  },
  {
    q: 40, label: '第10年 Q4', phase: '十年毕业', gdp: 5.0, cpi: 2.4, rate: 2.5, temp: 58, pe: 15.6,
    news: '🎉 十年穿越牛熊之旅圆满收官！你亲身经历了复苏、狂热泡沫、滞胀加息、黑天鹅熊市与慢牛长跑！',
    eli5Tip: '恭喜完成 40 个季度的真实投资长跑！快来看看你的《毕业投资能力评估报告》吧！',
    returns: { broadEtf: 4.5, techEtf: 6.2, dividend: 4.4, bondEtf: 1.0, goldEtf: 1.4, cash: 0.65 }
  }
];

/**
 * 创建全新的 10 年模拟器状态
 */
export function createSimState(initialCapital = 100000) {
  const prices = {};
  const holdings = {};
  for (const a of SIM_ASSETS) {
    prices[a.id] = 100;
    holdings[a.id] = 0; // 持有份额
  }

  return {
    quarterIndex: 0, // 0 表示尚未推进，当前看到 Q1 信息准备决策；推进到 40 表示结束
    finished: false,
    initialCapital,
    cash: initialCapital,
    quarterlySalary: 3000, // 每季度额外存下的可投资余钱（模拟真实打工族定投）
    totalDeposited: initialCapital,
    prices,
    holdings,
    autoDcaEnabled: true,
    autoDcaTarget: 'broadEtf',
    showEli5Advisor: true,
    tradeCount: 0,
    panicSellCount: 0,
    fomoBuyCount: 0,
    // 净值与基准历史记录
    history: [
      {
        label: '起点',
        portfolioValue: initialCapital,
        deposited: initialCapital,
        broadBenchmark: initialCapital,
        cashOnlyBenchmark: initialCapital,
        fomoXiaomingBenchmark: initialCapital
      }
    ],
    // 内部基准跟踪
    _benchBroadShares: initialCapital / 100,
    _benchCash: initialCapital,
    _xiaomingCash: initialCapital,
    _xiaomingBroadShares: 0,
    _xiaomingTechShares: 0
  };
}

/**
 * 计算当前组合总资产与各资产市值
 */
export function getPortfolioSnapshot(state) {
  let invested = 0;
  const breakdown = {};
  for (const a of SIM_ASSETS) {
    const val = (state.holdings[a.id] || 0) * (state.prices[a.id] || 100);
    breakdown[a.id] = val;
    invested += val;
  }
  const totalValue = state.cash + invested;
  const totalProfit = totalValue - state.totalDeposited;
  const totalReturnPct =
    state.totalDeposited > 0 ? +((totalProfit / state.totalDeposited) * 100).toFixed(1) : 0;

  return {
    cash: state.cash,
    invested,
    totalValue,
    totalProfit,
    totalReturnPct,
    breakdown
  };
}

/**
 * 买入/卖出指定资产（按金额操作，对新手最友好）
 */
export function tradeAsset(state, assetId, action, amount) {
  if (state.finished) return state;
  const price = state.prices[assetId];
  if (!price || amount <= 0) return state;

  const currentQuarter = MARKET_QUARTERS[Math.min(state.quarterIndex, MARKET_QUARTERS.length - 1)];

  if (action === 'buy') {
    const actualBuy = Math.min(state.cash, amount);
    if (actualBuy < 1) return state;
    state.cash -= actualBuy;
    state.holdings[assetId] = (state.holdings[assetId] || 0) + actualBuy / price;
    state.tradeCount += 1;
    // 记录追高行为（市场温度 >= 78 仍大买高风险股票类资产）
    if (currentQuarter && currentQuarter.temp >= 78 && (assetId === 'techEtf' || assetId === 'broadEtf')) {
      state.fomoBuyCount += 1;
    }
  } else if (action === 'sell') {
    const currentVal = (state.holdings[assetId] || 0) * price;
    const actualSell = Math.min(currentVal, amount);
    if (actualSell < 1) return state;
    state.holdings[assetId] = Math.max(0, (currentVal - actualSell) / price);
    state.cash += actualSell;
    state.tradeCount += 1;
    // 记录恐慌割肉行为（市场温度 <= 28 时卖出宽基或科技）
    if (currentQuarter && currentQuarter.temp <= 28 && (assetId === 'techEtf' || assetId === 'broadEtf')) {
      state.panicSellCount += 1;
    }
  }
  return state;
}

/**
 * 一键经典资产配置（新手省心工具：股债黄金现金一键配齐）
 */
export function applyPresetAllocation(state, weights) {
  if (state.finished) return state;
  const snap = getPortfolioSnapshot(state);
  const total = snap.totalValue;
  let used = 0;

  for (const a of SIM_ASSETS) {
    const w = (weights[a.id] || 0) / 100;
    const targetVal = total * w;
    state.holdings[a.id] = targetVal / state.prices[a.id];
    used += targetVal;
  }
  state.cash = Math.max(0, total - used);
  state.tradeCount += 1;
  return state;
}

/**
 * 推进一个季度：执行定投、应用当季涨跌、更新三大基准曲线
 */
export function advanceQuarter(state) {
  if (state.finished || state.quarterIndex >= MARKET_QUARTERS.length) {
    state.finished = true;
    return state;
  }

  const qData = MARKET_QUARTERS[state.quarterIndex];

  // 1. 发季度工资结余（模拟普通人持续储蓄）
  const salary = state.quarterlySalary;
  state.totalDeposited += salary;
  if (state.autoDcaEnabled && state.autoDcaTarget && state.prices[state.autoDcaTarget]) {
    state.holdings[state.autoDcaTarget] += salary / state.prices[state.autoDcaTarget];
  } else {
    state.cash += salary;
  }

  // 基准们同样收到这笔季度结余，保证绝对公平对比
  state._benchBroadShares += salary / state.prices.broadEtf;
  state._benchCash += salary;
  state._xiaomingCash += salary;

  // 反面教材"追涨杀跌小明"的典型行为：温度 > 70 追高买科技，温度 < 30 恐慌清仓割肉
  if (qData.temp >= 70 && state._xiaomingCash > 0) {
    state._xiaomingTechShares += (state._xiaomingCash * 0.85) / state.prices.techEtf;
    state._xiaomingCash *= 0.15;
  } else if (qData.temp <= 30) {
    state._xiaomingCash +=
      state._xiaomingTechShares * state.prices.techEtf +
      state._xiaomingBroadShares * state.prices.broadEtf;
    state._xiaomingTechShares = 0;
    state._xiaomingBroadShares = 0;
  } else if (qData.temp >= 55 && state._xiaomingCash > 10000) {
    state._xiaomingBroadShares += (state._xiaomingCash * 0.5) / state.prices.broadEtf;
    state._xiaomingCash *= 0.5;
  }

  // 2. 应用本季度市场价格涨跌幅与现金利息
  for (const a of SIM_ASSETS) {
    const pct = qData.returns[a.id] || 0;
    state.prices[a.id] = +(state.prices[a.id] * (1 + pct / 100)).toFixed(2);
  }
  const cashYield = (qData.returns.cash || 0.5) / 100;
  state.cash *= 1 + cashYield;
  state._benchCash *= 1 + cashYield;
  state._xiaomingCash *= 1 + cashYield;

  // 3. 记录历史快照
  const snap = getPortfolioSnapshot(state);
  const broadBenchmark = Math.round(state._benchBroadShares * state.prices.broadEtf);
  const cashOnlyBenchmark = Math.round(state._benchCash);
  const fomoXiaomingBenchmark = Math.round(
    state._xiaomingCash +
      state._xiaomingBroadShares * state.prices.broadEtf +
      state._xiaomingTechShares * state.prices.techEtf
  );

  state.history.push({
    label: qData.label,
    portfolioValue: Math.round(snap.totalValue),
    deposited: Math.round(state.totalDeposited),
    broadBenchmark,
    cashOnlyBenchmark,
    fomoXiaomingBenchmark
  });

  state.quarterIndex += 1;
  if (state.quarterIndex >= MARKET_QUARTERS.length) {
    state.finished = true;
  }

  return state;
}

/**
 * 生成 10 年毕业投资能力评估报告
 */
export function generateGraduationReport(state) {
  const snap = getPortfolioSnapshot(state);
  const last = state.history[state.history.length - 1];

  // 计算最大回撤（相对净值峰值，剔除新存入资金干扰的净值近似：用收益率曲线或净值比）
  let peakRatio = 1;
  let maxDrawdownPct = 0;
  for (const h of state.history) {
    const ratio = h.portfolioValue / Math.max(1, h.deposited);
    if (ratio > peakRatio) peakRatio = ratio;
    const dd = ((peakRatio - ratio) / peakRatio) * 100;
    if (dd > maxDrawdownPct) maxDrawdownPct = dd;
  }

  const finalMultiple = snap.totalValue / Math.max(1, state.totalDeposited);
  // 近似年化收益（考虑分期投入的平均资金在场时间约 6.5 年）
  const effectiveYears = Math.max(1, (state.quarterIndex / 4) * 0.68);
  const approxAnnualizedPct = +(
    (Math.pow(Math.max(0.1, finalMultiple), 1 / effectiveYears) - 1) *
    100
  ).toFixed(1);

  const beatCash = snap.totalValue > last.cashOnlyBenchmark;
  const beatXiaoming = snap.totalValue > last.fomoXiaomingBenchmark;
  const beatBroad = snap.totalValue >= last.broadBenchmark * 0.98;

  // 综合评分（满分 100）
  let score = 55;
  if (beatCash) score += 15;
  if (beatXiaoming) score += 10;
  if (beatBroad) score += 10;
  if (maxDrawdownPct < 20) score += 10;
  else if (maxDrawdownPct > 35) score -= 8;
  score -= Math.min(12, state.panicSellCount * 4 + state.fomoBuyCount * 3);
  score = Math.max(30, Math.min(100, Math.round(score)));

  let badge = '🌱 成长中的理性学徒';
  let summary = '你完成了完整的十年经济周期长跑！复盘你在牛市顶峰和熊市冰点的操作，下一次你会更从容。';

  if (score >= 88) {
    badge = '🏆 穿越牛熊的资产配置大师';
    summary =
      '太惊艳了！你既吃到了经济增长与复利的大肉，又用多元配置和冷静纪律避开了泡沫与恐慌割肉，完美跑赢通胀与盲目散户！';
  } else if (score >= 75) {
    badge = '🧭 稳健理性的投资舵手';
    summary =
      '非常出色的表现！你懂得利用宽基 ETF、债券与黄金分散风险，已经远远超越了市场上大多数追涨杀跌的投资者。';
  } else if (!beatCash) {
    badge = '🛡️ 过度保守的存钱守护者';
    summary =
      '你很看重本金安全，没亏钱，但因为长期把太多资金闲置在现金里或在低点割肉，没能充分享受到复利和经济增长红利。';
  }

  return {
    score,
    badge,
    summary,
    finalValue: Math.round(snap.totalValue),
    totalDeposited: Math.round(state.totalDeposited),
    totalProfit: Math.round(snap.totalProfit),
    totalReturnPct: snap.totalReturnPct,
    approxAnnualizedPct,
    maxDrawdownPct: +maxDrawdownPct.toFixed(1),
    broadBenchmark: last.broadBenchmark,
    cashOnlyBenchmark: last.cashOnlyBenchmark,
    fomoXiaomingBenchmark: last.fomoXiaomingBenchmark,
    beatCash,
    beatXiaoming,
    beatBroad,
    panicSellCount: state.panicSellCount,
    fomoBuyCount: state.fomoBuyCount
  };
}
