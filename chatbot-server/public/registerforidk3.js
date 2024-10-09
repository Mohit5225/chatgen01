// register.js

document.addEventListener('DOMContentLoaded', function () {
    // Get the form containers
    const registerContainer = document.querySelector('.register-here');
    const loginContainer = document.querySelector('.login-container');

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

    // Registration form event listener
    const registerForm = document.querySelector('.register-form');
    registerForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent form submission

        const usernameInput = document.getElementById('register-username');
        const passwordInput = document.getElementById('register-password');
        const emailInput = document.getElementById('register-email');

        // Basic validation
        if (usernameInput.value.trim() === '' || passwordInput.value.trim() === '' || emailInput.value.trim() === '') {
            alert('Please fill in all fields.');
            return;
        }

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const email = emailInput.value.trim();

        // Form submission logic
        fetch('http://localhost:3001/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, email }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                // Registration successful
                console.log('Registration successful:', data.message);
                alert('Registration successful!');
                // Optionally redirect to login page
                window.location.href = '/login.html';
            } else {
                // Handle registration error
                console.error('Registration failed:', data.error);
                alert('Registration failed: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error during registration:', error);
        });
    });
});
