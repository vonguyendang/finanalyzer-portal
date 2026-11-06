// Initialize rules on load
document.addEventListener('DOMContentLoaded', () => {
  if (typeof loadData === 'function') loadData();
  if (typeof updatePeriodRules === 'function') updatePeriodRules();
  
  const layout = document.querySelector('.tncn-layout');
  if (layout) {
    layout.addEventListener('input', () => { if(typeof saveData === 'function') saveData() });
    layout.addEventListener('change', () => { if(typeof saveData === 'function') saveData() });
  }
  
  const periodToggle = document.querySelector('.tncn-period-toggle');
  if (periodToggle) {
    periodToggle.addEventListener('change', () => { 
      if (typeof updatePeriodRules === 'function') updatePeriodRules();
      if(typeof saveData === 'function') saveData(); 
    });
  }
});
