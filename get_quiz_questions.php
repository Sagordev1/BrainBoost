<?php
require_once 'auth_check.php';
require_once 'db_connect.php';

header('Content-Type: application/json');

$quizKey = $_GET['code'] ?? '';

if ($quizKey === '') {
    echo json_encode(["success" => false, "message" => "quiz code পাওয়া যায়নি।"]);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM quiz_questions WHERE quiz_key = ? ORDER BY sort_order ASC, id ASC");
$stmt->execute([$quizKey]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($rows)) {
    echo json_encode(["success" => false, "message" => "এই quiz এর কোনো প্রশ্ন পাওয়া যায়নি।"]);
    exit;
}

$questions = [];
foreach ($rows as $row) {
    $questions[] = [
        "question" => $row['question'],
        "options"  => [$row['option1'], $row['option2'], $row['option3'], $row['option4']],
        "answer"   => $row['correct_answer']
    ];
}

echo json_encode(["success" => true, "questions" => $questions]);