// Constants (2024 onwards)
const BASE_SALARY = 2340000;

// Mức lương tối thiểu vùng theo từng thời kỳ
const REGION_MIN_SALARY_2026 = {
  1: 5310000,
  2: 4730000,
  3: 4140000,
  4: 3700000
};

const REGION_MIN_SALARY_2025 = {
  1: 4960000,
  2: 4410000,
  3: 3860000,
  4: 3450000
};

let REGION_MIN_SALARY = { ...REGION_MIN_SALARY_2026 };

// State variables for deductions
let PERSONAL_DEDUCTION = 15500000;
let DEPENDENT_DEDUCTION = 6200000;

// Period Toggle Logic
const legalBasis2025 = `
  <li>Luật Thuế TNCN năm 2007 (sửa đổi, bổ sung 2012, 2014)</li>
  <li>Thông tư 111/2013/TT-BTC hướng dẫn Luật Thuế TNCN</li>
  <li>Luật Bảo hiểm xã hội 2024 số 41/2024/QH15 &amp; Nghị định số 73/2024/NĐ-CP: Mức tham chiếu 2.340.000đ/tháng</li>
  <li>Nghị định 74/2024/NĐ-CP về mức lương tối thiểu vùng (Vùng I: 4.960.000đ, Vùng II: 4.410.000đ, Vùng III: 3.860.000đ, Vùng IV: 3.450.000đ)</li>
  <li>Nghị Quyết số 954/2020/UBTVQH14 về điều chỉnh mức giảm trừ gia cảnh (Bản thân 11 triệu đ/tháng, Phụ thuộc 4,4 triệu đ/tháng)</li>
  <li>Biểu thuế lũy tiến từng phần 7 bậc theo Luật Thuế TNCN 2007</li>
`;

const legalBasis2026 = `
  <li>Luật Thuế TNCN số 109/2025/QH15 (Cải cách Biểu thuế lũy tiến từng phần còn 5 bậc)</li>
  <li>Nghị định số 73/2024/NĐ-CP &amp; Luật BHXH số 41/2024/QH15: Áp dụng mức tham chiếu 2.340.000 đồng/tháng</li>
  <li>Nghị định số 293/2025/NĐ-CP: Mức lương tối thiểu vùng từ ngày 01/01/2026 (Vùng I: 5.310.000đ, Vùng II: 4.730.000đ, Vùng III: 4.140.000đ, Vùng IV: 3.700.000đ)</li>
  <li>Nghị quyết số 110/2025/UBTVQH15: Mức giảm trừ gia cảnh mới (Bản thân 15.500.000 đ/tháng, Phụ thuộc 6.200.000 đ/tháng)</li>
  <li><em>Cập nhật mới: Nghị định số 399/2026/NĐ-CP ngày 02/11/2026 điều chỉnh mức lương tối thiểu vùng mới (có hiệu lực từ 01/01/2027)</em></li>
`;

function updatePeriodRules() {
  const selectedPeriod = document.querySelector('input[name="tax_period"]:checked')?.value || '2026';
  const legalList = document.getElementById('legal-basis-list');
  const regionSelect = document.getElementById('gross-region');
  
  if (selectedPeriod === '2025') {
    PERSONAL_DEDUCTION = 11000000;
    DEPENDENT_DEDUCTION = 4400000;
    REGION_MIN_SALARY = { ...REGION_MIN_SALARY_2025 };
    if (legalList) legalList.innerHTML = legalBasis2025;
    if (regionSelect) {
      const curVal = regionSelect.value;
      regionSelect.innerHTML = `
        <option value="1">Vùng I (Mức lương tối thiểu 4.960.000 VNĐ)</option>
        <option value="2">Vùng II (Mức lương tối thiểu 4.410.000 VNĐ)</option>
        <option value="3">Vùng III (Mức lương tối thiểu 3.860.000 VNĐ)</option>
        <option value="4">Vùng IV (Mức lương tối thiểu 3.450.000 VNĐ)</option>
      `;
      regionSelect.value = curVal;
    }
  } else {
    // 2026
    PERSONAL_DEDUCTION = 15500000;
    DEPENDENT_DEDUCTION = 6200000;
    REGION_MIN_SALARY = { ...REGION_MIN_SALARY_2026 };
    if (legalList) legalList.innerHTML = legalBasis2026;
    if (regionSelect) {
      const curVal = regionSelect.value;
      regionSelect.innerHTML = `
        <option value="1">Vùng I (Mức lương tối thiểu 5.310.000 VNĐ)</option>
        <option value="2">Vùng II (Mức lương tối thiểu 4.730.000 VNĐ)</option>
        <option value="3">Vùng III (Mức lương tối thiểu 4.140.000 VNĐ)</option>
        <option value="4">Vùng IV (Mức lương tối thiểu 3.700.000 VNĐ)</option>
      `;
      regionSelect.value = curVal;
    }
  }
  
  // Wait until triggerCalculations is available (it's in calc.js)
  if (typeof triggerCalculations === 'function') {
    triggerCalculations();
  }
}
