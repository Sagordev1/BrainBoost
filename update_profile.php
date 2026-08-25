<?php
// ==========================================
// UPDATE PROFILE FIELD (school_college / class_name)
// শুধু whitelist করা field আপডেট হবে, নিরাপত্তার জন্য
// ==========================================

session_start();
require_once 'db_connect.php';

header('Content-Type: application/json');

// Login করা না থাকলে আপডেট করতে দেওয়া হবে না
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "আগে Login করো।"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

// শুধু এই দুইটা field-ই edit করা যাবে
$allowedFields = ['school_college', 'class_name'];

$field = $_POST['field'] ?? '';
$value = trim($_POST['value'] ?? '');

if (!in_array($field, $allowedFields, true)) {
    echo json_encode(["success" => false, "message" => "এই field edit করা যাবে না।"]);
    exit;
}

if ($value === '') {
    echo json_encode(["success" => false, "message" => "খালি রাখা যাবে না।"]);
    exit;
}

// $field সরাসরি whitelist থেকে আসছে, তাই column name হিসেবে ব্যবহার নিরাপদ
$stmt = $pdo->prepare("UPDATE users SET $field = ? WHERE id = ?");
$stmt->execute([$value, $_SESSION['user_id']]);

echo json_encode(["success" => true, "message" => "Updated!", "value" => htmlspecialchars($value)]);
