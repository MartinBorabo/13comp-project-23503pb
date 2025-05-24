console.log('%c script.js \n--------------------',
            'color: blue; background-color: white;');

const COLAD_D = 'black;'
const COLAD_E = '#F0E68C';

/**************************************************************/
// runAll()
// Entry function that triggers authentication
// passes to fb_authenticate()
/**************************************************************/
function runAll(){
    console.log('%c runAll(): ',
              'color: ' + COLAD_D + '; background-color: ' + COLAD_E + ';');

    fb_authenticate();
}


/**************************************************************/
// fb_authenticate()
// Checks if the user is authenticated
// Redirects to registration if no user is found, otherwise to game page
/**************************************************************/
function fb_authenticate(){
    console.log('%c fb_authenticate(): ',
              'color: ' + COLAD_D + '; background-color: ' + COLAD_E + ';');
    console.log("running fb_authenticate()")
    console.log("logging in")

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log("logged in")
            console.log(user)

            var uid = user.uid;
           
            firebase.database().ref('/auth/users/' + uid).once('value')
                .then((snapshot) => {
                    if (snapshot.val()) {
                        console.log("User exists in database");
                        fb_GamePage();
                    } else {
                        console.log("User doesn't exist in database")
                        fb_RegistrationPage();
                    }
                });
        } else {
            console.log("Not logged in")
            fb_RegistrationPage();
        }
    });
}


/*============================================================================*/


/**************************************************************/
// fb_GamePage()
// Redirects user to the game page
/**************************************************************/
function fb_GamePage(){
    console.log('%c fb_GamePage(): ',
             'color: ' + COLAD_D + '; background-color: ' + COLAD_E + ';');
    console.log("Game page working")
    
    window.location = 'pages/game_page.html';
}

/**************************************************************/
// fb_RegistrationPage()
// Redirects user to the registration page
/**************************************************************/
function fb_RegistrationPage(){
    console.log('%c fb_RegistrationPage(): ',
             'color: ' + COLAD_D + '; background-color: ' + COLAD_E + ';');
    console.log("Registration Working page");

    window.location = 'pages/registration_page.html';
}


/*============================================================================*/


/**************************************************************/
// fb_register()
// Collects user input from registration form and starts login process
// Stores input in sessionStorage before proceeding
/**************************************************************/
function fb_register(){
    console.log('%c fb_register(): ',
             'color: ' + COLAD_D + '; background-color: ' + COLAD_E + ';');
    console.log("fb_register working")
   
    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;
   
    console.log("Registration form values:")
    console.log("Registered name:", name)
    console.log("Registered age:", age)

    //sessionStorage.setItem("userName", name);
    //sessionStorage.setItem("userAge", age);
   
    fb_login(name, age);
}

/**************************************************************/
// fb_login(name, age)
// Authenticates user with Google, then saves user info
/**************************************************************/
function fb_login(name, age){
    console.log('%c fb_login(): ',
             'color: ' + COLAD_D + '; background-color: ' + COLAD_E + ';');
    console.log("fb_login working")
    console.log("logging in")

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log("logged in")
            console.log(user)

            fb_saveRegistrationInfo(user, name, age);

        } else {
            console.log("Not logged in")
            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider).then(function(result)
            {
                var token = result.credential.accessToken;
                var user = result.user;
               
                fb_saveRegistrationInfo(user, name, age);
            });
        }
    });
}

/**************************************************************/
// fb_saveRegistrationInfo(user, name, age)
// Saves user registration data to Firebase and redirects to game page
/**************************************************************/
function fb_saveRegistrationInfo(user, name, age){
    console.log('%c fb_saveRegistrationInfo(): ',
              'color: ' + COLAD_D + '; background-color: ' + COLAD_E + ';');
    console.log("fb_saveRegistration working")

    var uid = user.uid;
    var data = {
        Admin: {
            "isAdmin": "n",
        },
        Info: {
            "Name" : name,
            "Age" : age,
            "Google Name" : user.displayName,
            "Email" : user.email,
            "PhotoURL": user.photoURL
        },
        Games: {
            "GeoDash": {
                "High Score": "0",
                "Recent Score": "0"
            },
            "Guess The Number": {
                "wins": "0",
                "losses": "0"
            }
        }
    };
   
    console.log(user.uid)
    console.log(data)
   
    firebase.database().ref('/auth/users/'+ uid).set(data).then(function(){
        fb_GamePage()
    });

    sessionStorage.setItem("Name", name);
    sessionStorage.setItem("Age", age);
    sessionStorage.setItem("Google Name", user.displayName);
    sessionStorage.setItem("Email", user.email);
    sessionStorage.setItem("PhotoURl", user.photoURL)
}





