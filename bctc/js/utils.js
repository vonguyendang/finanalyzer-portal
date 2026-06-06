/* ═══════════════════════════════════════════════════
   HELPER FUNCTIONS
═══════════════════════════════════════════════════ */
const fmt = (v, d=0) => {
  if(v===null||v===undefined||v===''||isNaN(v)) return '–';
  const n = Number(v);
  if(Math.abs(n)<1000) return n.toLocaleString('vi-VN');
  return Math.round(n/1000).toLocaleString('vi-VN');
};
const fmtFull = v => v ? Number(v).toLocaleString('vi-VN') : '–';
const pct = (a,b) => {
  if(!b||b===0) return '–';
  const r = ((a-b)/Math.abs(b)*100);
  if(!isFinite(r)) return '–';
  return (r>=0?'+':'')+r.toFixed(1)+'%';
};
const pctVal = (a,b) => {
  if(!b||b===0) return null;
  return ((a-b)/Math.abs(b)*100);
};
const getXml = (doc, tag) => {
  const el = doc.querySelector(tag);
  return el ? parseFloat(el.textContent)||0 : 0;
};
const getXmlStr = (doc,tag) => {
  const el = doc.querySelector(tag);
  return el ? el.textContent.trim() : '';
};
const diff = (a,b) => {
  const d = a-b;
  return (d>=0?'+':'')+Math.round(d/1000).toLocaleString('vi-VN');
};
const pctCls = (a,b,inverted=false) => {
  const p = pctVal(a,b);
  if(p===null) return '';
  if(inverted) return p>0 ? 'nn' : p<0 ? 'np' : '';
  return p>0 ? 'np' : p<0 ? 'nn' : '';
};

/* ═══════════════════════════════════════════════════
   TAB NAVIGATION
═══════════════════════════════════════════════════ */
function switchTab(id, btn){
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.panel-section').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-'+id).classList.add('active');
}

/* ═══════════════════════════════════════════════════
   THEME TOGGLE
═══════════════════════════════════════════════════ */
(function initTheme(){
  // Restore saved preference or default to dark
  const saved = localStorage.getItem('finanalyzer-theme') || 'dark';
  applyTheme(saved, false);
})();

function toggleTheme(){
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next, true);
  localStorage.setItem('finanalyzer-theme', next);
}

function applyTheme(theme, animate){
  const html = document.documentElement;
  html.setAttribute('data-theme', theme);

  const isLight = theme === 'light';
  const icon  = isLight ? '☀️' : '🌙';
  const label = isLight ? 'Sáng' : 'Tối';

  // Update both toggle buttons
  ['Float','Dash'].forEach(id => {
    const iconEl  = document.getElementById(`theme${id}Icon`);
    const labelEl = document.getElementById(`theme${id}Label`);
    if(iconEl)  iconEl.textContent  = icon;
    if(labelEl) labelEl.textContent = label;
  });

  // Re-paint Chart.js charts to match new theme
  if(animate) {
    // Small delay so CSS vars have applied
    setTimeout(() => refreshChartColors(isLight), 80);
  }
}

function refreshChartColors(isLight){
  // Resolve current CSS variable values
  const style = getComputedStyle(document.documentElement);
  const gridColor  = style.getPropertyValue('--chart-grid').trim()  || (isLight ? 'rgba(180,200,224,0.5)' : 'rgba(30,45,74,0.6)');
  const tickColor  = style.getPropertyValue('--chart-tick').trim()  || (isLight ? '#374d6e' : '#8fa3c0');
  const textColor  = style.getPropertyValue('--text2').trim()       || (isLight ? '#374d6e' : '#8fa3c0');

  Chart.defaults.color       = tickColor;
  Chart.defaults.borderColor = gridColor;

  Object.values(charts).forEach(chart => {
    if(!chart || !chart.options) return;

    // Legend
    if(chart.options.plugins?.legend?.labels)
      chart.options.plugins.legend.labels.color = tickColor;

    // Scales (x and y)
    const scales = chart.options.scales || {};
    Object.values(scales).forEach(sc => {
      if(!sc) return;
      if(sc.grid)  sc.grid.color  = gridColor;
      if(sc.ticks) sc.ticks.color = tickColor;
    });

    chart.update('none'); // 'none' = no animation, instant repaint
  });
}
function toggleExportMenu(){
  const menu = document.getElementById('exportMenu');
  const btn  = document.getElementById('btnExport');
  const isOpen = menu.classList.contains('show');
  menu.classList.toggle('show', !isOpen);
  btn.classList.toggle('open', !isOpen);
}

// Close menu when clicking outside
document.addEventListener('click', e => {
  const wrap = document.getElementById('exportWrap');
  if(wrap && !wrap.contains(e.target)){
    document.getElementById('exportMenu').classList.remove('show');
    document.getElementById('btnExport').classList.remove('open');
  }
});

