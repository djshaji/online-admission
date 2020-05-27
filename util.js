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

  firebase.storage().ref().constructor.prototype.putFiles = function(files) { 
    var ref = this;
    return Promise.all(files[2].map(function(file) {
      return ref.child(files [0] + '/' + files [1] + '/' + fireuser.uid + '/' + file [0]).put(file [1]);
    }));
  }
  
  
}

function submit_page (page, metadatas) {
  document.getElementById ("spinner-status").innerText = "Saving information..."
  inputs = $("#" + page).find ("input")
  for (j of $("#" + page).find ("select"))
    inputs. push  (j)
  data = {}
  files = {}
  for (i of inputs) {
    if (i.id == null)
      console.log (i)
      if (i.type != 'file')
        data [i.id] = i.value

    // if (i.id.search ("subject") == -1 && i.value == '') {
    //   alert ("All fields are compulsory\n\nThe following field is not filled:\n" + i.id)
    //   i.focus ()
    //   return
    // } else if (i.type == 'file') {
    //   files [i.id] = i.value
    // } else {
    //   data [i.id] = i.value
    // }

    // console.log (data)
  }

  for (m of metadatas) {
    // console.log (m)
    data [m ["metadata"]["name"]] = m["metadata"] ["fullPath"]
  }

  var db = firebase.firestore();
  var sem = document.getElementById ("08-Admission-for-Semester").value
  var stream = document.getElementById ("07-Admission-for-Stream").value
  var storageRef = firebase.storage().ref();
  
  var ref = db.collection ("users").doc (sem).collection (stream).doc (fireuser.uid)
  ref.set (data, {merge:true})
    .then (function () {
      alert ("Data saved successfully")
      location.reload ()
    }).catch (function (err) {
      alert ("Error saving data:\n\n" + err)
      console.error (err)
    })
}

var fireuser = null ;
function init () {
  firebase_init ()
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      fireuser = user
      // User is signed in.
      check_progress ()
    } else {
      // No user is signed in.
    }
  });
  
}

async function upload_cb (sem, stream, files, page) {
  // use it!
  // var page = files [3]
  firebase.storage().ref().putFiles([sem, stream, files]).then(function(metadatas) {
    // Get an array of file metadata
    console.log (metadatas)
    submit_page (page, metadatas)
  }).catch(function(error) {
    // If any task fails, handle this
    console.log (error, files)
  });
  
}

function upload (page) {
  $("#spinner").modal ("show")
  document.getElementById ("spinner-status").innerText = "Uploading files..."
  var sem = document.getElementById ("admission-for-semester").value
  var stream = document.getElementById ("admission-for-stream").value

  inputs = $("#" + page).find ("input") 
  files = []
  for (i of inputs) {
    if (i.type == 'file' && i.files.length > 0)
      files.push ([i.id, i.files [0]])
  }

  // console.log (files)
  upload_cb (sem, stream, files, page)
}

function check_form (page, data) {
  console.log ("Going to upload", page)
  inputs = $("#" + page).find ("input")
  for (j of $("#" + page).find ("select"))
    inputs. push  (j)
  data = {}
  files = {}
  for (i of inputs) {
    if (i.id == null)
      console.log (i)

    if (i.id.search ("subject") == -1 && i.value == '' && i.id.search ("ba-") == -1) {
      alert ("All fields are compulsory\n\nThe following field is not filled:\n" + i.id)
      i.focus ()
      return
    } else if (i.type == 'file') {
      files [i.id] = i.value
    } else {
      data [i.id] = i.value
    }
  }

    upload (page)
}

var firedata = null 
function check_progress () {
  firebase.auth().currentUser.getIdTokenResult(true)
  .then((idTokenResult) => {
    console.log (idTokenResult)
    
    if (!idTokenResult.claims.hasOwnProperty ("semester"))
      return
      
    if (!idTokenResult.claims.hasOwnProperty ("stream"))
      return

    semester = idTokenResult ["claims"] ["semester"]
    stream = idTokenResult ["claims"]["stream"]
    fireuser.semester = idTokenResult ["claims"]["semester"]
    fireuser.stream = idTokenResult ["claims"]["stream"]
    
    var db = firebase.firestore();
    
    var ref = db.collection ("users").doc (semester).collection (stream).doc (fireuser.uid)
    $("#spinner").modal ("show")
    document.getElementById ("spinner-status").innerText = "Loading..."
    ref.get ()
      .then (function (doc) {
        data = doc.data ()
        firedata = data
        console.log (data)
        for (p of ['profile', "qualification", "summary"]) {
          // console.log (p)
          c = check_page (p, data)
          // console.log (c)
          if (!c)
            break
        }

        $("#spinner").modal ("hide")
        document.getElementById ("spinner-status").innerText = "Loading..."
      
      }).catch (function (err) {
        alert ("Error saving data:\n\n" + err)
        console.error (err)
      })   
  })
}

function check_page (page, data) {
  console.log ("going to check if", page, "has been completed")
  q = document.getElementById (page + '-btn')
  q.removeAttribute ("disabled")
  q.click ()
  window.scrollTo (0,0)
  inputs = $("#" + page).find ("input")
  for (j of $("#" + page).find ("select"))
    inputs. push  (j)

  for (i of inputs) {
    if (i.id.search ("subject") != -1 || i.id.search ("ba-") != -1) {
      continue
    }

    if (data.hasOwnProperty (i.id)) {
      if (i.type != 'file')
        i.value = data [i.id]
    } else {
      console.warn (i.id, "has not been filled.")
      return false
    }
  }

  console.log (page, "has been completed.")
  btn = document.getElementById (page + '-btn')
  btn.classList.remove ("btn-danger")
  btn.classList.remove ("btn-warning")
  btn.classList.remove ("active") // hack!!
  btn.classList.add ("btn-success")
  document.getElementById(page + "-icon").innerText = 'check_circle'
  if (page == 'summary') 
    populate_summary ()
  return true
}

function populate_summary () {
  var b = document.getElementById ('summary-table')
  for (page of ["profile", "qualification"]) {
    inputs = $("#" + page).find ("input")
    for (j of $("#" + page).find ("select"))
      inputs. push  (j)
    
    for (i of inputs) {
      val = i.value
      if (val != '') {
        tr = document.createElement ('tr')
        td1 = document.createElement ('td')
        td2 = document.createElement ('td')
        b.appendChild (tr)
        tr.appendChild (td1)
        tr.appendChild (td2)
        td1.innerText = i.id
        td2.innerText =i.value
      }
    }
  }
}