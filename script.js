document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chat-box");
    const downArrow = document.getElementById("down-arrow");
    let lastBotMessage = null;
    let isAtBottom = true;
    let refadeTimer;
    let inactivityTimer;
    let lastUserMessageTime = null;
    let messages = [];
    let favorites = [];

    try {
        const storedMessages = localStorage.getItem("messages");
        messages = storedMessages ? JSON.parse(storedMessages) : [];
    } catch (error) {
        console.error("Error loading messages from localStorage:", error);
        messages = [];
    }

    try {
        const storedFavorites = localStorage.getItem("favorites");
        favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    } catch (error) {
        console.error("Error loading favorites from localStorage:", error);
        favorites = [];
    }

    console.log("ChatBox found globally:", chatBox);
    console.log("DownArrow found globally:", downArrow);

    if (chatBox) {
        loadMessages();
    } else {
        console.error("Error: #chat-box element not found on page load.");
    }

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

        try {
            localStorage.setItem("messages", JSON.stringify(messages));
        } catch (error) {
            console.error("Error saving messages to localStorage:", error);
        }

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

        try {
            localStorage.setItem("messages", JSON.stringify(messages));
        } catch (error) {
            console.error("Error saving messages to localStorage:", error);
        }

        const messageContainer = document.createElement("div");
        messageContainer.classList.add("message-container");
        messageContainer.dataset.id = messageId;

        const botMessage = document.createElement("p");
        botMessage.classList.add("message", "bot");

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
            let totalDelay = 0;

            words.forEach((word, index) => {
                let speed = 180;
                if (word.length < 3) speed = 60;
                else if (word.length > 7) speed = 220;
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

                const wordSpan = document.createElement("span");
                wordSpan.classList.add("word-reveal");
                wordSpan.textContent = word + " ";
                wordSpan.style.animationDelay = `${totalDelay}ms`;
                botMessage.appendChild(wordSpan);

                totalDelay += speed;
            });

            setTimeout(() => {
                revealMessage();
            }, totalDelay + 300);
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

    function applyFadeEffect() {
        const allMessages = document.querySelectorAll(".message");
        allMessages.forEach((msg) => {
            msg.classList.remove("fade-out");
        });

        if (isAtBottom) {
            allMessages.forEach((msg, idx) => {
                if (msg !== lastBotMessage) {
                    msg.style.transitionDelay = `${idx * 0.3}s`;
                    msg.classList.add("fade-out");
                }
            });
        }
    }

    function startInactivityTimer() {
        clearTimeout(inactivityTimer);

        if (!lastUserMessageTime) return;

        const initialDelay = 10000;
        const silenceDelays = [60000, 120000, 180000];
        let silenceIndex = 0;

        function checkInactivity() {
            const timeSinceLastUserMessage = Date.now() - lastUserMessageTime;

            if (timeSinceLastUserMessage >= initialDelay && isAtBottom) {
                applyFadeEffect();
            }

            if (silenceIndex >= silenceDelays.length) return;

            if (timeSinceLastUserMessage >= silenceDelays[silenceIndex]) {
                if (silenceIndex === 0) {
                    sendBotMessage("Breathe... It's okay. You don't have to rush. Let the silence carry your thoughts.", "wordFade");
                } else if (silenceIndex === 1) {
                    sendBotMessage("Still here, still listening. 💙 No rush.", "wordFade");
                } else if (silenceIndex === 2) {
                    sendBotMessage("Whenever you're ready, I'm here. 😌💙", "wordFade");
                }
                silenceIndex++;
            }

            const nextCheck = silenceIndex < silenceDelays.length
                ? silenceDelays[silenceIndex] - timeSinceLastUserMessage
                : 1000;

            if (nextCheck > 0) {
                inactivityTimer = setTimeout(checkInactivity, nextCheck);
            }
        }

        const timeSinceLastUserMessage = Date.now() - lastUserMessageTime;
        const firstCheckDelay = Math.max(initialDelay - timeSinceLastUserMessage, 0);
        inactivityTimer = setTimeout(checkInactivity, firstCheckDelay);
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
                    applyFadeEffect();
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
            if (msg.type === "bot") {
                messageEl.classList.add("show");
            }

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

        try {
            localStorage.setItem("favorites", JSON.stringify(favorites));
        } catch (error) {
            console.error("Error saving favorites to localStorage:", error);
        }
    }

    const viewMemoriesBtn = document.getElementById("view-memories");
    const memoriesModal = document.getElementById("memories-modal");
    const closeMemories = document.getElementById("close-memories");
    const memoriesList = document.getElementById("memories-list");

    if (viewMemoriesBtn && memoriesModal && closeMemories && memoriesList) {
        viewMemoriesBtn.addEventListener("click", () => {
            memoriesList.innerHTML = "";
            messages.forEach((msg) => {
                const messageEl = document.createElement("p");
                messageEl.classList.add("message", msg.type);
                messageEl.textContent = `[${new Date(msg.timestamp).toLocaleString()}] ${msg.text}`;
                memoriesList.appendChild(messageEl);
            });
            memoriesModal.style.display = "block";
            memoriesModal.focus();
        });

        closeMemories.addEventListener("click", () => {
            memoriesModal.style.display = "none";
        });
    } else {
        console.error("Error: One or more memories modal elements not found.");
    }

    const viewFavoritesBtn = document.getElementById("view-favorites");
    const favoritesModal = document.getElementById("favorites-modal");
    const closeFavorites = document.getElementById("close-favorites");
    const favoritesList = document.getElementById("favorites-list");

    if (viewFavoritesBtn && favoritesModal && closeFavorites && favoritesList) {
        viewFavoritesBtn.addEventListener("click", () => {
            favoritesList.innerHTML = "";
            favorites.forEach((fav) => {
                const messageEl = document.createElement("p");
                messageEl.classList.add("message", fav.type);
                messageEl.textContent = `[${new Date(fav.timestamp).toLocaleString()}] ${fav.text}`;
                favoritesList.appendChild(messageEl);
            });
            favoritesModal.style.display = "block";
            favoritesModal.focus();
        });

        closeFavorites.addEventListener("click", () => {
            favoritesModal.style.display = "none";
        });
    } else {
        console.error("Error: One or more favorites modal elements not found.");
    }

    if (memoriesModal && favoritesModal) {
        window.addEventListener("click", (event) => {
            if (event.target === memoriesModal) {
                memoriesModal.style.display = "none";
            }
            if (event.target === favoritesModal) {
                favoritesModal.style.display = "none";
            }
        });

        window.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                if (memoriesModal.style.display === "block") {
                    memoriesModal.style.display = "none";
                }
                if (favoritesModal.style.display === "block") {
                    favoritesModal.style.display = "none";
                }
            }
        });
    }
});
