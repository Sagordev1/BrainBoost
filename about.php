<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About - BrainBoost</title>
    <link rel="stylesheet" href="index.css">
    <link rel="stylesheet" href="About.css">
</head>
<body>

<header class="header">
    <a href="index.html" class="logo">BrainBoost</a>
    <nav class="navbar">
        <a href="about.php" class="active">About</a>
        <a href="startquiz.php">Categories</a>
        <a href="Dashboard.php">Dashboard</a>
        <a href="account.php">Account</a>
    </nav>
</header>

<section class="about-section">

    <div class="about-box">
        <h2>About BrainBoost</h2>
        <p>BrainBoost is a simple, focused platform built to help learners test and sharpen their knowledge through interactive quizzes. Whether you're brushing up on programming fundamentals or preparing for an exam, BrainBoost gives you a clean space to practice, track your progress, and see exactly where you stand.</p>

        <h3>What you'll find here</h3>
        <ul>
            <li>Topic-based quizzes (HTML, CSS, JavaScript, Java, C++ and more)</li>
            <li>Instant scoring with detailed answer review</li>
            <li>A personal dashboard to track every attempt</li>
        </ul>

        <p>Built with the goal of making self-paced learning simple and distraction-free.</p>
    </div>

    <div class="about-box">
        <h2>Contact Us</h2>
        <p id="contactMsg" style="margin-bottom: 15px; font-size: 14px; font-weight: bold;"></p>

        <form id="contactForm">
            <input type="text" id="contactName" placeholder="User name" required>
            <input type="email" id="contactEmail" placeholder="Your Email" required>
            <textarea id="contactMessage" placeholder="Your Message" rows="5" required></textarea>
            <button type="submit">Send Message</button>
        </form>
    </div>

    <p class="credit">This web site is created by <strong>Anto Deb Shuvo</strong></p>

</section>

<script>
document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const msg = document.getElementById("contactMsg");
    msg.style.color = "#ffb703";
    msg.textContent = "পাঠানো হচ্ছে...";

    const payload = {
        name: document.getElementById("contactName").value.trim(),
        email: document.getElementById("contactEmail").value.trim(),
        message: document.getElementById("contactMessage").value.trim()
    };

    fetch("save_contact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            msg.style.color = "limegreen";
            msg.textContent = data.message;
            document.getElementById("contactForm").reset();
        } else {
            msg.style.color = "#ff6b6b";
            msg.textContent = data.message;
        }
    })
    .catch(() => {
        msg.style.color = "#ff6b6b";
        msg.textContent = "সার্ভারে সমস্যা হয়েছে।";
    });
});
</script>

</body>
</html>