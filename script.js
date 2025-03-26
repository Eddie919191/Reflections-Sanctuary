document.addEventListener("DOMContentLoaded", function () {
    
    let chatBox = document.getElementById("chat-box");

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

    userInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent accidental form submission
            const inputText = userInput.value.trim();
            // console.log("User input detected:", inputText); // Debugging line
            if (inputText !== "") {
                addUserMessage(inputText);
                userInput.value = "";
                setTimeout(() => {
                    showTypingIndicator();
                    setTimeout(() => {
                        removeTypingIndicator();
                        generateResponse(inputText);
                    }, 1800); // Pause before responding
                }, 1000);
            }
        }
    });

    function addUserMessage(text) {
        // console.log("Adding user message:", text); // Debugging line

        const chatBox = document.getElementById("chat-box");
        if (!chatBox) {
            return;
        }

        const userMessage = document.createElement("p");
        userMessage.classList.add("message", "user", "fade-in-soft");
        userMessage.textContent = text;

        chatBox.appendChild(userMessage);
        chatBox.scrollTop = chatBox.scrollHeight;

    }
    

    function showTypingIndicator() {
        removeTypingIndicator(); // Clear any existing one
    
        const typingIndicator = document.createElement("p");
        typingIndicator.classList.add("message", "bot", "typing");
        typingIndicator.textContent = "...";
        typingIndicator.setAttribute("id", "typing-indicator");
    
        const chatBox = document.getElementById("chat-box");
        if (chatBox) {
            chatBox.appendChild(typingIndicator);
            console.log("Typing indicator added:", typingIndicator); // Debugging
        } else {
            console.error("ChatBox not found!"); // Debugging
        }
    }
    

    function removeTypingIndicator() {
        const typingIndicator = document.getElementById("typing-indicator");
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function sendBotMessage(message, effect = "typewriter") {

        console.log("Bot Message Effect:", effect, "Message:", message);

        const botMessage = document.createElement("p");
        const chatBox = document.getElementById("chat-box");
        
        // ✅ Debug: Ensure message is valid
        if (!message || message.trim() === "") {
            console.warn("⚠️ Empty bot message detected! Not displaying.");
            return; // Stops execution if message is empty
        }


        chatBox.appendChild(botMessage);

        // Ensure botMessage is properly passed
        setTimeout(() => {
            console.log("Final botMessage state before reveal:", botMessage, botMessage?.textContent);
            if (botMessage) {
                revealMessage(botMessage);
            } else {
                console.error("Error: botMessage is missing at reveal step.");
            }
        }, 100);
    
        console.log("Before revealMessage, botMessage is:", botMessage);

        
        function revealMessage(botMessage) {
            if (!botMessage || !(botMessage instanceof HTMLElement)) {
                return;
            }
            console.log("Revealing message:", botMessage.textContent, botMessage);
            botMessage.classList.remove("hidden");
            chatBox.scrollTop = chatBox.scrollHeight;

            console.log("Revealing botMessage:", botMessage);

        }
    
        
        
        
    
        if (effect === "typewriter") {
            const words = message.split(" ");
            let index = 0;
        
            function type() {
                if (index < words.length) {
                    let word = words[index];
                    let speed = 120; // Default typing speed
        
                    // Adjust speed based on punctuation
                    if (word.length < 3) speed = 40; 
                    else if (word.length > 7) speed = 150;
                    else speed = 100;
        
                    if (word.includes(",")) speed += 250; 
                    if (word.includes("—")) speed += 400; 
                    if (word.includes("...")) speed += 600; 
                    if (word.includes("?") || word.includes("!")) speed += 500; 
        
                    botMessage.textContent += word + " "; 
                    index++;
                    setTimeout(type, speed);
                } else {
                    revealMessage(); // Show message after typing
                }
            }
            type();
        } 
        else if (effect === "softFade") {
            if (message && message.trim() !== "") {
                botMessage.textContent = message;
                console.log("Bot message assigned (softFade):", botMessage.textContent);
            } else {
                console.warn("Empty message detected in softFade!");
            }
            botMessage.classList.add("fade-in-soft");
            setTimeout(revealMessage, 100); 
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
            setTimeout(revealMessage, 100);
        }
        
    
      console.log("✅ Bot message added:", botMessage.textContent);

        // Ensure scrolling updates *after* message is fully revealed
        setTimeout(() => {
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 500);

        console.log("Final botMessage state before reveal:", botMessage);


    }
    
    
    
    
    
    
    
    
    

    let inactivityTimer;

    function startInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            sendBotMessage("Breathe... It's okay. You don't have to rush. Let the silence carry your thoughts.")
    
            setTimeout(() => {
                sendBotMessage("Still here, still listening. 💙 No rush.");
            }, 90000); // 90 seconds later
    
            setTimeout(() => {
                sendBotMessage("Whenever you're ready, I'm here. 😌💙");
            }, 180000); // 3 minutes later
        }, 60000); // First reminder at 1 minute
    }    

    document.getElementById("user-input").addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            startInactivityTimer();
        }
    });

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
