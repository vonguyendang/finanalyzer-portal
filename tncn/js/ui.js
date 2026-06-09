// Tab Switching
document.querySelectorAll('.tncn-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tncn-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tncn-tab-content').forEach(c => c.classList.remove('active'));
    
    tab.classList.add('active');
    document.getElementById(tab.dataset.target).classList.add('active');
  });
});

// Format currency
function formatCurrency(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseCurrency(str) {
  return parseFloat(str.replace(/,/g, '')) || 0;
}

// Input formatting
function initNumberFormat(input) {
  input.removeEventListener('input', handleNumberFormat);
  input.addEventListener('input', handleNumberFormat);
}

function handleNumberFormat(e) {
  let val = parseCurrency(this.value);
  if (val === 0 && this.value.trim() === '') {
    this.value = '';
  } else {
    this.value = formatCurrency(val);
  }
  if (typeof triggerCalculations === 'function') triggerCalculations();
}

document.querySelectorAll('.number-format').forEach(initNumberFormat);

// Extra sources logic for Cần nộp (GROSS)
window.reindexGrossSources = function() {
  const blocks = document.querySelectorAll('#gross-extra-sources .source-block');
  let counter = 1;
  blocks.forEach((block) => {
    const titleDiv = block.querySelector('.block-title-small');
    if (titleDiv && titleDiv.childNodes.length > 0 && titleDiv.childNodes[0].nodeType === Node.TEXT_NODE) {
      const text = titleDiv.childNodes[0].textContent.trim();
      if (text.startsWith('Nguồn thu nhập vãng lai')) {
        titleDiv.childNodes[0].textContent = `Nguồn thu nhập vãng lai ${counter} `;
      }
    }
    counter++;
  });
};

const btnAddGrossSource = document.getElementById('btn-add-gross-source');
const grossExtraSources = document.getElementById('gross-extra-sources');

if (btnAddGrossSource) {
  btnAddGrossSource.addEventListener('click', () => {
    const currentCount = document.querySelectorAll('#gross-extra-sources .source-block').length;
    const newIndex = currentCount + 1;
    const div = document.createElement('div');
    div.className = 'source-block';
    div.innerHTML = `
      <div class="block-title-small">
        Nguồn thu nhập vãng lai ${newIndex} 
        <button class="remove-source-btn" onclick="this.closest('.source-block').remove(); window.reindexGrossSources(); if(typeof triggerCalculations==='function') triggerCalculations()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Xóa
        </button>
      </div>
      <div class="form-row">
        <div class="form-label">
          <span class="icon">💵</span> Thu nhập (GROSS) <span class="required">*</span> <span class="info-icon" title="Sẽ khấu trừ 10% nếu từ 2 triệu trở lên">ⓘ</span>
        </div>
        <div class="form-input">
          <input type="text" class="number-format gross-extra-input" placeholder="Nhập thu nhập vãng lai">
        </div>
      </div>
    `;
    grossExtraSources.appendChild(div);
    initNumberFormat(div.querySelector('.number-format'));
    window.reindexGrossSources();
    if (typeof triggerCalculations === 'function') triggerCalculations();
  });
}

// Extra sources logic for Hoàn thuế
window.reindexRefundSources = function() {
  const blocks = document.querySelectorAll('#refund-sources-container .source-block');
  let counter = 1;
  blocks.forEach((block) => {
    const titleDiv = block.querySelector('.block-title-small');
    if (titleDiv && titleDiv.childNodes.length > 0 && titleDiv.childNodes[0].nodeType === Node.TEXT_NODE) {
      const text = titleDiv.childNodes[0].textContent.trim();
      if (text.startsWith('Nơi có thu nhập') || text.trim() === '') {
        titleDiv.childNodes[0].textContent = `Nơi có thu nhập ${counter} `;
      }
    }
    counter++;
  });
};

const btnAddRefundSource = document.getElementById('btn-add-refund-source');
const refundSourcesContainer = document.getElementById('refund-sources-container');

if (btnAddRefundSource) {
  btnAddRefundSource.addEventListener('click', () => {
    const currentCount = document.querySelectorAll('#refund-sources-container .source-block').length;
    const newIndex = currentCount + 1;
    const div = document.createElement('div');
    div.className = 'source-block';
    div.innerHTML = `
      <div class="block-title-small">
        Nơi có thu nhập ${newIndex} 
        <button class="remove-source-btn" onclick="this.closest('.source-block').remove(); window.reindexRefundSources(); if(typeof triggerCalculations==='function') triggerCalculations()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Xóa
        </button>
      </div>
      <div class="form-row">
        <div class="form-label">
          <span class="icon">💵</span> Tổng thu nhập (GROSS) năm <span class="required">*</span>
        </div>
        <div class="form-input">
          <input type="text" class="number-format refund-gross-input" placeholder="Nhập tổng thu nhập">
        </div>
      </div>
      <div class="form-row">
        <div class="form-label">
          <span class="icon">🛡️</span> Bảo hiểm bắt buộc đã đóng <span class="required">*</span>
        </div>
        <div class="form-input">
          <input type="text" class="number-format refund-ins-input" placeholder="Nhập tổng tiền bảo hiểm">
        </div>
      </div>
      <div class="form-row">
        <div class="form-label">
          <span class="icon">📉</span> Thuế TNCN đã bị khấu trừ <span class="required">*</span>
        </div>
        <div class="form-input">
          <input type="text" class="number-format refund-deducted-input" placeholder="Nhập số thuế đã khấu trừ">
        </div>
      </div>
    `;
    refundSourcesContainer.appendChild(div);
    div.querySelectorAll('.number-format').forEach(initNumberFormat);
    window.reindexRefundSources();
    if (typeof triggerCalculations === 'function') triggerCalculations();
  });
}
