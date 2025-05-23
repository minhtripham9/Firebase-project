// app.js

// 1. Firebase config - REPLACE with your own config object!
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ... etc, fill in all from your Firebase console
};

// 2. Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// 3. Elements
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const userEmailDiv = document.getElementById('user-email');
const postArea = document.getElementById('post-area');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesList = document.getElementById('messages-list');

// 4. Auth State Changes
auth.onAuthStateChanged(user => {
    if (user) {
        signupForm.style.display = 'none';
        loginForm.style.display = 'none';
        logoutBtn.style.display = '';
        postArea.style.display = '';
        userEmailDiv.textContent = "Logged in as: " + user.email;
        listenForMessages(); // Show messages in real time
    } else {
        signupForm.style.display = '';
        loginForm.style.display = '';
        logoutBtn.style.display = 'none';
        postArea.style.display = 'none';
        userEmailDiv.textContent = '';
        messagesList.innerHTML = '';
    }
});

// 5. Sign Up
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            signupForm.reset();
        })
        .catch(error => alert(error.message));
});

// 6. Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            loginForm.reset();
        })
        .catch(error => alert(error.message));
});

// 7. Logout
logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

// 8. Post a Message
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    const user = auth.currentUser;
    if (!user) return;

    db.collection('messages').add({
        message: message,
        userId: user.uid,
        email: user.email,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        messageForm.reset();
    })
    .catch(error => alert(error.message));
});

// 9. Listen and Display Messages (Real-Time)
let unsubscribeMessages = null;
function listenForMessages() {
    if (unsubscribeMessages) unsubscribeMessages();

    unsubscribeMessages = db.collection('messages')
        .orderBy('timestamp', 'desc')
        .onSnapshot(snapshot => {
            messagesList.innerHTML = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                const messageDiv = document.createElement('div');
                messageDiv.innerHTML = `
                    <strong>${data.message}</strong>
                    <div class="author">${data.email || "Unknown user"}</div>
                    <div class="time">${formatTime(data.timestamp)}</div>
                `;
                messagesList.appendChild(messageDiv);
            });
        });
}

// Helper: Format timestamp
function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleString();
}
