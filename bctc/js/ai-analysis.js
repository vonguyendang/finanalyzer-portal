/* ═══════════════════════════════════════════════════
   AI ANALYSIS & CHAT
═══════════════════════════════════════════════════ */
let aiChatHistory = [];

async function fetchAI(D){
  const {info,bs,pl,cf,yearLabel,prevYear}=D;
  const B=bs.cy,P=bs.py,L=pl.cy,LP=pl.py,CF=cf.cy;
  const toTr = v => Math.round(v/1e6).toLocaleString('vi-VN');

  const prompt = `Bạn là chuyên gia tài chính doanh nghiệp với hơn 15 năm kinh nghiệm tại Việt Nam.

THÔNG TIN DOANH NGHIỆP:
- Tên: ${info.name}
- MST: ${info.mst}
- Địa chỉ: ${info.addr}, ${info.province}
- Kỳ báo cáo: ${info.fromDate} – ${info.toDate}/${yearLabel}
- BCTC chưa kiểm toán: ${info.bctcDaKiemToan==='0'?'Có':'Không'}

SỐ LIỆU BCĐKT (triệu đồng):
Cuối ${yearLabel} | Đầu ${yearLabel}
- Tiền & TĐT: ${toTr(B.ct110)} | ${toTr(P.ct110)}
- Phải thu NH: ${toTr(B.ct130)} | ${toTr(P.ct130)}
- Hàng tồn kho: ${toTr(B.ct140)} | ${toTr(P.ct140)}
- Tổng tài sản: ${toTr(B.ct200)} | ${toTr(P.ct200)}
- Nợ phải trả: ${toTr(B.ct300)} | ${toTr(P.ct300)}
- Phải trả NB: ${toTr(B.ct311)} | ${toTr(P.ct311)}
- Vay NH: ${toTr(B.ct312)} | ${toTr(P.ct312)}
- VCSH: ${toTr(B.ct400)} | ${toTr(P.ct400)}
- Vốn CSH: ${toTr(B.ct411)} | ${toTr(P.ct411)}
- LNST chưa PP: ${toTr(B.ct417)} | ${toTr(P.ct417)}

SỐ LIỆU KQHĐKD (triệu đồng):
Năm ${yearLabel} | Năm ${prevYear}
- Doanh thu thuần: ${toTr(L.ct10)} | ${toTr(LP.ct10)}
- Giá vốn: ${toTr(L.ct11)} | ${toTr(LP.ct11)}
- LN gộp: ${toTr(L.ct20)} | ${toTr(LP.ct20)}
- CP tài chính: ${toTr(L.ct22)} | ${toTr(LP.ct22)}
- CP QLDN: ${toTr(L.ct24)} | ${toTr(LP.ct24)}
- LN HĐKD: ${toTr(L.ct30)} | ${toTr(LP.ct30)}
- Thu nhập khác: ${toTr(L.ct31)} | ${toTr(LP.ct31)}
- Chi phí khác: ${toTr(L.ct32)} | ${toTr(LP.ct32)}
- LN trước thuế: ${toTr(L.ct50)} | ${toTr(LP.ct50)}
- LN sau thuế: ${toTr(L.ct60)} | ${toTr(LP.ct60)}

SỐ LIỆU LCTT (triệu đồng):
Năm ${yearLabel} | Năm ${prevYear}
- LCT HĐKD: ${toTr(CF.ct20)} | ${toTr(CF.ct20?0:0)}
- LCT HĐ đầu tư: ${toTr(CF.ct30)} | ${toTr(CF.ct30?0:0)}
- LCT HĐ TC: ${toTr(CF.ct40)} | ${toTr(CF.ct40?0:0)}
- LCT thuần: ${toTr(CF.ct50)} | ${toTr(CF.ct50?0:0)}
- Tiền đầu kỳ: ${toTr(CF.ct60)} | ${toTr(CF.ct60?0:0)}
- Tiền cuối kỳ: ${toTr(CF.ct70)} | ${toTr(CF.ct70?0:0)}

Hãy cung cấp phân tích tài chính chuyên sâu bằng tiếng Việt, bao gồm:

1. NHẬN XÉT TỔNG QUAN
2. PHÂN TÍCH KẾT QUẢ KINH DOANH
3. PHÂN TÍCH CƠ CẤU TÀI SẢN VÀ NGUỒN VỐN
4. PHÂN TÍCH KHẢ NĂNG THANH KHOẢN VÀ DÒNG TIỀN
5. ĐÁNH GIÁ RỦI RO TRỌNG YẾU
6. KHUYẾN NGHỊ

Trình bày ngắn gọn, súc tích, có số liệu dẫn chứng cụ thể. Tổng khoảng 600-800 từ.`;

  aiChatHistory = [{role: 'user', content: prompt}];

  document.getElementById('aiContent').innerHTML =
    `<div class="ai-loading"><span>Đang phân tích số liệu</span><div class="ai-dots"><span>.</span><span>.</span><span>.</span></div></div>`;
  
  // Hiển thị khung chat box nếu nó đang ẩn
  const chatBox = document.getElementById('aiChatBox');
  if(chatBox) chatBox.style.display = 'flex';

  try {
    const resp = await fetch('api/analyze.php',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ messages: aiChatHistory })
    });
    
    const data = await resp.json();
    if(data.error) throw new Error(data.error);
    
    const text = data.content?.[0]?.text || 'Không thể lấy phân tích AI. Vui lòng kiểm tra lại cấu hình API key trong file api/analyze.php';
    aiChatHistory.push({role: 'assistant', content: text});
    renderAiChat();
  } catch(e) {
    document.getElementById('aiContent').innerHTML =
      `<div class="ai-content" style="color:var(--text2)">⚠ Lỗi kết nối AI: ${e.message}</div>`;
  }
}

