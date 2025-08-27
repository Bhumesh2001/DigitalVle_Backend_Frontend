const loginBtn = document.getElementById('loginBtn');
const loginText = document.getElementById('loginText');
const loginSpinner = document.getElementById('loginSpinner');
const togglePassword = document.getElementById("togglePassword");
const passwordField = document.getElementById("password");

document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    loginText.classList.add('d-none');
    loginSpinner.classList.remove('d-none');
    loginBtn.disabled = true;
    loginBtn.style.backgroundColor = '#ff0000';

    try {
        const response = await fetch(`/api/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        });
        await response.json();

        if (response.ok) {
            window.location.href = `/admin/dashboard?r=admin`;
            document.getElementById('loginForm').reset();
            removedisabledButton();
        } else {
            const inputs = document.querySelectorAll('input[type="password"], input[type="text"].form-control');
            inputs.forEach(input => {
                input.style.borderColor = 'red';
            });
            removedisabledButton();
        };

    } catch (error) {
        console.error('Error:', error);
        removedisabledButton();
    };
});

function removedisabledButton() {
    loginText.classList.remove('d-none');
    loginSpinner.classList.add('d-none');
    loginBtn.disabled = false;
    loginBtn.style.backgroundColor = '';
};

togglePassword.addEventListener("click", function () {
    const type = passwordField.type === "password" ? "text" : "password";
    passwordField.type = type;

    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
});

// Define an array of greeting messages
const greetings = [
    {
        main: "🚀 Welcome Back, Admin!",
        sub: "Your dashboard awaits. Please sign in to continue.",
    },
    {
        main: "🎩 Hello, Administrator!",
        sub: "Ready to take control? Login to access your dashboard.",
    },
    {
        main: "⚡ Greetings, Commander!",
        sub: "Your digital kingdom awaits. Log in to lead the way!",
    },
    {
        main: "🎛️ Welcome to the Control Panel!",
        sub: "Your admin tools are just a login away.",
    },
    {
        main: "👑 Hey Super Admin!",
        sub: "Let's make things awesome today!",
    },
    {
        main: "🛠️ Welcome, Captain!",
        sub: "Time to take charge of your dashboard!",
    },
    {
        main: "🎉 Good to See You Again!",
        sub: "Your control panel is waiting.",
    },
    {
        main: "🖤 Welcome to the Dark Side!",
        sub: "Power and control are at your fingertips.",
    },
    {
        main: "🚨 Neon Red Alert!",
        sub: "Only authorized admins can enter!",
    },
    {
        main: "✅ System Secure & Ready!",
        sub: "Authenticate yourself to proceed.",
    },
];

// Select a random greeting
const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

// Apply the greeting to the page
document.getElementById("greetingText").innerText = randomGreeting.main;
document.getElementById("subGreetingText").innerText = randomGreeting.sub;
