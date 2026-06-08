<?php
// get_stats.php
// API trả về thống kê số lượt sử dụng của từng tiện ích
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

$file_path = __DIR__ . '/tracking_data.json';
$stats = [];

if (file_exists($file_path)) {
    $file_contents = file_get_contents($file_path);
    $data = json_decode($file_contents, true);
    
    if (is_array($data)) {
        foreach ($data as $row) {
            $app = isset($row['app_id']) ? $row['app_id'] : 'unknown';
            // Bỏ qua nếu là tracking truy cập trang chủ (tùy chọn)
            if ($app === 'home' || $app === 'unknown') continue;
            
            if (!isset($stats[$app])) {
                $stats[$app] = 0;
            }
            // Mỗi dòng log được coi là 1 lượt sử dụng
            $stats[$app]++;
        }
    }
}

// Nếu chưa có file data, có thể mock một ít data để test giao diện
if (empty($stats)) {
    // Dữ liệu giả lập ban đầu để test giao diện khi file JSON chưa có
    $stats = [
        "bctc" => 125,
        "kthkd" => 84,
        "tracuu-hkd" => 203,
        "tncn" => 312,
        "vat" => 156,
        "bhxh1lan" => 89,
        "gross-net" => 420,
        "bhtn" => 67
    ];
}

echo json_encode([
    "status" => "success",
    "data" => $stats
]);
?>
