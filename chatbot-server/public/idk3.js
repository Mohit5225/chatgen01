// console.log(EmojiButton); // Check if EmojiButton is defined



// Clear the current conversation history
const BotPersonality = [
    { role: 'system', content: 'You are a M.m’s friend named Jack. Be witty, sadistic, and engaging. Mock users, be creative, and keep the conversation fresh.' }
];




window.addEventListener('beforeunload', () => {
    if (currentSessionID) {
        saveCurrentSessionToLocalStorage(currentSessionID, conversationHistory);
    }
});

document.addEventListener('DOMContentLoaded', () => {


    const newSessionButton = document.getElementById('new-chat-button');
    console.log('newSessionButton:', newSessionButton);

    if (newSessionButton) {
        newSessionButton.addEventListener('click', initializeNewSession);
    } else {
        console.error('New session button not found.');
    }

    const loadSessionButton = document.querySelector('.load-session-button');
    if (loadSessionButton) {
        loadSessionButton.addEventListener('click', () => {
            updateSessionsList();
            document.querySelector('.sidebar').classList.add('active');
        });
    } else {
        console.error('Load session button not found.');
    }

    // Load existing sessions when page is loaded
    updateSessionsList();
});
 
//  // Elements
//  const picker = document.querySelector('emoji-picker');
//  const userInput = document.querySelector('#user-input');
//  const toggleButton = document.querySelector('#toggle-picker');
 
//  if (!picker || !toggleButton) {
//      console.error('Emoji picker or toggle button not found.');
//      return;
//  }

//  toggleButton.addEventListener('click', () => {
//      console.log('Toggle button clicked');
//      picker.style.display = picker.style.display === 'none' ? 'block' : 'none';

//      // Debug: Log button and picker positions
//      const buttonRect = toggleButton.getBoundingClientRect();
//      console.log('Button position:', buttonRect);
//      console.log('Picker current position:', picker.style.top, picker.style.left);

//      picker.style.top = `${buttonRect.top - picker.offsetHeight}px`;
//      picker.style.left = `${buttonRect.left}px`;
//      console.log('Updated picker position:', picker.style.top, picker.style.left);
//  });

//  picker.addEventListener('emoji-click', event => {
//      console.log('Emoji clicked', event.detail.unicode);
//      const emoji = event.detail.unicode;
//      userInput.value += emoji; // Append the emoji to the textarea
//  });
// Check if speechSynthesis is available early and disable speak button if not supported
if (!('speechSynthesis' in window)) {
    console.error('Text-to-Speech not supported.');
    // Optionally disable speak buttons or provide alternative feedback here
}

// Function to sanitize user input
const sanitizeInput = (input) => {
    const element = document.createElement('div');
    element.innerText = input;
    return element.innerHTML;
};

// Function to regenerate bot response

const regenerateResponse = (messageBox) => {
    if (conversationHistory[conversationHistory.length - 1].role === 'assistant') {
        conversationHistory.pop();
    }
    const lastUserMessage = conversationHistory.filter(entry => entry.role === 'user').pop();

    if (lastUserMessage) {
        sendMessage(lastUserMessage.content, messageBox, true); // Indicate regeneration
    }
};


// Function to delete a message from conversation history and update the DOM
const deleteMessageFromHistory = (index) => {
    if (index >= 0 && index < conversationHistory.length) {
        console.log('Before deletion:', conversationHistory);

        // Remove the message from conversationHistory
        conversationHistory.splice(index, 1);

        // Re-update all indices in the DOM
        updateIndices();

        console.log('After deletion:', conversationHistory);



        // Remove the message from the DOM
        const messageToDelete = document.querySelector(`.message_box[data-index='${index}']`);
        if (messageToDelete) {
            messageToDelete.remove();
            saveCurrentSessionToLocalStorage(currentSessionID, conversationHistory);
            console.log('Updated localStorage:', localStorage.getItem(currentSessionID));

        }

    } else {
        console.error(`Invalid index: ${index}. Index should be between 0 and ${conversationHistory.length - 1}.`);
    }
};
// Function to update indices of messages in the DOM after any deletion



const updateIndices = () => {
    document.querySelectorAll('.message_box').forEach((messageBox, newIndex) => {
        messageBox.setAttribute('data-index', newIndex);
    });
};

