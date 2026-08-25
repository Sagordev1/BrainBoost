// ==========================================
// Login / Signup box toggle
// (profile view এ এই এলিমেন্টগুলো থাকবে না, তাই null চেক করা হয়েছে)
// ==========================================
const loginBox   = document.getElementById("loginBox");
const signupBox  = document.getElementById("signupBox");
const showSignup = document.getElementById("showSignup");
const showLogin  = document.getElementById("showLogin");

if (showSignup) {
    showSignup.addEventListener("click", function (e) {
        e.preventDefault();
        loginBox.style.display = "none";
        signupBox.style.display = "block";
    });
}

if (showLogin) {
    showLogin.addEventListener("click", function (e) {
        e.preventDefault();
        signupBox.style.display = "none";
        loginBox.style.display = "block";
    });
}


// ==========================================
// LOGIN FORM SUBMIT
// ==========================================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        fetch("login.php", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Login সফল হলে পেজ রিলোড হবে, account.php তখন Profile দেখাবে
                window.location.reload();
            } else {
                alert(data.message);
            }
        })
        .catch(() => {
            alert("সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করো।");
        });
    });
}


// ==========================================
// EDITABLE PROFILE FIELDS (School/College, Class)
// ==========================================
const editableFields = document.querySelectorAll(".editable-field");

editableFields.forEach(function (field) {
    const icon      = field.querySelector(".edit-icon");
    const valueSpan = field.querySelector(".field-value");
    const input     = field.querySelector(".field-input");
    const fieldName = field.dataset.field;

    icon.addEventListener("click", function () {

        // যদি এখন "save" মোডে থাকে -> ডেটা সেভ করো
        if (icon.classList.contains("editing")) {

            const newValue = input.value.trim();

            if (newValue === "") {
                alert("খালি রাখা যাবে না।");
                return;
            }

            const formData = new FormData();
            formData.append("field", fieldName);
            formData.append("value", newValue);

            fetch("update_profile.php", {
                method: "POST",
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    valueSpan.textContent = newValue;
                    valueSpan.style.display = "inline";
                    input.style.display = "none";
                    icon.innerHTML = "&#9998;";
                    icon.classList.remove("editing");
                } else {
                    alert(data.message);
                }
            })
            .catch(() => {
                alert("সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করো।");
            });

        } else {
            // Edit মোডে যাও
            valueSpan.style.display = "none";
            input.style.display = "inline-block";
            input.focus();
            icon.innerHTML = "&#10003;"; // ✓ চিহ্ন
            icon.classList.add("editing");
        }
    });
});


// ==========================================
// SIGNUP FORM SUBMIT
// ==========================================
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append("username", document.getElementById("signupUsername").value);
        formData.append("email", document.getElementById("signupEmail").value);
        formData.append("password", document.getElementById("signupPassword").value);
        formData.append("schoolCollege", document.getElementById("schoolCollege").value);
        formData.append("className", document.getElementById("className").value);

        fetch("signup.php", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Signup সফল হলে সাথে সাথে সেশন সেট হয়ে যায় (signup.php তে)
                // তাই রিলোড করলেই account.php Profile দেখাবে
                window.location.reload();
            } else {
                alert(data.message);
            }
        })
        .catch(() => {
            alert("সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করো।");
        });
    });
}