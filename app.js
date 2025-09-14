import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ---- Firebase config ----
const firebaseConfig = {
  apiKey: "AIzaSyCx8SYiBF9EUtcsJESyT7ZJcN8m4zd0fE8",
  authDomain: "famchat-624ab.firebaseapp.com",
  projectId: "famchat-624ab",
  storageBucket: "famchat-624ab.firebasestorage.app",
  messagingSenderId: "686126582474",
  appId: "1:686126582474:web:0b207958778479fa768233",
  measurementId: "G-PR7T35RYTM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ---- DOM elements ----
const messagesEl = document.getElementById('messages');
const msgInput = document.getElementById('msg');
const sendBtn = document.getElementById('send');
const nameInput = document.getElementById('name');
const saveNameBtn = document.getElementById('saveName');
const signoutBtn = document.getElementById('signout');

// ---- User name ----
let displayName = localStorage.getItem('famchat_name') || '';
if(displayName) nameInput.value = displayName;

saveNameBtn.onclick = () => {
  displayName = nameInput.value.trim() || 'Family';
  localStorage.setItem('famchat_name', displayName);
  alert('Name saved: ' + displayName);
};

// ---- Send message ----
sendBtn.onclick = sendMessage;
msgInput.addEventListener('keydown', e => { if(e.key==='Enter') sendMessage(); });

// ---- Sign out ----
signoutBtn.onclick = () => signOut(auth).catch(console.error);

// ---- Auth + listen messages ----
onAuthStateChanged(auth, user => {
  if(!user) signInAnonymously(auth).catch(console.error);
  else listenMessages();
});

// ---- Functions ----
async function sendMessage() {
  const text = msgInput.value.trim();
  if(!text) return;
  if(!auth.currentUser) {
    alert('Signing in… please try again.');
    await signInAnonymously(auth);
    return;
  }
  await addDoc(collection(db,'messages'),{
    uid: auth.currentUser.uid,
    name: displayName || 'Family',
    text,
    createdAt: serverTimestamp()
  });
  msgInput.value='';
}

let unsubscribe=null;
function listenMessages(){
  if(unsubscribe) unsubscribe();
  const q = query(collection(db,'messages'),orderBy('createdAt'));
  unsubscribe = onSnapshot(q,snap=>{
    messagesEl.innerHTML='';
    snap.forEach(d=>{
      const data = d.data();
      const who = data.uid===auth.currentUser.uid?'me':'other';
      const div = document.createElement('div');
      div.className = `message ${who}`;
      div.innerHTML = `<div class="meta">${data.name}</div><div class="body">${data.text}</div>`;
      messagesEl.appendChild(div);
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
}
