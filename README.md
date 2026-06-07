# Hệ Sinh Thái Tiện Ích Tài Chính · Kế Toán (FinAnalyzer Portal)

Dự án này là một hệ sinh thái (Portal) tập hợp các công cụ hỗ trợ kế toán, tài chính cá nhân, phân tích báo cáo tài chính và tra cứu thông tin doanh nghiệp/hộ kinh doanh một cách nhanh chóng, trực quan, tuân thủ các quy định pháp luật mới nhất (được cập nhật đến năm 2026).

## 🚀 Các Tiện Ích Tích Hợp

Dự án bao gồm 8 phân hệ chính được thiết kế liên kết chặt chẽ với nhau, giao diện đồng bộ hỗ trợ toàn diện **Dark Mode / Light Mode**:

### 1. Phân Tích BCTC B01A (`/bctc/`)
Công cụ "CFO Ảo" hỗ trợ đọc và phân tích Báo cáo Tài chính tự động.
- **Nhập liệu linh hoạt:** Hỗ trợ tải lên file XML (chuẩn HTKK/CQT) hoặc nhập số liệu thủ công (Manual Entry) trực tiếp ngay trên trình duyệt mà không cần file.
- **Trực quan hóa:** Hiển thị Dashboard với 12+ chỉ số tài chính và các biểu đồ minh họa rõ nét.
- **Khung Chat AI 2 chiều:** Tích hợp AI (Claude) không chỉ viết báo cáo tự động mà còn có thanh chat để người dùng hỏi đáp trực tiếp với dữ liệu BCTC đang mở.
- **Xuất báo cáo:** Hỗ trợ xuất dữ liệu ra Excel và in báo cáo dưới dạng PDF.

### 2. Sổ Kế Toán HKD (`/kthkd/`)
Công cụ thay thế việc ghi sổ tay truyền thống, được xây dựng theo chuẩn **Thông tư 152/2025/TT-BTC** và các Nghị định mới nhất.
- **Hệ thống sổ sách đầy đủ:** Hỗ trợ S1a, S2a, S2b, S2c, S2d, S2e và S3a tùy thuộc vào quy mô.
- **Đọc Hóa đơn Điện tử (XML):** Tích hợp tính năng tải lên file XML của Hóa đơn điện tử để tự động bóc tách ngày tháng và số tiền.
- **Dashboard Tài chính:** Theo dõi dòng tiền, doanh thu/chi phí qua biểu đồ.
- **Backup & Phục hồi:** Lưu trữ tại trình duyệt cục bộ (Local Storage), hỗ trợ xuất file JSON và Excel.

### 3. Tra Cứu Thuế HKD (`/tracuu-hkd/`)
Công cụ tính toán và ước lượng nhanh tiền thuế phải nộp.
- **Tính toán tự động:** Tính số thuế GTGT, TNCN dựa trên ngưỡng doanh thu (NĐ 141/2026/NĐ-CP).
- **Module Bất Động Sản:** Xử lý bài toán phân bổ mức trừ miễn thuế 1 tỷ/năm cho nhiều bất động sản cho thuê.
- **Liên kết Hệ sinh thái:** Nút *"Mở sổ kế toán"* tự động đẩy dữ liệu sang Sổ Kế Toán HKD (`/kthkd/`).

### 4. Tính Thuế TNCN (`/tncn/`)
Công cụ tính Thuế Thu nhập cá nhân và Hoàn thuế.
- Tính toán chính xác số thuế phải nộp dựa trên thu nhập chịu thuế, các khoản giảm trừ (bản thân, người phụ thuộc).
- Hiển thị bảng diễn giải chi tiết các bước tính thuế để người dùng dễ dàng hiểu quy trình.

### 5. Tính Thuế Giá Trị Gia Tăng (VAT) (`/vat/`)
- Hỗ trợ tính toán thuế GTGT theo phương pháp khấu trừ và trực tiếp.
- Bảng diễn giải hóa đơn đầu vào, đầu ra và số thuế phải nộp/được khấu trừ.

### 6. Tính Lương Gross - Net (`/gross-net/`)
Công cụ quy đổi lương Gross sang Net và Net sang Gross chuẩn xác nhất (cập nhật mức lương cơ sở và tỷ lệ đóng bảo hiểm năm 2026).
- Tách bạch các khoản trích nộp (BHXH, BHYT, BHTN) và thuế TNCN.
- Diễn giải từng khoản trừ chi tiết, giao diện trực quan.

