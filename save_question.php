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

$chapter  = trim($input['chapter'] ?? '');
$chapter  = preg_replace('/[^a-zA-Z0-9_()-]/', '', $chapter);
$question = trim($input['question'] ?? '');
$option1  = trim($input['option1'] ?? '');
$option2  = trim($input['option2'] ?? '');
$option3  = trim($input['option3'] ?? '');
$option4  = trim($input['option4'] ?? '');
$correct  = trim($input['correct'] ?? '');

if ($chapter === '' || $question === '' || $option1 === '' || $option2 === '' || $option3 === '' || $option4 === '' || $correct === '') {
    echo json_encode(["status" => "error", "message" => "সব ফিল্ড পূরণ করো।"]);
    exit;
}

$validOptions = [$option1, $option2, $option3, $option4];
if (!in_array($correct, $validOptions, true)) {
    echo json_encode(["status" => "error", "message" => "সঠিক answer অবশ্যই ৪টা option এর একটার সাথে হুবহু মিলতে হবে।"]);
    exit;
}

$countStmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM quiz_questions WHERE quiz_key = ?");
$countStmt->execute([$chapter]);
$nextOrder = ($countStmt->fetch(PDO::FETCH_ASSOC)['cnt'] ?? 0) + 1;

$stmt = $pdo->prepare(
    "INSERT INTO quiz_questions (quiz_key, question, option1, option2, option3, option4, correct_answer, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);
$stmt->execute([$chapter, $question, $option1, $option2, $option3, $option4, $correct, $nextOrder]);

echo json_encode(["status" => "success", "message" => "প্রশ্ন যোগ হয়ে গেছে!"]);