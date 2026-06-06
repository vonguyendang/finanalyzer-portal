# Hệ Sinh Thái Tiện Ích Tài Chính · Kế Toán (FinAnalyzer Pro Portal)

Dự án này là một hệ sinh thái (Portal) tập hợp các công cụ hỗ trợ kế toán, phân tích báo cáo tài chính và tra cứu thông tin doanh nghiệp/hộ kinh doanh một cách nhanh chóng, trực quan, tuân thủ các quy định pháp luật mới nhất.

## 🚀 Các Tiện Ích Tích Hợp

Dự án bao gồm 3 phân hệ chính được thiết kế liên kết chặt chẽ với nhau:

### 1. Phân Tích BCTC B01A (`/bctc/`)
Công cụ "CFO Ảo" hỗ trợ đọc và phân tích Báo cáo Tài chính tự động.
- **Nhập liệu linh hoạt:** Hỗ trợ tải lên file XML (chuẩn HTKK/CQT) hoặc **nhập số liệu thủ công** (Manual Entry) trực tiếp ngay trên trình duyệt mà không cần file.
- **Trực quan hóa:** Hiển thị Dashboard với 12+ chỉ số tài chính và các biểu đồ minh họa rõ nét.
- **Khung Chat AI 2 chiều:** Tích hợp AI (Claude) không chỉ viết báo cáo tự động mà còn có thanh chat để người dùng hỏi đáp trực tiếp với dữ liệu BCTC đang mở.
- **Xuất báo cáo:** Hỗ trợ xuất dữ liệu ra Excel và in báo cáo dưới dạng PDF.

### 2. Sổ Kế Toán HKD (`/kthkd/`)
Công cụ thay thế việc ghi sổ tay truyền thống, được xây dựng theo chuẩn **Thông tư 152/2025/TT-BTC** và các Nghị định mới nhất.
- **Hệ thống sổ sách đầy đủ:** Hỗ trợ S1a, S2a, S2b, S2c, S2d, S2e và S3a tùy thuộc vào quy mô (Doanh thu ≤ 1 tỷ, > 1 tỷ, > 3 tỷ) và phương pháp nộp thuế.
- **Đọc Hóa đơn Điện tử (XML):** Tích hợp tính năng tải lên file XML của Hóa đơn điện tử để tự động bóc tách ngày tháng và số tiền, giúp thao tác ghi sổ nhanh chóng.
- **Dashboard Tài chính:** Theo dõi dòng tiền, doanh thu/chi phí và cơ cấu thuế thông qua hệ thống biểu đồ (Chart.js) chuyên nghiệp.
- **Backup & Phục hồi:** Lưu trữ tại trình duyệt cục bộ (Local Storage), hỗ trợ xuất file `.json` để sao lưu và xuất ra Excel báo cáo nộp thuế.

### 3. Tra Cứu Thuế HKD (`/tracuu-hkd/`)
Công cụ tính toán và ước lượng nhanh tiền thuế phải nộp.
- **Tính toán tự động:** Tính số thuế GTGT, TNCN dựa trên ngưỡng doanh thu mới nhất (NĐ 141/2026/NĐ-CP).
- **Module Bất Động Sản riêng biệt:** Xử lý bài toán phân bổ mức trừ miễn thuế 1 tỷ/năm cho nhiều bất động sản cho thuê một cách tối ưu nhất.
- **Minh họa bằng Biểu đồ:** Biểu đồ Doughnut thể hiện tỷ trọng doanh thu sau thuế và các khoản thuế GTGT/TNCN phải nộp.
- **Liên kết Hệ sinh thái:** Tích hợp nút *"Mở sổ kế toán"* tự động đẩy dữ liệu (doanh thu, ngành nghề) trực tiếp sang Sổ Kế Toán HKD (`/kthkd/`) để thiết lập hồ sơ ngay tức thì.

---

## 📁 Cấu Trúc Mã Nguồn

Toàn bộ mã nguồn đã được tách biệt theo cấu trúc module để dễ dàng quản lý, bảo trì:

```text
/
├── index.html           # Trang chủ (Portal) điều hướng đến 3 tiện ích
├── README.md            # Tài liệu dự án
├── bctc/                # Phân hệ 1: Phân tích BCTC
│   ├── index.html       
│   ├── style.css        
│   ├── api/             # Proxy API bảo mật key
│   └── js/              # (main.js, xml-parser.js, dashboard.js, ai-analysis.js...)
├── kthkd/               # Phân hệ 2: Sổ Kế Toán HKD
│   ├── index.html
│   ├── style.css
│   └── js/              # (setup.js, app-shell.js, modal.js, render.js...)
└── tracuu-hkd/          # Phân hệ 3: Tra cứu Thuế HKD
    ├── index.html
    ├── style.css
    ├── bds-calc.js      # Logic tính toán phân bổ Bất động sản
    └── script.js        # Logic tra cứu chung và vẽ biểu đồ
```

## 🛠 Hướng Dẫn Sử Dụng (Chạy Cục Bộ)

Dự án phần lớn được viết bằng Front-end thuần (HTML, CSS, JavaScript) nhưng có dùng API PHP cho module AI. Bạn cần một môi trường hỗ trợ PHP.

**Cách chạy bằng PHP Server (Khuyên dùng):**
1. Mở Terminal (hoặc Command Prompt) tại thư mục gốc của dự án.
2. Chạy lệnh khởi tạo server:
   ```bash
   php -S localhost:8000
   ```
3. (Cách khác) Nếu chỉ test giao diện không cần gọi AI:
   ```bash
   python3 -m http.server 8000
   ```
4. Mở trình duyệt và truy cập: [http://localhost:8000](http://localhost:8000)

## 💻 Công Nghệ Sử Dụng
- **Giao diện**: HTML5, Vanilla CSS (Hỗ trợ Dark/Light Mode với CSS Variables).
- **Logic**: Vanilla JavaScript (ES6+).
- **Backend (API Proxy)**: PHP.
- **Thư viện bên thứ ba (sử dụng qua CDN)**:
  - [Chart.js 4.4.1](https://www.chartjs.org/) - Vẽ biểu đồ tài chính, biểu đồ thuế trực quan.
  - [SheetJS (xlsx)](https://sheetjs.com/) - Xử lý dữ liệu và xuất file Excel cho báo cáo kế toán.
  - [Google Fonts](https://fonts.google.com/) - Sử dụng bộ font `Be Vietnam Pro`, `Lexend` và `Inter`.

## ⚠️ Lưu Ý Cấu Hình AI
Tính năng "Chat AI" và "Phân tích tự động" tại `/bctc/` gọi API thông qua file trung gian `/bctc/api/analyze.php`.
- Bạn cần thay thế chuỗi `$API_KEY = '...';` trong file `analyze.php` thành API key hợp lệ của Anthropic (Claude) để AI có thể phản hồi bình thường.

## 🔗 Nguồn Tham Khảo
Dự án được quy hoạch, cấu trúc lại và mở rộng tính năng toàn diện dựa trên ý tưởng từ các nền tảng:
- Giải pháp hóa đơn điện tử: [https://minvoice.vn/](https://minvoice.vn/)
- Phân tích BCTC B01A gốc: [https://lyvu-bctc.edgeone.app/](https://lyvu-bctc.edgeone.app/)
- Kiểm tra & Sổ kế toán HKD gốc: [https://lyvu-kthkd.edgeone.app/](https://lyvu-kthkd.edgeone.app/)
- Tra cứu HKD gốc: [https://lyvu-tracuu-hkd.edgeone.app/](https://lyvu-tracuu-hkd.edgeone.app/)
