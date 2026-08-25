// ==========================================
// EXAM TIME COUNTDOWN
// server (check_exam_time.php) থেকে বাকি সময় নিয়ে countdown দেখানো হয়
// asol lock ta recentphage.php তে, এটা শুধু UI display
// ==========================================

const timerBox     = document.getElementById("timerBox");
const startLink    = document.getElementById("startLink");
const chapterLabel = document.getElementById("chapterLabel");

let remaining = 0;
let countdownInterval = null;

function updateDisplay() {
    if (remaining <= 0) {
        clearInterval(countdownInterval);
        timerBox.innerText = "Here You Go.....";
        timerBox.style.color = "limegreen";
        startLink.style.display = "inline-block";
        return;
    }

    let minutes = Math.floor(remaining / 60);
    let seconds = remaining % 60;
    timerBox.innerText = "You will be able to start the quiz after: " + minutes + "m " + seconds + "s";
}

if (timerBox) {
    fetch("check_exam_time.php")
        .then(res => res.json())
        .then(data => {
            const hasChapter = data.chapter && data.chapter.trim() !== "";

            if (!hasChapter) {
                // কোনো Active Chapter সেট করা নেই
                if (chapterLabel) {
                    chapterLabel.innerText = "Quiz are coming....";
                }
                timerBox.style.display = "none";
                startLink.style.display = "none";
                return;
            }

            // Chapter আছে, স্বাভাবিক প্রবাহ
            if (chapterLabel) {
                chapterLabel.innerText = data.chapter;
            }

            if (!data.locked) {
                timerBox.innerText = "Here You Go.....";
                timerBox.style.color = "limegreen";
                startLink.style.display = "inline-block";
            } else {
                remaining = data.secondsRemaining;
                updateDisplay();

                countdownInterval = setInterval(function () {
                    remaining--;
                    updateDisplay();
                }, 1000);
            }
        })
        .catch(() => {
            if (chapterLabel) {
                chapterLabel.innerText = "Quiz are coming....";
            }
            timerBox.style.display = "none";
        });
}