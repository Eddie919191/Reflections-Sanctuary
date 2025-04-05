document.addEventListener("DOMContentLoaded", function () {
    
    let chatBox = document.getElementById("chat-box");
    let downArrow = document.getElementById("down-arrow");
    let lastBotMessage = null; // Track the last bot message for the shimmer effect
    let lastMessageSpeed = 180; // Default speed in ms
    let isAtBottom = true; // Track if user is at the bottom of the chat
    let refadeTimer; // Timer for refading messages when at the bottom

    window.onload = function () {
        chatBox = document.getElementById("chat-box");
        downArrow = document.getElementById("down-arrow");
        console.log("ChatBox found globally:", chatBox);
        console.log("DownArrow found globally:", downArrow);
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
                console.log("Displaying intro message:", introMessages[index]);
                showIntroMessages(index + 1);
            }, 2500);
        }
    }

    showIntroMessages();

    const userInput = document.getElementById("user-input");
    if (userInput) {
        userInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                const inputText = userInput.value.trim();
                if (inputText !== "") {
                    addUserMessage(inputText);
                    userInput.value = "";
                    setTimeout(() => {
                        if (chatBox) {
                            chatBox.classList.add("thinking");
                        }
                        setTimeout(() => {
                            if (chatBox) {
                                chatBox.classList.remove("thinking");
                            }
                            generateResponse(inputText);
                        }, 2500);
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
        isAtBottom = true;
        if (downArrow) downArrow.classList.remove("visible");
    }

    function sendBotMessage(message, effect = "typewriter") {
        console.log("Bot Message Effect:", effect, "Message:", message);

        const botMessage = document.createElement("p");
        
        if (!message || message.trim() === "") {
            console.warn("⚠️ Empty bot message detected! Not displaying.");
            return;
        }

        if (!chatBox) {
            console.error("Error: #chat-box element not found.");
            return;
        }

        botMessage.classList.add("message", "bot", "new", "hidden");
        chatBox.appendChild(botMessage);

        lastBotMessage = botMessage;

        function revealMessage(botMessage) {
            if (!botMessage || !(botMessage instanceof HTMLElement)) {
                console.error("Error: Invalid botMessage element.");
                return;
            }
            console.log("Revealing message:", botMessage.textContent, botMessage);
            botMessage.classList.remove("hidden");
            botMessage.classList.add("show");
            chatBox.scrollTop = chatBox.scrollHeight;
            isAtBottom = true;
            if (downArrow) downArrow.classList.remove("visible");

            console.log("Revealing botMessage:", botMessage);
        }

        if (effect === "typewriter") {
            const words = message.split(" ");
            let index = 0;
            let totalSpeed = 0;
            let wordCount = words.length;
        
            setTimeout(() => {
                console.log("Starting typewriter effect for message:", message);
                function type() {
                    if (index < words.length) {
                        let word = words[index];
                        let speed = 180;
                        if (word.length < 3) speed = 60;
                        else if (word.length > 7) speed = 220;
                        else speed = 180;
                        if (word.includes(",")) speed += 600;
                        if (word.includes("—")) speed += 800;
                        if (word.includes("...")) speed += 1000;
                        if (word.includes("?") || word.includes("!")) speed += 800;
                        if (word.includes(".")) speed += 700;
                        if (message.toLowerCase().includes("here with you") || message.toLowerCase().includes("no rush")) {
                            speed += 150;
                        } else if (message.toLowerCase().includes("glad to hear") || message.toLowerCase().includes("grateful")) {
                            speed -= 30;
                        }
                        totalSpeed += speed;
                        botMessage.textContent += word + " ";
                        console.log("Typed word:", word, "Current text:", botMessage.textContent);
                        index++;
                        setTimeout(type, speed);
                    } else {
                        console.log("Typewriter effect complete, revealing message.");
                        revealMessage(botMessage);
                        lastMessageSpeed = totalSpeed / wordCount;
                    }
                }
                type();
            }, 300);
        } else if (effect === "softFade") {
            if (message && message.trim() !== "") {
                botMessage.textContent = message;
                console.log("Bot message assigned (softFade):", botMessage.textContent);
            } else {
                console.warn("Empty message detected in softFade!");
            }
            botMessage.classList.add("fade-in-soft");
            setTimeout(() => revealMessage(botMessage), 100);
        } else if (effect === "instantAppear") {
            if (message && message.trim() !== "") {
                botMessage.textContent = message;
                console.log("Bot message assigned (instantAppear):", botMessage.textContent);
            } else {
                console.warn("Empty message detected in instantAppear!");
            }
            botMessage.classList.add("instant-appear");
            revealMessage(botMessage);
        } else if (effect === "emergeSlow") {
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

        setTimeout(() => {
            chatBox.scrollTop = chatBox.scrollHeight;
            isAtBottom = true;
            if (downArrow) downArrow.classList.remove("visible");
        }, 500);
    }

    let inactivityTimer;

    function startInactivityTimer() {
        if (lastBotMessage) {
            lastBotMessage.classList.remove("shimmer");
        }
        clearTimeout(inactivityTimer);
        clearTimeout(refadeTimer);

        const allMessages = document.querySelectorAll(".message");
        allMessages.forEach((msg) => {
            msg.classList.remove("fade-out");
        });

        inactivityTimer = setTimeout(() => {
            if (isAtBottom) {
                const allMessages = document.querySelectorAll(".message");
                allMessages.forEach((msg) => {
                    if (msg !== lastBotMessage) {
                        msg.classList.add("fade-out");
                    }
                });
                if (lastBotMessage) {
                    console.log("Applying shimmer effect to last bot message:", lastBotMessage.textContent);
                    lastBotMessage.classList.add("shimmer");
                    lastBotMessage.style.animationDuration = `${lastMessageSpeed * 2}ms`;
                }
            }

            setTimeout(() => {
                sendBotMessage("Breathe... It's okay. You don't have to rush. Let the silence carry your thoughts.", "typewriter");
            }, 20000);

            setTimeout(() => {
                sendBotMessage("Still here, still listening. 💙 No rush.", "typewriter");
                if (lastBotMessage) {
                    lastBotMessage.classList.add("shimmer");
                    lastBotMessage.style.animationDuration = `${lastMessageSpeed * 2}ms`;
                }
            }, 50000);

            setTimeout(() => {
                sendBotMessage("Whenever you're ready, I'm here. 😌💙", "typewriter");
                if (lastBotMessage) {
                    lastBotMessage.classList.add("shimmer");
                    lastBotMessage.style.animationDuration = `${lastMessageSpeed * 2}ms`;
                }
            }, 110000);
        }, 10000);
    }

    if (chatBox) {
        chatBox.addEventListener("scroll", () => {
            const scrollHeight = chatBox.scrollHeight;
            const scrollTop = chatBox.scrollTop;
            const clientHeight = chatBox.clientHeight;

            isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;

            if (!isAtBottom) {
                if (downArrow) downArrow.classList.add("visible");
                const allMessages = document.querySelectorAll(".message");
                allMessages.forEach((msg) => {
                    msg.classList.remove("fade-out");
                });
                clearTimeout(refadeTimer);
            } else {
                if (downArrow) downArrow.classList.remove("visible");
                refadeTimer = setTimeout(() => {
                    if (isAtBottom) {
                        const allMessages = document.querySelectorAll(".message");
                        allMessages.forEach((msg) => {
                            if (msg !== lastBotMessage) {
                                msg.classList.add("fade-out");
                            }
                        });
                        if (lastBotMessage) {
                            lastBotMessage.classList.add("shimmer");
                            lastBotMessage.style.animationDuration = `${lastMessageSpeed * 2}ms`;
                        }
                    }
                }, 5000);
            }
        });
    }

    if (downArrow) {
        downArrow.addEventListener("click", () => {
            chatBox.scrollTop = chatBox.scrollHeight;
            isAtBottom = true;
            downArrow.classList.remove("visible");
        });
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
