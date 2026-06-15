<?php
// get_stats.php
// API trả về thống kê số lượt sử dụng của từng tiện ích
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

$stats_file = __DIR__ . '/real_stats.json';
$stats = [];

if (file_exists($stats_file)) {
    $stats = json_decode(file_get_contents($stats_file), true);
    if (!is_array($stats)) {
        $stats = [];
    }
}

// Cấu hình fake traffic dựa trên trạng thái trước đó được lưu lại theo từng giờ
$fake_stats_file = __DIR__ . '/fake_stats_state.json';

// Dữ liệu giả lập ban đầu để tăng uy tín
$initial_fake_stats = [
    "bctc" => 1254,
    "kthkd" => 842,
    "tracuu-hkd" => 2038,
    "tncn" => 3125,
    "vat" => 1563,
    "bhxh1lan" => 892,
    "gross-net" => 4207,
    "bhtn" => 671,
    "thaisan" => 1504,
    "laivay" => 2345,
    "khanangvay" => 1254,
    "tietkiem" => 1840
];

$current_time = time();
$current_hour = floor($current_time / 3600);

if (file_exists($fake_stats_file)) {
    $state = json_decode(file_get_contents($fake_stats_file), true);
    if (!is_array($state) || !isset($state['last_hour']) || !isset($state['stats'])) {
        $state = [
            'last_hour' => $current_hour,
            'stats' => $initial_fake_stats
        ];
        @file_put_contents($fake_stats_file, json_encode($state, JSON_PRETTY_PRINT));
    }
} else {
    $state = [
        'last_hour' => $current_hour,
        'stats' => $initial_fake_stats
    ];
    @file_put_contents($fake_stats_file, json_encode($state, JSON_PRETTY_PRINT));
}

$hours_passed = $current_hour - $state['last_hour'];
if ($hours_passed > 0) {
    // Giới hạn vòng lặp cập nhật trong tối đa 30 ngày (nếu API không được gọi thời gian dài)
    if ($hours_passed > 24 * 30) $hours_passed = 24 * 30;
    
    $total_apps = count($initial_fake_stats);

    for ($i = 0; $i < $hours_passed; $i++) {
        $num_apps_to_update = mt_rand(0, $total_apps); // Từ 0 đến 12 tiện ích
        if ($num_apps_to_update > 0) {
            $random_apps = array_rand($initial_fake_stats, $num_apps_to_update);
            if (!is_array($random_apps)) {
                $random_apps = [$random_apps];
            }
            foreach ($random_apps as $app_key) {
                $increase = mt_rand(0, 50); // Tăng ngẫu nhiên 0-50 lượt truy cập
                if (!isset($state['stats'][$app_key])) {
                    $state['stats'][$app_key] = 0;
                }
                $state['stats'][$app_key] += $increase;
            }
        }
    }
    
    $state['last_hour'] = $current_hour;
    @file_put_contents($fake_stats_file, json_encode($state, JSON_PRETTY_PRINT));
}

$fake_stats = $state['stats'];

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
