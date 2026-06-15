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

$file_path = __DIR__ . '/tracking_data.json';

// Đọc dữ liệu cũ (nếu có)
$current_data = [];
if (file_exists($file_path)) {
    $file_contents = file_get_contents($file_path);
    $decoded = json_decode($file_contents, true);
    if (is_array($decoded)) {
        $current_data = $decoded;
    }
}

// Thêm dữ liệu mới vào mảng
$current_data[] = $data;

// Ghi đè file với dữ liệu đã cập nhật, định dạng JSON cho dễ nhìn
$result = file_put_contents($file_path, json_encode($current_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

if ($result !== false) {
    echo json_encode(["status" => "success", "message" => "Tracking data saved"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to write data"]);
}
?>