//sessionStorage.setItem("lastname", "Smith");
//let personName = sessionStorage.getItem("lastname");
//document.getElementById("demo").innerHTML = personName;





/**************************************************************/
// ValidationForm()
// Validates user input fields before proceeding with registration
/**************************************************************/
function ValidationForm(){
    console.log('%c ValidationForm(): ',
             'color: ' + COLAD_D + '; background-color: ' + COLAD_E + ';');

    let Valid = true;
   
    document.getElementById('NameError').innerText = '';
    document.getElementById("AgeError").innerText = '';
   
    var name = document.getElementById('name').value;
    if (name.trim() === '') {
        document.getElementById('NameError').innerText = 'Required';
        Valid = false;
    }
   
    var age = document.getElementById('age').value;
    if (age < 1 || age > 200) {
        document.getElementById('AgeError').innerText = 'Required';
        Valid = false;
    }
   
    if (Valid) {
        fb_register();
    }
    return false;
}


/*============================================================================*/


/**************************************************************/
// fb_saveScore_Game1(score)
// Saves high scores and recent score for Game 1
/**************************************************************/
function fb_saveScore_Game1(score){
    console.log('%c fb_saveScore_Game1(): ',
             'color: ' + COLAD_D + '; background-color: ' + COLAD_E + ';');
    console.log("Save score working..")

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            var uid = user.uid;
            firebase.database().ref('/auth/users/' + uid + '/Games/GeoDash').once('value').then((snapshot) => {
                let data = snapshot.val();
                let HighScore = data["High Score"] || 0;
               
                if (score > HighScore){
                    console.log("Reached new record")
                    firebase.database().ref('/auth/users/' + uid + '/Games/GeoDash').update({
                        "High Score": score,
                        "Recent Score": score
                    });
                } else {
                    console.log("High score not reached");
                    firebase.database().ref('/auth/users/' + uid + '/Games/GeoDash').update({
                        "Recent Score": score
                    });
                }
            });
        } else {
            console.log("Not logged in")
            fb_RegistrationPage();
        }
    });
}

/**************************************************************/
// fb_saveScore_Game2(score)
// Saves high scores and recent score for Game 2
/**************************************************************/
function fb_saveScore_Game2(score) {
    console.log('%c fb_saveScore_Game2(): ',
              'color: ' + COLAD_D + '; background-color: ' + COLAD_E + ';');
    console.log("Save score working..")
   
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            var uid = user.uid;
            firebase.database().ref('/auth/users/' + uid + '/Games/Guess The Number').once('value').then((snapshot) => {
                let data = snapshot.val();
                //let HighScore = data["High Score"] || 0;
               
                if (score > HighScore){
                    console.log("Reached new record")
                    firebase.database().ref('/auth/users/' + uid + '/Games/Guess The Number').update({
                        "High Score": score,
                        "Recent Score": score
                    });
                } else {
                    console.log("High score not reached");
                    firebase.database().ref('/auth/users/' + uid + '/Games/Guess The Number').update({
                        "Recent Score": score
                    });
                }
            });
        } else {
            console.log("Not logged in")
            fb_RegistrationPage();
        }
    });
}


/*============================================================================*/


/**************************************************************/
// displayUserName(name)
// Displays the logged-in user's name
/**************************************************************/
function displayUserName(name) {
    console.log('%c displayUserName(): ',
              'color: ' + COLAD_D + '; background-color: ' + COLAD_E + ';');

    const userInfo = document.getElementById('user-info');
    userInfo.innerHTML = `<h1>Welcome, ${name}!</h1>`;
}

/**************************************************************/
// displayHighScores()
// Retrieves and displays high scores from Firebase
/**************************************************************/
function displayHighScores() {
    console.log('%c displayHighScores(): ',
              'color: ' + COLAD_D + '; background-color: ' + COLAD_E + ';');

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            var uid = user.uid;
            firebase.database().ref('/auth/users/' + uid + '/Games').once('value').then((snapshot) => {
                let GamesData = snapshot.val();
               
                const UserGames = document.getElementById('user-highscores');
                UserGames.innerHTML = '';

                for (let game in GamesData) {
                    let highScore = GamesData[game]["High Score"];
                    let recentScore = GamesData[game]["Recent Score"];

                    UserGames.innerHTML += `<h3>${game}</h3>
                                            <p>High Score: ${highScore}</p>
                                            <p>Recent Score: ${recentScore}</p>`;
                }
            });
        } else {
            console.log("No user is signed in.");
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            var uid = user.uid;
            firebase.database().ref('/auth/users/' + uid + '/Info').once('value').then((snapshot) => {
                const userData = snapshot.val();
               
                displayUserName(userData.Name);
                displayHighScores();
            });
        } else {
            console.log("No user is signed in.");
        }
    });
});



