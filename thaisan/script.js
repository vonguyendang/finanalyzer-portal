// Script cho công cụ Tính tiền Chế độ Thai sản 2026

document.addEventListener('DOMContentLoaded', function () {
    const modeSelect = document.getElementById('mode-select');
    const salaryTypeRadios = document.querySelectorAll('input[name="salary-type"]');
    
    // Rows
    const rowSalaryType = document.getElementById('row-salary-type');
    const rowSalary1 = document.getElementById('row-salary-1');
    const rowSalary6 = document.getElementById('row-salary-6');
    const rowChildren = document.getElementById('row-children');
    const rowMonths = document.getElementById('row-months');
    const rowDays = document.getElementById('row-days');
    const rowNam1Lan = document.getElementById('row-nam-1lan');
    const rowBaseSalary = document.getElementById('row-base-salary');
    const hintDays = document.getElementById('hint-days');
    const labelDays = document.getElementById('label-days');

    // Cập nhật giao diện khi đổi chế độ
    function updateUI() {
        const mode = modeSelect.value;
        let salaryType = document.querySelector('input[name="salary-type"]:checked').value;
        const optUnder6 = document.getElementById('opt-under-6');
        
        if (mode === 'nu_sinh_con' || mode === 'nhan_con_nuoi') {
            if (optUnder6) optUnder6.style.display = 'none';
            if (salaryType === 'under_6_months') {
                document.querySelector('input[value="unchanged"]').checked = true;
                salaryType = 'unchanged';
            }
        } else {
            if (optUnder6) optUnder6.style.display = '';
        }

        // Reset display
        rowSalaryType.style.display = 'flex';
        rowSalary1.style.display = 'none';
        rowSalary6.style.display = 'none';
        rowChildren.style.display = 'none';
        rowMonths.style.display = 'none';
        rowDays.style.display = 'none';
        rowNam1Lan.style.display = 'none';
        rowBaseSalary.style.display = 'none';
        hintDays.style.display = 'none';
        labelDays.innerHTML = 'Số ngày nghỉ <span title="Số ngày nghỉ hưởng chế độ thai sản tùy vào loại chế độ" style="cursor:help;">ⓘ</span>';

        if (salaryType === 'unchanged') {
            rowSalary1.style.display = 'flex';
        } else {
            rowSalary6.style.display = 'flex';
            const hintSal6 = document.getElementById('hint-salary-6');
            if (hintSal6) {
                if (salaryType === 'under_6_months') {
                    hintSal6.innerText = 'Tháng nào không đóng thì vui lòng để trống';
                } else {
                    hintSal6.innerText = 'Lương đóng BHXH trong 6 tháng gần nhất trước khi nghỉ khám/chế độ';
                }
            }
        }

        switch (mode) {
            case 'nu_sinh_con':
                rowChildren.style.display = 'flex';
                break;
            case 'nhan_con_nuoi':
                rowChildren.style.display = 'flex';
                rowMonths.style.display = 'flex';
                break;
            case 'nam_co_vo_sinh_con':
                rowChildren.style.display = 'flex';
                rowDays.style.display = 'flex';
                rowNam1Lan.style.display = 'flex';
                hintDays.innerText = '(Tối đa 14 ngày làm việc)';
                hintDays.style.display = 'block';
                labelDays.innerHTML = `Số ngày nghỉ <span title="Thời gian nghỉ:\n- 05 ngày làm việc.\n- 07 ngày làm việc khi vợ sinh con phải phẫu thuật, sinh con dưới 32 tuần tuổi.\n- Trường hợp vợ sinh đôi thì được nghỉ 10 ngày làm việc, từ sinh ba trở lên thì cứ thêm mỗi con được nghỉ thêm 03 ngày làm việc.\n- Trường hợp vợ sinh đôi trở lên mà phải phẫu thuật thì được nghỉ 14 ngày làm việc." style="cursor:help;">ⓘ</span>`;
                break;
            case 'nghi_duong_suc':
                rowSalaryType.style.display = 'none';
                rowSalary1.style.display = 'none';
                rowSalary6.style.display = 'none';
                rowDays.style.display = 'flex';
                hintDays.innerText = '(Tối đa 10 ngày)';
                hintDays.style.display = 'block';
                labelDays.innerHTML = `Số ngày nghỉ <span title="Thời gian nghỉ:\nSố ngày nghỉ dưỡng sức, phục hồi sức khỏe do người sử dụng lao động và Ban Chấp hành công đoàn cơ sở (nếu có) quyết định nhưng không vượt quá thời gian sau đây:\n- Tối đa 10 ngày đối với lao động nữ sinh một lần từ hai con trở lên.\n- Tối đa 07 ngày đối với lao động nữ sinh con phải phẫu thuật.\n- Tối đa 05 ngày đối với các trường hợp khác.\nTính cả ngày nghỉ lễ, Tết và nghỉ hằng tuần." style="cursor:help;">ⓘ</span>`;
                break;
            case 'kham_thai':
                rowDays.style.display = 'flex';
                hintDays.innerText = '(Tối đa 10 ngày)';
                hintDays.style.display = 'block';
                labelDays.innerHTML = `Số ngày nghỉ <span title="Thời gian nghỉ:\n- Lao động nữ được nghỉ khám thai 05 lần, mỗi lần 01 ngày; trường hợp ở xa cơ sở y tế hoặc người mang thai có bệnh lý hoặc thai không bình thường thì được nghỉ 02 ngày/lần khám thai.\n- Tính theo ngày làm việc, không kể ngày lễ, Tết, nghỉ hằng tuần." style="cursor:help;">ⓘ</span>`;
                break;
            case 'say_thai':
                rowDays.style.display = 'flex';
                hintDays.innerText = '(Tối đa 50 ngày)';
                hintDays.style.display = 'block';
                labelDays.innerHTML = `Số ngày nghỉ <span title="Thời gian nghỉ:\nSố ngày nghỉ căn cứ vào chỉ định của bác sĩ nhưng không vượt quá:\n- 10 ngày: Trường hợp thai dưới 05 tuần tuổi.\n- 20 ngày: Trường hợp thai từ 05 tuần tuổi đến dưới 13 tuần tuổi.\n- 40 ngày: Trường hợp thai từ 13 tuần tuổi đến dưới 25 tuần tuổi.\n- 50 ngày: Trường hợp thai từ 25 tuần tuổi trở lên.\nTính cả ngày nghỉ lễ, Tết và nghỉ hằng tuần." style="cursor:help;">ⓘ</span>`;
                break;
            case 'tranh_thai':
                rowDays.style.display = 'flex';
                hintDays.innerText = '(Tối đa 7 ngày đặt vòng, 15 ngày triệt sản)';
                hintDays.style.display = 'block';
                break;
        }
        
        renderSEOContent(mode);
    }

    modeSelect.addEventListener('change', updateUI);
    salaryTypeRadios.forEach(radio => radio.addEventListener('change', updateUI));

    // Khởi tạo ban đầu
    updateUI();

    // Format số
    document.querySelectorAll('.number-format').forEach(input => {
        input.addEventListener('input', function (e) {
            let value = e.target.value.replace(/[^0-9]/g, '');
            if (value !== '') {
                e.target.value = new Intl.NumberFormat('vi-VN').format(value);
            }
        });
    });
    
    // Xử lý nút Xem thêm SEO
    const btnReadMore = document.getElementById('btn-read-more');
    if (btnReadMore) {
      btnReadMore.addEventListener('click', function() {
        const seoWrapper = document.querySelector('.seo-text-wrapper');
        if (seoWrapper.classList.contains('expanded')) {
          seoWrapper.classList.remove('expanded');
          btnReadMore.textContent = 'Xem thêm ⌄';
        } else {
          seoWrapper.classList.add('expanded');
          btnReadMore.textContent = 'Thu gọn ⌃';
        }
      });
    }

    loadData();
    document.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', saveData);
        el.addEventListener('change', saveData);
    });
});

