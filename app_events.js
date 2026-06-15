// tracking.js
// API Endpoint (trỏ đến file PHP vừa tạo ở thư mục gốc)
const TRACKING_API_ENDPOINT = '/log_action.php';

/**
 * Hàm gửi dữ liệu tracking lên server
 * @param {string} appId - Mã tiện ích (vd: 'bctc', 'vat', 'tncn')
 * @param {string} action - Hành động (vd: 'visit', 'calculate', 'export')
 */
function trackUtilityUsage(appId, action = 'visit') {
    // Log ra console để dễ debug
    console.log(`[Tracking] Tiện ích: ${appId} | Hành động: ${action}`);

    fetch(TRACKING_API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            app_id: appId,
            action: action,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            // user_agent: navigator.userAgent
        })
    }).catch(err => console.error('[Tracking] Lỗi khi gửi dữ liệu:', err));
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Theo dõi khi click vào các thẻ ở trang chủ
    const cards = document.querySelectorAll('.card');
    if (cards.length > 0) {
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const href = card.getAttribute('href');
                if (href) {
                    const appId = href.replace(/[\.\/]/g, '') || 'home';
                    trackUtilityUsage(appId, 'click_from_home');
                }
            });
        });

        // Gọi API lấy thống kê lượt sử dụng để hiển thị lên thẻ card
        const STATS_API_ENDPOINT = '/get_stats.php';
        fetch(STATS_API_ENDPOINT)
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success' && res.data) {
                    cards.forEach(card => {
                        const href = card.getAttribute('href');
                        if (href) {
                            const appId = href.replace(/[\.\/]/g, '');
                            if (res.data[appId]) {
                                // Tạo badge hiển thị
                                const badge = document.createElement('div');
                                badge.className = 'card-usage';
                                badge.innerHTML = `<span style="font-size: 13px;">🔥</span> ${res.data[appId]} lượt`;
                                card.appendChild(badge);
                            }
                        }
                    });
                }
            })
            .catch(err => {
                console.error('[Tracking] Không thể tải thống kê (có thể do chưa up lên host), hiển thị dữ liệu mẫu:', err);
                // Dữ liệu mẫu để xem trước giao diện khi test dưới máy (localhost)
                const mockData = {
                    "bctc": 125,
                    "kthkd": 84,
                    "tracuu-hkd": 203,
                    "tncn": 312,
                    "vat": 156,
                    "bhxh1lan": 89,
                    "gross-net": 420,
                    "bhtn": 67,
                    "thaisan": 150,
                    "laivay": 345,
                    "khanangvay": 284,
                    "tietkiem": 195
                };
                cards.forEach(card => {
                    const href = card.getAttribute('href');
                    if (href) {
                        const appId = href.replace(/[\.\/]/g, '');
                        if (mockData[appId]) {
                            const badge = document.createElement('div');
                            badge.className = 'card-usage';
                            badge.innerHTML = `<span style="font-size: 13px;">🔥</span> ${mockData[appId]} lượt`;
                            card.appendChild(badge);
                        }
                    }
                });
            });
    }

    // 2. Tự động theo dõi khi người dùng truy cập trực tiếp vào một tiện ích
    // Lấy path hiện tại, ví dụ: /bctc/, /vat/
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
        // Lấy segment cuối cùng (tên thư mục tiện ích)
        const currentAppId = pathSegments[pathSegments.length - 1];
        // Nếu không phải trang chủ (có class .card) thì track visit
        if (cards.length === 0 && currentAppId && !currentAppId.endsWith('.html')) {
            trackUtilityUsage(currentAppId, 'page_load');
        }
    }
});
