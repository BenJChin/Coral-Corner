// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDpy3lkqeJRgtMwF8ORVoOBMvM9C7ZLiYo",
    authDomain: "coralcorner-b8d78.firebaseapp.com",
    databaseURL: "https://coralcorner-b8d78.firebaseio.com",
    projectId: "coralcorner-b8d78",
    storageBucket: "coralcorner-b8d78.appspot.com",
    messagingSenderId: "805148954178",
    appId: "1:805148954178:web:d619c70e0e17fc72d3e7db",
    measurementId: "G-3T26SZR4T2"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
  const db = firebase.firestore();