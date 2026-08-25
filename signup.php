<?php
// ==========================================
// SIGNUP HANDLER
// Account.js থেকে fetch() এর মাধ্যমে এখানে POST আসবে
// ==========================================

session_start();
require_once 'db_connect.php';

header('Content-Type: application/json');

// শুধু POST request accept করবে
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

// ফর্ম থেকে ডেটা নেওয়া + trim করা
$username       = trim($_POST['username'] ?? '');
$email          = trim($_POST['email'] ?? '');
$password       = $_POST['password'] ?? '';
$schoolCollege  = trim($_POST['schoolCollege'] ?? '');
$className      = trim($_POST['className'] ?? '');

// ==========================================
// Validation
// ==========================================
if (
    $username === '' || $email === '' || $password === '' ||
    $schoolCollege === '' || $className === ''
) {
    echo json_encode(["success" => false, "message" => "সব ফিল্ড পূরণ করো।"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "সঠিক ইমেইল দাও।"]);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(["success" => false, "message" => "পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে।"]);
    exit;
}

// ==========================================
// Username / Email আগে থেকে আছে কিনা চেক
// ==========================================
$checkStmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
$checkStmt->execute([$username, $email]);

if ($checkStmt->rowCount() > 0) {
    echo json_encode(["success" => false, "message" => "এই Username অথবা Email আগে থেকেই ব্যবহৃত হয়েছে।"]);
    exit;
}

// ==========================================
// Password Hash করে Insert করা
// ==========================================
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$insertStmt = $pdo->prepare(
    "INSERT INTO users (username, email, password, school_college, class_name)
     VALUES (?, ?, ?, ?, ?)"
);

try {
    $insertStmt->execute([$username, $email, $hashedPassword, $schoolCollege, $className]);

    // নতুন ইউজারের id নিয়ে সাথে সাথে Login/Session সেট করা
    $newUserId = $pdo->lastInsertId();

    $_SESSION['user_id']  = $newUserId;
    $_SESSION['username'] = $username;

    echo json_encode(["success" => true, "message" => "Account তৈরি হয়েছে!"]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "কিছু একটা ভুল হয়েছে, আবার চেষ্টা করো।"]);
}
