<?php
session_start();
require_once 'db_connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "আগে Login করো।"]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$quizKey = $input['quiz_key'] ?? '';
$score   = $input['score'] ?? 0;
$total   = $input['total'] ?? 0;
$answers = $input['answers'] ?? [];

if ($quizKey === '') {
    echo json_encode(["success" => false, "message" => "quiz_key পাওয়া যায়নি।"]);
    exit;
}

$userId = $_SESSION['user_id'];
$answersJson = json_encode($answers, JSON_UNESCAPED_UNICODE);

try {
    $stmt = $pdo->prepare(
        "INSERT INTO quiz_attempts (user_id, quiz_key, score, total_questions, answers)
         VALUES (?, ?, ?, ?, ?)"
    );
    $stmt->execute([$userId, $quizKey, $score, $total, $answersJson]);

    echo json_encode(["success" => true, "message" => "রেজাল্ট সেভ হয়েছে।"]);

} catch (PDOException $e) {
    // UNIQUE constraint এর কারণে আগেই attempt থাকলে এখানে আসবে
    echo json_encode(["success" => false, "message" => "This quiz already has given by you"]);
}