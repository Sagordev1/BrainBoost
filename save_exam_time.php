<?php
date_default_timezone_set('Asia/Dhaka');
header('Content-Type: application/json');
require_once 'db_connect.php';

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$startTime = null;
if (isset($data['start_time'])) {
    $startTime = $data['start_time'];
} elseif (isset($_POST['start_time'])) {
    $startTime = $_POST['start_time'];
}

if (!empty($startTime)) {
    // ISO Standard (T) দূর করে DB Format এ আনা
    $formattedTime = str_replace('T', ' ', $startTime);
    if (strlen($formattedTime) == 16) {
        $formattedTime .= ':00';
    }

    try {
        if (isset($pdo)) {
            $stmt = $pdo->prepare("INSERT INTO quiz_settings (quiz_key, start_time) VALUES ('recent_phage', ?) ON DUPLICATE KEY UPDATE start_time = ?");
            $stmt->execute([$formattedTime, $formattedTime]);
        } elseif (isset($conn)) {
            $stmt = $conn->prepare("INSERT INTO quiz_settings (quiz_key, start_time) VALUES ('recent_phage', ?) ON DUPLICATE KEY UPDATE start_time = ?");
            $stmt->bind_param("ss", $formattedTime, $formattedTime);
            $stmt->execute();
            $stmt->close();
        }

        echo json_encode(['status' => 'success', 'message' => 'Exam time সেভ হয়ে গেছে!']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'DB Error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'সঠিক সময় পাওয়া যায়নি!']);
}
?>