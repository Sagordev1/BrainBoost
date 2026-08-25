<?php
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

require_once 'auth_check.php';
require_once 'db_connect.php';

$userId = $_SESSION['user_id'];

// এখন কোন chapter active আছে সেটা DB থেকে বের করা
$settingsStmt = $pdo->prepare("SELECT start_time, active_chapter, duration_minutes FROM quiz_settings WHERE quiz_key = 'recent_phage'");
$settingsStmt->execute();
$settingsRow = $settingsStmt->fetch(PDO::FETCH_ASSOC);

$quizKey = !empty($settingsRow['active_chapter']) ? $settingsRow['active_chapter'] : 'chapter1';
$startTimeStr = $settingsRow['start_time'] ?? null;
$quizDuration = !empty($settingsRow['duration_minutes']) ? (int)$settingsRow['duration_minutes'] : 10;

// এই ইউজার আগে এই chapter (quizKey) দিয়েছে কিনা চেক
$attemptStmt = $pdo->prepare("SELECT * FROM quiz_attempts WHERE user_id = ? AND quiz_key = ?");
$attemptStmt->execute([$userId, $quizKey]);
$existingAttempt = $attemptStmt->fetch(PDO::FETCH_ASSOC);

$now = time();
$startTimestamp = $startTimeStr ? strtotime($startTimeStr) : 0;
$secondsRemaining = $startTimestamp - $now;
$notStartedYet = ($secondsRemaining > 0);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo htmlspecialchars($quizKey); ?> - BrainBoost</title>
  <link rel="stylesheet" href="Recentphage.css">
</head>
<body>

<div class="container">

<?php if ($existingAttempt): ?>

    <h1><?php echo htmlspecialchars($quizKey); ?></h1>
    <h2>You have already given this quiz!</h2>
    <h2 id="score">Your Score : <?php echo (int)$existingAttempt['score']; ?> / <?php echo (int)$existingAttempt['total_questions']; ?></h2>
    <p style="margin-top:15px; color:#b8b8b8;">Go to Dashboard to see the full result.</p>
    <a href="Dashboard.php"><button style="margin-top:15px; background:#00b4fc; color:#081b29; font-weight:bold; font-size:16px; padding:12px 30px; border:none; border-radius:8px; cursor:pointer;">Go to Dashboard</button></a>

<?php elseif ($notStartedYet): ?>

    <h1><?php echo htmlspecialchars($quizKey); ?></h1>
    <h2>Quiz starts in:</h2>
    <h1 id="timer" style="color: #ffb703; font-size: 38px; margin: 20px 0;">--:--</h1>

    <script>
        let remaining = <?php echo (int)$secondsRemaining; ?>;
        const timerEl = document.getElementById("timer");

        function updateTimer() {
            if (remaining <= 0) {
                timerEl.innerText = "Time's up! Loading questions...";
                location.reload(true);
                return;
            }
            let hours = Math.floor(remaining / 3600);
            let mins = Math.floor((remaining % 3600) / 60);
            let secs = remaining % 60;

            let displayTime = "";
            if (hours > 0) displayTime += hours + "h ";
            displayTime += mins + "m " + (secs < 10 ? "0" : "") + secs + "s";

            timerEl.innerText = displayTime;
            remaining--;
        }

        updateTimer();
        const countdown = setInterval(updateTimer, 1000);
    </script>

<?php else: ?>

    <div id="quizStickyHeader">
        <h1><?php echo htmlspecialchars($quizKey); ?></h1>
        <h2 id="quizTimer">Time Left: --:--</h2>
    </div>

    <div id="quizBox">
        <div id="questionsContainer"></div>
        <button id="submitBtn">Submit</button>
    </div>

    <div id="resultBox" style="display:none;">
        <h2 id="resultTitle" style="margin-bottom:8px;"></h2>
        <p id="resultSubtitle" style="margin-bottom:15px; font-size:15px; color:#b8b8b8; line-height:1.6;"></p>
        <h2 id="score"></h2>
        <button id="seeResultBtn">See Result</button>
    </div>
    <canvas id="confettiCanvas" style="position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:9999;"></canvas>

    <div id="reviewContainer" style="display:none;"></div>

    <script>
        const QUIZ_CODE = "<?php echo htmlspecialchars($quizKey); ?>";
        const QUIZ_DURATION_MINUTES = <?php echo (int)$quizDuration; ?>;
    </script>
    <script src="Recentphage.js"></script>

<?php endif; ?>

</div>

</body>
</html>