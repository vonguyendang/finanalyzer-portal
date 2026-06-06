<?php
header('Content-Type: application/json; charset=utf-8');

// Chỉ cho phép POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

// ⚠️ BẠN ĐIỀN API KEY CỦA MÌNH VÀO ĐÂY (Giữ bí mật tuyệt đối)
$api_key = 'YOUR_ANTHROPIC_API_KEY';

// Nhận dữ liệu từ Frontend
$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['messages']) || !is_array($input['messages'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Thiếu dữ liệu messages']);
    exit;
}

$messages = $input['messages'];

// Cấu hình request gửi lên Anthropic
$data = [
    'model' => 'claude-3-5-sonnet-20241022', // Cập nhật sang model mới nhất của Claude 3.5 Sonnet
    'max_tokens' => 1500,
    'messages' => $messages
];

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-key: ' . $api_key,
    'anthropic-version: 2023-06-01'
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

if ($error) {
    http_response_code(500);
    echo json_encode(['error' => 'Lỗi kết nối CURL: ' . $error]);
    exit;
}

// Kiểm tra mã lỗi từ Anthropic
if ($http_code !== 200) {
    http_response_code($http_code);
    echo $response;
    exit;
}

// Trả kết quả về cho Frontend
echo $response;
?>
