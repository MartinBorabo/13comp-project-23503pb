console.log('%c gtn.js \n--------------------', 'color: blue; background-color: white;');


/**************************************************************/
// gtn_buildTableFunc()
// Fetches lobby data from Firebase and updates the table.
// Listens for real-time updates from Firebase and repopulates the table accordingly.
//**************************************************************/
function gtn_buildTableFunc() {
    console.log('Running gtn_buildTableFunc');

    console.log('%c gtn_buildTableFunc(): ',
        'color: ' + COLAD_D + '; background-color: ' + COLAD_E + ';');

    var gtn_table = $("#tb_gtnLobby");
    gtn_table.empty();

    firebase.database().ref('/Lobby/gtn').on('value', (snapshot) => {
        gtn_table.empty();
        let lobbies = snapshot.val();
        console.log('Checking lobbies from Firebase:', lobbies);

        if (lobbies) {
            let keys = Object.keys(lobbies);
            for (let i = 0; i < keys.length; i++) {
                let p1_uid = keys[i];
                let lobby = lobbies[p1_uid];
                console.log('Processing lobby:', lobby);

                let row = `<tr>
                            <td>${lobby.p1_gameName}</td>
                            <td>${lobby.p1_wins}</td>
                            <td>${lobby.p1_draws}</td>
                            <td>${lobby.p1_losses}</td>
                            <td><button class='b_join' data-uid="${p1_uid}">Join</button></td>
                        </tr>`;
                gtn_table.append(row);
            }
        } else {
            console.log('No lobbies available to display.');
        }
    }, (error) => {
        console.error('Error fetching lobbies:', error);
    });
}


/**************************************************************/
// Event listener for the join button
// Redirects to the game page when the "Join" button is clicked.
//**************************************************************/
$(document).ready(function() {
    $("#tb_gtnLobby").on("click", ".b_join", function() {
        var p1_uid = $(this).data("uid");
        console.log('Join button clicked, UID:', p1_uid);

        gtn_p2Details(p1_uid);
    });
});

/**************************************************************/
// Create_lobby()
// Creates a new lobby in Firebase with the current user's data.
// After creating the lobby, it refreshes the table to show the new lobby.
// Only writes p1 (The one who creates the lobby)
// Generates random number to guess
//**************************************************************/
function Create_lobby() {
    console.log("Running Create_lobby()");
    console.log('%c Create_lobby(): ',
              'color: ' + COLAD_D + '; background-color: ' + COLAD_E + ';');


    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            let p1_uid = user.uid;
            console.log("User authenticated. UID:", p1_uid);

            firebase.database().ref('/auth/users/' + p1_uid + '/Info').once('value')
                .then((snapshot) => {
                    let userData = snapshot.val();
                    let gameName = userData ? userData.Name : "Unknown";

                    let lobbyData = {
                        p1_gameName: gameName,
                        p1_photoURL: user.photoURL,
                        p1_wins: 0,
                        p1_losses: 0,
                        number2Guess: Math.floor(Math.random() * 100) + 1,
                        p2Join: "n"
                    };

                    return firebase.database().ref('/Lobby/gtn/' + p1_uid).set(lobbyData);
                    
                })
                .then(() => {
                    console.log("Lobby created successfully");
                    gtn_buildTableFunc();

                    window.location.href=`gtn_game.html?lobbyUid=${p1_uid}`;

                })
                .catch((error) => {
                    console.error("Error creating lobby:", error);

                });
        } else {
            console.log("User not authenticated");
        }
    });
}


/**************************************************************/
// fb_GamePage()
// Redirects user to the game page.
//**************************************************************/
function fb_GamePage() {
    console.log('%c fb_GamePage(): ', 
        'color: ' + COLAD_D + '; background-color: ' + COLAD_E + ';');
    console.log("Game page working");

    window.location = '/pages/GamePage.html';
}


/**************************************************************/
// gtn_p2Details()
// Writes Player 2 data to Firebase and then redirects
//**************************************************************/
function gtn_p2Details(lobbyUid) {
    console.log('%c gtn_p2Details(): ',
            'color: ' + COLAD_D + '; background-color: ' + COLAD_E + ';');
    console.log('Running gtn_p2Details with Lobby UID:', lobbyUid);

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            let uid = user.uid;

            firebase.database().ref('/auth/users/' + uid + '/Info').once('value')
                .then((snapshot) => {
                    let userData = snapshot.val();
                    let gameName = userData ? userData.Name : "Unknown";

                    let updates = {
                        p2_gameName: gameName,
                        p2_photoURL: user.photoURL,
                        p2_wins: 0,
                        p2_losses: 0,
                        p2_uid: uid,
                        p2Join: "y",
                        p1Guess: 0,
                        p2Guess: 0,
                        currentTurn: 1,
                    };

                    return firebase.database().ref('/Lobby/gtn/' + lobbyUid).update(updates);
                })
                .then(() => {
                    console.log("Player 2 details updated successfully!");

                    window.location.href = `gtn_game.html?lobbyUid=${lobbyUid}`;
                })
                .catch((error) => {
                    console.error("Error updating Player 2 details:", error);
                });
        } else {
            console.log("User not authenticated");
        }
    });
}

