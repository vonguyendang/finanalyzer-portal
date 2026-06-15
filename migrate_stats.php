<?php
// migrate_stats.php
// Chuyển đổi dữ liệu cũ sang chuẩn mới

$old_file = __DIR__ . '/tracking_data.json';
$log_file = __DIR__ . '/tracking_logs.jsonl';
$stats_file = __DIR__ . '/real_stats.json';

if (!file_exists($old_file)) {
    die("Khong tim thay file tracking_data.json\n");
}

$file_contents = file_get_contents($old_file);
$data = json_decode($file_contents, true);

if (!is_array($data)) {
    die("Du lieu cu khong hop le\n");
}

$stats = [];
$log_lines = "";

foreach ($data as $row) {
    // 1. Chuyen doi sang log
    $log_lines .= json_encode($row, JSON_UNESCAPED_UNICODE) . "\n";
    
    // 2. Tinh toan thong ke
    $app = isset($row['app_id']) ? $row['app_id'] : 'unknown';
    if ($app !== 'home' && $app !== 'unknown') {
        if (!isset($stats[$app])) {
            $stats[$app] = 0;
        }
        $stats[$app]++;
    }
}

// Ghi ra file moi
file_put_contents($log_file, $log_lines, FILE_APPEND);
file_put_contents($stats_file, json_encode($stats, JSON_PRETTY_PRINT));

// Xoa file cu de giam dung luong (co the backup neu muon)
rename($old_file, $old_file . '.backup');

echo "Chuyen doi thanh cong " . count($data) . " ban ghi!\n";
?>
