<?php
session_start();
require_once 'admin_config.php';
require_once 'db_connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
    echo json_encode(["status" => "error", "message" => "Unauthorized."]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$chapter = trim($input['chapter'] ?? '');
$chapter = preg_replace('/[^a-zA-Z0-9_()-]/', '', $chapter);

$duration = (int)($input['duration'] ?? 10);
if ($duration <= 0) {
    $duration = 10;
}

// এখন খালি chapter code ও গ্রহণযোগ্য — মানে "কোনো active quiz নেই"
$stmt = $pdo->prepare(
    "INSERT INTO quiz_settings (quiz_key, active_chapter, duration_minutes) VALUES ('recent_phage', ?, ?)
     ON DUPLICATE KEY UPDATE active_chapter = ?, duration_minutes = ?"
);
$stmt->execute([$chapter, $duration, $chapter, $duration]);

if ($chapter === '') {
    echo json_encode(["status" => "success", "message" => "Active Chapter খালি করা হয়েছে — এখন কোনো quiz active নেই।"]);
} else {
    echo json_encode(["status" => "success", "message" => "Chapter এবং সময় ($duration মিনিট) সেভ হয়ে গেছে!"]);
}