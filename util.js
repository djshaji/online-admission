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
  console.log ("init", location.href)
  firebase_init ()
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      fireuser = user
      console.log (user)
      // User is signed in.
      document.getElementById ("menu-logout").classList.remove ('d-none')

      switch (module) {
        case 'index':
        default:
          get_tokens ()
          break ;
        case 'profile':
          document.getElementById ("menu-profile").classList.remove ('d-none')
          check_progress ()
          break ;
      }
    } else {
      // No user is signed in.
      console.warn ("No user signed in")
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
  var sem = document.getElementById ("08-Admission-for-Semester").value
  var stream = document.getElementById ("07-Admission-for-Stream").value

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
    if (i.type == 'checkbox')
      continue
    if (i.id == null)
      console.log (i)

    // if ((i.id.toLowerCase ().search ("subject")||i.id.toLowerCase ().search ("-ba-")) == -1 && i.value == '') {
    if (! i.hasAttribute ("optional") && i.value == '') {
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
  console.log ("Module Profile")

  firebase.auth().currentUser.getIdTokenResult(true)
  .then((idTokenResult) => {
    console.log (idTokenResult)
    if (idTokenResult.claims.hasOwnProperty ("admin")) {
      location.href = "/admin.html"
      return
    }
    
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

  var storage = firebase.storage();

  for (i of inputs) {
    if (i.hasAttribute ("optional") && ! data.hasOwnProperty (i.id)) {
      continue
    }

    if (data.hasOwnProperty (i.id)) {
      if (i.type == 'checkbox') {
        if (data [i.id] == 'on') {
          i.checked = true
        }
      }
      if (i.type != 'file')
        i.value = data [i.id]
      
      if (data [i.id].search ("1/") === 0) {
        let img = document.getElementById (i.id + '-img')
        if (img != null) {
          img.src = "assets/img/spinner.gif"
          storage.ref (data [i.id]).getDownloadURL()
            .then(function(url) {
              console.log (img.id, url)
              img.src = url
            }).catch(function(error) {
              // Handle any errors
              // alert ("Unable to get image")
              console.error (error)
            })
  
        }
      }
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
  if (page == 'qualification') 
    populate_summary ()
  else if(page =='summary') {
    if (firedata ['final-submit']) {
      document.getElementById ("final-submit-agreement").style.display = 'none'
      b = document.getElementById ("final-submit-btn")
      b.classList.remove ('btn-danger')
      b.classList.add ('btn-success')
      b.classList.add ('text-white')
      b.innerText = 'Form has been submitted'
      b.removeAttribute ('href')
      document.getElementById ("next-1").style.display = 'none'
      document.getElementById ("next-2").style.display = 'none'

      status = firedata ["status"]
      callback = firedata ["callback"]
      callback_date = firedata ["callback-date"]

      header_title = document.getElementById ("header-title")
      switch (status) {
        case null:
        default:
          header_title.innerHTML = 'Your application status is <span class="btn btn-warning">Pending</span>' ;
          break
        case "approved":
          header_title.innerHTML = 'Your application status is <span class="btn btn-success">Approved</span>' ;
          break
        case "rejected":
          header_title.innerHTML = 'Your application status is <span class="btn btn-danger">Rejected</span>' ;
          break
        
      }

      if (callback != null && callback_date != null) {
        document.getElementById ("header-callback").innerHTML = 
          "You have to appear for <span class='btn btn-danger'>" + callback + '</span> on <span class="btn btn-danger">' + callback_date + '</span>'
      }

      $("#spinner").modal ("hide")
    }
  }
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
        field = i.id
        if (field.search ("13-ba-1") != -1)
          field = field.replace ("13-ba-1", "13-BA/BSc. Semester 1")
        if (field.search ("15-ba-3") != -1)
          field = field.replace ("15-ba-3", "15-BA/BSc. Semester 3")
        if (field.search ('-') != -1) {
          field = field.replace ('-', '+')
          // console.log (field)
          field = field.split ('+') [1]
          field = field.replace (/-/g, ' ')
  
        }

        td1.innerText = field
        td2.innerHTML = "<a href=\"javascript: focus_entry ('" + page + "','" + i.id + "')\"><i class=\"material-icons\">edit</i>&nbsp&nbsp;" + i.value + "</a>"
      }
    }
  }
}

function focus_entry (page, input) {
  document.getElementById (page + '-btn').click ()
  document.getElementById ("input").focus ()
}

function final_submit () {
  if (!document.getElementById ("i-agree").checked) {
    alert ("You have to verify that information provided is correct before submitting the form.")
    document.getElementById ("i-agree").focus ()
    return
  }

  if (! confirm ("Are you sure you want to submit the form? You cannot make any changes after the form has been submitted."))
    return
  
  data = {
    "final-submit": true,
    "final-date-submitted": Date (),
    "i-agree": "on"
  }

  $("#spinner").modal ("show")
  document.getElementById ("spinner-status").innerText = "Submitting form..."
  var db = firebase.firestore();
  var ref = db.collection ("users").doc (fireuser.semester).collection (fireuser.stream).doc (fireuser.uid)
  ref.set (data, {merge:true})
    .then (function () {
      alert ("Form has been successfully")
      location.reload ()
    }).catch (function (err) {
      alert ("Error saving data:\n\n" + err)
      console.error (err)
    })
    
}

async function get_tokens () {
  await firebase.auth().currentUser.getIdTokenResult(true)
  .then((idTokenResult) => {
    console.log (idTokenResult)
    
    if (idTokenResult.claims.hasOwnProperty ("admin")) {
      is_admin ()
      return
    }
      
    if (!idTokenResult.claims.hasOwnProperty ("semester"))
      return
      
    if (!idTokenResult.claims.hasOwnProperty ("stream"))
      return

    semester = idTokenResult ["claims"] ["semester"]
    stream = idTokenResult ["claims"]["stream"]
    fireuser.semester = idTokenResult ["claims"]["semester"]
    fireuser.stream = idTokenResult ["claims"]["stream"]
    document.getElementById ("default-section").classList.add ('d-none')
    var db = firebase.firestore();

    var ref = db.collection ("users").doc (fireuser.semester).collection (fireuser.stream).doc (fireuser.uid)
    $("#spinner").modal ("show")
    document.getElementById ("spinner-status").innerText = "Loading..."
    ref.get ()
      .then (function (doc) {
        data = doc.data ()
        firedata = data
        console.log (data)
        status = firedata ["status"]
        callback = firedata ["callback"]
        callback_date = firedata ["callback-date"]
  
        header_title = document.getElementById ("header-title")
        switch (status) {
          case null:
            break ;
          default:
            header_title.innerHTML = 'Your application status is <span class="btn btn-warning">Pending</span>' ;
            break
          case "approved":
            header_title.innerHTML = 'Your application status is <span class="btn btn-success">Approved</span>' ;
            break
          case "rejected":
            header_title.innerHTML = 'Your application status is <span class="btn btn-danger">Rejected</span>' ;
            break
          
        }
  
        if (callback != null && callback_date != null) {
          document.getElementById ("header-callback").innerHTML = 
            "You have to appear for <span class='btn btn-danger'>" + callback + '</span> on <span class="btn btn-danger">' + callback_date + '</span>'
        }

        $("#spinner").modal ("hide")
               
      })
    

  })
}

function logout () {
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
    alert ("You have been logged out.")
    location.href = "/"
  }).catch(function(error) {
    // An error happened.
    alert ("Unable to log out")
    console.error (error)
  });
  
}

function calculate_percentage (el1, el2, el3)  {
  e1 = document.getElementById (el1).value 
  e2 = document.getElementById (el2).value 
  
  if (e1 != '' && e2 != '')
    document.getElementById (el3).value = (e1 / e2) * 100
}

function is_admin () {
  document.getElementById ("menu-admin").classList.remove ('d-none')
  // get_data ()
  if (localStorage.items_per_page)
    document.getElementById ("per-page").value = localStorage.items_per_page
  
}

function get_random_theme () {
  var url = "http://colormind.io/api/";
  var data = {
    model : "default",
    input : [[44,43,44],[90,83,82],"N","N","N"]
  }
  
  var http = new XMLHttpRequest();
  
  http.onreadystatechange = function() {
    if(http.readyState == 4 && http.status == 200) {
      var palette = JSON.parse(http.responseText).result;
    }
  }
  
  http.open("POST", url, true);
  http.send(JSON.stringify(data));
  
}