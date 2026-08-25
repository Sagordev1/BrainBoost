<?php
// ==========================================
// LOGOUT HANDLER
// Session ধ্বংস করে account.php তে ফেরত পাঠাবে
// ==========================================

session_start();
$_SESSION = [];
session_destroy();

header("Location: account.php");
exit;
