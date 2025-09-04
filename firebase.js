// Firebase init og fælles hjælpefunktioner
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

// Din Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBMxiDa_hV95neKZFOndaWf-vW2OyA3I9c",
  authDomain: "seatmixxer.firebaseapp.com",
  projectId: "seatmixxer",
  storageBucket: "seatmixxer.appspot.com",
  messagingSenderId: "1000604838839",
  appId: "1:1000604838839:web:c36a73bcfaaf82b0365632",
  measurementId: "G-85VG44MFG8"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Hjælp: Tjek login, redirect til login hvis ikke logget ind
export function requireLogin(redirect = "index.html") {
  onAuthStateChanged(auth, user => {
    if (!user) window.location.href = redirect;
  });
}

// Hjælp: Gem data for bruger
export async function saveUserData(data) {
  if (!auth.currentUser) throw new Error("Ikke logget ind");
  await setDoc(doc(db, "users", auth.currentUser.uid), data, { merge: true });
}

// Hjælp: Hent data for bruger
export async function loadUserData() {
  if (!auth.currentUser) throw new Error("Ikke logget ind");
  const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
  return snap.exists() ? snap.data() : {};
}
