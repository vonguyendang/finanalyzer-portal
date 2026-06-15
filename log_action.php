<?php
// track.php
// Cho phép CORS nếu cần (tuỳ chọn, vì nếu chạy cùng domain thì không bắt buộc)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Xử lý preflight request của trình duyệt (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Nhận dữ liệu từ GET hoặc POST
$data = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['app_id']) && isset($_GET['action'])) {
        $data = [
            'app_id' => $_GET['app_id'],
            'action' => $_GET['action'],
            'timestamp' => isset($_GET['timestamp']) ? $_GET['timestamp'] : date('c'),
            'url' => isset($_GET['url']) ? $_GET['url'] : ''
        ];
    }
}

if (!$data) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON payload"]);
    exit();
}

// Thêm thông tin IP (tuỳ chọn)
// $data['ip'] = $_SERVER['REMOTE_ADDR'];

// 1. Ghi log chi tiết (siêu nhanh, không tốn RAM)
$log_file = __DIR__ . '/tracking_logs.jsonl';
$log_line = json_encode($data, JSON_UNESCAPED_UNICODE) . "\n";
file_put_contents($log_file, $log_line, FILE_APPEND | LOCK_EX);

// 2. Cập nhật biến đếm nhanh để get_stats.php dùng (O(1))
$app = isset($data['app_id']) ? $data['app_id'] : 'unknown';
if ($app !== 'home' && $app !== 'unknown') {
    $stats_file = __DIR__ . '/real_stats.json';
    $stats = [];
    if (file_exists($stats_file)) {
        $stats = json_decode(file_get_contents($stats_file), true);
        if (!is_array($stats)) $stats = [];
    }
    
    if (!isset($stats[$app])) {
        $stats[$app] = 0;
    }
    $stats[$app]++;
    
    file_put_contents($stats_file, json_encode($stats, JSON_PRETTY_PRINT));
}

echo json_encode(["status" => "success", "message" => "Tracking data saved"]);

?>
