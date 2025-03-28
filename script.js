document.addEventListener("DOMContentLoaded", function () {
    

let chatBox = document.getElementById("chat-box");
let lastBotMessage = null; // Track the last bot message for the shimmer effect

window.onload = function () {
    chatBox = document.getElementById("chat-box"); // Assign it when the page loads
    console.log("ChatBox found globally:", chatBox);
};

const introMessages = [
    ". . .",
    "Hello. 😌💙",
    "How are you feeling?"
];

function showIntroMessages(index = 0) {
    if (index < introMessages.length) {
        setTimeout(() => {
            sendBotMessage(introMessages[index], "typewriter");
            console.log("Displaying intro message:", introMessages[index]); // Debugging
            showIntroMessages(index + 1);
        }, 2500);
    }
}

showIntroMessages(); // Start intro messages in sequence

const userInput = document.getElementById("user-input");
if (userInput) {
    userInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent accidental form submission
            const inputText = userInput.value.trim();
            if (inputText !== "") {
                addUserMessage(inputText);
                userInput.value = "";
                setTimeout(() => {
                    // Show thinking effect instead of typing indicator
                    if (chatBox) {
                        chatBox.classList.add("thinking");
                    }
                    setTimeout(() => {
                        // Remove thinking effect
                        if (chatBox) {
                            chatBox.classList.remove("thinking");
                        }
                        generateResponse(inputText);
                    }, 2500); // Total delay of 3500ms (1000ms + 2500ms)
                }, 1000);
            }
            startInactivityTimer();
        }
    });
} else {
    console.error("Error: #user-input element not found.");
}

