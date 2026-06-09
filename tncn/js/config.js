// Constants (2024 onwards)
const BASE_SALARY = 2340000;
const REGION_MIN_SALARY = {
  1: 4960000,
  2: 4410000,
  3: 3860000,
  4: 3450000
};

// State variables for deductions
let PERSONAL_DEDUCTION = 15500000;
let DEPENDENT_DEDUCTION = 6200000;

// Period Toggle Logic
const legalBasis2025 = `
  <li>Luật Thuế TNCN năm 2007</li>
  <li>Luật sửa đổi bổ sung Thuế TNCN năm 2012</li>
  <li>Luật sửa đổi Luật về Thuế năm 2014</li>
  <li>Thông tư 111/2013/TT-BTC</li>
  <li>Nghị định số 73/2024/NĐ-CP về mức lương cơ sở mới nhất</li>
  <li>Nghị định 74/2024/NĐ-CP về mức lương tối thiểu vùng</li>
  <li>Nghị Quyết số 954/ 2020/UBTVQH14 về điều chỉnh mức giảm trừ gia cảnh mới nhất</li>
`;

const legalBasis2026 = `
  <li>Luật Thuế TNCN năm 2025 số 109/2025/QH15</li>
  <li>Nghị định số 73/2024/NĐ-CP: Quy định về mức lương cơ sở từ ngày 01/07/2024</li>
  <li>Nghị định 293/2025/NĐ-CP: Quy định về mức lương tối thiểu vùng mới nhất có hiệu lực từ ngày 01/01/2026</li>
  <li>Nghị quyết 110/2025/UBTVQH15 về điều chỉnh mức giảm trừ gia cảnh mới nhất</li>
`;

function updatePeriodRules() {
  const selectedPeriod = document.querySelector('input[name="tax_period"]:checked').value;
  const legalList = document.getElementById('legal-basis-list');
  
  if (selectedPeriod === '2025') {
    PERSONAL_DEDUCTION = 11000000;
    DEPENDENT_DEDUCTION = 4400000;
    if (legalList) legalList.innerHTML = legalBasis2025;
  } else {
    // 2026
    PERSONAL_DEDUCTION = 15500000;
    DEPENDENT_DEDUCTION = 6200000;
    if (legalList) legalList.innerHTML = legalBasis2026;
  }
  
  // Wait until triggerCalculations is available (it's in calc.js)
  if (typeof triggerCalculations === 'function') {
    triggerCalculations();
  }
}
