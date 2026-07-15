// Initialize rules on load
document.addEventListener('DOMContentLoaded', () => {
  // Set default period based on current date (before 2026 -> default to 2025)
  const currentDate = new Date();
  const transitionDate = new Date('2026-01-01T00:00:00');
  if (currentDate < transitionDate) {
    const radio2025 = document.querySelector('input[name="tax_period"][value="2025"]');
    if (radio2025) radio2025.checked = true;
  }

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