function saveData() {
    const data = {
        mode: document.getElementById('mode-select').value,
        salaryType: document.querySelector('input[name="salary-type"]:checked')?.value,
        salaryAvg: document.getElementById('salary-avg').value,
        salaries: [],
        numChildren: document.getElementById('num-children').value,
        numMonths: document.getElementById('num-months')?.value,
        numDaysLe: document.getElementById('num-days-le')?.value,
        numDays: document.getElementById('num-days')?.value,
        voDuDieuKien: document.querySelector('input[name="vo-du-dieu-kien"]:checked')?.value
    };
    for(let i=1; i<=6; i++) {
        const salEl = document.getElementById(`sal-${i}`);
        if(salEl) data.salaries.push(salEl.value);
    }
    localStorage.setItem('thaisan_data', JSON.stringify(data));
}

function loadData() {
    const dataStr = localStorage.getItem('thaisan_data');
    if(dataStr) {
        try {
            const data = JSON.parse(dataStr);
            if(data.mode) {
                document.getElementById('mode-select').value = data.mode;
            }
            if(data.salaryType) {
                const el = document.querySelector(`input[name="salary-type"][value="${data.salaryType}"]`);
                if(el) el.checked = true;
            }
            if(data.salaryAvg) document.getElementById('salary-avg').value = data.salaryAvg;
            if(data.salaries) {
                data.salaries.forEach((val, idx) => {
                    const salEl = document.getElementById(`sal-${idx+1}`);
                    if(salEl) salEl.value = val;
                });
            }
            if(data.numChildren) document.getElementById('num-children').value = data.numChildren;
            if(data.numMonths) document.getElementById('num-months').value = data.numMonths;
            if(data.numDaysLe) document.getElementById('num-days-le').value = data.numDaysLe;
            if(data.numDays) document.getElementById('num-days').value = data.numDays;
            if(data.voDuDieuKien) {
                const el = document.querySelector(`input[name="vo-du-dieu-kien"][value="${data.voDuDieuKien}"]`);
                if(el) el.checked = true;
            }
            
            // Force UI update
            updateUI(); // Function from within DOMContentLoaded but wait, updateUI is not global.
            // Oh right, I need to trigger change on mode-select.
            const ev = new Event('change');
            document.getElementById('mode-select').dispatchEvent(ev);
        } catch(e){}
    }
}

