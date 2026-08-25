<?php require_once 'auth_check.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    
    <link rel="stylesheet" href="startquiz.css">
    <link rel="stylesheet" href="index.css">
</head>
<body>
    <header class="header">
    <a href="index.html" class="logo">BrainBoost</a>
    <nav class="navbar">
    
         <a href="about.php">About</a>
          <a href="startquiz.php" class="active">Categories</a>
           <a href="Dashboard.php">Dashboard</a>
            <a href="account.php">Account</a>

    </nav>

</header>
<section class="quiz">
    <h2>Choose a Quiz</h2>
    <p class="subtitle">Select a topic to start your learning journey.</p>

    <div class="container">

        <div class="card">
            <h3>HTML</h3>
            <p>Test your HTML fundamentals.</p>
            <button>Start Quiz</button>
        </div>

        <div class="card">
            <h3>CSS</h3>
            <p>Practice layouts, Flexbox and Grid.</p>
            <button>Start Quiz</button>
        </div>

        <div class="card">
            <h3>JavaScript</h3>
            <p>Improve your JS programming skills.</p>
            <button>Start Quiz</button>
        </div>

        <div class="card">
            <h3>Java</h3>
            <p>Object-Oriented Programming concepts.</p>
            <button>Start Quiz</button>
        </div>

        <div class="card">
            <h3>C++</h3>
            <p>Data Structures and Algorithms.</p>
            <button>Start Quiz</button>
        </div>

        <div class="card">
            <h3>Recent Phage</h3>
            <p id="chapterLabel">Loading...</p>
            <h4 id="timerBox">You will be able to start the quiz after:</h4>
            <a href="recentphage.php" id="startLink" style="display:none;">
                <button>Start Quiz</button>
            </a>
        </div>

        <script src="startquiz.js"></script>

    </div>
</section>
</body>
</html>