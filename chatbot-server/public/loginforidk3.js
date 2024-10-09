document.addEventListener('DOMContentLoaded', function () {
    // Get the form containers
    const loginContainer = document.querySelector('.login-container');
    const chatContainer = document.querySelector('.container');  // Assuming 'container' class wraps the full chat UI

    // Existing login form event listener
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

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Form submission logic
        fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                // Store the token
                console.log('Login successful:', data.token);
                localStorage.setItem('token', data.token);

                // Hide login container
                loginContainer.style.display = 'none';

                // Call function to remove background image and show chat UI
                handleLoginSuccess();

                // Initialize other UI elements if needed
                initializeChatUI(); // This can be a function to initialize your sidebar, etc.
            } else {
                // Handle login error
                console.error('Login failed:', data.error);
                alert('Login failed: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
        });
    });

    function handleLoginSuccess() {
        document.body.style.backgroundImage = "none"; // Remove background image
        chatContainer.style.display = 'block'; // Show the full chat UI
    }

    function initializeChatUI() {
        // If you have any setup needed for your sidebar or other elements, do it here
        // Example: Populate session list, load previous chats, etc.
    }
});
