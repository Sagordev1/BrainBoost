<?php
// ==========================================
// LOGIN HANDLER
// ==========================================

session_start();
require_once 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if ($username === '' || $password === '') {
    echo json_encode(["success" => false, "message" => "Username এবং Password দাও।"]);
    exit;
}

// Username দিয়ে ইউজার খোঁজা
$stmt = $pdo->prepare("SELECT id, username, password FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// ইউজার আছে কিনা + পাসওয়ার্ড মিলছে কিনা চেক
if ($user && password_verify($password, $user['password'])) {

    $_SESSION['user_id']  = $user['id'];
    $_SESSION['username'] = $user['username'];

    echo json_encode(["success" => true, "message" => "Login successful!"]);

} else {
    echo json_encode(["success" => false, "message" => "Username অথবা Password ভুল।"]);
}
