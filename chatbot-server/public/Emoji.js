document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed'); // Ensure the script is running

    // Check if the button and picker elements are found
    const picker = document.querySelector('#emojiPickerContainer');
    const toggleButton = document.getElementById('emojiButton');

    // Log to ensure these elements are found
    console.log('Picker:', picker);
    console.log('Toggle Button:', toggleButton);

    if (!picker || !toggleButton) {
        console.error('Emoji picker or toggle button not found.');
        return;
    }

    // Add event listener to the emoji button
    toggleButton.addEventListener('click', () => {
        console.log('Emoji button clicked');
    });
});
