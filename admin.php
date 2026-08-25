<?php
session_start();
require_once 'admin_config.php';
require_once 'db_connect.php';

if (isset($_GET['logout'])) {
    unset($_SESSION['is_admin']);
    header('Location: admin.php');
    exit;
}

$error = '';

// Brute-force protection: বারবার ভুল try করলে সাময়িক লক
if (!isset($_SESSION['login_attempts'])) {
    $_SESSION['login_attempts'] = 0;
    $_SESSION['lockout_until'] = 0;
}

$isLockedOut = time() < ($_SESSION['lockout_until'] ?? 0);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['admin_password'])) {
    if ($isLockedOut) {
        $error = 'অনেকবার ভুল Password দিয়েছ। কিছুক্ষণ পর আবার চেষ্টা করো।';
    } elseif (password_verify($_POST['admin_password'], ADMIN_PASSWORD_HASH)) {
        $_SESSION['is_admin'] = true;
        $_SESSION['login_attempts'] = 0;
    } else {
        $_SESSION['login_attempts']++;
        if ($_SESSION['login_attempts'] >= 5) {
            $_SESSION['lockout_until'] = time() + 300; // ৫ মিনিট লক
            $error = 'অনেকবার ভুল Password দিয়েছ। ৫ মিনিট পর আবার চেষ্টা করো।';
        } else {
            $error = 'Wrong Password!';
        }
    }
}

$isAdmin = isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true;

$currentStartTime = '';
$currentChapter = '';
$currentDuration = 10;
$allQuestions = [];

if ($isAdmin) {
    try {
        $stmt = $pdo->prepare("SELECT start_time, active_chapter, duration_minutes FROM quiz_settings WHERE quiz_key = 'recent_phage'");
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!empty($row['start_time'])) {
            $currentStartTime = date('Y-m-d\TH:i', strtotime($row['start_time']));
        }
        $currentChapter = $row['active_chapter'] ?? '';
        $currentDuration = $row['duration_minutes'] ?? 10;
    } catch (Exception $e) {
        // Ignore Error
    }

    $qStmt = $pdo->prepare("SELECT * FROM quiz_questions ORDER BY quiz_key ASC, sort_order ASC");
    $qStmt->execute();
    $allQuestions = $qStmt->fetchAll(PDO::FETCH_ASSOC);
}
session_write_close();
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - BrainBoost</title>
    <link rel="stylesheet" href="index.css">
    <link rel="stylesheet" href="Account.css">
</head>
<body>

<section class="account">
<?php if (!$isAdmin): ?>
    <div class="form-box">
        <h2>Admin Login</h2>
        <?php if ($error): ?><p style="color: #ff6b6b;"><?php echo htmlspecialchars($error); ?></p><?php endif; ?>
        <form method="POST">
            <input type="password" name="admin_password" placeholder="Admin Password" required>
            <button type="submit">Login</button>
        </form>
    </div>
<?php else: ?>
    <div class="form-box" style="max-width: 700px;">
        <h2>Recent Phage - Exam Time</h2>
        <p id="statusMsg" style="margin-bottom: 15px; font-size: 14px; font-weight: bold;"></p>

        <form id="examTimeForm">
            <label style="color:white; display:block; margin-bottom:5px;">Start Time:</label>
            <input type="datetime-local" id="startTimeInput" value="<?php echo $currentStartTime; ?>" required>
            <button type="submit" style="margin-top:15px;">Save Time</button>
        </form>

        <hr style="margin: 20px 0; border-color: #00abf0;">

        <label style="color:white; display:block; margin-bottom:5px;">Active Chapter Code:</label>
        <input type="text" id="chapterInput" value="<?php echo htmlspecialchars($currentChapter); ?>" placeholder="chapter1">

        <label style="color:white; display:block; margin-top:15px; margin-bottom:5px;">Quiz Duration (minutes):</label>
        <input type="number" id="durationInput" value="<?php echo (int)$currentDuration; ?>" min="1" placeholder="10">

        <button id="saveChapterBtn" type="button" style="margin-top:15px;">Save Chapter</button>
        <p id="chapterMsg" style="margin-top:10px; font-size: 14px; font-weight: bold;"></p>

        <hr style="margin: 30px 0; border-color: #00abf0;">

        <h3 style="color:white; margin-bottom: 15px;">নতুন প্রশ্ন যোগ করো</h3>

        <form id="addQuestionForm">
            <label style="color:white; display:block; margin-bottom:5px;">Chapter Code:</label>
            <input type="text" id="qChapter" placeholder="chapter1" required style="margin-bottom:10px;">

            <label style="color:white; display:block; margin-bottom:5px;">প্রশ্ন:</label>
            <input type="text" id="qQuestion" placeholder="প্রশ্ন লেখো" required style="margin-bottom:10px;">

            <label style="color:white; display:block; margin-bottom:5px;">Option 1:</label>
            <input type="text" id="qOption1" required style="margin-bottom:10px;">

            <label style="color:white; display:block; margin-bottom:5px;">Option 2:</label>
            <input type="text" id="qOption2" required style="margin-bottom:10px;">

            <label style="color:white; display:block; margin-bottom:5px;">Option 3:</label>
            <input type="text" id="qOption3" required style="margin-bottom:10px;">

            <label style="color:white; display:block; margin-bottom:5px;">Option 4:</label>
            <input type="text" id="qOption4" required style="margin-bottom:10px;">

            <label style="color:white; display:block; margin-bottom:5px;">সঠিক Answer (উপরের ৪টার একটা হুবহু কপি করো):</label>
            <input type="text" id="qCorrect" required style="margin-bottom:10px;">

            <button type="submit">প্রশ্ন যোগ করো</button>
            <p id="questionMsg" style="margin-top:10px; font-size: 14px; font-weight: bold;"></p>
        </form>

        <hr style="margin: 30px 0; border-color: #00abf0;">

        <h3 style="color:white; margin-bottom: 15px;">সব প্রশ্ন (Chapter অনুযায়ী)</h3>

        <div style="text-align:left; max-height: 400px; overflow-y:auto;">
        <?php
        $groupedByChapter = [];
        foreach ($allQuestions as $q) {
            $groupedByChapter[$q['quiz_key']][] = $q;
        }
        foreach ($groupedByChapter as $chapKey => $questions):
        ?>
            <h4 style="color:#00abf0; margin-top:15px;"><?php echo htmlspecialchars($chapKey); ?></h4>
            <?php foreach ($questions as $q): ?>
                <div style="background:#081b29; padding:10px; border-radius:8px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:#ddd; font-size:14px;">
                        <?php echo htmlspecialchars($q['question']); ?>
                        <br><small style="color:#0f0;">সঠিক: <?php echo htmlspecialchars($q['correct_answer']); ?></small>
                    </span>
                    <button type="button" class="delete-q-btn" data-id="<?php echo $q['id']; ?>" style="background:#e74c3c; color:white; padding:6px 12px; font-size:12px;">মুছো</button>
                </div>
            <?php endforeach; ?>
        <?php endforeach; ?>
        </div>

        <p class="switch" style="margin-top:20px;"><a href="admin.php?logout=1">Logout</a></p>
    </div>
