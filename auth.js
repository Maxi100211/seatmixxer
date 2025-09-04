// Importer Firebase SDK v9+ modules fra CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

// Din Firebase konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyBMxiDa_hV95neKZFOndaWf-vW2OyA3I9c",
  authDomain: "seatmixxer.firebaseapp.com",
  projectId: "seatmixxer",
  storageBucket: "seatmixxer.appspot.com", // KORREKT!
  messagingSenderId: "1000604838839",
  appId: "1:1000604838839:web:c36a73bcfaaf82b0365632",
  measurementId: "G-85VG44MFG8"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Login
document.getElementById("login-btn").onclick = async () => {
  const email = document.getElementById("email").value;
  const pw = document.getElementById("password").value;
  document.getElementById("auth-msg").innerText = "";
  try {
    await signInWithEmailAndPassword(auth, email, pw);
    // success handled by onAuthStateChanged
  } catch (e) {
    document.getElementById("auth-msg").innerText = e.message;
  }
};

// Opret bruger
document.getElementById("signup-btn").onclick = async () => {
  const email = document.getElementById("email").value;
  const pw = document.getElementById("password").value;
  document.getElementById("auth-msg").innerText = "";
  try {
    await createUserWithEmailAndPassword(auth, email, pw);
  } catch (e) {
    document.getElementById("auth-msg").innerText = e.message;
  }
};

// Logout
document.getElementById("logout-btn").onclick = () => signOut(auth);

// Skift mellem login og app
onAuthStateChanged(auth, user => {
  if (user) showApp();
  else showLogin();
});

function showApp() {
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("app-section").style.display = "block";
  document.getElementById("user-email").innerText = "Logget ind som: " + (auth.currentUser?.email || "");
  document.getElementById("class-msg").innerText = "";
}

function showLogin() {
  document.getElementById("auth-section").style.display = "block";
  document.getElementById("app-section").style.display = "none";
  document.getElementById("auth-msg").innerText = "";
  document.getElementById("class-msg").innerText = "";
}

// Gem klasse i Firestore
document.getElementById("save-btn").onclick = async () => {
  const data = document.getElementById("class-data").value.trim();
  if (!data) {
    document.getElementById("class-msg").innerText = "Du skal skrive noget før du kan gemme.";
    return;
  }
  try {
    await setDoc(doc(db, "classes", auth.currentUser.uid), { data });
    document.getElementById("class-msg").innerText = "Klasse gemt!";
  } catch (e) {
    document.getElementById("class-msg").innerText = e.message;
  }
};

// Hent klasse fra Firestore
document.getElementById("load-btn").onclick = async () => {
  try {
    const docSnap = await getDoc(doc(db, "classes", auth.currentUser.uid));
    if (docSnap.exists()) {
      document.getElementById("class-data").value = docSnap.data().data;
      document.getElementById("class-msg").innerText = "Klasse hentet!";
    } else {
      document.getElementById("class-msg").innerText = "Ingen klasse fundet. Gem først!";
    }
  } catch (e) {
    document.getElementById("class-msg").innerText = e.message;
  }
};
