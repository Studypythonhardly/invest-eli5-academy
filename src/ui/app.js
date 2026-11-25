/**
 * 零基础投资冒险学院（InvestELI5 Academy）主应用控制器
 * 负责：导航路由、学习地图、三层 ELI5 课程渲染、内联术语点击即懂弹窗、成长等级系统、主题与红绿习惯切换
 */

import { GLOSSARY, GLOSSARY_CATEGORIES } from '../data/glossary.js';
import { CHAPTERS_PART1 } from '../data/curriculumPart1.js';
import { CHAPTERS_PART2 } from '../data/curriculumPart2.js';
import { LAB_META, mountLab } from '../labs/interactiveLabs.js';
import { mountTenYearSandbox, mountMarketChecklist } from '../labs/tenYearSandbox.js';

export const ALL_CHAPTERS = [...CHAPTERS_PART1, ...CHAPTERS_PART2];
export const ALL_LESSONS = ALL_CHAPTERS.flatMap((ch) =>
  ch.lessons.map((l) => ({ ...l, chapterId: ch.id, chapterTitle: ch.title, chapterIcon: ch.icon }))
);

const STORAGE_KEY = 'invest_eli5_academy_v1';

const RANKS = [
  { minXp: 0, title: 'Lv.0 金融萌新', nextXp: 150 },
  { minXp: 150, title: 'Lv.1 理财学徒', nextXp: 350 },
  { minXp: 350, title: 'Lv.2 股市观察员', nextXp: 600 },
  { minXp: 600, title: 'Lv.3 基金达人', nextXp: 900 },
  { minXp: 900, title: 'Lv.4 ETF 猎手', nextXp: 1200 },
  { minXp: 1200, title: 'Lv.5 宏观解码师', nextXp: 1550 },
  { minXp: 1550, title: 'Lv.6 全能投资舵手', nextXp: 2000 }
];

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        completedLessons: parsed.completedLessons || [],
        triedLabs: parsed.triedLabs || [],
        xp: parsed.xp || 0,
        sandboxGraduated: Boolean(parsed.sandboxGraduated),
        theme: parsed.theme || 'light',
        marketColor: parsed.marketColor || 'cn' // 'cn' 红涨绿跌 | 'global' 绿涨红跌
      };
    }
  } catch {
    // 忽略隐私模式存储异常
  }
  return {
    completedLessons: [],
    triedLabs: [],
    xp: 0,
    sandboxGraduated: false,
    theme: 'light',
    marketColor: 'cn'
  };
}

function saveProgress(prog) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prog));
  } catch {
    // 忽略存储异常
  }
}

/**
 * 将正文中 **加粗** 与 [[glossaryId|显示文字]] 渲染为安全的交互 HTML
 */
export function renderRichEli5Text(text) {
  if (!text) return '';
  let html = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 加粗语法
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // 术语胶囊 [[id|label]]
  html = html.replace(/\[\[([a-zA-Z0-9_-]+)\|([^\]]+)\]\]/g, (_, id, label) => {
    if (GLOSSARY[id]) {
      return `<span class="glossary-term" role="button" tabindex="0" data-glossary="${id}" title="点击查看 5 岁大白话解释">${label}</span>`;
    }
    return `<strong>${label}</strong>`;
  });

  return html;
}

function getRank(xp) {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.minXp) current = r;
  }
  return current;
}

