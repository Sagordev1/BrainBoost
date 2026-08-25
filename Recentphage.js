// =========================
// Variables
// =========================
let quiz = [];
let userAnswers = {};   // { questionIndex: selectedOptionText }
let score = 0;
let timerInterval = null;
let secondsLeft = 0;
let autoSubmitted = false;

// =========================
// HTML Elements
// =========================
const quizBox            = document.getElementById("quizBox");
const questionsContainer = document.getElementById("questionsContainer");
const submitBtn          = document.getElementById("submitBtn");
const resultBox          = document.getElementById("resultBox");
const scoreEl            = document.getElementById("score");
const resultTitleEl      = document.getElementById("resultTitle");
const resultSubtitleEl   = document.getElementById("resultSubtitle");
const seeResultBtn       = document.getElementById("seeResultBtn");
const reviewContainer    = document.getElementById("reviewContainer");
const quizTimerEl        = document.getElementById("quizTimer");

// =========================
// প্রশ্ন লোড করা DB থেকে
// =========================
fetch("get_quiz_questions.php?code=" + encodeURIComponent(QUIZ_CODE))
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            questionsContainer.innerHTML = "<p>" + (data.message || "প্রশ্ন লোড করা যায়নি।") + "</p>";
            submitBtn.style.display = "none";
            if (quizTimerEl) quizTimerEl.style.display = "none";
            return;
        }
        quiz = data.questions;
        renderAllQuestions();
        startTimer();
    })
    .catch(() => {
        questionsContainer.innerHTML = "<p>সার্ভারে সমস্যা হয়েছে।</p>";
        submitBtn.style.display = "none";
        if (quizTimerEl) quizTimerEl.style.display = "none";
    });

// =========================
// টাইমার শুরু করা
// =========================
function startTimer() {
    secondsLeft = (typeof QUIZ_DURATION_MINUTES !== "undefined" ? QUIZ_DURATION_MINUTES : 10) * 60;
    updateTimerDisplay();

    timerInterval = setInterval(function () {
        secondsLeft--;

        if (secondsLeft <= 0) {
            clearInterval(timerInterval);
            secondsLeft = 0;
            updateTimerDisplay();
            autoSubmitQuiz();
            return;
        }

        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    if (!quizTimerEl) return;

    let mins = Math.floor(secondsLeft / 60);
    let secs = secondsLeft % 60;
    let display = mins + "m " + (secs < 10 ? "0" : "") + secs + "s";

    quizTimerEl.innerText = "Time Left: " + display;

    // শেষ ৩০ সেকেন্ডে লাল করে দেখানো (সতর্কতা)
    if (secondsLeft <= 30) {
        quizTimerEl.style.color = "#e74c3c";
    }
}

// =========================
// সব প্রশ্ন একসাথে render করা
// =========================
function renderAllQuestions() {
    questionsContainer.innerHTML = "";

    quiz.forEach(function (q, qIndex) {
        const qBlock = document.createElement("div");
        qBlock.className = "question-block";

        const qTitle = document.createElement("h3");
        qTitle.className = "question-title";
        qTitle.innerHTML = (qIndex + 1) + ". " + q.question;
        qBlock.appendChild(qTitle);

        const optionsDiv = document.createElement("div");
        optionsDiv.className = "options";
        optionsDiv.id = "options-" + qIndex;

        q.options.forEach(function (optText) {
            const optBtn = document.createElement("button");
            optBtn.type = "button";
            optBtn.className = "option";
            optBtn.innerHTML = optText;

            optBtn.onclick = function () {
                const allBtns = optionsDiv.querySelectorAll(".option");
                allBtns.forEach(b => b.style.background = "#3498db");
                optBtn.style.background = "green";
                userAnswers[qIndex] = optText;
            };

            optionsDiv.appendChild(optBtn);
        });

        qBlock.appendChild(optionsDiv);
        questionsContainer.appendChild(qBlock);
    });
}

// =========================
// Submit বাটন (ম্যানুয়াল)
// =========================
submitBtn.onclick = function () {
    if (Object.keys(userAnswers).length < quiz.length) {
        if (!confirm("সব প্রশ্নের উত্তর দাওনি! এখনই সাবমিট করতে চাও?")) {
            return;
        }
    }
    finishQuiz();
};

// =========================
// সময় শেষ হলে Auto Submit
// =========================
function autoSubmitQuiz() {
    if (autoSubmitted) return;
    autoSubmitted = true;

    alert("সময় শেষ! যা উত্তর দিয়েছ তাই দিয়ে অটোমেটিক সাবমিট হয়ে যাচ্ছে।");
    finishQuiz();
}

// =========================
// Quiz শেষ হলে
// =========================
function finishQuiz() {
    if (timerInterval) clearInterval(timerInterval);

    const finalAnswers = [];
    score = 0;

    quiz.forEach(function (q, index) {
        const selected  = userAnswers[index] || ""; // উত্তর না দিলে খালি
        const isCorrect = selected === q.answer;
        if (isCorrect) score++;

        finalAnswers.push({
            question: q.question,
            selected: selected || "উত্তর দেওয়া হয়নি",
            correct: q.answer,
            isCorrect: isCorrect
        });
    });

    quizBox.style.display = "none";
    resultBox.style.display = "block";
    scoreEl.innerHTML = "Your Score : " + score + " / " + quiz.length;

    const stickyHeader = document.getElementById("quizStickyHeader");
    if (stickyHeader) stickyHeader.style.display = "none";

    // ===== Legendary / Good / Low নির্ধারণ ও animation =====
    showResultAnimation(score, quiz.length);

    fetch("save_quiz_result.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            quiz_key: QUIZ_CODE,
            score: score,
            total: quiz.length,
            answers: finalAnswers
        })
    })
    .catch(() => {
        console.log("রেজাল্ট সেভ করতে সমস্যা হয়েছে।");
    });

    // Review এর জন্য answers সংরক্ষণ
    window.__finalAnswers = finalAnswers;
}

