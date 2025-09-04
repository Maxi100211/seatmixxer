import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

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

export async function saveUserData(data) {
  const user = auth.currentUser;
  if (!user) throw new Error("Ikke logget ind");
  await setDoc(doc(db, "users", user.uid), data, { merge: true });
}
export async function loadUserData() {
  const user = auth.currentUser;
  if (!user) throw new Error("Ikke logget ind");
  const snap = await getDoc(doc(db, "users", user.uid));
  return snap.exists() ? snap.data() : {};
}
