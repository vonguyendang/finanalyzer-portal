/* ═══════════════════════════════════════════════════
   CHART DEFAULTS
═══════════════════════════════════════════════════ */
Chart.defaults.color = '#8fa3c0';
Chart.defaults.borderColor = '#1e2d4a';
Chart.defaults.font.family = "'Be Vietnam Pro', sans-serif";
const C = {
  gold:'rgba(245,166,35,0.8)',gold2:'rgba(245,166,35,0.45)',
  green:'rgba(0,232,122,0.8)',green2:'rgba(0,232,122,0.45)',
  red:'rgba(255,77,77,0.8)',red2:'rgba(255,77,77,0.45)',
  blue:'rgba(61,142,248,0.8)',blue2:'rgba(61,142,248,0.45)',
  cyan:'rgba(0,212,255,0.75)',purple:'rgba(167,139,250,0.75)',
  border:'#1e2d4a',
};

// Helper: read current theme CSS vars for chart colors
function getChartColors(){
  const st = getComputedStyle(document.documentElement);
  return {
    grid: st.getPropertyValue('--chart-grid').trim() || 'rgba(30,45,74,0.6)',
    tick: st.getPropertyValue('--chart-tick').trim() || '#8fa3c0',
  };
}
const ttPlugin = {
  callbacks:{label:ctx=>' '+Math.round(ctx.parsed.y).toLocaleString('vi-VN')+' tr.đ'}
};

/* store chart instances */
let charts = {};
let _currentData = null; // global reference for export functions

const mkChart = (id, cfg) => {
  if(charts[id]) charts[id].destroy();
  charts[id] = new Chart(document.getElementById(id), cfg);
  return charts[id];
};