function clearData() {
    if(!confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đã nhập?')) return;
    localStorage.removeItem('thaisan_data');
    
    document.getElementById('mode-select').value = 'nu_sinh_con';
    const stEl = document.querySelector('input[name="salary-type"][value="unchanged"]');
    if(stEl) stEl.checked = true;
    
    document.getElementById('salary-avg').value = '';
    for(let i=1; i<=6; i++) {
        const salEl = document.getElementById(`sal-${i}`);
        if(salEl) salEl.value = '';
    }
    const nc = document.getElementById('num-children');
    if(nc) nc.value = '';
    const nm = document.getElementById('num-months');
    if(nm) nm.value = '';
    const ndl = document.getElementById('num-days-le');
    if(ndl) ndl.value = '';
    const nd = document.getElementById('num-days');
    if(nd) nd.value = '';
    
    const vddk = document.querySelector('input[name="vo-du-dieu-kien"][value="co"]');
    if(vddk) vddk.checked = true;
    
    document.getElementById('thaisan-report-container').style.display = 'none';
    
    const ev = new Event('change');
    document.getElementById('mode-select').dispatchEvent(ev);
    
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// Hàm lấy giá trị số từ input đã format
function getNumberValue(id) {
    const el = document.getElementById(id);
    if (!el || el.value === '') return 0;
    return parseInt(el.value.replace(/\./g, ''));
}

// Logic Tính Toán
function calculateThaiSan() {
    const mode = document.getElementById('mode-select').value;
    const salaryType = document.querySelector('input[name="salary-type"]:checked')?.value;
    
    // Kiểm tra dữ liệu bị thiếu
    let isMissing = false;
    
    if (mode !== 'nghi_duong_suc') {
        if (salaryType === 'unchanged') {
            if (document.getElementById('salary-avg').value.trim() === '') isMissing = true;
        } else if (salaryType === 'changed') {
            for (let i = 1; i <= 6; i++) {
                if (document.getElementById(`sal-${i}`).value.trim() === '') isMissing = true;
            }
        } else if (salaryType === 'under_6_months') {
            let hasAny = false;
            for (let i = 1; i <= 6; i++) {
                if (document.getElementById(`sal-${i}`).value.trim() !== '') hasAny = true;
            }
            if (!hasAny) isMissing = true;
        }
    }
    
    if (document.getElementById('row-children').style.display !== 'none') {
        if (document.getElementById('num-children').value.trim() === '') isMissing = true;
    }
    if (document.getElementById('row-days').style.display !== 'none') {
        if (document.getElementById('num-days').value.trim() === '') isMissing = true;
    }
    if (document.getElementById('row-months').style.display !== 'none') {
        if (document.getElementById('num-months').value.trim() === '' || document.getElementById('num-days-le').value.trim() === '') isMissing = true;
    }
    
    if (isMissing) {
        alert('Vui lòng nhập đầy đủ thông tin để tính tiền chế độ thai sản!');
        return;
    }
    
    let avgSalary = 0;
    if (mode !== 'nghi_duong_suc') {
        if (salaryType === 'unchanged') {
            avgSalary = getNumberValue('salary-avg');
        } else {
            let total = 0;
            let count = 0;
            for (let i = 1; i <= 6; i++) {
                let val = getNumberValue(`sal-${i}`);
                if (val > 0) {
                    total += val;
                    count++;
                }
            }
            if (count > 0) {
                avgSalary = Math.round(total / count);
            } else {
                avgSalary = 0;
            }
        }
        if (avgSalary <= 0) {
            alert('Vui lòng nhập tiền lương đóng BHXH hợp lệ!');
            return;
        }
    }

    const baseSalary = 2340000; // Mức tham chiếu mới
    const numChildren = parseInt(document.getElementById('num-children').value) || 1;
    let numDays = parseInt(document.getElementById('num-days').value) || 0;
    const numMonths = parseInt(document.getElementById('num-months')?.value) || 0;
    
    if (mode === 'nhan_con_nuoi') {
        numDays = parseInt(document.getElementById('num-days-le')?.value) || 0;
    }
    
    // Validate rules
    if (mode === 'nhan_con_nuoi') {
        if (numMonths > 6 || (numMonths === 6 && numDays > 0)) {
            alert('Thời gian nghỉ tối đa khi nhận con nuôi không được vượt quá 6 tháng!');
            return;
        }
    }
    if (mode === 'kham_thai' && numDays > 10) {
        alert('Số ngày nghỉ khám thai không được vượt quá 10 ngày (tối đa 5 lần, mỗi lần 2 ngày)!');
        return;
    }
    if (mode === 'say_thai' && numDays > 50) {
        alert('Số ngày nghỉ sẩy thai/nạo hút thai không được vượt quá 50 ngày!');
        return;
    }
    if (mode === 'nam_co_vo_sinh_con' && numDays > 14) {
        alert('Số ngày nghỉ đối với lao động nam có vợ sinh con không được vượt quá 14 ngày!');
        return;
    }
    if (mode === 'nghi_duong_suc' && numDays > 10) {
        alert('Số ngày nghỉ dưỡng sức sau thai sản không vượt quá 10 ngày!');
        return;
    }
    if (mode === 'tranh_thai' && numDays > 15) {
        alert('Số ngày nghỉ thực hiện biện pháp tránh thai không vượt quá 15 ngày!');
        return;
    }
    if (mode === 'nhan_con_nuoi') {
        if (numMonths > 6) {
            alert('Số tháng nghỉ khi nhận con nuôi không được vượt quá 6 tháng!');
            return;
        }
        if (numDays >= 30) {
            alert('Số ngày lẻ phải nhỏ hơn 30 ngày!');
            return;
        }
        if (numMonths === 0 && numDays === 0) {
            alert('Vui lòng nhập thời gian nghỉ (tháng hoặc ngày)!');
            return;
        }
    } else {
        if (mode !== 'nu_sinh_con' && numDays <= 0) {
            alert('Vui lòng nhập số ngày nghỉ hợp lệ (>0)!');
            return;
        }
    }
    
    let totalMoney = 0;
    let allowance1L = 0;
    let maternityAllowance = 0;
    
    let resultHTML = '';
    let explainHTML = '';
    let reportContainer = document.getElementById('thaisan-report-container');

    switch (mode) {
        case 'nu_sinh_con':
            let monthsOff = 6 + (numChildren > 1 ? numChildren - 1 : 0);
            allowance1L = 2 * baseSalary * numChildren;
            maternityAllowance = avgSalary * monthsOff;
            totalMoney = allowance1L + maternityAllowance;
            
            resultHTML = `
                <div class="blue-text">KẾT QUẢ</div>
                <div class="report-table-wrapper">
                  <table class="report-table">
                    <tr><td>Tiền lương đóng BHXH</td><td><strong>${formatMoney(avgSalary)}</strong></td></tr>
                    <tr><td>Số con</td><td><strong>${numChildren} con</strong></td></tr>
                    <tr><td>Số tháng nghỉ</td><td><strong>${monthsOff} tháng</strong></td></tr>
                    <tr class="highlight-row"><td>Tiền chế độ thai sản khi sinh con</td><td class="highlight-val">${formatMoney(totalMoney)}</td></tr>
                  </table>
                </div>
            `;
            
            explainHTML = `
                <div class="blue-text">DIỄN GIẢI CHI TIẾT CHẾ ĐỘ THAI SẢN</div>
                <div class="report-table-wrapper">
                  <table class="report-table">
                    <tr><td>(1) Bình quân tiền lương đóng BHXH</td><td><strong>${formatMoney(avgSalary)}</strong></td></tr>
                    <tr><td>(2) Chế độ hưởng</td><td><strong>Lao động nữ khi sinh con</strong></td></tr>
                    <tr><td>(3) Số con</td><td><strong>${numChildren} con</strong></td></tr>
                    <tr><td>(4) Mức tham chiếu</td><td><strong>${formatMoney(baseSalary)}</strong></td></tr>
                    <tr><td>(5) Số tháng nghỉ</td><td><strong>${monthsOff} tháng</strong></td></tr>
                    <tr><td>(6) Tiền trợ cấp 1 lần khi sinh con (= 2 x (3) x (4)) (Điều 58, 59 Luật BHXH 2024)</td><td><strong>${formatMoney(allowance1L)}</strong></td></tr>
                    <tr><td>(7) Tiền trợ cấp thai sản (= 100% x (1) x (5))</td><td><strong>${formatMoney(maternityAllowance)}</strong></td></tr>
                    <tr class="highlight-row"><td>(8) Tiền chế độ thai sản khi sinh con ( = (6) + (7) )</td><td class="highlight-val">${formatMoney(totalMoney)}</td></tr>
                  </table>
                </div>
            `;
            break;

        case 'nhan_con_nuoi':
            allowance1L = 2 * baseSalary * numChildren;
            let moneyMonth = avgSalary * numMonths;
            let moneyDay = Math.round((avgSalary / 30) * numDays);
            maternityAllowance = moneyMonth + moneyDay;
            totalMoney = allowance1L + maternityAllowance;
            
            let timeStr = '';
            if (numMonths > 0) timeStr += `${numMonths} tháng `;
            if (numDays > 0) timeStr += `${numDays} ngày`;
            
            resultHTML = `
                <div class="blue-text">KẾT QUẢ</div>
                <div class="report-table-wrapper">
                  <table class="report-table">
                    <tr><td>Tiền lương đóng BHXH</td><td><strong>${formatMoney(avgSalary)}</strong></td></tr>
                    <tr><td>Số con</td><td><strong>${numChildren} con</strong></td></tr>
                    <tr><td>Thời gian từ lúc nhận con đến khi con đủ 06 tháng tuổi</td><td><strong>${timeStr.trim()}</strong></td></tr>
                    <tr class="highlight-row"><td>Tiền chế độ thai sản khi nhận con nuôi</td><td class="highlight-val">${formatMoney(totalMoney)}</td></tr>
                  </table>
                </div>
            `;
            
            explainHTML = `
                <div class="blue-text">DIỄN GIẢI CHI TIẾT CHẾ ĐỘ THAI SẢN</div>
                <div class="report-table-wrapper">
                  <table class="report-table">
                    <tr><td>(1) Bình quân tiền lương đóng BHXH</td><td><strong>${formatMoney(avgSalary)}</strong></td></tr>
                    <tr><td>(2) Chế độ hưởng</td><td><strong>Nhận con nuôi</strong></td></tr>
                    <tr><td>(3) Số con</td><td><strong>${numChildren} con</strong></td></tr>
                    <tr><td>(4) Mức tham chiếu</td><td><strong>${formatMoney(baseSalary)}</strong></td></tr>
                    <tr><td>(5) Thời gian từ lúc nhận con đến khi con đủ 06 tháng tuổi</td><td><strong>${timeStr.trim()}</strong></td></tr>
                    <tr><td>(6) Tiền trợ cấp 1 lần khi nhận con nuôi (= 2 x (3) x (4)) (Điều 58, 59 Luật BHXH 2024)</td><td><strong>${formatMoney(allowance1L)}</strong></td></tr>
                    <tr><td>(7) Tiền trợ cấp thai sản</td><td><strong>${formatMoney(maternityAllowance)}</strong></td></tr>
                    <tr class="highlight-row"><td>(8) Tiền chế độ thai sản khi nhận con nuôi ( = (6) + (7) )</td><td class="highlight-val">${formatMoney(totalMoney)}</td></tr>
                  </table>
                </div>
            `;
            break;

        case 'nam_co_vo_sinh_con':
            const voDuDieuKien = document.querySelector('input[name="vo-du-dieu-kien"]:checked')?.value;
            const is1Lan = (voDuDieuKien === 'khong');
            if (is1Lan) {
                allowance1L = 2 * baseSalary * numChildren;
            }
            maternityAllowance = Math.round((avgSalary / 24) * numDays);
            totalMoney = allowance1L + maternityAllowance;
            
            resultHTML = `
                <div class="blue-text">KẾT QUẢ</div>
                <div class="report-table-wrapper">
                  <table class="report-table">
                    <tr><td>Tiền lương đóng BHXH</td><td><strong>${formatMoney(avgSalary)}</strong></td></tr>
                    <tr><td>Số con</td><td><strong>${numChildren} con</strong></td></tr>
                    <tr><td>Số ngày nghỉ</td><td><strong>${numDays} ngày</strong></td></tr>
                    <tr class="highlight-row"><td>Tiền chế độ thai sản khi lao động nam có vợ sinh con</td><td class="highlight-val">${formatMoney(totalMoney)}</td></tr>
                  </table>
                </div>
            `;
            
            explainHTML = `
                <div class="blue-text">DIỄN GIẢI CHI TIẾT CHẾ ĐỘ THAI SẢN</div>
                <div class="report-table-wrapper">
                  <table class="report-table">
                    <tr><td>(1) Bình quân tiền lương đóng BHXH</td><td><strong>${formatMoney(avgSalary)}</strong></td></tr>
                    <tr><td>(2) Chế độ hưởng</td><td><strong>Lao động nam có vợ sinh con</strong></td></tr>
                    <tr><td>(3) Số con</td><td><strong>${numChildren} con</strong></td></tr>
                    <tr><td>(4) Mức tham chiếu</td><td><strong>${formatMoney(baseSalary)}</strong></td></tr>
                    <tr><td>(5) Số ngày nghỉ</td><td><strong>${numDays} ngày</strong></td></tr>
                    <tr><td>(6) Tiền trợ cấp 1 lần khi sinh con</td><td><strong>${formatMoney(allowance1L)}</strong></td></tr>
                    <tr><td>(7) Tiền trợ cấp thai sản (= 100% x (1) : 24 x (5) )</td><td><strong>${formatMoney(maternityAllowance)}</strong></td></tr>
                    <tr class="highlight-row"><td>(8) Tiền chế độ thai sản khi lao động nam có vợ sinh con (= (6) + (7))</td><td class="highlight-val">${formatMoney(totalMoney)}</td></tr>
                  </table>
                </div>
            `;
            break;
            
        case 'nghi_duong_suc':
            totalMoney = Math.round(0.3 * baseSalary * numDays);
            
            resultHTML = `
                <div class="blue-text">KẾT QUẢ</div>
                <div class="report-table-wrapper">
                  <table class="report-table">
                    <tr><td>Số ngày nghỉ</td><td><strong>${numDays} ngày</strong></td></tr>
                    <tr><td>Mức tham chiếu (Lương cơ sở)</td><td><strong>${formatMoney(baseSalary)}</strong></td></tr>
                    <tr class="highlight-row"><td>Tiền chế độ dưỡng sức sau thai sản</td><td class="highlight-val">${formatMoney(totalMoney)}</td></tr>
                  </table>
                </div>
            `;
            
            explainHTML = `
                <div class="blue-text">ĐIỀU KIỆN, THỦ TỤC HƯỞNG VÀ CÁCH TÍNH (Tham khảo bên dưới)</div>
                <p>Tiền dưỡng sức = 30% x Mức tham chiếu x Số ngày nghỉ = 30% x ${formatMoney(baseSalary)} x ${numDays} = <strong class="highlight-val">${formatMoney(totalMoney)}</strong></p>
            `;
            break;
            
        case 'kham_thai':
            maternityAllowance = Math.round((avgSalary / 24) * numDays);
            totalMoney = maternityAllowance;
            
            resultHTML = `
                <div class="blue-text">KẾT QUẢ</div>
                <div class="report-table-wrapper">
                  <table class="report-table">
                    <tr><td>Tiền lương đóng BHXH</td><td><strong>${formatMoney(avgSalary)}</strong></td></tr>
                    <tr><td>Số ngày nghỉ</td><td><strong>${numDays} ngày</strong></td></tr>
                    <tr class="highlight-row"><td>Tiền chế độ thai sản khi đi khám thai</td><td class="highlight-val">${formatMoney(totalMoney)}</td></tr>
                  </table>
                </div>
            `;
            
            explainHTML = '';
            break;
            
        case 'say_thai':
        case 'tranh_thai':
            maternityAllowance = Math.round((avgSalary / 30) * numDays);
            totalMoney = maternityAllowance;
            
            let modeName = mode === 'say_thai' ? 'sẩy thai, nạo, hút thai, thai chết lưu hoặc phá thai bệnh lý' : 'thực hiện biện pháp tránh thai';
            
            resultHTML = `
                <div class="blue-text">KẾT QUẢ</div>
                <div class="report-table-wrapper">
                  <table class="report-table">
                    <tr><td>Tiền lương đóng BHXH</td><td><strong>${formatMoney(avgSalary)}</strong></td></tr>
                    <tr><td>Số ngày nghỉ</td><td><strong>${numDays} ngày</strong></td></tr>
                    <tr class="highlight-row"><td>Tiền chế độ thai sản khi ${modeName}</td><td class="highlight-val">${formatMoney(totalMoney)}</td></tr>
                  </table>
                </div>
            `;
            
            explainHTML = '';
            break;
    }

    reportContainer.innerHTML = resultHTML + explainHTML;
    reportContainer.style.display = 'block';
    
    // Cuộn xuống kết quả
    reportContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đồng';
}

function renderSEOContent() {
    const mode = document.getElementById('mode-select').value;
    const seoContent = document.getElementById('thaisan-guide-content');
    const legalBasisContainer = document.getElementById('legal-basis-container');
    
    if (!seoContent || !legalBasisContainer) return;
    
    let html = '';
    let legalHtml = '';
    
    if (mode === 'nu_sinh_con') {
        legalHtml = `
           <p><strong>Căn cứ pháp lý:</strong></p>
           <p>- Điều 50, Điều 53, Điều 58 và Điều 59 <span style="color: #d35400;">Luật Bảo hiểm xã hội năm 2024</span> và <span style="color: #d35400;">Quyết định 166/QĐ-BHXH</span>.</p>
           <p>- Trợ cấp 1 lần = 2 × Mức tham chiếu × Số con. Mức tham chiếu 2.340.000 đồng/tháng (theo <span style="color: #d35400;">Nghị định 73/2024/NĐ-CP</span>).</p>
        `;
        html = `
            <h3>ĐIỀU KIỆN, THỦ TỤC HƯỞNG VÀ CÁCH TÍNH TIỀN CHẾ ĐỘ THAI SẢN KHI LAO ĐỘNG NỮ SINH CON</h3>
            <p><strong>1. Điều kiện hưởng:</strong></p>
            <ul>
                <li>Đã đóng bảo hiểm xã hội từ <strong style="color: #d35400;">đủ 06 tháng</strong> trở lên trong thời gian <strong style="color: #d35400;">12 tháng</strong> trước khi sinh con.</li>
                <li>Hoặc nếu mang thai phải nghỉ việc để dưỡng thai theo chỉ định của bác sĩ thì phải đóng BHXH từ <strong style="color: #d35400;">đủ 12 tháng</strong> trở lên, đồng thời đóng BHXH từ <strong style="color: #d35400;">đủ 03 tháng</strong> trở lên trong <strong style="color: #d35400;">12 tháng</strong> trước khi sinh con.</li>
            </ul>
            <p><strong>2. Thời gian nghỉ:</strong></p>
            <p>Lao động nữ sinh con được nghỉ việc hưởng chế độ thai sản trước và sau khi sinh con là <strong style="color: #d35400;">06 tháng</strong>. Trường hợp sinh đôi trở lên thì tính từ con thứ hai trở đi, cứ mỗi con, người mẹ được nghỉ thêm <strong style="color: #d35400;">01 tháng</strong>.</p>
            <p><strong>3. Cách tính tiền chế độ thai sản khi sinh con:</strong></p>
            <p><strong style="color: #d35400; font-size: 15px;">Tiền thai sản khi sinh con = Tiền trợ cấp 1 lần khi sinh con + Tiền trợ cấp thai sản</strong></p>
            <p><em>Trong đó:</em></p>
            <ul>
                <li><strong>Tiền trợ cấp 1 lần khi sinh con</strong> = <strong style="color: #d35400;">2</strong> x Mức lương cơ sở x Số con</li>
                <li><strong>Tiền trợ cấp thai sản</strong> = <strong style="color: #d35400;">100%</strong> x Mức bình quân tiền lương tháng đóng BHXH của 06 tháng liền kề x Số tháng nghỉ</li>
            </ul>
            <p><strong>4. Thủ tục hưởng chế độ thai sản khi sinh con:</strong></p>
            <p><strong style="color: #3498db;">Bước 1: Chuẩn bị hồ sơ.</strong></p>
            <p>Hồ sơ hưởng chế độ thai sản đối với lao động nữ đang đóng BHXH bao gồm bản sao giấy khai sinh hoặc trích lục khai sinh hoặc bản sao giấy chứng sinh của con.</p>
            <p><strong style="color: #3498db;">Bước 2: Nộp hồ sơ thai sản.</strong></p>
            <p>Lao động nữ đang đóng BHXH nộp hồ sơ cho doanh nghiệp. Thời hạn nộp không quá <strong style="color: #d35400;">45 ngày</strong> kể từ ngày trở lại làm việc. Sau đó, người sử dụng lao động hoàn thiện hồ sơ và nộp cho cơ quan BHXH trong <strong style="color: #d35400;">10 ngày</strong> kể từ ngày nhận được hồ sơ từ người lao động.</p>
            <p>Lao động nữ đã nghỉ việc nộp hồ sơ cho cơ quan BHXH và xuất trình sổ BHXH nơi cư trú.</p>
            <p><strong style="color: #3498db;">Bước 3: Nhận kết quả giải quyết chế độ thai sản.</strong></p>
            <p>Thời hạn giải quyết:</p>
            <ul>
                <li>Tối đa <strong style="color: #d35400;">06 ngày</strong> làm việc kể từ ngày nhận đủ hồ sơ từ doanh nghiệp.</li>
                <li>Tối đa <strong style="color: #d35400;">03 ngày</strong> làm việc kể từ ngày nhận đủ hồ sơ từ người lao động.</li>
            </ul>
            <p>Người lao động có thể nhận tiền thai sản bằng một trong các hình thức sau:</p>
            <ul>
                <li>Thông qua doanh nghiệp nơi mình đang làm việc.</li>
                <li>Thông qua tài khoản cá nhân.</li>
                <li>Trực tiếp nhận tại cơ quan BHXH nếu doanh nghiệp đã chuyển lại kinh phí cho cơ quan BHXH và trong trường hợp thôi việc trước khi sinh con mà không có tài khoản cá nhân.</li>
                <li>Nhận qua người được ủy quyền hợp pháp để thực thủ tục hưởng chế độ thai sản.</li>
            </ul>
        `;
    } else if (mode === 'nam_co_vo_sinh_con') {
        legalHtml = `
           <p><strong>Căn cứ pháp lý:</strong></p>
           <p>- Điều 50, Điều 53, Điều 58 và Điều 59 <span style="color: #d35400;">Luật Bảo hiểm xã hội năm 2024</span> và <span style="color: #d35400;">Quyết định 166/QĐ-BHXH</span>.</p>
           <p>- Trợ cấp 1 lần = 2 × Mức tham chiếu × Số con. Mức tham chiếu 2.340.000 đồng/tháng (theo <span style="color: #d35400;">Nghị định 73/2024/NĐ-CP</span>).</p>
        `;
        html = `
            <h3>ĐIỀU KIỆN, THỦ TỤC HƯỞNG VÀ CÁCH TÍNH TIỀN CHẾ ĐỘ THAI SẢN KHI LAO ĐỘNG NAM CÓ VỢ SINH CON</h3>
            <p><strong>1. Điều kiện hưởng:</strong></p>
            <p>Đang đóng bảo hiểm xã hội bắt buộc vào thời điểm vợ sinh con.</p>
            <p><strong>2. Thời gian nghỉ:</strong></p>
            <ul>
                <li><strong style="color: #d35400;">05 ngày</strong> làm việc.</li>
                <li><strong style="color: #d35400;">07 ngày</strong> làm việc: Trường hợp vợ sinh con phải phẫu thuật, sinh con dưới 32 tuần tuổi.</li>
                <li><strong style="color: #d35400;">10 ngày</strong> làm việc: Trường hợp vợ sinh đôi, từ sinh ba trở lên thì cứ thêm mỗi con được nghỉ thêm <strong style="color: #d35400;">03 ngày</strong> làm việc.</li>
                <li><strong style="color: #d35400;">14 ngày</strong> làm việc: Trường hợp vợ sinh đôi trở lên mà phải phẫu thuật.</li>
            </ul>
            <p><strong>3. Cách tính tiền chế độ thai sản cho nam:</strong></p>
            <p><strong style="color: #d35400; font-size: 15px;">Tiền thai sản nam = Tiền trợ cấp 1 lần khi sinh con (nếu đủ điều kiện) + Tiền trợ cấp thai sản</strong></p>
            <p><em>Trong đó:</em></p>
            <ul>
                <li><strong>Tiền trợ cấp thai sản</strong> = Mức bình quân tiền lương tháng đóng BHXH của 06 tháng liền kề : 24 x Số ngày nghỉ</li>
                <li><strong>Tiền trợ cấp 1 lần khi sinh con</strong> (Chỉ nhận trong trường hợp vợ không tham gia BHXH nhưng chồng đóng BHXH đủ <strong style="color: #d35400;">6 tháng</strong> trở lên) = <strong style="color: #d35400;">2</strong> x Mức tham chiếu x Số con</li>
            </ul>
            <p><strong>4. Thủ tục hưởng chế độ thai sản nam:</strong></p>
            <p><strong style="color: #3498db;">Bước 1: Chuẩn bị hồ sơ.</strong></p>
            <p>Hồ sơ hưởng chế độ thai sản đối với lao động nam có vợ sinh con gồm:</p>
            <ul>
                <li>Bản sao giấy chứng sinh hoặc bản sao giấy khai sinh hoặc trích lục khai sinh của con.</li>
                <li>Trường hợp sinh con phải phẫu thuật hoặc sinh con dưới 32 tuần tuổi mà giấy chứng sinh không thể hiện thì có thêm giấy tờ của cơ sở khám bệnh, chữa bệnh thể hiện việc sinh con phải phẫu thuật, sinh con dưới 32 tuần tuổi.</li>
            </ul>
            <p><strong style="color: #3498db;">Bước 2: Nộp hồ sơ thai sản.</strong></p>
            <p>Lao động nam đang đóng BHXH nộp hồ sơ cho doanh nghiệp. Thời hạn nộp không quá <strong style="color: #d35400;">45 ngày</strong> kể từ ngày trở lại làm việc. Sau đó, người sử dụng lao động hoàn thiện hồ sơ và nộp cho cơ quan BHXH trong <strong style="color: #d35400;">10 ngày</strong> kể từ ngày nhận được hồ sơ từ người lao động.</p>
            <p><strong style="color: #3498db;">Bước 3: Nhận kết quả giải quyết chế độ thai sản.</strong></p>
            <p>Thời hạn giải quyết: Tối đa <strong style="color: #d35400;">06 ngày</strong> làm việc kể từ ngày cơ quan BHXH nhận đủ hồ sơ từ doanh nghiệp.</p>
            <p>Lao động nam có thể nhận tiền thai sản bằng một trong các hình thức sau:</p>
            <ul>
                <li>Thông qua doanh nghiệp nơi mình đang làm việc.</li>
                <li>Thông qua tài khoản cá nhân.</li>
                <li>Trực tiếp nhận tại cơ quan BHXH nếu doanh nghiệp đã chuyển lại kinh phí cho cơ quan BHXH và trong trường hợp thôi việc trước khi nhận nuôi con nuôi mà không có tài khoản cá nhân.</li>
                <li>Nhận qua người được ủy quyền hợp pháp để thực thủ tục hưởng chế độ thai sản.</li>
            </ul>
        `;
    } else if (mode === 'nghi_duong_suc') {
        legalHtml = `
           <p><strong>Căn cứ pháp lý:</strong></p>
           <p>- Điều 41 <span style="color: #d35400;">Luật Bảo hiểm xã hội năm 2014</span>.</p>
           <p>- <span style="color: #d35400;">Quyết định 166/QĐ-BHXH</span>.</p>
           <p>- Mức lương cơ sở hiện đang áp dụng là 2,340 triệu đồng/tháng (theo Điều 3 <span style="color: #d35400;">Nghị định 73/2024/NĐ-CP</span>).</p>
        `;
        html = `
            <h3>ĐIỀU KIỆN, THỦ TỤC HƯỞNG VÀ CÁCH TÍNH TIỀN CHẾ ĐỘ THAI SẢN KHI NGHỈ DƯỠNG SỨC SAU THAI SẢN</h3>
            <p><strong>1. Điều kiện hưởng:</strong></p>
            <p>Lao động nữ ngay sau thời gian hưởng chế độ thai sản do sẩy thai, nạo, hút thai, thai chết lưu hoặc phá thai bệnh lý hoặc sau thời gian nghỉ sinh con, trong khoảng thời gian <strong style="color: #d35400;">30 ngày đầu</strong> làm việc mà sức khoẻ chưa phục hồi thì được nghỉ dưỡng sức, phục hồi sức khoẻ.</p>
            <p><strong>2. Thời gian nghỉ:</strong></p>
            <p>Số ngày nghỉ dưỡng sức, phục hồi sức khỏe do người sử dụng lao động và Ban Chấp hành công đoàn cơ sở (nếu có) quyết định nhưng không vượt quá thời gian sau đây:</p>
            <ul>
                <li>Tối đa <strong style="color: #d35400;">10 ngày</strong> đối với lao động nữ sinh một lần từ hai con trở lên.</li>
                <li>Tối đa <strong style="color: #d35400;">07 ngày</strong> đối với lao động nữ sinh con phải phẫu thuật.</li>
                <li>Tối đa <strong style="color: #d35400;">05 ngày</strong> đối với các trường hợp khác.</li>
            </ul>
            <p><em>Tính cả ngày nghỉ lễ, Tết và nghỉ hằng tuần.</em></p>
            <p><strong>3. Cách tính tiền chế độ:</strong></p>
            <p><strong style="color: #d35400; font-size: 15px;">Tiền dưỡng sức = 30% x Mức lương cơ sở x Số ngày nghỉ</strong></p>
            <p><strong>4. Thủ tục hưởng chế độ dưỡng sức sau thai sản:</strong></p>
            <p>Người thực hiện thủ tục: Người sử dụng lao động.</p>
            <p><strong style="color: #3498db;">Bước 1:</strong> Người sử dụng lao động lập Danh sách đề nghị giải quyết hưởng chế độ ốm đau, thai sản, dưỡng sức phục hồi sức khỏe (theo Mẫu 01B-HSB).</p>
            <p><strong style="color: #3498db;">Bước 2: Gửi hồ sơ cho cơ quan bảo hiểm.</strong></p>
            <p>Thời hạn nộp hồ sơ chế độ dưỡng sức: Trong <strong style="color: #d35400;">10 ngày</strong> kể từ ngày người lao động đủ điều kiện hưởng chế độ dưỡng sức sau sinh.</p>
            <p><strong style="color: #3498db;">Bước 3: Người lao động nhận kết quả.</strong></p>
            <p>Thời hạn giải quyết: Tối đa <strong style="color: #d35400;">06 ngày</strong> làm việc kể từ ngày nhận đủ hồ sơ từ doanh nghiệp.</p>
            <p>Người lao động có thể nhận tiền thai sản bằng một trong các hình thức sau:</p>
            <ul>
                <li>Thông qua doanh nghiệp nơi mình đang làm việc.</li>
                <li>Thông qua tài khoản cá nhân.</li>
                <li>Trực tiếp nhận tại cơ quan BHXH nếu doanh nghiệp đã chuyển lại kinh phí cho cơ quan BHXH.</li>
            </ul>
        `;
    } else if (mode === 'kham_thai') {
        legalHtml = `
           <p><strong>Căn cứ pháp lý:</strong></p>
           <p>- Điều 30, Điều 31, Điều 32 và Điều 39 <span style="color: #d35400;">Luật Bảo hiểm xã hội năm 2014</span>.</p>
           <p>- <span style="color: #d35400;">Quyết định 166/QĐ-BHXH</span>.</p>
        `;
        html = `
            <h3>ĐIỀU KIỆN, THỦ TỤC HƯỞNG VÀ CÁCH TÍNH TIỀN CHẾ ĐỘ THAI SẢN KHI KHÁM THAI</h3>
            <p><strong>1. Điều kiện hưởng:</strong></p>
            <p>Đang tham gia bảo hiểm xã hội bắt buộc.</p>
            <p><strong>2. Thời gian nghỉ:</strong></p>
            <p>Lao động nữ được nghỉ khám thai <strong style="color: #d35400;">05 lần</strong>, mỗi lần <strong style="color: #d35400;">01 ngày</strong>; trường hợp ở xa cơ sở y tế hoặc người mang thai có bệnh lý hoặc thai không bình thường thì được nghỉ <strong style="color: #d35400;">02 ngày/lần</strong> khám thai.</p>
            <p><em>Tính theo ngày làm việc, không kể ngày lễ, Tết, nghỉ hằng tuần.</em></p>
            <p><strong>3. Cách tính tiền chế độ khám thai:</strong></p>
            <p><strong style="color: #d35400; font-size: 15px;">Tiền chế độ khám thai = 100% x Mức bình quân tiền lương tháng đóng BHXH của 06 tháng liền kề trước khi nghỉ (*) : 24 x Số ngày nghỉ</strong></p>
            <p>(*) Nếu đóng bảo hiểm xã hội chưa đủ <strong style="color: #d35400;">06 tháng</strong> thì mức hưởng chế độ thai sản tính theo mức bình quân tiền lương tháng của các tháng đã đóng bảo hiểm xã hội.</p>
            <p><strong>4. Thủ tục hưởng chế độ khám thai:</strong></p>
            <p><strong style="color: #3498db;">Bước 1: Lao động nữ nộp hồ sơ hưởng chế độ khám thai cho doanh nghiệp.</strong></p>
            <p>Hồ sơ gồm: Bản chính giấy chứng nhận nghỉ việc hưởng BHXH do cơ sở y tế nơi người lao động khám thai cấp.</p>
            <p>Thời hạn nộp: Trong vòng <strong style="color: #d35400;">45 ngày</strong> kể từ ngày trở lại làm việc.</p>
            <p><strong style="color: #3498db;">Bước 2: Doanh nghiệp hoàn thiện hồ sơ và nộp cho cơ quan BHXH.</strong></p>
            <p>Doanh nghiệp lập Danh sách đề nghị hưởng chế độ thai sản theo mẫu 01B-HSB và nộp cho cơ quan BHXH trong vòng <strong style="color: #d35400;">10 ngày</strong> kể từ ngày nhận đủ hồ sơ của người lao động.</p>
            <p><strong style="color: #3498db;">Bước 3: Người lao động nhận tiền khám thai.</strong></p>
            <p>Nếu doanh nghiệp đã nộp đủ hồ sơ hợp lệ, cơ quan BHXH sẽ giải quyết chế độ cho người lao động trong thời gian tối đa là <strong style="color: #d35400;">06 ngày</strong> làm việc.</p>
            <p>Người lao động có thể nhận tiền chế độ khám thai thông qua một trong các hình thức sau:</p>
            <ul>
                <li>Thông qua doanh nghiệp nơi mình đang làm việc.</li>
                <li>Thông qua tài khoản cá nhân.</li>
                <li>Trực tiếp nhận tại cơ quan BHXH nếu doanh nghiệp đã chuyển lại kinh phí cho cơ quan BHXH.</li>
            </ul>
        `;
    } else if (mode === 'say_thai') {
        legalHtml = `
           <p><strong>Căn cứ pháp lý:</strong></p>
           <p>- Điều 30, Điều 31, Điều 33 và Điều 39 <span style="color: #d35400;">Luật Bảo hiểm xã hội năm 2014</span>.</p>
           <p>- <span style="color: #d35400;">Quyết định 166/QĐ-BHXH</span>.</p>
        `;
        html = `
            <h3>ĐIỀU KIỆN, THỦ TỤC HƯỞNG VÀ CÁCH TÍNH TIỀN CHẾ ĐỘ THAI SẢN KHI KHI SẨY THAI, NẠO, HÚT THAI, THAI CHẾT LƯU HOẶC PHÁ THAI BỆNH LÝ</h3>
            <p><strong>1. Điều kiện hưởng:</strong></p>
            <p>Đang tham gia bảo hiểm xã hội bắt buộc.</p>
            <p><strong>2. Thời gian nghỉ:</strong></p>
            <p>Số ngày nghỉ căn cứ vào chỉ định của bác sĩ nhưng không vượt quá:</p>
            <ul>
                <li><strong style="color: #d35400;">10 ngày</strong>: Trường hợp thai dưới 05 tuần tuổi.</li>
                <li><strong style="color: #d35400;">20 ngày</strong>: Trường hợp thai từ 05 tuần tuổi đến dưới 13 tuần tuổi.</li>
                <li><strong style="color: #d35400;">40 ngày</strong>: Trường hợp thai từ 13 tuần tuổi đến dưới 25 tuần tuổi.</li>
                <li><strong style="color: #d35400;">50 ngày</strong>: Trường hợp thai từ 25 tuần tuổi trở lên.</li>
            </ul>
            <p><em>Tính cả ngày nghỉ lễ, Tết và nghỉ hằng tuần.</em></p>
            <p><strong>3. Cách tính tiền chế độ:</strong></p>
            <p><strong style="color: #d35400; font-size: 15px;">Tiền chế độ = 100% x Mức bình quân tiền lương tháng đóng BHXH của 06 tháng liền kề trước khi nghỉ chế độ (*) : 30 x Số ngày nghỉ</strong></p>
            <p>(*) Nếu đóng bảo hiểm xã hội chưa đủ <strong style="color: #d35400;">06 tháng</strong> thì mức hưởng chế độ thai sản tính theo mức bình quân tiền lương tháng của các tháng đã đóng bảo hiểm xã hội.</p>
            <p><strong>4. Thủ tục hưởng chế độ:</strong></p>
            <p><strong style="color: #3498db;">Bước 1: Lao động nữ nộp hồ sơ cho doanh nghiệp.</strong></p>
            <p>Hồ sơ bao gồm:</p>
            <ul>
                <li>Trường hợp điều trị nội trú: Bản sao giấy ra viện của người lao động; trường hợp chuyển tuyến khám bệnh, chữa bệnh trong quá trình điều trị nội trú thì có thêm Bản sao giấy chuyển tuyến hoặc bản sao giấy chuyển viện.</li>
                <li>Trường hợp điều trị ngoại trú: Giấy chứng nhận nghỉ việc hưởng BHXH; hoặc bản sao giấy ra viện có chỉ định của y, bác sỹ điều trị cho nghỉ thêm sau thời gian điều trị nội trú. Thời hạn nộp: Trong vòng <strong style="color: #d35400;">45 ngày</strong> kể từ ngày trở lại làm việc.</li>
            </ul>
            <p><strong style="color: #3498db;">Bước 2: Doanh nghiệp hoàn thiện hồ sơ và nộp cho cơ quan BHXH.</strong></p>
            <p>Doanh nghiệp lập Danh sách đề nghị hưởng chế độ thai sản theo mẫu 01B-HSB và nộp cho cơ quan BHXH trong vòng <strong style="color: #d35400;">10 ngày</strong> kể từ ngày nhận đủ hồ sơ của người lao động.</p>
            <p><strong style="color: #3498db;">Bước 3: Người lao động nhận tiền</strong></p>
            <p>Nếu doanh nghiệp đã nộp đủ hồ sơ hợp lệ, cơ quan BHXH sẽ giải quyết chế độ cho người lao động trong thời gian tối đa là <strong style="color: #d35400;">06 ngày</strong> làm việc.</p>
            <p>Người lao động có thể nhận tiền chế độ thai sản thông qua một trong các hình thức sau:</p>
            <ul>
                <li>Thông qua doanh nghiệp nơi mình đang làm việc.</li>
                <li>Thông qua tài khoản cá nhân.</li>
                <li>Trực tiếp nhận tại cơ quan BHXH nếu doanh nghiệp đã chuyển lại kinh phí cho cơ quan BHXH.</li>
            </ul>
        `;
    } else if (mode === 'nhan_con_nuoi') {
        legalHtml = `
           <p><strong>Căn cứ pháp lý:</strong></p>
           <p>- Điều 50, Điều 56, Điều 58 và Điều 59 <span style="color: #d35400;">Luật Bảo hiểm xã hội năm 2024</span> và <span style="color: #d35400;">Quyết định 166/QĐ-BHXH</span>.</p>
           <p>- Trợ cấp 1 lần = 2 × Mức tham chiếu × Số con. Mức tham chiếu 2.340.000 đồng/tháng (theo Điều 3 <span style="color: #d35400;">Nghị định 73/2024/NĐ-CP</span>).</p>
        `;
        html = `
            <h3>ĐIỀU KIỆN, THỦ TỤC HƯỞNG VÀ CÁCH TÍNH TIỀN CHẾ ĐỘ THAI SẢN KHI NHẬN CON NUÔI</h3>
            <p><strong>1. Điều kiện hưởng:</strong></p>
            <p>Đã đóng bảo hiểm xã hội từ <strong style="color: #d35400;">đủ 06 tháng</strong> trở lên trong thời gian <strong style="color: #d35400;">12 tháng</strong> trước khi nhận nuôi con nuôi.</p>
            <p><strong>2. Thời gian nghỉ:</strong></p>
            <p>Người lao động nhận nuôi con nuôi dưới 06 tháng tuổi thì được nghỉ việc hưởng chế độ thai sản cho đến khi con <strong style="color: #d35400;">đủ 06 tháng tuổi</strong>.</p>
            <p><strong>3. Cách tính tiền chế độ thai sản khi nhận nuôi con nuôi:</strong></p>
            <p><strong style="color: #d35400; font-size: 15px;">Tiền thai sản khi nhận con nuôi = Tiền trợ cấp 1 lần khi nhận con nuôi + Tiền trợ cấp thai sản</strong></p>
            <p><em>Trong đó:</em></p>
            <p><strong>Tiền trợ cấp 1 lần khi sinh con</strong> = <strong style="color: #d35400;">2</strong> x Mức lương cơ sở x Số con</p>
            <p><strong>Tiền trợ cấp thai sản được tính như sau:</strong></p>
            <p>Nếu nghỉ tròn tháng:</p>
            <p><strong style="color: #d35400;">Tiền trợ cấp thai sản = 100% x Mức bình quân tiền lương tháng đóng BHXH của 06 tháng liền kề trước khi nghỉ chế độ x Số tháng nghỉ</strong></p>
            <p>Nếu thời gian nghỉ có ngày lẻ:</p>
            <p><strong style="color: #d35400;">Tiền trợ cấp thai sản = Mức bình quân tiền lương tháng đóng BHXH của 06 tháng liền kề trước khi nghỉ chế độ x Số tháng nghỉ + Mức bình quân tiền lương tháng đóng BHXH của 06 tháng liền kề trước khi nghỉ chế độ : 30 x Số ngày lẻ</strong></p>
            <p><strong>4. Thủ tục hưởng chế độ thai sản khi nhận nuôi con nuôi:</strong></p>
            <p><strong style="color: #3498db;">Bước 1: Chuẩn bị hồ sơ.</strong></p>
            <p>Hồ sơ hưởng chế độ thai sản khi nhận nuôi con nuôi dưới 06 tháng tuổi gồm bản sao giấy chứng nhận nuôi con nuôi.</p>
            <p><strong style="color: #3498db;">Bước 2: Nộp hồ sơ thai sản.</strong></p>
            <p>Người lao động đang đóng BHXH nộp hồ sơ cho doanh nghiệp. Thời hạn nộp không quá <strong style="color: #d35400;">45 ngày</strong> kể từ ngày trở lại làm việc. Sau đó, người sử dụng lao động hoàn thiện hồ sơ và nộp cho cơ quan BHXH trong <strong style="color: #d35400;">10 ngày</strong> kể từ ngày nhận được hồ sơ từ người lao động.</p>
            <p>Người lao động đã nghỉ việc nộp hồ sơ cho cơ quan BHXH và xuất trình sổ BHXH nơi cư trú.</p>
            <p><strong style="color: #3498db;">Bước 3: Nhận kết quả giải quyết chế độ thai sản.</strong></p>
            <p>Thời hạn giải quyết:</p>
            <ul>
                <li>Tối đa <strong style="color: #d35400;">06 ngày</strong> làm việc kể từ ngày nhận đủ hồ sơ từ doanh nghiệp.</li>
                <li>Tối đa <strong style="color: #d35400;">03 ngày</strong> làm việc kể từ ngày nhận đủ hồ sơ từ người lao động.</li>
            </ul>
            <p>Người lao động có thể nhận tiền thai sản bằng một trong các hình thức sau:</p>
            <ul>
                <li>Thông qua doanh nghiệp nơi mình đang làm việc.</li>
                <li>Thông qua tài khoản cá nhân.</li>
                <li>Trực tiếp nhận tại cơ quan BHXH nếu doanh nghiệp đã chuyển lại kinh phí cho cơ quan BHXH và trong trường hợp thôi việc trước khi nhận nuôi con nuôi mà không có tài khoản cá nhân.</li>
                <li>Nhận qua người được ủy quyền hợp pháp để thực thủ tục hưởng chế độ thai sản.</li>
            </ul>
        `;
    } else if (mode === 'tranh_thai') {
        legalHtml = `
           <p><strong>Căn cứ pháp lý:</strong></p>
           <p>- Điều 30, Điều 31, Điều 37 và Điều 39 <span style="color: #d35400;">Luật Bảo hiểm xã hội năm 2014</span> và <span style="color: #d35400;">Quyết định 166/QĐ-BHXH</span>.</p>
           <p>- Mức lương cơ sở hiện đang áp dụng là 2,340 triệu đồng/tháng (theo Điều 3 <span style="color: #d35400;">Nghị định 73/2024/NĐ-CP</span>).</p>
        `;
        html = `
            <h3>ĐIỀU KIỆN, THỦ TỤC HƯỞNG VÀ CÁCH TÍNH TIỀN CHẾ ĐỘ THAI SẢN KHI THỰC HIỆN BIỆN PHÁP TRÁNH THAI</h3>
            <p><strong>1. Điều kiện hưởng:</strong></p>
            <p>Đang tham gia bảo hiểm xã hội bắt buộc.</p>
            <p><strong>2. Thời gian nghỉ:</strong></p>
            <p>Số ngày nghỉ căn cứ vào chỉ định của bác sĩ nhưng không vượt quá:</p>
            <ul>
                <li><strong style="color: #d35400;">07 ngày</strong> đối với lao động nữ đặt vòng tránh thai.</li>
                <li><strong style="color: #d35400;">15 ngày</strong> đối với người lao động thực hiện biện pháp triệt sản.</li>
            </ul>
            <p><em>Tính cả ngày nghỉ lễ, Tết và nghỉ hằng tuần.</em></p>
            <p><strong>3. Cách tính tiền chế độ thai sản khi thực hiện biện pháp tránh thai:</strong></p>
            <p><strong style="color: #d35400; font-size: 15px;">Tiền chế độ = 100% x Mức bình quân tiền lương tháng đóng BHXH của 06 tháng liền kề trước khi nghỉ (*) : 30 x Số ngày nghỉ</strong></p>
            <p>(*) Nếu đóng bảo hiểm xã hội chưa đủ <strong style="color: #d35400;">06 tháng</strong> thì mức hưởng chế độ thai sản tính theo mức bình quân tiền lương tháng của các tháng đã đóng bảo hiểm xã hội.</p>
            <p><strong>4. Thủ tục hưởng chế độ:</strong></p>
            <p><strong style="color: #3498db;">Bước 1: Lao động nữ nộp hồ sơ cho doanh nghiệp.</strong></p>
            <p>Hồ sơ bao gồm:</p>
            <ul>
                <li>Trường hợp điều trị nội trú: Bản sao giấy ra viện của người lao động; trường hợp chuyển tuyến khám bệnh, chữa bệnh trong quá trình điều trị nội trú thì có thêm Bản sao giấy chuyển tuyến hoặc bản sao giấy chuyển viện.</li>
                <li>Trường hợp điều trị ngoại trú: Giấy chứng nhận nghỉ việc hưởng BHXH; hoặc bản sao giấy ra viện có chỉ định của y, bác sỹ điều trị cho nghỉ thêm sau thời gian điều trị nội trú.</li>
            </ul>
            <p>Thời hạn nộp: Trong vòng <strong style="color: #d35400;">45 ngày</strong> kể từ ngày trở lại làm việc.</p>
            <p><strong style="color: #3498db;">Bước 2: Doanh nghiệp hoàn thiện hồ sơ và nộp cho cơ quan BHXH.</strong></p>
            <p>Doanh nghiệp lập Danh sách đề nghị hưởng chế độ thai sản theo mẫu 01B-HSB và nộp cho cơ quan BHXH trong vòng <strong style="color: #d35400;">10 ngày</strong> kể từ ngày nhận đủ hồ sơ của người lao động.</p>
            <p><strong style="color: #3498db;">Bước 3: Người lao động nhận tiền chế độ thai sản.</strong></p>
            <p>Nếu doanh nghiệp đã nộp đủ hồ sơ hợp lệ, cơ quan BHXH sẽ giải quyết chế độ cho người lao động trong thời gian tối đa là <strong style="color: #d35400;">06 ngày</strong> làm việc.</p>
            <p>Người lao động có thể nhận tiền chế độ thai sản thông qua một trong các hình thức sau:</p>
            <ul>
                <li>Thông qua doanh nghiệp nơi mình đang làm việc.</li>
                <li>Thông qua tài khoản cá nhân.</li>
                <li>Trực tiếp nhận tại cơ quan BHXH nếu doanh nghiệp đã chuyển lại kinh phí cho cơ quan BHXH.</li>
            </ul>
        `;
    }
    
    seoContent.innerHTML = html;
    legalBasisContainer.innerHTML = legalHtml;
}