### 7. Tính Mức Hưởng Bảo Hiểm Thất Nghiệp (`/bhtn/`)
- Ước tính số tiền trợ cấp thất nghiệp hàng tháng dựa trên mức lương bình quân 6 tháng liền kề.
- Cho biết số tháng được hưởng và diễn giải chi tiết công thức áp dụng.

### 8. Tính Tiền BHXH 1 Lần (`/bhxh1lan/`)
- Tính số tiền Bảo hiểm Xã hội 1 lần được rút dựa trên quá trình đóng và hệ số trượt giá mới nhất.
- Bảng liệt kê dòng tiền chi tiết theo từng giai đoạn đóng bảo hiểm.

---

## 📁 Cấu Trúc Mã Nguồn

Toàn bộ mã nguồn đã được tách biệt theo cấu trúc module để dễ dàng quản lý, bảo trì:

```text
/
├── index.html           # Trang chủ (Portal) điều hướng đến các tiện ích
├── README.md            # Tài liệu dự án
├── style.css            # CSS hệ thống dùng chung (CSS variables, Footer, Float buttons)
├── script.js            # Script điều khiển Dark Mode và UI toàn cục
├── bctc/                # Phân hệ 1: Phân tích BCTC
├── kthkd/               # Phân hệ 2: Sổ Kế Toán HKD
├── tracuu-hkd/          # Phân hệ 3: Tra cứu Thuế HKD
├── tncn/                # Phân hệ 4: Tính Thuế TNCN
├── vat/                 # Phân hệ 5: Tính Thuế VAT
├── gross-net/           # Phân hệ 6: Tính Lương Gross/Net
├── bhtn/                # Phân hệ 7: Tính BHTN
└── bhxh1lan/            # Phân hệ 8: Tính BHXH 1 Lần
```

## 🛠 Hướng Dẫn Sử Dụng (Chạy Cục Bộ)

Dự án phần lớn được viết bằng Front-end thuần (HTML, CSS, JavaScript) tĩnh hoàn toàn (không cần build nodejs).

**Cách chạy đơn giản nhất:**
1. Mở Terminal (hoặc Command Prompt) tại thư mục gốc của dự án.
2. Chạy lệnh khởi tạo HTTP server:
   ```bash
   python3 -m http.server 8000
   ```
   *Hoặc bằng PHP:*
   ```bash
   php -S localhost:8000
   ```
3. Mở trình duyệt và truy cập: [http://localhost:8000](http://localhost:8000)

## 💻 Công Nghệ Sử Dụng
- **Giao diện**: HTML5, Vanilla CSS (Hỗ trợ Dark/Light Mode đồng bộ xuyên suốt với hệ thống CSS Variables).
- **Logic**: Vanilla JavaScript (ES6+).
- **Thư viện bên thứ ba (sử dụng qua CDN)**:
  - [Chart.js 4.4.1](https://www.chartjs.org/) - Vẽ biểu đồ tài chính, biểu đồ thuế trực quan.
  - [SheetJS (xlsx)](https://sheetjs.com/) - Xử lý dữ liệu và xuất file Excel cho báo cáo kế toán.
  - [Google Fonts](https://fonts.google.com/) - Sử dụng bộ font `Inter` và `Lexend`.

## ⚠️ Lưu Ý Pháp Lý
Website hoạt động hoàn toàn với mục đích **phi thương mại**, phục vụ cho nhu cầu học tập, tham khảo và hỗ trợ tính toán nhanh. Các công cụ tính toán được xây dựng dựa trên việc tham khảo các quy định pháp luật và nguồn tài liệu uy tín, tuy nhiên chúng tôi **không chịu trách nhiệm** pháp lý đối với bất kỳ quyết định tài chính, kế toán hay thuế nào dựa trên các kết quả từ hệ thống này.

## 🔗 Nguồn Tham Khảo
Dự án được quy hoạch, cấu trúc lại và mở rộng tính năng toàn diện dựa trên ý tưởng từ các nền tảng:
- Giải pháp hóa đơn điện tử: [https://minvoice.vn/](https://minvoice.vn/)
- Các công cụ tính toán tham khảo từ Luật Vietnam, Thuế điện tử.
- Các ứng dụng gốc (BCTC, Sổ Kế Toán, Tra Cứu HKD) trên hệ thống EdgeOne.