function renderAiChat() {
  const html = aiChatHistory.map((msg, i) => {
    if(i === 0) return ''; // Bỏ qua câu lệnh mồi đầu tiên để không choáng chỗ
    if(msg.role === 'user') {
      return `<div class="ai-msg user-msg">${escHtml(msg.content)}</div>`;
    }
    return `<div class="ai-content">${escHtml(msg.content)}</div>`;
  }).join('');
  
  const contentEl = document.getElementById('aiContent');
  contentEl.innerHTML = html;
  contentEl.scrollTop = contentEl.scrollHeight; // cuộn xuống dưới cùng
}

async function sendAiChat() {
  const inputEl = document.getElementById('aiChatInput');
  const text = inputEl.value.trim();
  if(!text) return;

  // Thêm tin nhắn của user vào lịch sử
  aiChatHistory.push({role: 'user', content: text});
  inputEl.value = '';
  renderAiChat();

  // Hiện loading
  const contentEl = document.getElementById('aiContent');
  const loadingEl = document.createElement('div');
  loadingEl.className = 'ai-loading';
  loadingEl.style.marginTop = '16px';
  loadingEl.innerHTML = `<span>AI đang trả lời</span><div class="ai-dots"><span>.</span><span>.</span><span>.</span></div>`;
  contentEl.appendChild(loadingEl);
  contentEl.scrollTop = contentEl.scrollHeight;

  try {
    const resp = await fetch('api/analyze.php',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ messages: aiChatHistory })
    });
    const data = await resp.json();
    if(data.error) throw new Error(data.error);

    const reply = data.content?.[0]?.text || 'Không nhận được phản hồi.';
    aiChatHistory.push({role: 'assistant', content: reply});
    renderAiChat();
  } catch(e) {
    aiChatHistory.pop(); // Xóa tin nhắn user nếu lỗi để tránh rác
    loadingEl.remove();
    contentEl.innerHTML += `<div class="ai-content" style="color:var(--red);margin-top:16px;">⚠ Lỗi: ${e.message}</div>`;
    contentEl.scrollTop = contentEl.scrollHeight;
  }
}

// Lắng nghe phím Enter trong ô input
document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.getElementById('aiChatInput');
  if(inputEl) {
    inputEl.addEventListener('keypress', function(e) {
      if(e.key === 'Enter') sendAiChat();
    });
  }
});

function escHtml(t){
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
}

