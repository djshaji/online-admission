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
  var ui = new firebaseui.auth.AuthUI(firebase.auth());
  ui.start('#firebaseui-auth-container', uiConfig);

}

function submit_page (page) {
  inputs = $("#" + page).find ("input")
  for (j of $("#" + page).find ("select"))
    inputs. push  (j)
  data = {}
  for (i of inputs) {
    if (i.id == null)
      console.log (i)
    if (i.id.search ("subject") == -1 && i.value == '') {
      alert ("All fields are compulsory\n\nThe following field is not filled:\n" + i.id)
      i.focus ()
      return
    } else {
      data [i.id] = i.value
    }

    console.log (data)
  }
}