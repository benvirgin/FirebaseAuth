// config
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc, addDoc, onSnapshot, query, where, getDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBdosiFJ-yR8F_9Lnml9g7QyJjwDT18ysw",
  authDomain: "game-guidez-fdc96.firebaseapp.com",
  projectId: "game-guidez-fdc96",
  storageBucket: "game-guidez-fdc96.appspot.com",
  messagingSenderId: "381316896604",
  appId: "1:381316896604:web:3e4f0318d1066d5ce8d399",
  measurementId: "G-4EM6HLKC2L"
};

// init firebase
const app = initializeApp(firebaseConfig);

// init services
const db = getFirestore();
const auth = getAuth();

// collection ref
const colRef = collection(db, 'guides');
const userColRef = collection(db, 'users');

// doc ref
const docRef = doc(db, 'users', 'user.id');
const docSnap = await getDoc(docRef);
console.log(docSnap.data());

// query
const q = query(userColRef, where('user.uid', '==', 'userColRef.id'))

// dom elements
const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');
const accountDetails = document.querySelector('.account-details');

const setupUI = (user) => {
  if (user) {
    // account info
    if (docSnap.exists()) {
      const html = `
      <div>Logged in as ${user.email}</div>
      <div>${docSnap.data()}</div>
      `
      accountDetails.innerHTML = html;
    }

    
    
    // toggle user UI elements
    loggedInLinks.forEach(item => item.style.display = 'block');
    loggedOutLinks.forEach(item => item.style.display = 'none');
  } else {
    // clear account info
    accountDetails.innerHTML = '';
    // toggle user elements
    loggedInLinks.forEach(item => item.style.display = 'none');
    loggedOutLinks.forEach(item => item.style.display = 'block');
  }
};

// listen for auth status changes
onAuthStateChanged(auth, (user) => {
  console.log(user);
  if (user) {
    onSnapshot(colRef, (snapshot) => {
      setupGuides(snapshot.docs);
      setupUI(user);
    }, err => console.log(err.message));
  } else {
    setupUI();
    setupGuides([]);
  }
});

// create new guide
const createForm = document.querySelector('#create-form');
createForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addDoc(colRef, {
    title: createForm.title.value,
    content: createForm.content.value
  }).then(() => {
    // close the create modal & reset form
    const modal = document.querySelector('#modal-create');
    M.Modal.getInstance(modal).close();
    createForm.reset();
  }).catch(err => {
    console.log(err.message);
  });
});


// signup
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // get user info
  const email = signupForm['signup-email'].value;
  const password = signupForm['signup-password'].value;
  const userBio = signupForm['signup-bio'].value

  // sign up the user & add firestore data
  createUserWithEmailAndPassword(auth, email, password)
    .then(cred => {
      setDoc(doc(userColRef, cred.user.uid), {
        bio: userBio
      });
    })
    .then(() => {
      // close the signup modal & reset form
      const modal = document.querySelector('#modal-signup');
      M.Modal.getInstance(modal).close();
      signupForm.reset();
    }), err => console.log(err.message);
  });

// logout
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
  e.preventDefault();
  signOut(auth)
});

// login
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // get user info
  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;

  // log the user in
  signInWithEmailAndPassword(auth, email, password).then(cred => {
    // close the signup modal & reset form
    const modal = document.querySelector('#modal-login');
    M.Modal.getInstance(modal).close();
    loginForm.reset();
  })
  .catch(err => {
    console.log(err.message)
  })
  });