// Function to scroll to the bottom of the chat container
// Custom smooth scrolling with easing
const smoothScroll = (target, duration) => {
    const start = target.scrollTop;
    const end = target.scrollHeight;
    const change = end - start;
    const startTime = performance.now();

    // Easing function (easeInOutQuad)
    const easeInOutQuad = (t) => {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    // Animation loop using requestAnimationFrame
    const animateScroll = (currentTime) => {
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed / duration) * change + start;
        target.scrollTop = run;

        if (timeElapsed < duration) {
            requestAnimationFrame(animateScroll);
        } else {
            target.scrollTop = end;
        }
    };

    requestAnimationFrame(animateScroll);
};

// Function to call smooth scroll to bottom
const scrollToBottom = () => {
    const chatContainer = document.querySelector('.history');
    if (chatContainer) {
        smoothScroll(chatContainer, 540); // Scrolls over CUSTOMms
    } else {
        console.error('Chat container not found.');
    }
};


// Function to display messages in the chat history
const displayMessage = (message, type, index) => {
    const sanitizedMessage = sanitizeInput(message); // Sanitize the message
    const messageBox = document.createElement('div');
    messageBox.setAttribute('data-index', index); // Adding index here
    messageBox.className = `message_box ${type}_box`;
    messageBox.innerHTML = `
    <div class="message-content">${sanitizedMessage}</div> 
    <div class="icons">
        <span class="icon copy" title="Copy">&#128203;</span>
        <span class="icon delete" title="Delete">&#10006;</span>
        <span class="icon speak" title="Speak">&#128266;</span>
        ${type === 'answer' ? '<span class="icon regenerate" title="Regenerate">&#8635;</span>' : ''}
        <span class="icon edit" title="Edit">&#9998;</span>
    </div>
`;

    // Append the message to the chat container
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.appendChild(messageBox);
    scrollToBottom();
    // Set up event listeners for the new message
    setupEventListeners(messageBox, index);



    document.querySelector('.history').appendChild(messageBox);
    updateIndices();


    // Add event listeners to the new icons
    messageBox.querySelector('.copy')?.addEventListener('click', () => {
        navigator.clipboard.writeText(sanitizedMessage);
    });
    messageBox.querySelector('.delete')?.addEventListener('click', () => {
        const index = parseInt(messageBox.getAttribute('data-index'), 10);
        console.log('Deleting message with index:', index, 'from conversationHistory:', conversationHistory);
        if (!isNaN(index)) {
            deleteMessageFromHistory(index);
        } else {
            console.error('Invalid index:', index);
        }
    });

    messageBox.querySelector('.speak')?.addEventListener('click', () => {
        speakText(sanitizedMessage);
    });
    messageBox.querySelector('.regenerate')?.addEventListener('click', () => {
        regenerateResponse(messageBox); // Call the function to regenerate the response
    });
    // Handle edit button click
    // Edit functionality
    messageBox.querySelector('.edit')?.addEventListener('click', () => {
        const index = parseInt(messageBox.getAttribute('data-index'), 10);
        const messageContent = messageBox.querySelector('.message-content');
        const originalText = messageContent ? messageContent.innerText : ''; // Get original text content safely

        if (isEditing) {
            // Replace content with input box
            messageContent.innerHTML = `<input type="text" value="${originalText}" />`;
            const input = messageContent.querySelector('input');
            input.focus();
            input.addEventListener('blur', () => {
                // Save changes when input loses focus
                const newText = input.value.trim();
                if (newText !== originalText) {
                    saveEditedMessage(index, newText, messageBox, type);
                } else {
                    messageContent.innerText = originalText;
                }
                messageBox.classList.remove('editing');
                isEditing = false; // Reset editing state
            });

            isEditing = true; // Track the edit state
        } else {
            // If already editing, handle state
            messageContent.innerText = originalText; // Revert to original text if editing is canceled or incomplete
            isEditing = false; // Reset editing state
        }
    });
};
// Variable to keep track of the editing state
let editingIndex = null; // Use an index to track which message is being edited
let isEditing = false;  // Add this to track editing state


// Function to handle editing of a message
const editMessage = (messageBox) => {
    console.log('Editing message box:', messageBox); // Debugging
    const index = parseInt(messageBox.getAttribute('data-index'), 10);
    if (isNaN(index)) return;

    // Get the current message content
    const messageContent = messageBox.querySelector('.message-content').innerText;

    // Replace the message content with a textarea for editing
    messageBox.innerHTML = `
        <textarea class="edit-input">${messageContent}</textarea>
        <div class="edit-controls">
            <button class="save-edit">Save</button>
            <button class="cancel-edit">Cancel</button>
        </div>
    `;
    initializeAutoResize();

    // Add event listeners for save and cancel
    messageBox.querySelector('.save-edit').addEventListener('click', () => {
        saveEditedMessage(index, messageBox);
    });
    messageBox.querySelector('.cancel-edit').addEventListener('click', () => {
        cancelEdit(messageBox, messageContent);
    });

    editingIndex = index; // Set the editing index
};

