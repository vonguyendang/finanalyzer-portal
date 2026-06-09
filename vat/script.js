// Format numbers
function formatCurrency(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseCurrency(str) {
  return parseFloat(str.replace(/,/g, '')) || 0;
}

// Auto format input
const amountInput = document.getElementById('vat-amount');
if (amountInput) {
  amountInput.addEventListener('input', function() {
    let val = parseCurrency(this.value);
    if (val === 0 && this.value.trim() === '') {
      this.value = '';
    } else {
      this.value = formatCurrency(val);
    }
    calculateVAT();
  });
}

// Bind events to other inputs
document.getElementById('vat-rate').addEventListener('change', calculateVAT);
document.querySelectorAll('input[name="vat-method"]').forEach(radio => {
  radio.addEventListener('change', calculateVAT);
});

// Đọc số thành chữ tiếng Việt
const ChuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
const Tien = ["", " nghìn", " triệu", " tỷ", " nghìn tỷ", " triệu tỷ"];

function DocSo3ChuSo(baso) {
    let tram = Math.floor(baso / 100);
    let chuc = Math.floor((baso % 100) / 10);
    let donvi = baso % 10;
    let KetQua = "";
    
    if (tram == 0 && chuc == 0 && donvi == 0) return "";
    
    if (tram != 0) {
        KetQua += ChuSo[tram] + " trăm ";
        if ((chuc == 0) && (donvi != 0)) KetQua += " linh ";
    }
    if ((chuc != 0) && (chuc != 1)) {
        KetQua += ChuSo[chuc] + " mươi";
        if ((chuc == 0) && (donvi != 0)) KetQua = KetQua + " linh ";
    }
    if (chuc == 1) KetQua += " mười ";
    switch (donvi) {
        case 1:
            if ((chuc != 0) && (chuc != 1)) {
                KetQua += " mốt ";
            } else {
                KetQua += ChuSo[donvi] + " ";
            }
            break;
        case 5:
            if (chuc == 0) {
                KetQua += ChuSo[donvi] + " ";
            } else {
                KetQua += " lăm ";
            }
            break;
        default:
            if (donvi != 0) {
                KetQua += " " + ChuSo[donvi] + " ";
            }
            break;
    }
    return KetQua;
}

function DocTienBangChu(SoTien) {
    var lan = 0;
    var i = 0;
    var KetQua = "";
    var tmp = "";
    var ViTri = new Array();
    if (SoTien < 0) return "Số tiền âm !";
    if (SoTien == 0) return "Không đồng";
    if (SoTien > 8999999999999999) {
        return "Số quá lớn!";
    }
    ViTri[5] = Math.floor(SoTien / 1000000000000000);
    if (isNaN(ViTri[5])) ViTri[5] = "0";
    SoTien = SoTien - parseFloat(ViTri[5].toString()) * 1000000000000000;
    ViTri[4] = Math.floor(SoTien / 1000000000000);
    if (isNaN(ViTri[4])) ViTri[4] = "0";
    SoTien = SoTien - parseFloat(ViTri[4].toString()) * 1000000000000;
    ViTri[3] = Math.floor(SoTien / 1000000000);
    if (isNaN(ViTri[3])) ViTri[3] = "0";
    SoTien = SoTien - parseFloat(ViTri[3].toString()) * 1000000000;
    ViTri[2] = parseInt(SoTien / 1000000);
    if (isNaN(ViTri[2])) ViTri[2] = "0";
    ViTri[1] = parseInt((SoTien % 1000000) / 1000);
    if (isNaN(ViTri[1])) ViTri[1] = "0";
    ViTri[0] = parseInt(SoTien % 1000);
    if (isNaN(ViTri[0])) ViTri[0] = "0";
    
    if (ViTri[5] > 0) { lan = 5; } 
    else if (ViTri[4] > 0) { lan = 4; } 
    else if (ViTri[3] > 0) { lan = 3; } 
    else if (ViTri[2] > 0) { lan = 2; } 
    else if (ViTri[1] > 0) { lan = 1; } 
    else { lan = 0; }
    
    for (i = lan; i >= 0; i--) {
        tmp = DocSo3ChuSo(ViTri[i]);
        KetQua += tmp;
        if (ViTri[i] > 0) KetQua += Tien[i];
        if ((i > 0) && (tmp.length > 0)) KetQua += " ";
    }
    if (KetQua.substring(KetQua.length - 1) == " ") {
        KetQua = KetQua.substring(0, KetQua.length - 1);
    }
    KetQua = KetQua.trim();
    // remove double spaces
    KetQua = KetQua.replace(/  /g, ' ');
    // capitalize first letter
    return KetQua.substring(0, 1).toUpperCase() + KetQua.substring(1) + " đồng";
}

function calculateVAT() {
  let amountStr = document.getElementById('vat-amount').value;
  let amount = parseCurrency(amountStr);
  let rate = parseFloat(document.getElementById('vat-rate').value) || 0;
  let method = document.querySelector('input[name="vat-method"]:checked').value;
  
  let beforeTax = 0;
  let tax = 0;
  let afterTax = 0;

  if (amount > 0) {
    if (method === 'forward') {
      beforeTax = amount;
      tax = amount * (rate / 100);
      afterTax = amount + tax;
    } else {
      afterTax = amount;
      beforeTax = amount / (1 + rate / 100);
      tax = afterTax - beforeTax;
    }
  }

  beforeTax = Math.round(beforeTax);
  tax = Math.round(tax);
  afterTax = Math.round(afterTax);

  document.getElementById('res-before').innerText = formatCurrency(beforeTax) + ' VNĐ';
  document.getElementById('res-tax').innerText = formatCurrency(tax) + ' VNĐ';
  document.getElementById('res-after').innerText = formatCurrency(afterTax) + ' VNĐ';

  document.getElementById('words-before').innerText = DocTienBangChu(beforeTax);
  document.getElementById('words-tax').innerText = DocTienBangChu(tax);
  document.getElementById('words-after').innerText = DocTienBangChu(afterTax);
}

// Copy functionality
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast();
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const targetId = this.getAttribute('data-target');
    const text = document.getElementById(targetId).innerText;
    copyToClipboard(text.replace(' VNĐ', '').replace(/,/g, ''));
  });
});

