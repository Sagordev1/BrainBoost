<?php
// ==========================================
// CHECK EXAM TIME (Public)
// startquiz.js এখান থেকে বাকি সময় জেনে countdown দেখায়
// ==========================================

require_once 'db_connect.php';

header('Content-Type: application/json');

$stmt = $pdo->prepare("SELECT start_time, active_chapter FROM quiz_settings WHERE quiz_key = ?");
$stmt->execute(['recent_phage']);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    echo json_encode(["locked" => true, "secondsRemaining" => 0, "startTime" => null, "chapter" => ""]);
    exit;
}

$startTimestamp    = strtotime($row['start_time']);
$now                = time();
$secondsRemaining   = $startTimestamp - $now;

echo json_encode([
    "locked"           => $secondsRemaining > 0,
    "secondsRemaining" => max(0, $secondsRemaining),
    "startTime"        => $row['start_time'],
    "chapter"          => $row['active_chapter'] ?? ""
]);