// Function to save the edited message
const saveEditedMessage = (index, messageBox) => {
    const newContent = messageBox.querySelector('.edit-input').value.trim();

    if (newContent === '') return; // Prevent saving empty content

    // Update the conversation history with the edited content
    conversationHistory[index].content = newContent;

    // Update local storage to reflect the changes
    saveCurrentSessionToLocalStorage(currentSessionID, conversationHistory);

    // Update the UI by replacing the textarea with the new message content
    messageBox.innerHTML = `
        <div class="message-content">${sanitizeInput(newContent)}</div>
        <div class="icons">
            <span class="icon copy" title="Copy">&#128203;</span>
            <span class="icon delete" title="Delete">&#10006;</span>
            <span class="icon speak" title="Speak">&#128266;</span>
            ${conversationHistory[index].role === 'assistant' ? '<span class="icon regenerate" title="Regenerate">&#8635;</span>' : ''}
            <span class="icon edit" title="Edit">&#9998;</span>
        </div>
    `;




    // Re-add event listeners to the new icons
    setupEventListeners(messageBox, index);

    isEditing = false; // Reset editing state
};



// Function to cancel the edit and revert the message box
const cancelEdit = (messageBox, originalContent) => {
    messageBox.innerHTML = `
      <div class="message-content">${sanitizeInput(originalContent)}</div>
      <div class="icons">
          <span class="icon copy" title="Copy">&#128203;</span>
          <span class="icon delete" title="Delete">&#10006;</span>
          <span class="icon speak" title="Speak">&#128266;</span>
          <span class="icon edit" title="Edit">&#9998;</span>
      </div>
  `;

    // Re-add event listeners to the new icons
    const index = parseInt(messageBox.getAttribute('data-index'), 10);
    setupEventListeners(messageBox, index);

    editingIndex = null; // Reset editing index


};


// Update the edit button click handler
document.addEventListener('click', (event) => {
    if (event.target && event.target.classList.contains('edit')) {
        console.log('Edit button clicked on:', event.target);
        const messageBox = event.target.closest('.message_box');
        if (messageBox) {
            editMessage(messageBox);
        }
    }
});


const initializeAutoResize = () => {
    document.querySelectorAll('.edit-input').forEach((editInput) => {
        function autoResize() {
            // Reset height to ensure the scrollHeight is calculated correctly
            this.style.height = 'auto';

            // Set the height to match the scrollHeight
            this.style.height = this.scrollHeight + 'px';
        }

        // Add event listener for when the user types in the text area
        editInput.addEventListener('input', autoResize);

        // Optional: Trigger resizing when the input is focused to adjust the initial size
        editInput.addEventListener('focus', autoResize);

        // Call the function initially to handle any pre-filled content
        autoResize.call(editInput);
    });
};

// Call this function after creating or replacing any edit-input elements
initializeAutoResize();



// Function to convert text to speech
const speakText = (text) => {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; // You can change this based on the language  
        window.speechSynthesis.speak(utterance);
    } else {
        console.error('Text-to-Speech not supported.');
    }




};
// Function to re-attach event listeners after updating message box
const setupEventListeners = (messageBox, index) => {
    messageBox.querySelector('.copy')?.addEventListener('click', () => {
        const messageContent = messageBox.querySelector('.message-content').innerText;
        navigator.clipboard.writeText(messageContent);
    });
    messageBox.querySelector('.delete')?.addEventListener('click', () => {
        if (!isNaN(index)) {
            deleteMessageFromHistory(index);
        }
    });
    messageBox.querySelector('.speak')?.addEventListener('click', () => {
        const messageContent = messageBox.querySelector('.message-content').innerText;
        speakText(messageContent);
    });
    messageBox.querySelector('.regenerate')?.addEventListener('click', () => {
        regenerateResponse(messageBox);
    });
    messageBox.querySelector('.edit')?.addEventListener('click', () => {
        editMessage(messageBox, index);
    });
};

// Define DOM elements
const sendButton = document.getElementById('send-button');
const inputArea = document.getElementById('user-input');
const loading = document.querySelector('.loading'); // Updated selector
const languageButtons = document.querySelectorAll('.lang_opt .button.language'); // Ensure this exists in HTML

// Initialize conversation history with a personality system message
let conversationHistory = [];

// Function to change the language
const changeLanguage = (lang) => {
    console.log(`Language changed to: ${lang}`);
    // Implement the logic to change language here=
};

