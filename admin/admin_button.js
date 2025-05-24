
window.addEventListener('DOMContentLoaded', function() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      fb_checkIfAdmin(user);
    }
  });
});

function fb_checkIfAdmin(user) {
  var uid = user.uid;
  firebase.database().ref('/auth/users/' + uid + '/Admin/isAdmin')
    .on('value', function(snapshot) {
      var isAdmin = snapshot.val();
      console.log("isAdmin value:", isAdmin);

      if (isAdmin === "y") {
        document.getElementById("adminButton").style.display = "block";
      } else if (isAdmin === "n") {
        document.getElementById("adminButton").style.display = "none";

      }
    });
}

//firebase.database().ref("/Lobby/gtn/" + lobbyUid).on('value', function(snapshot) {