var columns = [
    "photo",
    "00-Name-Of-Student",
    "01-Fathers-Name",
    "02-Mothers-Name",
    "03-Date-of-Birth-Day",
    "04-Date-of-Birth-Month",
    "05-Date-of-Birth-Year"
]

snapshot = null ;
function get_data () {
    $("#spinner").modal ("show")
    document.getElementById ("spinner-status").innerText = "Loading..."

    semester = document.getElementById ("semester").value
    stream = document.getElementById ("stream") .value
    if (semester == '' || stream == '') {
        alert ("Select a Semester and Stream to display data")
        return

    }

    var db = firebase.firestore();
    db.collection ("users").doc (semester).collection (stream).get ()
    .then(function(querySnapshot) {
        snapshot = querySnapshot
        $("#spinner").modal ("hide")
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });

}