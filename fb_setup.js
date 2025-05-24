console.log('%c fb_setup.js \n--------------------',
    'color: blue; background-color: white;');
  
  var database;
  
  /**************************************************************/
  // fb_initialise()
  // Initialize firebase, connect to the Firebase project.
  //
  // Find the config data in the Firebase consol. Cog wheel > Project Settings > General > Your Apps > SDK setup and configuration > Config
  //
  // Input:  n/a
  // Return: n/a
  /**************************************************************/
  function fb_initialise() {  
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAt_9qMZZ0-6GK_j7I4t6KW3fcxdRHh8II",
    authDomain: "comp-2025-paul-martin-borabo.firebaseapp.com",
    databaseURL: "https://comp-2025-paul-martin-borabo-default-rtdb.firebaseio.com",
    projectId: "comp-2025-paul-martin-borabo",
    storageBucket: "comp-2025-paul-martin-borabo.firebasestorage.app",
    messagingSenderId: "546742412165",
    appId: "1:546742412165:web:080667e7e6a91c540fdaec",
    measurementId: "G-LW47PH13SH"
  };
   
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
  
    // This log prints the firebase object to the console to show that it is working.
    // As soon as you have the script working, delete this log.
    console.log(firebase);  
  }
  
  fb_initialise();
  