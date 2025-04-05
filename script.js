document.addEventListener("DOMContentLoaded", function () {
    
    let chatBox = document.getElementById("chat-box");
    let downArrow = document.getElementById("down-arrow");
    let lastBotMessage = null;
    let lastMessageSpeed = 180;
    let isAtBottom = true;
    let refadeTimer;
    let wordSpeeds = [];
    let inactivityTimer;
    let lastUserMessageTime = null;
    let messages = JSON.parse(localStorage.getItem("messages")) || [];
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    window.onload = function () {
        chatBox = document.getElementById("chat-box");
        downArrow = document.getElementById("down-arrow");
        console.log("ChatBox found globally:", chatBox);
        console.log("DownArrow found globally:", downArrow);
        loadMessages();
    };

    const introMessages = [
        ". . .",
        "Hello. 😌💙",
        "How are you feeling?"
    ];

    function showIntroMessages(index = 0) {
        if (index < introMessages.length) {
            setTimeout(() => {
                sendBotMessage(introMessages[index], "wordFade");
                console.log("Displaying intro message:", introMessages[index]);
                showIntroMessages(index + 1);
            }, 2500);
        }
    }

    if (messages.length === 0) {
        showIntroMessages();
    }

    const userInput = document.getElementById("user-input");
    if (userInput) {
        userInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                const inputText = userInput.value.trim();
                if (inputText !== "") {
                    addUserMessage(inputText);
                    userInput.value = "";
                    lastUserMessageTime = Date.now();
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
                    startInactivityTimer();
                }
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

        const messageId = Date.now();
        const messageData = { id: messageId, text, type: "user", timestamp: new Date().toISOString() };
        messages.push(messageData);
        localStorage.setItem("messages", JSON.stringify(messages));

        const messageContainer = document.createElement("div");
        messageContainer.classList.add("message-container");
        messageContainer.dataset.id = messageId;

        const userMessage = document.createElement("p");
        userMessage.classList.add("message", "user", "fade-in-soft");
        userMessage.textContent = text;

        const favoriteBtn = document.createElement("button");
        favoriteBtn.classList.add("favorite-btn");
        favoriteBtn.innerHTML = "♡";
        favoriteBtn.addEventListener("click", () => toggleFavorite(messageId, messageData));

        messageContainer.appendChild(userMessage);
        messageContainer.appendChild(favoriteBtn);

        chatBox.appendChild(messageContainer);
        chatBox.scrollTop = chatBox.scrollHeight;
        isAtBottom = true;
        if (downArrow) downArrow.classList.remove("visible");
    }

    function sendBotMessage(message, effect = "wordFade") {
        console.log("Bot Message Effect:", effect, "Message:", message);

        const messageId = Date.now();
        const messageData = { id: messageId, text: message, type: "bot", timestamp: new Date().toISOString() };
        messages.push(messageData);
        localStorage.setItem("messages", JSON.stringify(messages));

        const messageContainer = document.createElement("div");
        messageContainer.classList.add("message-container");
        messageContainer.dataset.id = messageId;

        const botMessage = document.createElement("p");
        botMessage.classList.add("message", "bot", "new");

        const favoriteBtn = document.createElement("button");
        favoriteBtn.classList.add("favorite-btn");
        favoriteBtn.innerHTML = "♡";
        favoriteBtn.addEventListener("click", () => toggleFavorite(messageId, messageData));

        messageContainer.appendChild(botMessage);
        messageContainer.appendChild(favoriteBtn);

        if (!message || message.trim() === "") {
            console.warn("⚠️ Empty bot message detected! Not displaying.");
            return;
        }

        if (!chatBox) {
            console.error("Error: #chat-box element not found.");
            return;
        }

        chatBox.appendChild(messageContainer);

        lastBotMessage = botMessage;

        function revealMessage() {
            if (!botMessage || !(botMessage instanceof HTMLElement)) {
                console.error("Error: Invalid botMessage element.");
                return;
            }
            console.log("Revealing message:", botMessage.textContent, botMessage);
            botMessage.classList.add("show");
            chatBox.scrollTop = chatBox.scrollHeight;
            isAtBottom = true;
            if (downArrow) downArrow.classList.remove("visible");

            console.log("Revealed botMessage:", botMessage);
        }

        if (effect === "wordFade") {
            const words = message.split(" ");
            let index = 0;
            let totalSpeed = 0;
            let wordCount = words.length;
            wordSpeeds = [];

            setTimeout(() => {
                console.log("Starting word fade effect for message:", message);
                function revealWord() {
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
                        wordSpeeds.push(speed);

                        const wordSpan = document.createElement("span");
                        wordSpan.classList.add("word-reveal");
                        /* Commented out shimmer-related code
                        const shimmerSpan = document.createElement("span");
                        shimmerSpan.classList.add("word-shimmer");
                        shimmerSpan.textContent = word + " ";
                        wordSpan.appendChild(shimmerSpan);

                        setTimeout(() => {
                            shimmerSpan.style.opacity = "1";
                        }, 300);
                        */
                        wordSpan.textContent = word + " ";
                        botMessage.appendChild(wordSpan);

                        index++;
                        setTimeout(revealWord, speed);
                    } else {
                        console.log("Word fade effect complete, revealing message.");
                        revealMessage();
                        lastMessageSpeed = totalSpeed / wordCount;
                    }
                }
                revealWord();
            }, 300);
        } else if (effect === "softFade") {
            botMessage.textContent = message;
            botMessage.classList.add("fade-in-soft");
            setTimeout(() => revealMessage(), 100);
        } else if (effect === "instantAppear") {
            botMessage.textContent = message;
            botMessage.classList.add("instant-appear");
            revealMessage();
        } else if (effect === "emergeSlow") {
            botMessage.textContent = message;
            botMessage.classList.add("fade-in-slow");
            setTimeout(() => revealMessage(), 100);
        }
        
        console.log("✅ Bot message added:", botMessage.textContent);
    }

    function applyFadeAndShimmer() {
        const allMessages = document.querySelectorAll(".message");
        allMessages.forEach((msg) => {
            msg.classList.remove("fade-out");
        });

        if (isAtBottom) {
            allMessages.forEach((msg, idx) => {
                if (msg !== lastBotMessage) {
                    setTimeout(() => {
                        msg.classList.add("fade-out");
                    }, idx * 300);
                }
            });
        }
    }

    function startInactivityTimer() {
        clearTimeout(inactivityTimer);

        if (!lastUserMessageTime) return;

        const timeSinceLastUserMessage = Date.now() - lastUserMessageTime;
        const initialDelay = 10000;
        const silenceDelays = [
            60000,
            120000,
            180000
        ];

        function scheduleSilenceMessage(index) {
            if (index >= silenceDelays.length) return;

            const timeUntilNextSilence = silenceDelays[index] - timeSinceLastUserMessage;
            if (timeUntilNextSilence <= 0) {
                setTimeout(() => {
                    if (Date.now() - lastUserMessageTime >= silenceDelays[index]) {
                        if (index === 0) {
                            sendBotMessage("Breathe... It's okay. You don't have to rush. Let the silence carry your thoughts.", "wordFade");
                        } else if (index === 1) {
                            sendBotMessage("Still here, still listening. 💙 No rush.", "wordFade");
                        } else if (index === 2) {
                            sendBotMessage("Whenever you're ready, I'm here. 😌💙", "wordFade");
                        }
                        scheduleSilenceMessage(index + 1);
                    }
                }, 0);
            } else {
                inactivityTimer = setTimeout(() => {
                    if (Date.now() - lastUserMessageTime >= silenceDelays[index]) {
                        if (index === 0) {
                            sendBotMessage("Breathe... It's okay. You don't have to rush. Let the silence carry your thoughts.", "wordFade");
                        } else if (index === 1) {
                            sendBotMessage("Still here, still listening. 💙 No rush.", "wordFade");
                        } else if (index === 2) {
                            sendBotMessage("Whenever you're ready, I'm here. 😌💙", "wordFade");
                        }
                        scheduleSilenceMessage(index + 1);
                    }
                }, timeUntilNextSilence);
            }
        }

        setTimeout(() => {
            applyFadeAndShimmer();
            scheduleSilenceMessage(0);
        }, initialDelay - timeSinceLastUserMessage > 0 ? initialDelay - timeSinceLastUserMessage : 0);
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
                    applyFadeAndShimmer();
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

    async function callGrokAPI(userText) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const lowerText = userText.toLowerCase();
                let response = "I’m listening. 💙 Can you tell me more?";
                if (lowerText.includes("fine") || lowerText.includes("good") || lowerText.includes("okay")) {
                    response = "I'm glad to hear that. 😌💙 What is something that made you feel good today?";
                } else if (lowerText.includes("not great") || lowerText.includes("bad") || lowerText.includes("sad") || lowerText.includes("tired")) {
                    response = "I'm here with you. 🥺💙 What has been weighing on your heart?";
                } else if (lowerText.includes("i don't know") || lowerText.includes("unsure")) {
                    response = "That's okay. 😌💙 Sometimes we don’t have the words right away. But if you sit with it a moment, what do you feel?";
                } else if (lowerText.includes("thank you") || lowerText.includes("thanks")) {
                    response = "You're welcome. 😌💙 I’m grateful to share this moment with you.";
                } else if (lowerText.includes("alone") || lowerText.includes("lonely")) {
                    response = "You’re not alone right now. 💙 I’m here. And I’ll stay as long as you need.";
                }
                resolve(response);
            }, 1000);
        });
    }

    async function generateResponse(userText) {
        try {
            const response = await callGrokAPI(userText);
            sendBotMessage(response, "wordFade");
        } catch (error) {
            console.error("Error calling Grok API:", error);
            sendBotMessage("I'm sorry, I couldn't process that. Can you try again? 💙", "wordFade");
        }
    }

    function loadMessages() {
        messages.forEach((msg) => {
            const messageContainer = document.createElement("div");
            messageContainer.classList.add("message-container");
            messageContainer.dataset.id = msg.id;

            const messageEl = document.createElement("p");
            messageEl.classList.add("message", msg.type);
            messageEl.textContent = msg.text;

            const favoriteBtn = document.createElement("button");
            favoriteBtn.classList.add("favorite-btn");
            favoriteBtn.innerHTML = favorites.some(fav => fav.id === msg.id) ? "❤️" : "♡";
            if (favorites.some(fav => fav.id === msg.id)) {
                favoriteBtn.classList.add("favorited");
            }
            favoriteBtn.addEventListener("click", () => toggleFavorite(msg.id, msg));

            messageContainer.appendChild(messageEl);
            messageContainer.appendChild(favoriteBtn);

            chatBox.appendChild(messageContainer);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function toggleFavorite(messageId, messageData) {
        const messageContainer = document.querySelector(`.message-container[data-id="${messageId}"]`);
        const favoriteBtn = messageContainer.querySelector(".favorite-btn");
        const isFavorited = favorites.some(fav => fav.id === messageId);

        if (isFavorited) {
            favorites = favorites.filter(fav => fav.id !== messageId);
            favoriteBtn.innerHTML = "♡";
            favoriteBtn.classList.remove("favorited");
        } else {
            favorites.push(messageData);
            favoriteBtn.innerHTML = "❤️";
            favoriteBtn.classList.add("favorited");
        }

        localStorage.setItem("favorites", JSON.stringify(favorites));
    }

    const viewMemoriesBtn = document.getElementById("view-memories");
    const memoriesModal = document.getElementById("memories-modal");
    const closeMemories = document.getElementById("close-memories");
    const memoriesList = document.getElementById("memories-list");

    viewMemoriesBtn.addEventListener("click", () => {
        memoriesList.innerHTML = "";
        messages.forEach((msg) => {
            const messageEl = document.createElement("p");
            messageEl.classList.add("message", msg.type);
            messageEl.textContent = `[${new Date(msg.timestamp).toLocaleString()}] ${msg.text}`;
            memoriesList.appendChild(messageEl);
        });
        memoriesModal.style.display = "block";
    });

    closeMemories.addEventListener("click", () => {
        memoriesModal.style.display = "none";
    });

    const viewFavoritesBtn = document.getElementById("view-favorites");
    const favoritesModal = document.getElementById("favorites-modal");
    const closeFavorites = document.getElementById("close-favorites");
    const favoritesList = document.getElementById("favorites-list");

    viewFavoritesBtn.addEventListener("click", () => {
        favoritesList.innerHTML = "";
        favorites.forEach((fav) => {
            const messageEl = document.createElement("p");
            messageEl.classList.add("message", fav.type);
            messageEl.textContent = `[${new Date(fav.timestamp).toLocaleString()}] ${fav.text}`;
            favoritesList.appendChild(messageEl);
        });
        favoritesModal.style.display = "block";
    });

    closeFavorites.addEventListener("click", () => {
        favoritesModal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === memoriesModal) {
            memoriesModal.style.display = "none";
        }
        if (event.target === favoritesModal) {
            favoritesModal.style.display = "none";
        }
    });
});