/**************************************************************/

var PlayerArray =[
    { 
        gameName: "...",
        PhotoURL: "...",
        Wins: 0,
        Losses: 0,
        gameWins: 0,
        gameLosses: 0
    },
    { 
        gameName: "...",
        PhotoURL: "...",
        Wins: 0,
        Losses: 0,
        gameWins: 0,
        gameLosses: 0
    }
];


function loadPlayerArray(lobbyUid) {
    console.log('%c loadPlayerArray(lobbyUid): ',
        'color: ' + COLAD_D + '; background-color: ' + COLAD_E + ';');

    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            console.log("Not logged in.");
            return;
        }

        var currentUid = user.uid;

        firebase.database().ref("/Lobby/gtn/" + lobbyUid).on('value', function(snapshot) {
            var data = snapshot.val();

            if (!data) {
                console.log("No lobby data.");
                return;
            }

            var p1_uid = lobbyUid;
            var p2_uid = data.p2_uid;

            var isPlayer1 = (currentUid === p1_uid);

            firebase.database().ref("/auth/users/" + p1_uid + "/Info").once('value').then(function(p1Snap) {
                var p1Data = p1Snap.val();

                if (p2_uid) {
                    firebase.database().ref("/auth/users/" + p2_uid + "/Info").once('value').then(function(p2Snap) {
                        var p2Data = p2Snap.val();
                        assignPlayerArray(p1Data, p2Data, data, isPlayer1);
                    });
                } else {
                    assignPlayerArray(p1Data, null, data, isPlayer1);
                }
            });
        });
    });
}




//firebase.database().ref('/auth/users/' + uid + '/Info').once('value').then((snapshot) => {
// /firebase.database().ref('/auth/users/' + uid + '/Info').on('value', (snapshot) => {
//});



function assignPlayerArray(p1Data, p2Data, data, isPlayer1) {
    console.log('%c assignPlayerArray(p1Data, p2Data, data, isPlayer1): ',
        'color: ' + COLAD_D + '; background-color: ' + COLAD_E + ';');


    if (isPlayer1) {
        PlayerArray[0] = {
            gameName: p1Data.Name,
            PhotoURL: p1Data.PhotoURL,
            Wins: data.p1_wins,
            Losses: data.p1_losses,
            gameWins: data.p1_wins,
            gameLosses: data.p1_losses
        };

        PlayerArray[1] = p2Data ? {
            gameName: p2Data.Name,
            PhotoURL: p2Data.PhotoURL,
            Wins: data.p2_wins,
            Losses: data.p2_losses,
            gameWins: data.p2_wins,
            gameLosses: data.p2_losses
        } : null;

    }
    else {
        PlayerArray[0] = p2Data ? {
            gameName: p2Data.Name,
            PhotoURL: p2Data.PhotoURL,
            Wins: data.p2_wins,
            Losses: data.p2_losses,
            gameWins: data.p2_wins,
            gameLosses: data.p2_losses
        } : null;
        PlayerArray[1] = {
            gameName: p1Data.Name,
            PhotoURL: p1Data.PhotoURL,
            Wins: data.p1_wins,
            Losses: data.p1_losses,
            gameWins: data.p1_wins,
            gameLosses: data.p1_losses
        };
    }
    console.log("PlayerArray[0]:", PlayerArray[0]);
    console.log("PlayerArray[1]:", PlayerArray[1]);
    updatePlayerInfoUI();
}


