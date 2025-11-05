import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    getDatabase,
    ref,
    push,
    onChildAdded,
    remove,
    update,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCLsgoSnRN9IHB4A8TzJT3K3CRt0ubdg9Q",
    authDomain: "realtime-database-3c518.firebaseapp.com",
    databaseURL: "https://realtime-database-3c518-default-rtdb.firebaseio.com",
    projectId: "realtime-database-3c518",
    storageBucket: "realtime-database-3c518.firebasestorage.app",
    messagingSenderId: "470126901435",
    appId: "1:470126901435:web:f1f069857cc0634d84519e",
    measurementId: "G-MRM65JK741",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

//signup function
document.getElementById("registerBtn")?.addEventListener("click", () => {
    const signupEmail = document.getElementById("email").value;
    const loginPassword = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, signupEmail, loginPassword)
        .then(() => {
            alert("Signup Sucessful!✅");
            window.location.href = "user.html";
        })
        .catch((error) => {
            alert(error.message);
        });
});

//login function
document.getElementById("loginBtn")?.addEventListener("click", () => {
    const loginEmail = document.getElementById("email").value;
    const loginPassword = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, loginEmail, loginPassword)
        .then(() => {
            alert("Login Sucessful! 👮");
            window.location.href = "user.html";
        })
        .catch((error) => {
            alert(error.message);
        });
});

//continue with google
document.getElementById("googleBtn")?.addEventListener("click", () => {
    signInWithPopup(auth, provider)
        .then(() => {
            alert("Login Successful 👮");
            window.location.href = "user.html";
        })
        .catch((error) => {
            alert(error.message);
        });
});

//LogOut function
document.getElementById("logoutBtn")?.addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            swal({
                title: "Log Out",
                text: "Successfully!",
                icon: "success",
                button: "okay!",
            });

            window.location.href = "index.html";
        })
        .catch((error) => {
            alert(error.message);
        });
});

//Enter chat function
window.enterChat = function () {
    const username = document.getElementById("username").value.trim();
    if (!username) return alert("Please enter a username");

    localStorage.setItem("username", username);
    window.location.href = "chat.html";
};

//Send Message function
window.messageSend = function () {
    const message = document.getElementById("message").value.trim();
    const username = localStorage.getItem("username");
    if (message === "") return;

    push(ref(db, "messages"), { username, message })
        .then(() => (document.getElementById("message").value = ""))
        .catch((error) => alert("Error sending message: " + error.message));
};
//Delet message
function deleteMessage(messageId, messageElement) {
    remove(ref(db, `messages/${messageId}`))
        .then(() => messageElement.remove())
        .catch((error) => alert("Error deleting message: " + error.message));
}

//Edit Message
function editMessage(messageId, messageElement, oldText) {
    const newText = prompt("Edit your message:", oldText);
    if (newText && newText.trim() !== "") {
        update(ref(db, `messages/${messageId}`), { message: newText })
            .then(() => {
                messageElement.querySelector(".message-text").textContent = newText;
            })
            .catch((error) => alert("Error updating message: " + error.message));
    }
}

//Chat Message
window.onload = function () {
    const chatBox = document.getElementById("chat-box");
    if (!chatBox) return;

    const currentUsername = localStorage.getItem("username");

    onChildAdded(ref(db, "messages"), (snapshot) => {
        const data = snapshot.val();
        const messageId = snapshot.key;

        const container = document.createElement("div");
        container.classList.add("message-container");
        container.classList.add(data.username === currentUsername ? "sent" : "received");

        const wrapper = document.createElement("div");
        wrapper.classList.add("message-wrapper");


        const textWrapper = document.createElement("div");
        const name = document.createElement("div");
        name.classList.add("username");
        name.textContent = data.username;

        const msg = document.createElement("div");
        msg.classList.add("message-text");
        msg.textContent = data.message;

        textWrapper.appendChild(name);
        textWrapper.appendChild(msg);
        wrapper.appendChild(textWrapper);

        if (data.username === currentUsername) {
            const btnContainer = document.createElement("div");
            btnContainer.classList.add("btn-container");


            const editBtn = document.createElement("span");
            editBtn.textContent = "✏️"; // ✏️ emoji
            editBtn.classList.add("edit-icon");
            editBtn.title = "Edit message";
            editBtn.addEventListener("click", () =>
                editMessage(messageId, container, data.message)
            );


            const delBtn = document.createElement("span");
            delBtn.textContent = "🗑️";
            delBtn.classList.add("delete-icon");
            delBtn.title = "Delete message";
            delBtn.addEventListener("click", () => {
                if (confirm("Delete this message?")) deleteMessage(messageId, container);
            });

            btnContainer.appendChild(editBtn);
            btnContainer.appendChild(delBtn);
            wrapper.appendChild(btnContainer);
        }


        container.appendChild(wrapper);
        chatBox.appendChild(container);
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}
// //Theme change
const chatContainer = document.getElementById("chat-container");
const themeBtn = document.getElementById("toggleBtn");

const themes = [
    { container: "#efe8e8ff", text: "#5d3210ff" }, // light
    { container: "#595751ff", text: "#f8f8f8ff" },
];

let currentTheme = 0;

themeBtn.addEventListener("click", () => {
    currentTheme = (currentTheme + 1) % themes.length;
    const theme = themes[currentTheme];

    //Apply colours
    chatContainer.style.background = theme.container;
    chatContainer.style.color = theme.text;

    const texts = chatContainer.querySelectorAll("h1, h2, p, button, input");
    texts.forEach((el) => (el.style.color = theme.text));
});
