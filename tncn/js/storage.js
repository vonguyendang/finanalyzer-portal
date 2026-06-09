function saveData() {
  const data = {
    netIncome: document.getElementById('net-income').value,
    netDependents: document.getElementById('net-dependents').value,
    grossIncome: document.getElementById('gross-income').value,
    grossInsurance: document.getElementById('gross-insurance').value,
    grossRegion: document.getElementById('gross-region').value,
    grossDependents: document.getElementById('gross-dependents').value,
    refundDependents: document.getElementById('refund-dependents').value,
    refundMonths: document.getElementById('refund-months').value,
    period: document.querySelector('input[name="tax_period"]:checked').value
  };

  let grossExtra = [];
  document.querySelectorAll('.gross-extra-input').forEach(el => {
    grossExtra.push(el.value);
  });
  data.grossExtra = grossExtra;

  let refundSources = [];
  document.querySelectorAll('#refund-sources-container .source-block').forEach(block => {
    let titleText = '';
    const titleDiv = block.querySelector('.block-title-small');
    if (titleDiv && titleDiv.childNodes.length > 0 && titleDiv.childNodes[0].nodeType === Node.TEXT_NODE) {
      titleText = titleDiv.childNodes[0].textContent.trim();
    }
    refundSources.push({
      gross: block.querySelector('.refund-gross-input').value,
      ins: block.querySelector('.refund-ins-input').value,
      deducted: block.querySelector('.refund-deducted-input').value,
      title: titleText
    });
  });
  data.refundSources = refundSources;

  localStorage.setItem('tncn_data', JSON.stringify(data));
}

function loadData() {
  const dataStr = localStorage.getItem('tncn_data');
  if (dataStr) {
    try {
      const data = JSON.parse(dataStr);
      if(data.netIncome) document.getElementById('net-income').value = data.netIncome;
      if(data.netDependents) document.getElementById('net-dependents').value = data.netDependents;
      if(data.grossIncome) document.getElementById('gross-income').value = data.grossIncome;
      if(data.grossInsurance) document.getElementById('gross-insurance').value = data.grossInsurance;
      if(data.grossRegion) document.getElementById('gross-region').value = data.grossRegion;
      if(data.grossDependents) document.getElementById('gross-dependents').value = data.grossDependents;
      if(data.refundDependents) document.getElementById('refund-dependents').value = data.refundDependents;
      if(data.refundMonths) document.getElementById('refund-months').value = data.refundMonths;
      if(data.period) {
        const r = document.querySelector(`input[name="tax_period"][value="${data.period}"]`);
        if(r) r.checked = true;
      }

      if(data.grossExtra && data.grossExtra.length > 0) {
        document.getElementById('gross-extra-sources').innerHTML = '';
        const btnAddGrossSource = document.getElementById('btn-add-gross-source');
        data.grossExtra.forEach(val => {
          if (btnAddGrossSource) btnAddGrossSource.click();
          const inputs = document.querySelectorAll('.gross-extra-input');
          inputs[inputs.length - 1].value = val;
        });
      }

      if(data.refundSources && data.refundSources.length > 0) {
        document.getElementById('refund-sources-container').innerHTML = '';
        const btnAddRefundSource = document.getElementById('btn-add-refund-source');
        data.refundSources.forEach(src => {
          if (btnAddRefundSource) btnAddRefundSource.click();
          const blocks = document.querySelectorAll('#refund-sources-container .source-block');
          const lastBlock = blocks[blocks.length - 1];
          lastBlock.querySelector('.refund-gross-input').value = src.gross;
          lastBlock.querySelector('.refund-ins-input').value = src.ins;
          lastBlock.querySelector('.refund-deducted-input').value = src.deducted;
          
          if (src.title) {
            const titleDiv = lastBlock.querySelector('.block-title-small');
            if (titleDiv && titleDiv.childNodes.length > 0 && titleDiv.childNodes[0].nodeType === Node.TEXT_NODE) {
              titleDiv.childNodes[0].textContent = src.title + ' ';
            }
          }
        });
      }
    } catch(e) {}
  }
}

function clearData() {
  if(!confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đã nhập?')) return;
  localStorage.removeItem('tncn_data');

  document.getElementById('net-income').value = '';
  document.getElementById('net-dependents').value = '';
  document.getElementById('gross-income').value = '';
  document.getElementById('gross-insurance').value = '';
  document.getElementById('gross-region').value = '1';
  document.getElementById('gross-dependents').value = '';
  document.getElementById('refund-dependents').value = '';
  document.getElementById('refund-months').value = '';

  document.getElementById('gross-extra-sources').innerHTML = '';
  
  document.getElementById('refund-sources-container').innerHTML = '';
  const btnAddRefundSource = document.getElementById('btn-add-refund-source');
  if (btnAddRefundSource) btnAddRefundSource.click(); // add 1 empty default source

  if (window.importedPdfNames) window.importedPdfNames.clear();
  const fileListEl = document.getElementById('imported-files-list');
  if (fileListEl) fileListEl.innerHTML = '';

  document.querySelector('input[name="tax_period"][value="2026"]').checked = true;
  
  if (typeof updatePeriodRules === 'function') updatePeriodRules();
  if (typeof triggerCalculations === 'function') triggerCalculations();

  window.scrollTo({top: 0, behavior: 'smooth'});
}
