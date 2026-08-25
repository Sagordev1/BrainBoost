<?php
require_once 'auth_check.php';
require_once 'db_connect.php';

$stmt = $pdo->prepare("SELECT * FROM quiz_attempts WHERE user_id = ? ORDER BY submitted_at DESC");
$stmt->execute([$_SESSION['user_id']]);
$attempts = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - BrainBoost</title>
    <link rel="stylesheet" href="index.css">
    <link rel="stylesheet" href="Dashboard.css">
</head>
<body>
       <header class="header">
    <a href="index.html" class="logo">BrainBoost</a>
    <nav class="navbar">
       <a href="about.php">About</a>
          <a href="startquiz.php">Categories</a>
           <a href="Dashboard.php" class="active">Dashboard</a>
            <a href="account.php">Account</a>
    </nav>
</header>

<section class="dashboard">

<?php if (empty($attempts)): ?>

    <div class="dash-message">
        <h2>You don't start any quiz Yet</h2>
        <a href="startquiz.php"><button>Start a Quiz</button></a>
    </div>

<?php else: ?>

    <h2 class="dash-title">Your Quiz History</h2>

    <div class="attempts-list">
    <?php foreach ($attempts as $attempt): ?>
        <div class="attempt-card">
            <div class="attempt-header">
                <h3><?php echo htmlspecialchars($attempt['quiz_key']); ?></h3>
                <span class="attempt-score"><?php echo (int)$attempt['score']; ?> / <?php echo (int)$attempt['total_questions']; ?></span>
            </div>
            <p class="attempt-date">Submitted at: <?php echo date('d M Y, h:i A', strtotime($attempt['submitted_at'])); ?></p>

            <button class="toggle-review-btn" onclick="toggleReview(this)">see Review</button>

            <div class="attempt-review" style="display:none;">
                <?php
                $answers = json_decode($attempt['answers'], true);
                if (is_array($answers)):
                    foreach ($answers as $index => $item):
                        $isCorrect = !empty($item['isCorrect']);
                        $askText = $item['question'];
                ?>
                    <div class="review-item <?php echo $isCorrect ? 'correct' : 'wrong'; ?>">
                        <div class="review-question-row">
                            <p class="review-question"><?php echo ($index + 1) . ". " . htmlspecialchars($item['question']); ?></p>
                            <button type="button" class="ask-ai-btn" data-ask="<?php echo htmlspecialchars($askText); ?>" title="Ask AI about this question">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L14.2 9.2L21.5 11.5L14.2 13.8L12 21L9.8 13.8L2.5 11.5L9.8 9.2L12 2Z" fill="currentColor"/>
                                </svg>
                            </button>
                        </div>
                        <p class="review-answer">Your Answer: <span><?php echo htmlspecialchars($item['selected']); ?></span></p>
                        <?php if (!$isCorrect): ?>
                            <p class="review-answer">Correct Answer: <span><?php echo htmlspecialchars($item['correct']); ?></span></p>
                        <?php endif; ?>
                    </div>
                <?php endforeach; endif; ?>
            </div>
        </div>
    <?php endforeach; ?>
    </div>

<?php endif; ?>

</section>

<div id="copyToast" class="copy-toast">Question copied! Paste (Ctrl+V) in the chat box and hit Enter.</div>

<script>
function toggleReview(btn) {
    const reviewBox = btn.nextElementSibling;
    const isHidden = reviewBox.style.display === "none";
    reviewBox.style.display = isHidden ? "block" : "none";
    btn.innerText = isHidden ? "Hide Review" : "see Review";
}

document.querySelectorAll(".ask-ai-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
        const text = btn.dataset.ask;

        navigator.clipboard.writeText(text).then(function () {
            const toast = document.getElementById("copyToast");
            toast.classList.add("show");
            setTimeout(function () {
                toast.classList.remove("show");
            }, 3000);

            window.open("https://claude.ai/new", "claudeAskTab");
        }).catch(function () {
            alert("কপি করা যায়নি। ম্যানুয়ালি প্রশ্নটা কপি করো।");
        });
    });
});
</script>

</body>
</html>