document.getElementById('btn-copy-all').addEventListener('click', () => {
  const before = document.getElementById('res-before').innerText;
  const tax = document.getElementById('res-tax').innerText;
  const after = document.getElementById('res-after').innerText;
  
  const text = `Kết quả tính VAT:
- Số tiền trước thuế: ${before}
- Thuế VAT: ${tax}
- Số tiền sau thuế: ${after}`;
  
  copyToClipboard(text);
});

function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

function saveData() {
  const data = {
    amount: document.getElementById('vat-amount').value,
    rate: document.getElementById('vat-rate').value,
    method: document.querySelector('input[name="vat-method"]:checked')?.value
  };
  localStorage.setItem('vat_data', JSON.stringify(data));
}

function loadData() {
  const dataStr = localStorage.getItem('vat_data');
  if(dataStr) {
    try {
      const data = JSON.parse(dataStr);
      if(data.amount) document.getElementById('vat-amount').value = data.amount;
      if(data.rate) document.getElementById('vat-rate').value = data.rate;
      if(data.method) {
        const el = document.querySelector(`input[name="vat-method"][value="${data.method}"]`);
        if(el) el.checked = true;
      }
    } catch(e){}
  }
}

function clearData() {
  if(!confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đã nhập?')) return;
  localStorage.removeItem('vat_data');
  
  document.getElementById('vat-amount').value = '';
  document.getElementById('vat-rate').value = '10';
  document.querySelector('input[name="vat-method"][value="forward"]').checked = true;
  
  calculateVAT();
  window.scrollTo({top: 0, behavior: 'smooth'});
}

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  calculateVAT();
  
  document.getElementById('vat-amount').addEventListener('input', saveData);
  document.getElementById('vat-rate').addEventListener('change', saveData);
  document.querySelectorAll('input[name="vat-method"]').forEach(radio => {
    radio.addEventListener('change', saveData);
  });
});
