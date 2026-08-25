<?php
// ==========================================
// ACCOUNT PAGE
// Session আছে কিনা চেক করে Profile অথবা Login/Signup ফর্ম দেখাবে
// ==========================================

session_start();
require_once 'db_connect.php';

$loggedIn = isset($_SESSION['user_id']);
$user = null;

if ($loggedIn) {
    $stmt = $pdo->prepare(
        "SELECT username, email, school_college, class_name, created_at
         FROM users WHERE id = ?"
    );
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // যদি কোনো কারণে ইউজার DB তে না পাওয়া যায় (ডিলিট হয়ে গেছে ইত্যাদি)
    if (!$user) {
        session_destroy();
        $loggedIn = false;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account - BrainBoost</title>
    <link rel="stylesheet" href="index.css">
    <link rel="stylesheet" href="Account.css">
</head>
<body>

<header class="header">
    <a href="index.html" class="logo">BrainBoost</a>
    <nav class="navbar">
       <a href="about.php">About</a>
       <a href="startquiz.php">Categories</a>
        <a href="Dashboard.php">Dashboard</a>
        <a href="account.php" class="active">Account</a>
    </nav>
</header>

<section class="account">

<?php if ($loggedIn && $user): ?>

    <!-- ============ PROFILE BOX (Logged In) ============ -->
    <div class="form-box" id="profileBox">

        <h2>My Account</h2>

        <p class="greeting">
            Hey, <?php echo htmlspecialchars($user['username']); ?> —
            You are in active mode
            <span class="active-badge">✓</span>
        </p>

        <div class="profile-info">
            <p><strong>Username:</strong> <?php echo htmlspecialchars($user['username']); ?></p>
            <p><strong>Email:</strong> <?php echo htmlspecialchars($user['email']); ?></p>

            <p class="editable-field" data-field="school_college">
                <strong>School/College:</strong>
                <span class="field-value"><?php echo htmlspecialchars($user['school_college']); ?></span>
                <input type="text" class="field-input" value="<?php echo htmlspecialchars($user['school_college']); ?>" style="display:none;">
                <span class="edit-icon" title="Edit">&#9998;</span>
            </p>

            <p class="editable-field" data-field="class_name">
                <strong>Class:</strong>
                <span class="field-value"><?php echo htmlspecialchars($user['class_name']); ?></span>
                <input type="text" class="field-input" value="<?php echo htmlspecialchars($user['class_name']); ?>" style="display:none;">
                <span class="edit-icon" title="Edit">&#9998;</span>
            </p>

            <p><strong>Joined:</strong> <?php echo date('d M Y', strtotime($user['created_at'])); ?></p>
        </div>

        <a href="logout.php"><button type="button">Logout</button></a>

    </div>

<?php else: ?>

    <!-- ============ LOGIN BOX ============ -->
    <div class="form-box" id="loginBox">

        <h2>Login</h2>

        <form id="loginForm">
            <input type="text" id="username" placeholder="Username" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Log In</button>
        </form>

        <p class="switch">
            Don't have an account?
            <a href="#" id="showSignup">Sign Up</a>
        </p>

    </div>

    <!-- ============ SIGNUP BOX ============ -->
    <div class="form-box" id="signupBox">

        <h2>Sign Up</h2>

        <form id="signupForm">
            <input type="text" id="signupUsername" placeholder="Username" required>
            <input type="email" id="signupEmail" placeholder="Email" required>
            <input type="password" id="signupPassword" placeholder="Password" required>
            <input type="text" id="schoolCollege" placeholder="School / College Name" required>
            <input type="text" id="className" placeholder="Class" required>
            <button type="submit">Sign Up</button>
        </form>

        <p class="switch">
            Already have an account?
            <a href="#" id="showLogin">Log In</a>
        </p>

    </div>

<?php endif; ?>

</section>

<script src="Account.js"></script>

</body>
</html>