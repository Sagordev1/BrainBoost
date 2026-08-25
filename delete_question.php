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
$id = (int)($input['id'] ?? 0);

if ($id <= 0) {
    echo json_encode(["status" => "error", "message" => "Invalid ID."]);
    exit;
}

$stmt = $pdo->prepare("DELETE FROM quiz_questions WHERE id = ?");
$stmt->execute([$id]);

echo json_encode(["status" => "success", "message" => "প্রশ্ন মুছে ফেলা হয়েছে!"]);