<?php endif; ?>
</section>

<?php if ($isAdmin): ?>
<script>
document.getElementById("examTimeForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const startTime = document.getElementById("startTimeInput").value;
    const statusMsg = document.getElementById("statusMsg");

    statusMsg.style.color = "#ffb703";
    statusMsg.textContent = "সেভ হচ্ছে...";

    fetch("save_exam_time.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start_time: startTime })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success' || data.success) {
            statusMsg.style.color = "limegreen";
            statusMsg.textContent = data.message;
        } else {
            statusMsg.style.color = "#ff6b6b";
            statusMsg.textContent = data.message || "ত্রুটি হয়েছে!";
        }
    })
    .catch(() => {
        statusMsg.style.color = "#ff6b6b";
        statusMsg.textContent = "সার্ভারে কানেক্ট করা যাচ্ছে না!";
    });
});

document.getElementById("saveChapterBtn").addEventListener("click", function () {
    const chapter = document.getElementById("chapterInput").value.trim();
    const duration = document.getElementById("durationInput").value.trim();
    const msg = document.getElementById("chapterMsg");

    msg.style.color = "#ffb703";
    msg.textContent = "সেভ হচ্ছে...";

    fetch("save_chapter.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapter: chapter, duration: duration })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            msg.style.color = "limegreen";
            msg.textContent = data.message;
            document.getElementById("qChapter").value = chapter;
        } else {
            msg.style.color = "#ff6b6b";
            msg.textContent = data.message || "ত্রুটি হয়েছে!";
        }
    })
    .catch(() => {
        msg.style.color = "#ff6b6b";
        msg.textContent = "সার্ভারে কানেক্ট করা যাচ্ছে না!";
    });
});

document.getElementById("addQuestionForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const msg = document.getElementById("questionMsg");
    msg.style.color = "#ffb703";
    msg.textContent = "সেভ হচ্ছে...";

    const payload = {
        chapter:  document.getElementById("qChapter").value.trim(),
        question: document.getElementById("qQuestion").value.trim(),
        option1:  document.getElementById("qOption1").value.trim(),
        option2:  document.getElementById("qOption2").value.trim(),
        option3:  document.getElementById("qOption3").value.trim(),
        option4:  document.getElementById("qOption4").value.trim(),
        correct:  document.getElementById("qCorrect").value.trim()
    };

    fetch("save_question.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            msg.style.color = "limegreen";
            msg.textContent = data.message;
            setTimeout(() => location.reload(), 800);
        } else {
            msg.style.color = "#ff6b6b";
            msg.textContent = data.message;
        }
    })
    .catch(() => {
        msg.style.color = "#ff6b6b";
        msg.textContent = "সার্ভারে কানেক্ট করা যাচ্ছে না!";
    });
});

document.querySelectorAll(".delete-q-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
        if (!confirm("এই প্রশ্নটা মুছে ফেলতে চাও?")) return;

        fetch("delete_question.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: btn.dataset.id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                location.reload();
            } else {
                alert(data.message);
            }
        })
        .catch(() => alert("সার্ভারে কানেক্ট করা যাচ্ছে না!"));
    });
});
</script>
<?php endif; ?>
</body>
</html>