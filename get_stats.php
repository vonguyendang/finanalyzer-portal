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

// Dữ liệu giả lập ban đầu để tăng uy tín (cộng dồn vào data thật)
// Sau này dữ liệu thật nhiều có thể xóa mảng này đi
$fake_stats = [
    "bctc" => 1254,
    "kthkd" => 842,
    "tracuu-hkd" => 2038,
    "tncn" => 3125,
    "vat" => 1563,
    "bhxh1lan" => 892,
    "gross-net" => 4207,
    "bhtn" => 671
];

foreach ($fake_stats as $app => $count) {
    if (!isset($stats[$app])) {
        $stats[$app] = 0;
    }
    $stats[$app] += $count;
}

echo json_encode([
    "status" => "success",
    "data" => $stats
]);
?>
