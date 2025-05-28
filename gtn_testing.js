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
        console.log("Lobby UID from URL:", lobbyUid);
    } else {
        console.warn("Missing lobbyUid in URL.");
    }

    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            currentUserUid = user.uid;
            console.log("Logged in user UID:", currentUserUid);

            try {
                const snapshot = await firebase.database().ref("/Lobby/gtn/" + lobbyUid).once("value");
                const data = snapshot.val();

                if (!data) {
                    console.error("No lobby data found for lobbyUid:", lobbyUid);
                    return;
                }

                console.log("Lobby data fetched:", data);

                // Determine current player based on UID matching
                if (currentUserUid === data.p1_uid) {
                    currentPlayer = 1;
                    console.log("You are Player 1");
                } else if (currentUserUid === data.p2_uid) {
                    currentPlayer = 2;
                    console.log("You are Player 2");
                } else {
                    console.error("Current user UID not found in lobby as Player 1 or 2");
                    currentPlayer = null;
                }

                // Initialize currentTurn if missing or invalid
                if (!data.currentTurn || (data.currentTurn !== 1 && data.currentTurn !== 2)) {
                    console.log("currentTurn missing or invalid, setting to 1...");
                    await firebase.database().ref("/Lobby/gtn/" + lobbyUid).update({
                        currentTurn: 1
                    });
                } else {
                    console.log("currentTurn is:", data.currentTurn);
                }

                listenForTurnChanges();
                listenForWinLoss();

            } catch (error) {
                console.error("Error fetching lobby data:", error);
            }
        } else {
            console.warn("User not logged in.");
        }
    });
});

function submitButton() {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("You must be logged in to play.");
        return;
    }

    console.log('submitButton called');

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
        console.log('Player guess:', guess);
        console.log('Correct Number:', correctNumber);

        if (currentPlayer !== currentTurn) {
            alert("It's not your turn!");
            return;
        }

        let hint = '';

        if (guess === correctNumber) {
            hint = `Player ${currentPlayer} guessed it right!`;

            savingScores(user);

            const updates = {
                winner: currentPlayer,
                gameOver: true
            };

            if (currentPlayer === 1) {
                updates.p1Guess = 'w';  // Mark p1 as winner
            } else if (currentPlayer === 2) {
                updates.p2Guess = 'w';  // Mark p2 as winner
            }

            firebase.database().ref('/Lobby/gtn/' + lobbyUid).update(updates);

        } else {
            hint = guess > correctNumber ? "Too high!" : "Too low!";

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
        }

        hintEl.textContent = hint;
        guessInput.value = '';
    });
}

function listenForTurnChanges() {
    firebase.database().ref('/Lobby/gtn/' + lobbyUid + '/currentTurn').on('value', (snapshot) => {
        const turn = snapshot.val();
        console.log("Turn updated:", turn, "Current player:", currentPlayer);

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

function listenForWinLoss() {
    firebase.database().ref('/Lobby/gtn/' + lobbyUid).on('value', (snapshot) => {
        const data = snapshot.val();

        if (data && data.gameOver) {
            console.log("Game over! Winner:", data.winner, "You are player:", currentPlayer);
            if (currentPlayer === data.winner) {
                hintEl.textContent = "You won!";
            } else {
                hintEl.textContent = "You lost!";
            }
            guessInput.disabled = true;
            document.getElementById("submit").disabled = true;
        }
    });
}

function savingScores(user) {
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
