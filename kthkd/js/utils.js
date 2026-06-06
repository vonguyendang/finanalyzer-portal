// ═══════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function fN(n){return isNaN(n)?'0':Math.round(n).toLocaleString('vi-VN')}
function fmt(n){
  n=Math.abs(n);
  if(n>=1e9){var v=n/1e9;return(v===Math.floor(v)?v.toFixed(0):v.toFixed(2).replace(/\.?0+$/,''))+' tỷ';}
  if(n>=1e6){return Math.round(n/1e6)+' triệu';}
  return fN(n);
}
function fDate(d){return d?d.replace(/-/g,'/'):''}
function today(){return new Date().toISOString().slice(0,10)}
function parseN(s){return parseFloat(String(s).replace(/[^0-9.]/g,''))||0}
function $(id){return document.getElementById(id)}
function toast(msg,type){
  var t=$('toast');t.textContent=msg;t.className='t-'+(type||'ok')+' show';
  setTimeout(function(){t.className='';},2800);
}