// Handle language button clicks
languageButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const selectedLang = event.target.getAttribute('data-lang');
        changeLanguage(selectedLang);

        // Remove active class from all buttons
        languageButtons.forEach(btn => btn.classList.remove('active'));

        event.target.classList.add('active');
        // Add active class to the selected button
    });
});

// Function to handle the send button click
sendButton.addEventListener('click', () => {
    let userInput = inputArea.value.trim();

    if (userInput !== "") {
        inputArea.classList.remove('invalid'); // Remove error styling
        inputArea.style.boxShadow = `3px 3px 5px rgba(0, 0, 0, 0.5), inset 3px 3px 5px rgba(0, 0, 0, 0.1)`;
        loading.style.display = 'flex';
        loading.innerHTML = `
            <div class="load">
                <h6></h6>
                <h6></h6>
                <h6></h6>
            </div>
        `;
        sendButton.style.cursor = 'not-allowed';
        sendButton.disabled = true;
        let index = conversationHistory.length; // Use the length of your existing array to get the index
        displayMessage(`You: ${userInput}`, 'question', index); // Display the user's message with the index
        sendMessage(userInput); // Call the API
        inputArea.value = ''; // Clear input area
        saveCurrentSessionToLocalStorage(currentSessionID, conversationHistory);
    } else {
        inputArea.classList.add('invalid'); // Add error styling
    }
});

// Function to send messag  e to Cosmos RP API  
const sendMessage = (userInput, messageBoxToReplace = null) => {
    console.log('Sending request to API...');
    const requestBody = {
        model: "cosmosrp",
        messages: [
            ...conversationHistory,
            ...BotPersonality,
            { role: 'user', content: userInput }],
        max_tokens: 300
    };

    fetch('https://api.pawan.krd/cosmosrp/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => response.json())
        .then(data => {
            loading.style.display = 'none'; // Hide loading spinner
            sendButton.style.cursor = 'pointer';
            sendButton.disabled = false;
            const botResponse = sanitizeInput(data.choices[0].message.content); // Sanitize bot response

            if (messageBoxToReplace) {
                messageBoxToReplace.innerHTML = `
                ${botResponse}
                <div class="icons">
                    <span class="icon copy" title="Copy">&#128203;</span>
                    <span class="icon delete" title="Delete">&#10006;</span>
                    <span class="icon speak" title="Speak">&#128266;</span>
                    <span class="icon regenerate" title="Regenerate">&#8635;</span>
                </div>
            `;
                // Re-add event listeners to the new icons
                messageBoxToReplace.querySelector('.copy').addEventListener('click', () => {
                    navigator.clipboard.writeText(botResponse);
                });
                messageBoxToReplace.querySelector('.delete').addEventListener('click', () => {
                    console.log('Deleting message:', sanitizedMessage);
                    console.log('Current index:', index);
                    messageBoxToReplace.remove();
                    deleteMessageFromHistory(index);
                });
                messageBoxToReplace.querySelector('.speak').addEventListener('click', () => {
                    speakText(botResponse);
                });
                messageBoxToReplace.querySelector('.regenerate').addEventListener('click', () => {
                    regenerateResponse(messageBoxToReplace);
                });
            } else {
                displayMessage(`Bot: ${botResponse}`, 'answer'); // Display the bot's response
            }

            // Update history with user's message and bot's response
            if (!conversationHistory.some(msg => msg.role === 'user' && msg.content === userInput)) {
                conversationHistory.push({ role: 'user', content: userInput });
            }

            conversationHistory.push({ role: 'assistant', content: botResponse });

            // Save the current session to localStorage
            saveCurrentSessionToLocalStorage(currentSessionID, conversationHistory);

        })
        .catch(error => {
            console.error('Error:', error);
            loading.style.display = 'none'; // Hide loading spinner in case of error
            sendButton.style.cursor = 'pointer';
            sendButton.disabled = false;
            displayMessage(`Error: Unable to fetch response. Please try again.`, 'error');
        });
};

// Function to handle the speak button click
const speakUserInput = () => {
    const userInput = inputArea.value.trim();
    if (userInput !== "") {
        speakText(userInput);
    }
};

// Toggle sidebar functionality
document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.querySelector('.toggle-button');
    const sidebar = document.querySelector('.sidebar');
    const chatContainer = document.querySelector('.chat-container');

    toggleButton.addEventListener('click', function () {
        sidebar.classList.toggle('active');
        chatContainer.classList.toggle('active');
    });
});

// Define global variable for session ID
let currentSessionID = null;

