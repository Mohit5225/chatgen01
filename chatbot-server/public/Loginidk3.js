 // login.js

document.addEventListener('DOMContentLoaded', function () {
    // Get the form containers
    const loginContainer = document.querySelector('.login-container');
    const registerContainer = document.querySelector('.register-here');

    // Get the form links
    const registerLink = document.getElementById('register-link');
    const loginLink = document.getElementById('login-link');

    // Event listener for the "Register here" link
    registerLink.addEventListener('click', function (event) {
        event.preventDefault();
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'block';
    });

    // Event listener for the "Login here" link
    loginLink.addEventListener('click', function (event) {
        event.preventDefault();
        registerContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });

    // Your existing login form event listener
    const loginForm = document.querySelector('.login-form');
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent form submission

        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        // Basic validation
        if (usernameInput.value.trim() === '' || passwordInput.value.trim() === '') {
            alert('Please fill in both fields.');
            return;
        }

        // Form submission logic
        console.log('Username:', usernameInput.value);
        console.log('Password:', passwordInput.value);

        // Uncomment to submit the form to your server
        // loginForm.submit();
    });
});