export function initApp() {
  const progress = loadProgress();
  const appState = {
    view: 'home', // home | lesson | labs | sandbox | checklist | glossary
    lessonId: ALL_LESSONS[0].id,
    activeLabId: 'compound',
    glossaryQuery: '',
    glossaryCategory: '全部',
    expandedChapterId: ALL_CHAPTERS[0].id,
    quizAnswered: {},
    mobileMenuOpen: false
  };

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', progress.theme);
    document.documentElement.setAttribute('data-market-color', progress.marketColor);
  }
  applyTheme();

  let toastTimer = null;
  function showToast(msg) {
    const el = document.getElementById('app-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  function addXp(amount, reason) {
    progress.xp += amount;
    saveProgress(progress);
    showToast(`✨ +${amount} XP · ${reason}`);
    renderSidebar();
  }

  function markLessonDone(lesson) {
    if (!progress.completedLessons.includes(lesson.id)) {
      progress.completedLessons.push(lesson.id);
      addXp(lesson.xp, `完成《${lesson.title}》`);
    }
  }

  function markLabTried(labId) {
    if (!progress.triedLabs.includes(labId)) {
      progress.triedLabs.push(labId);
      addXp(30, '动手完成互动金融实验！');
    }
  }

  // 打开 ELI5 术语弹窗
  function openGlossaryModal(termId) {
    const item = GLOSSARY[termId];
    if (!item) return;
    const backdrop = document.getElementById('glossary-modal');
    const body = document.getElementById('glossary-modal-body');
    if (!backdrop || !body) return;

    body.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;">
        <div>
          <span class="lab-badge">${item.category} · ELI5 大白话词条</span>
          <h2 style="margin:8px 0 0;font-size:21px;">${item.term}</h2>
        </div>
        <button class="modal-close" id="close-modal-btn" aria-label="关闭">✕</button>
      </div>
      <div class="eli5-box" style="margin:12px 0;">
        <div class="eli5-box-title">🧒 5 岁小孩也能懂的一句话</div>
        <p style="margin:0;font-size:15px;font-weight:600;">${item.eli5}</p>
      </div>
      <div class="bridge-box" style="margin:12px 0;">
        <div class="bridge-box-title">🧋 生活中的神比喻</div>
        <p style="margin:0;font-size:14.5px;">${item.analogy}</p>
      </div>
      <div class="trap-box" style="margin:12px 0 0;">
        <div class="trap-box-title">🎯 实战一句话提醒</div>
        <p style="margin:0;font-size:14px;">${item.tip}</p>
      </div>
    `;
    backdrop.classList.add('open');
    document.getElementById('close-modal-btn')?.addEventListener('click', closeGlossaryModal);
  }

  function closeGlossaryModal() {
    document.getElementById('glossary-modal')?.classList.remove('open');
  }

  // 全局委托点击与键盘触发术语胶囊
  document.addEventListener('click', (e) => {
    const termEl = e.target.closest('[data-glossary]');
    if (termEl) {
      openGlossaryModal(termEl.dataset.glossary);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeGlossaryModal();
    if ((e.key === 'Enter' || e.key === ' ') && e.target?.dataset?.glossary) {
      e.preventDefault();
      openGlossaryModal(e.target.dataset.glossary);
    }
  });

  function navigate(view, opts = {}) {
    appState.view = view;
    if (opts.lessonId) {
      appState.lessonId = opts.lessonId;
      const found = ALL_LESSONS.find((l) => l.id === opts.lessonId);
      if (found) appState.expandedChapterId = found.chapterId;
    }
    if (opts.labId) appState.activeLabId = opts.labId;
    appState.mobileMenuOpen = false;
    renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    if (!sidebar) return;

    const doneCount = progress.completedLessons.length;
    const totalLessons = ALL_LESSONS.length;
    const pct = Math.round((doneCount / totalLessons) * 100);
    const rank = getRank(progress.xp);

    sidebar.classList.toggle('open', appState.mobileMenuOpen);
    document.getElementById('sidebar-overlay')?.classList.toggle('open', appState.mobileMenuOpen);

    sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="brand-row" style="cursor:pointer;" data-nav="home">
          <div class="brand-logo">🧭</div>
          <div>
            <div class="brand-title">零基础投资冒险学院</div>
            <div class="brand-sub">ELI5 大白话 · 互动金融实验室</div>
          </div>
        </div>
        <div class="progress-widget">
          <div class="progress-top">
            <span class="rank-pill">${rank.title}</span>
            <span>${progress.xp} XP</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width:${pct}%;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-top:5px;">
            <span>课程进度 ${doneCount}/${totalLessons}</span>
            <span>实验 ${progress.triedLabs.length}/${LAB_META.length}</span>
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label">核心导航</div>
        <button class="nav-item ${appState.view === 'home' ? 'active' : ''}" data-nav="home">
          <span>🗺️</span><span>成长地图总览</span>
        </button>
        <button class="nav-item ${appState.view === 'labs' ? 'active' : ''}" data-nav="labs">
          <span>🧪</span><span>7 大互动金融实验室</span><span class="nav-badge">7</span>
        </button>
        <button class="nav-item ${appState.view === 'sandbox' ? 'active' : ''}" data-nav="sandbox">
          <span>🎮</span><span>10 年牛熊实战沙盒</span><span class="nav-badge">${progress.sandboxGraduated ? '🏆' : '实战'}</span>
        </button>
        <button class="nav-item ${appState.view === 'checklist' ? 'active' : ''}" data-nav="checklist">
          <span>📋</span><span>市场走向 5 步分析清单</span>
        </button>
        <button class="nav-item ${appState.view === 'glossary' ? 'active' : ''}" data-nav="glossary">
          <span>📖</span><span>ELI5 大白话词典</span><span class="nav-badge">${Object.keys(GLOSSARY).length}</span>
        </button>

        <div class="nav-section-label" style="margin-top:10px;">系统课程（从 0 到 1）</div>
        ${ALL_CHAPTERS.map((ch) => {
          const chDone = ch.lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
          const isExpanded = appState.expandedChapterId === ch.id;
          return `
            <div>
              <button class="nav-chapter-btn" data-toggle-ch="${ch.id}">
                <span>${ch.icon}</span>
                <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${ch.title.replace(/^第.+篇：/, '')}</span>
                <span style="font-size:11px;color:var(--text-muted);font-weight:600;">${chDone}/${ch.lessons.length}</span>
              </button>
              ${
                isExpanded
                  ? `<div class="nav-lesson-list">
                      ${ch.lessons
                        .map((l) => {
                          const done = progress.completedLessons.includes(l.id);
                          const isAct = appState.view === 'lesson' && appState.lessonId === l.id;
                          return `
                            <button class="nav-lesson-item ${isAct ? 'active' : ''}" data-lesson="${l.id}">
                              <span class="lesson-dot ${done ? 'done' : ''}">${done ? '✓' : ''}</span>
                              <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${l.title}</span>
                            </button>
                          `;
                        })
                        .join('')}
                    </div>`
                  : ''
              }
            </div>
          `;
        }).join('')}
      </nav>
    `;

    sidebar.querySelectorAll('[data-nav]').forEach((el) => {
      el.addEventListener('click', () => navigate(el.dataset.nav));
    });
    sidebar.querySelectorAll('[data-toggle-ch]').forEach((el) => {
      el.addEventListener('click', () => {
        appState.expandedChapterId = appState.expandedChapterId === el.dataset.toggleCh ? null : el.dataset.toggleCh;
        renderSidebar();
      });
    });
    sidebar.querySelectorAll('[data-lesson]').forEach((el) => {
      el.addEventListener('click', () => navigate('lesson', { lessonId: el.dataset.lesson }));
    });
  }

  function renderTopbar() {
    const breadcrumb = document.getElementById('app-breadcrumb');
    const colorBtn = document.getElementById('toggle-market-color');
    const themeBtn = document.getElementById('toggle-theme');

    if (breadcrumb) {
      if (appState.view === 'home') breadcrumb.innerHTML = '<strong>成长地图</strong> · 零基础投资全景路线';
      else if (appState.view === 'labs') breadcrumb.innerHTML = '<strong>互动金融实验室</strong> · 动手调参学透底层原理';
      else if (appState.view === 'sandbox') breadcrumb.innerHTML = '<strong>毕业实战沙盒</strong> · 10 年穿越牛熊模拟盘';
      else if (appState.view === 'checklist') breadcrumb.innerHTML = '<strong>实操决策罗盘</strong> · 下单前 5 步市场分析';
      else if (appState.view === 'glossary') breadcrumb.innerHTML = '<strong>ELI5 大白话词典</strong> · 随时查词秒懂';
      else {
        const l = ALL_LESSONS.find((x) => x.id === appState.lessonId);
        breadcrumb.innerHTML = l ? `${l.chapterTitle} / <strong>${l.title}</strong>` : '课程学习';
      }
    }

    if (colorBtn) {
      colorBtn.innerHTML =
        progress.marketColor === 'cn'
          ? '🔴🟢 红涨绿跌 (A股)'
          : '🟢🔴 绿涨红跌 (国际)';
    }
    if (themeBtn) {
      themeBtn.innerHTML = progress.theme === 'dark' ? '☀️ 浅色' : '🌙 深色';
    }
  }

  function renderMainContent() {
    const main = document.getElementById('app-main');
    if (!main) return;

    if (appState.view === 'home') return renderHome(main);
    if (appState.view === 'lesson') return renderLesson(main);
    if (appState.view === 'labs') return renderLabsHub(main);
    if (appState.view === 'sandbox') {
      mountTenYearSandbox(main, () => {
        if (!progress.sandboxGraduated) {
          progress.sandboxGraduated = true;
          addXp(200, '通关 10 年穿越牛熊实战沙盒！');
        }
      });
      return;
    }
    if (appState.view === 'checklist') {
      mountMarketChecklist(main);
      return;
    }
    if (appState.view === 'glossary') return renderGlossaryPage(main);
  }

  /* ------------------------------------------------------------------------
     视图 1：成长地图首页
     ------------------------------------------------------------------------ */
  function renderHome(main) {
    // 找下一节还没学完的课
    const nextLesson = ALL_LESSONS.find((l) => !progress.completedLessons.includes(l.id)) || ALL_LESSONS[0];
    const doneCount = progress.completedLessons.length;
    const rank = getRank(progress.xp);

    main.innerHTML = `
      <div class="hero-card" style="margin-bottom:22px;">
        <div class="hero-tag">🧒 ELI5 零门槛教学法 · 拒绝晦涩灌输</div>
        <h1 class="hero-title">从金融零基础，到独立看懂股票、基金、ETF 与市场走向</h1>
        <p style="font-size:15px;margin:0 0 20px;">
          别怕看不懂术语！这里每一课都先给你讲一个 <strong>5 岁小孩也能听懂的生活故事</strong>（比如开奶茶店、买水果拼盘、拔河比赛），再用<strong>可拖拽的互动模拟器</strong>让你亲眼验证规律，正文中所有带虚线的专业名词<strong>点一下就能弹出大白话解释</strong>！
        </p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-white" id="home-start-btn">
            ${doneCount === 0 ? '🚀 从第 1 课零基础启程' : `▶ 继续学习：${nextLesson.title}`}
          </button>
          <button class="btn btn-ghost-light" id="home-labs-btn">🧪 直接玩 7 大金融模拟器</button>
          <button class="btn btn-ghost-light" id="home-sandbox-btn">🎮 挑战 10 年牛熊实战沙盒</button>
        </div>
      </div>

      <!-- 三步教学法说明卡 -->
      <div class="grid-3" style="margin-bottom:22px;">
        <div class="card" style="padding:16px 18px;">
          <div style="font-size:22px;margin-bottom:6px;">🧒</div>
          <div style="font-weight:800;margin-bottom:4px;">1. 先听生活大白话</div>
          <div style="font-size:13px;color:var(--text-secondary);">绝不劈头盖脸甩公式！先用奶茶店、雨伞墨镜、水龙头建立直觉。</div>
        </div>
        <div class="card" style="padding:16px 18px;">
          <div style="font-size:22px;margin-bottom:6px;">🎛️</div>
          <div style="font-weight:800;margin-bottom:4px;">2. 动手拨动模拟器</div>
          <div style="font-size:13px;color:var(--text-secondary);">亲手调利率、拉情绪滑块、测微笑曲线，玩 2 分钟胜过背书 2 小时。</div>
        </div>
        <div class="card" style="padding:16px 18px;">
          <div style="font-size:22px;margin-bottom:6px;">🎯</div>
          <div style="font-weight:800;margin-bottom:4px;">3. 十年沙盒通关实战</div>
          <div style="font-size:13px;color:var(--text-secondary);">拿 10 万虚拟本金走完 40 个季度牛熊周期，带走一套现实市场分析清单。</div>
        </div>
      </div>

      <!-- 快速定位入口（按基础一键直达） -->
      <div class="card" style="margin-bottom:22px;padding:16px 20px;">
        <div style="font-size:13px;font-weight:800;margin-bottom:10px;color:var(--text-secondary);">🎯 按你现在的水平，挑一个最舒服的起点：</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="pill-btn" data-jump-lesson="l1-1">🌱 完全零基础小白 → 第1课《通货膨胀》</button>
          <button class="pill-btn" data-jump-lesson="l3-1">📈 想看懂股票大盘走向 → 第3篇《大盘指数与四维罗盘》</button>
          <button class="pill-btn" data-jump-lesson="l5-1">🧺 想精通 ETF 与定投 → 第5篇《ETF 完全精通》</button>
          <button class="pill-btn" data-jump-lesson="l6-1">🌊 想听懂加息降息与宏观 → 第6篇《利率跷跷板与美林时钟》</button>
          <button class="pill-btn" data-jump-view="checklist">📋 马上分析现实市场 → 《5步决策检查清单》</button>
        </div>
      </div>

      <!-- 学习数据条 -->
      <div class="card" style="margin-bottom:22px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">
        <div>
          <div style="font-size:12px;color:var(--text-muted);">当前学习段位</div>
          <div style="font-size:19px;font-weight:900;color:var(--brand);">${rank.title} · ${progress.xp} XP</div>
        </div>
        <div style="display:flex;gap:22px;flex-wrap:wrap;">
          <div>
            <div style="font-size:12px;color:var(--text-muted);">课程完成</div>
            <div style="font-size:18px;font-weight:800;font-family:var(--font-mono);">${doneCount} / ${ALL_LESSONS.length} 节</div>
          </div>
          <div>
            <div style="font-size:12px;color:var(--text-muted);">已体验实验室</div>
            <div style="font-size:18px;font-weight:800;font-family:var(--font-mono);">${progress.triedLabs.length} / ${LAB_META.length} 个</div>
          </div>
          <div>
            <div style="font-size:12px;color:var(--text-muted);">10 年沙盒通关</div>
            <div style="font-size:18px;font-weight:800;">${progress.sandboxGraduated ? '🏆 已毕业' : '待挑战'}</div>
          </div>
        </div>
        <button class="btn btn-outline btn-sm" id="home-reset-progress">重置进度</button>
      </div>

      <h2 style="margin:0 0 14px;font-size:19px;">🗺️ 完整 8 大阶段进阶路线图</h2>
      <div class="grid-2">
        ${ALL_CHAPTERS.map((ch) => {
          const chDone = ch.lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
          const pct = Math.round((chDone / ch.lessons.length) * 100);
          return `
            <div class="chapter-card" data-open-ch="${ch.id}">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span class="chapter-icon">${ch.icon}</span>
                <span class="lab-badge">${ch.level}</span>
              </div>
              <h3 class="chapter-title">${ch.title}</h3>
              <p class="chapter-desc">${ch.subtitle}</p>
              <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:5px;">
                <span>共 ${ch.lessons.length} 节互动课 + 专属实验室</span>
                <strong>${chDone}/${ch.lessons.length} 完成</strong>
              </div>
              <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width:${pct}%;"></div>
              </div>
            </div>
          `;
        }).join('')}

        <!-- 第八篇：毕业级 10 年沙盒卡片 -->
        <div class="chapter-card" data-open-sandbox="1" style="border-color:var(--brand);background:var(--brand-soft);">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="chapter-icon">🎮</span>
            <span class="lab-badge" style="background:var(--brand);color:#fff;">终极毕业挑战</span>
          </div>
          <h3 class="chapter-title">第八篇：10 年穿越牛熊全景实战沙盒</h3>
          <p class="chapter-desc">拿 ¥100,000 虚拟本金亲历复苏、狂热泡沫、滞胀加息与黑天鹅熊市，检验你是否真正练成理性投资高手！</p>
          <div style="font-size:12.5px;font-weight:700;color:var(--brand);">
            ${progress.sandboxGraduated ? '🏆 已通关！点击随时再战一轮 →' : '▶ 点击立即进入 40 季度实战模拟 →'}
          </div>
        </div>
      </div>
    `;

    main.querySelector('#home-start-btn')?.addEventListener('click', () => navigate('lesson', { lessonId: nextLesson.id }));
    main.querySelector('#home-labs-btn')?.addEventListener('click', () => navigate('labs'));
    main.querySelector('#home-sandbox-btn')?.addEventListener('click', () => navigate('sandbox'));
    main.querySelectorAll('[data-jump-lesson]').forEach((btn) => {
      btn.addEventListener('click', () => navigate('lesson', { lessonId: btn.dataset.jumpLesson }));
    });
    main.querySelectorAll('[data-jump-view]').forEach((btn) => {
      btn.addEventListener('click', () => navigate(btn.dataset.jumpView));
    });
    main.querySelectorAll('[data-open-ch]').forEach((card) => {
      card.addEventListener('click', () => {
        const ch = ALL_CHAPTERS.find((c) => c.id === card.dataset.openCh);
        if (ch) {
          const firstUndone = ch.lessons.find((l) => !progress.completedLessons.includes(l.id)) || ch.lessons[0];
          navigate('lesson', { lessonId: firstUndone.id });
        }
      });
    });
    main.querySelector('[data-open-sandbox]')?.addEventListener('click', () => navigate('sandbox'));
    main.querySelector('#home-reset-progress')?.addEventListener('click', () => {
      if (confirm('确定要清空当前学习进度和经验值，重新从 Lv.0 开始吗？')) {
        progress.completedLessons = [];
        progress.triedLabs = [];
        progress.xp = 0;
        progress.sandboxGraduated = false;
        saveProgress(progress);
        renderAll();
        showToast('已重置学习进度，欢迎重新开启冒险！');
      }
    });
  }

  /* ------------------------------------------------------------------------
     视图 2：三层 ELI5 精讲课程页（含内嵌实验室 + 随堂闯关小测）
     ------------------------------------------------------------------------ */
  function renderLesson(main) {
    const idx = ALL_LESSONS.findIndex((l) => l.id === appState.lessonId);
    const lesson = ALL_LESSONS[idx] || ALL_LESSONS[0];
    const prevLesson = idx > 0 ? ALL_LESSONS[idx - 1] : null;
    const nextLesson = idx < ALL_LESSONS.length - 1 ? ALL_LESSONS[idx + 1] : null;
    const isDone = progress.completedLessons.includes(lesson.id);
    const chosen = appState.quizAnswered[lesson.id];

    main.innerHTML = `
      <article class="card lesson-article">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
          <span class="lab-badge">${lesson.chapterIcon} ${lesson.chapterTitle} · 第 ${idx + 1} / ${ALL_LESSONS.length} 课</span>
          <span style="font-size:12.5px;color:var(--text-muted);">⏱️ 预计 ${lesson.minutes} 分钟 · 奖励 +${lesson.xp} XP · ${isDone ? '✅ 已掌握' : '学习中'}</span>
        </div>

        <h1 style="margin:0 0 8px;font-size:25px;line-height:1.3;">${lesson.title}</h1>
        <p style="font-size:13px;color:var(--text-muted);margin:0 0 18px;">
          💡 阅读小提示：正文里所有 <span class="glossary-term" data-glossary="etf">带虚线的金融名词</span> 都可以直接点击，立刻弹出 5 岁大白话解释！
        </p>

        <!-- 第一层：5岁大白话故事 -->
        <div class="eli5-box">
          <div class="eli5-box-title">🧒 第一层 · 5 岁小孩也能听懂的故事（零术语直觉）</div>
          <p style="margin:0;font-size:15.5px;line-height:1.75;">${renderRichEli5Text(lesson.eli5Story)}</p>
        </div>

        <!-- 第二层：核心原理拆解 -->
        <h2>🔍 第二层 · 拆解它到底是怎么运转的</h2>
        ${lesson.howItWorks.map((p) => `<p>${renderRichEli5Text(p)}</p>`).join('')}

        <!-- 第三层：正式金融桥梁 -->
        <div class="bridge-box">
          <div class="bridge-box-title">🎓 第三层 · 正式金融世界的名字与实战用法</div>
          <p style="margin:0;font-size:14.5px;">${renderRichEli5Text(lesson.proBridge)}</p>
        </div>

        <!-- 新手避坑 -->
        <div class="trap-box">
          <div class="trap-box-title">⚠️ 新手最容易踩的坑（千万避开！）</div>
          <p style="margin:0;font-size:14.5px;">${renderRichEli5Text(lesson.pitfall)}</p>
        </div>

        <!-- 嵌入式互动实验室挂载点 -->
        ${lesson.labId ? '<div id="lesson-embedded-lab"></div>' : ''}

        <!-- 随堂情景小测验 -->
        ${
          lesson.quiz
            ? `
          <div class="quiz-card">
            <div style="font-size:12.5px;font-weight:800;color:var(--brand);margin-bottom:6px;">✅ 随堂小闯关（答对自动点亮本课并赢取 +${lesson.xp} XP）</div>
            <div style="font-size:15.5px;font-weight:700;margin-bottom:10px;">${lesson.quiz.question}</div>
            <div>
              ${lesson.quiz.options
                .map((opt, oIdx) => {
                  let cls = '';
                  if (chosen !== undefined) {
                    if (oIdx === lesson.quiz.correctIndex) cls = 'correct';
                    else if (oIdx === chosen) cls = 'wrong';
                  }
                  return `
                    <button class="quiz-option ${cls}" data-quiz-opt="${oIdx}">
                      <strong style="color:var(--brand);">${String.fromCharCode(65 + oIdx)}.</strong>
                      <span>${opt}</span>
                    </button>
                  `;
                })
                .join('')}
            </div>
            ${
              chosen !== undefined
                ? `
              <div class="quiz-feedback ${chosen === lesson.quiz.correctIndex ? 'ok' : 'err'}">
                <strong>${chosen === lesson.quiz.correctIndex ? '🎉 回答正确！' : '🤔 差一点点！再看一眼解析：'}</strong>
                ${lesson.quiz.explanation}
              </div>
            `
                : ''
            }
          </div>
        `
            : ''
        }

        <div class="lesson-nav-footer">
          <div>
            ${
              prevLesson
                ? `<button class="btn btn-outline" id="prev-lesson-btn">← 上一课：${prevLesson.title.slice(0, 14)}...</button>`
                : `<button class="btn btn-outline" id="back-home-btn">← 返回成长地图</button>`
            }
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            ${
              !isDone
                ? `<button class="btn btn-outline" id="mark-done-btn">✓ 标记本课已懂</button>`
                : ''
            }
            ${
              nextLesson
                ? `<button class="btn btn-primary" id="next-lesson-btn">下一课：${nextLesson.title.slice(0, 14)}... →</button>`
                : `<button class="btn btn-primary" id="go-sandbox-btn">🎮 毕业实战：进入 10 年牛熊沙盒 →</button>`
            }
          </div>
        </div>
      </article>
    `;

    // 如果本课绑定了互动实验室，自动挂载
    if (lesson.labId) {
      const labBox = main.querySelector('#lesson-embedded-lab');
      if (labBox) mountLab(labBox, lesson.labId, markLabTried);
    }

    // 绑定测验选项
    main.querySelectorAll('[data-quiz-opt]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const picked = Number(btn.dataset.quizOpt);
        appState.quizAnswered[lesson.id] = picked;
        if (picked === lesson.quiz.correctIndex) {
          markLessonDone(lesson);
        }
        renderLesson(main);
      });
    });

    main.querySelector('#mark-done-btn')?.addEventListener('click', () => {
      markLessonDone(lesson);
      renderLesson(main);
    });
    main.querySelector('#prev-lesson-btn')?.addEventListener('click', () => navigate('lesson', { lessonId: prevLesson.id }));
    main.querySelector('#next-lesson-btn')?.addEventListener('click', () => navigate('lesson', { lessonId: nextLesson.id }));
    main.querySelector('#back-home-btn')?.addEventListener('click', () => navigate('home'));
    main.querySelector('#go-sandbox-btn')?.addEventListener('click', () => navigate('sandbox'));
  }

  /* ------------------------------------------------------------------------
     视图 3：7 大互动实验室大厅
     ------------------------------------------------------------------------ */
  function renderLabsHub(main) {
    main.innerHTML = `
      <div>
        <div class="hero-card" style="padding:24px 28px;margin-bottom:18px;">
          <div class="hero-tag">🧪 做中学 · 7 大金融可视化沙盒</div>
          <h1 class="hero-title" style="font-size:24px;">互动金融实验室大厅</h1>
          <p style="margin:0;font-size:14px;">金融规律背下来容易忘，但自己亲手拖动滑块玩过一遍就永远不会忘！点选任意主题立即开玩。</p>
        </div>

        <div class="seg-tabs" style="margin-bottom:16px;width:100%;">
          ${LAB_META.map(
            (m) => `
            <button class="seg-tab ${appState.activeLabId === m.id ? 'active' : ''}" data-pick-lab="${m.id}">
              ${m.icon} ${m.title} ${progress.triedLabs.includes(m.id) ? '✓' : ''}
            </button>
          `
          ).join('')}
        </div>

        <div id="hub-lab-mount"></div>
      </div>
    `;

    const mountBox = main.querySelector('#hub-lab-mount');
    if (mountBox) mountLab(mountBox, appState.activeLabId, markLabTried);

    main.querySelectorAll('[data-pick-lab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        appState.activeLabId = btn.dataset.pickLab;
        renderLabsHub(main);
      });
    });
  }

  /* ------------------------------------------------------------------------
     视图 4：ELI5 金融大白话术语百科全书（兼容中文拼音输入法，搜索时不重建输入框）
     ------------------------------------------------------------------------ */
  function renderGlossaryPage(main) {
    main.innerHTML = `
      <div>
        <div class="hero-card" style="padding:24px 28px;margin-bottom:18px;">
          <div class="hero-tag">📖 全站随时查 · ${Object.keys(GLOSSARY).length} 个高频金融词条</div>
          <h1 class="hero-title" style="font-size:24px;">ELI5 金融大白话百科词典</h1>
          <p style="margin:0;font-size:14px;">看到财经新闻、基金详情页或股票软件里不懂的词？在这里一搜即懂，每个词都配有 5 岁白话 + 生活神比喻！</p>
        </div>

        <div class="card" style="margin-bottom:18px;">
          <input type="text" class="search-input" id="glossary-search" placeholder="输入关键词搜索，比如：PE、ETF、溢价、加息、微笑曲线、美林时钟..." value="${appState.glossaryQuery.replace(/"/g, '&quot;')}">
          <div class="seg-tabs" id="glossary-cat-tabs" style="margin-top:12px;">
            ${GLOSSARY_CATEGORIES.map(
              (c) => `<button class="seg-tab ${appState.glossaryCategory === c ? 'active' : ''}" data-gcat="${c}">${c}</button>`
            ).join('')}
          </div>
        </div>

        <div class="grid-2" id="glossary-grid"></div>
      </div>
    `;

    const grid = main.querySelector('#glossary-grid');
    const renderCards = () => {
      const q = appState.glossaryQuery.trim().toLowerCase();
      const cat = appState.glossaryCategory;

      main.querySelectorAll('[data-gcat]').forEach((b) => {
        b.classList.toggle('active', b.dataset.gcat === cat);
      });

      const entries = Object.entries(GLOSSARY).filter(([, item]) => {
        const catOk = cat === '全部' || item.category === cat;
        const qOk =
          !q ||
          item.term.toLowerCase().includes(q) ||
          item.eli5.toLowerCase().includes(q) ||
          item.analogy.toLowerCase().includes(q);
        return catOk && qOk;
      });

      grid.innerHTML = entries.length
        ? entries
            .map(
              ([id, item]) => `
            <div class="card" style="margin:0;display:flex;flex-direction:column;gap:8px;cursor:pointer;" data-glossary="${id}">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                <strong style="font-size:15.5px;color:var(--brand);">${item.term}</strong>
                <span class="lab-badge" style="font-size:11px;">${item.category}</span>
              </div>
              <div style="font-size:14px;"><strong>🧒 大白话：</strong>${item.eli5}</div>
              <div style="font-size:13px;color:var(--text-secondary);"><strong>🧋 比喻：</strong>${item.analogy}</div>
              <div style="font-size:12.5px;color:var(--eli5-accent);background:var(--eli5-bg);padding:6px 10px;border-radius:8px;margin-top:auto;">
                🎯 ${item.tip}
              </div>
            </div>
          `
            )
            .join('')
        : `<div class="card" style="grid-column:1/-1;text-align:center;color:var(--text-muted);">没有找到匹配"${appState.glossaryQuery}"的词条，试试搜索"ETF"、"PE"或"利率"吧！</div>`;
    };

    main.querySelector('#glossary-search')?.addEventListener('input', (e) => {
      appState.glossaryQuery = e.target.value;
      renderCards();
    });
    main.querySelectorAll('[data-gcat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        appState.glossaryCategory = btn.dataset.gcat;
        renderCards();
      });
    });

    renderCards();
  }

  function renderAll() {
    renderSidebar();
    renderTopbar();
    renderMainContent();
  }

  // 顶部栏按钮绑定
  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    appState.mobileMenuOpen = !appState.mobileMenuOpen;
    renderSidebar();
  });
  document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
    appState.mobileMenuOpen = false;
    renderSidebar();
  });
  document.getElementById('toggle-market-color')?.addEventListener('click', () => {
    progress.marketColor = progress.marketColor === 'cn' ? 'global' : 'cn';
    saveProgress(progress);
    applyTheme();
    renderTopbar();
    showToast(
      progress.marketColor === 'cn'
        ? '已切换为中国 A 股习惯：红涨绿跌'
        : '已切换为国际/美股习惯：绿涨红跌'
    );
  });
  document.getElementById('toggle-theme')?.addEventListener('click', () => {
    progress.theme = progress.theme === 'dark' ? 'light' : 'dark';
    saveProgress(progress);
    applyTheme();
    renderTopbar();
  });
  document.getElementById('quick-glossary-btn')?.addEventListener('click', () => {
    navigate('glossary');
  });
  document.getElementById('glossary-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'glossary-modal') closeGlossaryModal();
  });

  renderAll();
}

// 浏览器环境自动启动
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}