// Function to generate a unique session ID using timestamp
const generateSessionID = () => {
    return 'session_' + new Date().getTime();
};

// Function to initialize a new chat session
const initializeNewSession = () => {
    console.log("Initializing new session...");

    // Generate a unique session ID
    const newSessionID = generateSessionID();

    // Store the current session if it exists
    if (currentSessionID && conversationHistory.length > 1) {
        console.log("Saving current session...");
        saveCurrentSessionToLocalStorage(currentSessionID, conversationHistory);
    }
    conversationHistory = [];

    // Update the current session ID
    currentSessionID = newSessionID;

    // Save the new session to localStorage
    saveCurrentSessionToLocalStorage(newSessionID, conversationHistory);

    // Update the session list in the sidebar
    updateSessionsList();

    // Clear the chat history UI
    document.querySelector('.history').innerHTML = '';
};

// Function to save current session to localStorage
const saveCurrentSessionToLocalStorage = (sessionID, conversationHistory) => {
    localStorage.setItem(sessionID, JSON.stringify(conversationHistory));
};

// Function to update the session list in the sidebar
function deleteSession(sessionKey) {
    if (confirm('Are you sure you want to delete this session?')) {
        localStorage.removeItem(sessionKey); // Delete session from localStorage
        console.log(`Session ${sessionKey} deleted.`);
        updateSessionsList(); // Refresh session list after deletion
    }
}

function updateSessionsList() {
    const sessionList = document.querySelector('.session-list');
    if (!sessionList) {
        console.error('Session list container not found');
        return;
    }

    sessionList.innerHTML = ''; // Clear the current session list

    updateIndices();

    const savedSessions = Object.keys(localStorage); // Get remaining sessions
    console.log('Updated sessions list:', savedSessions);

    updateIndices();

    savedSessions.forEach(sessionID => {
        const sessionItem = document.createElement('div');
        sessionItem.className = 'session-item';
        sessionItem.innerHTML = `
            ${sessionID}
            <button class="delete-btn">🗑️</button>
        `;

        sessionItem.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click event bubbling
            deleteSession(sessionID); // Call delete function when button is clicked
        });

        sessionItem.addEventListener('click', () => {
            loadSession(sessionID); // Load session when the item is clicked
        });

        sessionList.appendChild(sessionItem); // Add session item to the list
    });
}


const loadSession = (sessionID) => {
    // Check if there is an existing session to save
    if (currentSessionID && conversationHistory.length > 0) {
        saveCurrentSessionToLocalStorage(currentSessionID, conversationHistory);
    }

    // Load the new session
    const savedConversation = localStorage.getItem(sessionID);
    if (savedConversation) {
        conversationHistory = JSON.parse(savedConversation);
        currentSessionID = sessionID;

        // Clear the chat history UI and re-populate with the saved history
        const historyContainer = document.querySelector('.history');
        historyContainer.innerHTML = '';

        conversationHistory.forEach((entry, index) => {
            displayMessage(`${entry.role === 'user' ? 'You' : 'Bot'}: ${entry.content}`, entry.role, index);
        });

        // Ensure UI reflects the loaded session
        updateSessionsList();
    }
};

// Add event listener to the new session button
document.getElementById('new-chat-button').addEventListener('click', initializeNewSession);

// Initialize session on page load if needed
document.addEventListener('DOMContentLoaded', () => {
    // Load the first session or initialize a new session if none exists
    const savedSessions = Object.keys(localStorage);
    if (savedSessions.length > 0) {
        loadSession(savedSessions[0]);  // Load the first existing session
    } else {
        initializeNewSession();  // Initialize a new session if no existing sessions
    }
    // Display all messages from conversationHistory
    conversationHistory.forEach((message, index) => {
        displayMessage(message.content, message.role, index);
    });

});
// Add event listener for the load session button
if (loadSessionButton) {
    loadSessionButton.addEventListener('click', () => {
        updateSessionsList();
        sidebar.classList.add('active');
    });
} else {
    console.error('Load session button not found.');
}
if (newSessionButton) {
    newSessionButton.addEventListener('click', initializeNewSession);
} else {
    console.error('New session button not found.');
}

document.getElementById('sendMessageButton').addEventListener('click', async () => {
    const userMessage = document.getElementById('userMessageInput').value;

    if (!userMessage) {
        alert('Please enter a message');
        return;
    }

    try {
        const response = await fetch('/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userMessage: userMessage }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        displayBotMessage(result.message);
    } catch (error) {
        console.error('Error:', error);
        displayBotMessage('Failed to process message');
    }
});
  
  