// =========================
// Result Title + Subtitle + Confetti Animation
// =========================
function showResultAnimation(score, total) {
    if (!resultTitleEl) return;

    if (score === total || score >= total - 2) {
        // Legendary
        resultTitleEl.innerHTML = "Congratulations, Legendary Performance 🐐";
        resultTitleEl.style.color = "#ffd700";

        if (resultSubtitleEl) {
            resultSubtitleEl.innerHTML = "Keep Crushing It!";
            resultSubtitleEl.style.fontSize = "16px";
            resultSubtitleEl.style.color = "#ddd";
        }

        launchConfetti(150);

    } else if (score > total / 2) {
        // Good
        resultTitleEl.innerHTML = "Owhhh, Good Performance⚡";
        resultTitleEl.style.color = "#00abf0";

        if (resultSubtitleEl) {
            resultSubtitleEl.innerHTML = "Keep Improving! 📈";
            resultSubtitleEl.style.fontSize = "16px";
            resultSubtitleEl.style.color = "#ddd";
        }

        launchConfetti(60);

    } else {
        // Low Performance
        resultTitleEl.innerHTML = "Low Performance 😢";
        resultTitleEl.style.color = "#ff6b6b";

        if (resultSubtitleEl) {
            resultSubtitleEl.innerHTML = "Failure is an important things<br>because success doesn't always teach you much <br>it just boosts your ego(keep pushing)";
            resultSubtitleEl.style.fontSize = "13px";
            resultSubtitleEl.style.color = "#8a8a8a";
        }
        // কোনো animation নেই
    }
}

function launchConfetti(particleCount) {
    const canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#ffd700", "#00abf0", "#ff6b6b", "#4CAF50", "#e74c3c", "#ffffff"];
    let particles = [];

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: -20 - Math.random() * canvas.height * 0.5,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 3 + 2,
            speedX: Math.random() * 2 - 1,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5
        });
    }

    let frame = 0;
    const maxFrames = 240; // প্রায় ৪ সেকেন্ড

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            ctx.restore();
        });

        frame++;
        if (frame < maxFrames) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    animate();
}

// =========================
// "See Result" বাটন
// =========================
seeResultBtn.onclick = function () {
    reviewContainer.style.display = "block";
    reviewContainer.innerHTML = "";

    (window.__finalAnswers || []).forEach(function (item, index) {
        let reviewItem = document.createElement("div");
        reviewItem.className = "review-item " + (item.isCorrect ? "correct" : "wrong");

        reviewItem.innerHTML =
            "<p class='review-question'>" + (index + 1) + ". " + item.question + "</p>" +
            "<p class='review-answer'>Your Answer: <span>" + item.selected + "</span></p>" +
            (item.isCorrect
                ? ""
                : "<p class='review-answer'>Correct Answer: <span>" + item.correct + "</span></p>");

        reviewContainer.appendChild(reviewItem);
    });

    seeResultBtn.style.display = "none";
};