function addUserMessage(text) {
    if (!chatBox) {
        console.error("Error: #chat-box element not found.");
        return;
    }

    const userMessage = document.createElement("p");
    userMessage.classList.add("message", "user", "fade-in-soft");
    userMessage.textContent = text;

    chatBox.appendChild(userMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function sendBotMessage(message, effect = "typewriter") {
    console.log("Bot Message Effect:", effect, "Message:", message);

    const botMessage = document.createElement("p");
    
    // Ensure message is valid
    if (!message || message.trim() === "") {
        console.warn("⚠️ Empty bot message detected! Not displaying.");
        return; // Stops execution if message is empty
    }

    if (!chatBox) {
        console.error("Error: #chat-box element not found.");
        return;
    }

    // Add classes for styling and animation
    botMessage.classList.add("message", "bot", "new", "hidden");
    chatBox.appendChild(botMessage);

    // Store the last bot message for the shimmer effect
    lastBotMessage = botMessage;

    // Define revealMessage function at the correct scope
    function revealMessage(botMessage) {
        if (!botMessage || !(botMessage instanceof HTMLElement)) {
            console.error("Error: Invalid botMessage element.");
            return;
        }
        console.log("Revealing message:", botMessage.textContent, botMessage);
        botMessage.classList.remove("hidden");
        botMessage.classList.add("show");
        chatBox.scrollTop = chatBox.scrollHeight;

        console.log("Revealing botMessage:", botMessage);
    }

    if (effect === "typewriter") {
        const words = message.split(" ");
        let index = 0;
    
        // Add a slight pause before starting the typewriter effect
        setTimeout(() => {
            function type() {
                if (index < words.length) {
                    let word = words[index];
                    let speed = 180; // Slower base speed
    
                    // Adjust speed based on word length
                    if (word.length < 3) speed = 60; 
                    else if (word.length > 7) speed = 220;
                    else speed = 180;
    
                    // Adjust speed based on punctuation for more rhythm
                    if (word.includes(",")) speed += 600;
                    if (word.includes("—")) speed += 800;
                    if (word.includes("...")) speed += 1000;
                    if (word.includes("?") || word.includes("!")) speed += 800;
                    if (word.includes(".")) speed += 700;
                    
                    // Adjust speed based on emotional tone of the message
                    if (message.toLowerCase().includes("here with you") || message.toLowerCase().includes("no rush")) {
                        speed += 150;
                    } else if (message.toLowerCase().includes("glad to hear") || message.toLowerCase().includes("grateful")) {
                        speed -= 30;
                    }

                    // Add the word with a space
                    botMessage.textContent += word + " "; 
                    index++;
                    setTimeout(type, speed);
                } else {
                    revealMessage(botMessage); // Show message after typing
                }
            }
            type();
        }, 300); // 300ms pause before typing starts
    } 
    else if (effect === "softFade") {
        if (message && message.trim() !== "") {
            botMessage.textContent = message;
            console.log("Bot message assigned (softFade):", botMessage.textContent);
        } else {
            console.warn("Empty message detected in softFade!");
        }
        botMessage.classList.add("fade-in-soft");
        setTimeout(() => revealMessage(botMessage), 100); 
    } 
    else if (effect === "instantAppear") {
        if (message && message.trim() !== "") {
            botMessage.textContent = message;
            console.log("Bot message assigned (instantAppear):", botMessage.textContent);
        } else {
            console.warn("Empty message detected in instantAppear!");
        }
        botMessage.classList.add("instant-appear");
        revealMessage(botMessage);
    } 
    else if (effect === "emergeSlow") {
        if (message && message.trim() !== "") {
            botMessage.textContent = message;
            console.log("Bot message assigned (emergeSlow):", botMessage.textContent);
        } else {
            console.warn("Empty message detected in emergeSlow!");
        }
        botMessage.classList.add("fade-in-slow");
        setTimeout(() => revealMessage(botMessage), 100);
    }
    
    console.log("✅ Bot message added:", botMessage.textContent);

    // Ensure scrolling updates *after* message is fully revealed
    setTimeout(() => {
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 500);
}

let inactivityTimer;

function startInactivityTimer() {
    // Remove shimmer from the last message if it exists
    if (lastBotMessage) {
        lastBotMessage.classList.remove("shimmer");
    }

    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        // Add shimmer effect to the last bot message after 10 seconds
        if (lastBotMessage) {
            console.log("Applying shimmer effect to last bot message:", lastBotMessage.textContent);
            lastBotMessage.classList.add("shimmer");
        } else {
            console.log("No last bot message to apply shimmer effect.");
        }

        // First gentle reminder at 30 seconds
        setTimeout(() => {
            sendBotMessage("Breathe... It's okay. You don't have to rush. Let the silence carry your thoughts.", "typewriter");
        }, 20000); // 30 seconds total (10s + 20s)

        // Second gentle reminder at 60 seconds
        setTimeout(() => {
            sendBotMessage("Still here, still listening. 💙 No rush.", "typewriter");
            // Add shimmer effect again
            if (lastBotMessage) {
                lastBotMessage.classList.add("shimmer");
            }
        }, 50000); // 60 seconds total (10s + 50s)

        // Third gentle reminder at 120 seconds
        setTimeout(() => {
            sendBotMessage("Whenever you're ready, I'm here. 😌💙", "typewriter");
            // Add shimmer effect again
            if (lastBotMessage) {
                lastBotMessage.classList.add("shimmer");
            }
        }, 110000); // 120 seconds total (10s + 110s)
    }, 10000); // Shimmer at 10 seconds
}    

startInactivityTimer();

function generateResponse(userText) {
    const lowerText = userText.toLowerCase();

    if (lowerText.includes("fine") || lowerText.includes("good") || lowerText.includes("okay")) {
        sendBotMessage("I'm glad to hear that. 😌💙 What is something that made you feel good today?", "typewriter");
    } else if (lowerText.includes("not great") || lowerText.includes("bad") || lowerText.includes("sad") || lowerText.includes("tired")) {
        sendBotMessage("I'm here with you. 🥺💙 What has been weighing on your heart?", "emergeSlow");
    } else if (lowerText.includes("i don't know") || lowerText.includes("unsure")) {
        sendBotMessage("That's okay. 😌💙 Sometimes we don’t have the words right away. But if you sit with it a moment, what do you feel?", "typewriter");
    } else if (lowerText.includes("thank you") || lowerText.includes("thanks")) {
        sendBotMessage("You're welcome. 😌💙 I’m grateful to share this moment with you.", "instantAppear");
    } else if (lowerText.includes("alone") || lowerText.includes("lonely")) {
        sendBotMessage("You’re not alone right now. 💙 I’m here. And I’ll stay as long as you need.", "emergeSlow");
    } else {
        sendBotMessage("I’m listening. 💙 Can you tell me more?", "typewriter");
    }
}

});