function updatePlayerInfoUI() {
    console.log('%c updatePlayerInfoUI(): ',
        'color: ' + COLAD_D + '; background-color: ' + COLAD_E + ';');

    document.getElementById("image_photo1").src = PlayerArray[0].PhotoURL;
    document.getElementById("p1_gameName").textContent = PlayerArray[0].gameName;
    document.getElementById("p1_gameWins").textContent = "Wins: " + PlayerArray[0].gameWins;
    document.getElementById("p1_gameLosses").textContent = "Losses: " + PlayerArray[0].gameLosses;
    document.getElementById("p1_highScoresWins").textContent = "Wins: " + PlayerArray[0].Wins;
    document.getElementById("p1_highScoresLosses").textContent = "Losses: " + PlayerArray[0].Losses;

    document.getElementById("image_photo2").src = PlayerArray[1].PhotoURL;
    document.getElementById("p2_gameName").textContent = PlayerArray[1].gameName;
    document.getElementById("p2_gameWins").textContent = "Wins: " + PlayerArray[1].gameWins;
    document.getElementById("p2_gameLosses").textContent = "Losses: " + PlayerArray[1].gameLosses;
    document.getElementById("p2_highScoresWins").textContent = "Wins: " + PlayerArray[1].Wins;
    document.getElementById("p2_highScoresLosses").textContent = "Losses: " + PlayerArray[1].Losses;
}



/* ------------------------------------------------------------------- */

let lobbyUid;
let currentUserUid;
let currentPlayer = null;
let guessInput, hintEl, attemptsEl;




document.addEventListener("DOMContentLoaded", () => {
    guessInput = document.getElementById("guess");
    hintEl = document.getElementById("hint");
    attemptsEl = document.getElementById("attempts");


    const params = new URLSearchParams(window.location.search);
    lobbyUid = params.get('lobbyUid');


    if (lobbyUid) {
        console.log("Calling loadPlayerArray with lobbyUid:", lobbyUid);
        loadPlayerArray(lobbyUid);
    } else {
        console.warn("Missing lobbyUid in URL.");
    }


    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUserUid = user.uid;


            firebase.database().ref("/Lobby/gtn/" + lobbyUid).once("value").then((snapshot) => {
                const data = snapshot.val();


                if (data) {
                    currentPlayer = currentUserUid === lobbyUid ? 1 : 2;
                    listenForTurnChanges();
                }
            });
        }
    });
});






function submitButton() {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("You must be logged in to play.");
        return;
    }
   


    console.log('%c submitButton(): ', 'color: ' + COLAD_D + '; background-color: ' + COLAD_E + ';');


    const guess = parseInt(guessInput.value);


    if (isNaN(guess) || guess < 1 || guess > 100) {
        alert("Enter a valid number between 1 and 100.");
        return;
    }


    firebase.database().ref('/Lobby/gtn/' + lobbyUid).once('value').then((snapshot) => {
        const gameData = snapshot.val();
        const correctNumber = gameData.number2Guess;
        const currentTurn = gameData.currentTurn;


        console.log('Current Turn:', currentTurn);
        console.log('Current Player:', currentPlayer);
        console.log('Guess:', guess);
        console.log('Correct Number:', correctNumber);


        if (currentPlayer !== currentTurn) {
            alert("It's not your turn!");
            return;
        }


        let hint = '';


        if (guess === correctNumber) {
            hint = `Player ${currentPlayer} guessed it right!`;


            savingScores(user);
            
            firebase.database().ref('/Lobby/gtn/' + lobbyUid).update({
                winner: currentPlayer,
                gameOver: true
            });
        }else{
            hint = guess > correctNumber ? "Too high!" : "Too low!";
        }


        const nextTurn = currentTurn === 1 ? 2 : 1;


        if (currentTurn === 1) {
            firebase.database().ref('/Lobby/gtn/' + lobbyUid).update({
                p1Guess: guess,
                currentTurn: nextTurn
            });
        } else {
            firebase.database().ref('/Lobby/gtn/' + lobbyUid).update({
                p2Guess: guess,
                currentTurn: nextTurn
            });
        }


        hintEl.textContent = hint;
        guessInput.value = '';
    });
}




function listenForTurnChanges() {


  firebase.database().ref('/Lobby/gtn/' + lobbyUid + '/currentTurn').on('value', (snapshot) => {
    const turn = snapshot.val();
    if (turn === currentPlayer) {
      guessInput.disabled = false;
      document.getElementById("submit").disabled = false;
      hintEl.textContent = "It's your turn!";
    } else {
      guessInput.disabled = true;
      document.getElementById("submit").disabled = true;
      hintEl.textContent = "Waiting for other player...";
    }
  });
}




function savingScores(user) {
    console.log()


    const uid = user.uid;


    firebase.database().ref('/auth/users/' + uid + '/Games/Guess The Number/wins').once('value')
        .then((snapshot) => {
            let currentWins = parseInt(snapshot.val());
            if (isNaN(currentWins)) currentWins = 0;
            const newWins = currentWins + 1;


            console.log(`Current wins for ${uid}:`, currentWins);
            console.log(`Updating wins to:`, newWins);


            firebase.database().ref('/auth/users/' + uid + '/Games/Guess The Number').update({
                wins: newWins
            });
        });
}


 