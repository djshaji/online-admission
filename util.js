function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /* Loop through a collection of all HTML elements: */
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {elmnt.innerHTML = this.responseText;}
          if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
          /* Remove the attribute, and call this function once more: */
          elmnt.removeAttribute("w3-include-html");
          includeHTML();
        }
      }
      xhttp.open("GET", file, true);
      xhttp.send();
      /* Exit the function: */
      // componentHandler.upgradeDom ()
      return;
    } 
    // else if (elmnt.tagName == 'SCRIPT' ) {
    //   file = elmnt.getAttribute("src");
    //   script = document.createElement ("script")
    //   script.setAttribute ("src", file)
    //   document.head.appendChild (script)

    // }
  }
}

function firebase_init () {
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
  if (document.getElementById ("firebaseui-auth-container") != null) {
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseui-auth-container', uiConfig);
  

  }

}

function submit_page (page) {
  inputs = $("#" + page).find ("input")
  for (j of $("#" + page).find ("select"))
    inputs. push  (j)
  data = {}
  files = {}
  for (i of inputs) {
    if (i.id == null)
      console.log (i)
    if (i.id.search ("subject") == -1 && i.value == '') {
      alert ("All fields are compulsory\n\nThe following field is not filled:\n" + i.id)
      i.focus ()
      return
    } else if (i.type == 'file') {
      files [i.id] = i.value
    } else {
      data [i.id] = i.value
    }

    // console.log (data)
  }

  var db = firebase.firestore();
  var sem = document.getElementById ("admission-for-semester")
  var stream = document.getElementById ("admission-for-stream")
  var storageRef = firebase.storage().ref();
  
  var ref = db.collection ("users").doc (sem).collection (stream).doc (fireuser.uid)
  ref.set (data, {merge:true})
    .then (function () {
      
    })
}

var fireuser = null ;
function init () {
  firebase_init ()
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      fireuser = user
      // User is signed in.
    } else {
      // No user is signed in.
    }
  });
  
}