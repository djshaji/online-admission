var columns = [
    "photo",
    "00-Name-Of-Student",
    "01-Fathers-Name",
    "02-Mothers-Name",
    "03-Date-of-Birth-Day",
    "04-Date-of-Birth-Month",
    "05-Date-of-Birth-Year"
]

sems = [1] // hack for testing!
for (i of document.getElementById ("semester").querySelectorAll ("input"))
    sems.append (i.value)

snapshot = null ;
function get_data () {
    items_per_page = document.getElementById ("per-page").value
    page = document.getElementById ("page").value
    pages = document.getElementById ("total-pages")

    document.getElementById ("spinner-status").innerText = "Loading..."

    semester = document.getElementById ("semester").value
    stream = document.getElementById ("stream") .value
    if (semester == 'Semester' || stream == 'Stream') {
        alert ("Select a Semester and Stream to display data")
        return

    }

    $("#spinner").modal ("show")

    var db = firebase.firestore();
    var storage = firebase.storage();
    console.log ("Getting data for", semester, stream)
    db.collection ("users").doc (semester).collection (stream).get ()
    .then(function(querySnapshot) {
        snapshot = querySnapshot
        pages.innerText = Math.ceil (snapshot.docs.length / items_per_page)
        total_pages = Math.ceil (snapshot.docs.length / items_per_page)
        counter = items_per_page * (page - 1) ;

        //pagination
        pagination = document.getElementById ("pagination")
        pagination.innerHTML = ''
        prev = document.createElement ('li')
        prev.classList.add ('page-item')
        prev.innerHTML = '<a class="page-link" href="javascript: page_prev ()" tabindex="-1">Previous</a>'
        pagination.appendChild (prev)
        next = document.createElement ('li')
        next.classList.add ('page-item')
        next.innerHTML = '<a class="page-link" href="javascript: page_next ()" >Next</a>'
        for (x = 1 ; x < total_pages + 1 ; x ++) {
            p = document.createElement ('li')
            p.classList.add ("page-item")
            let a = document.createElement ('a')
            a.href = 'javascript: goto_page (' + x + ')'
            a.classList.add ('page-link')
            a.innerText = x
            p.appendChild (a)
            // p.innerHTML = '<a class="page-link" href="javascript: goto_page (' + x + ')">' + x + '</a>'
            if (x == page) {
                p.classList.add ('bg-primary')
                a.classList.add ('text-white')
            }
            
            if (total_pages > 10) {
                if (x < 5 || x > total_pages - 5)
                    pagination.appendChild (p)
            } else 
                pagination.appendChild (p)
        }
        pagination.appendChild (next)

        //build columns
        thead = document.getElementById ("thead")
        tbody = document.getElementById ("tbody")
        thead.innerHTML = ''
        tbody.innerHTML = ''
        sa = document.createElement ("th")
        sa.innerHTML = 
            '\
            <div class="form-inline">\
                <input class="form-check-input" type="checkbox" value="" id="select-all" onchange="javascript: select_all ()">\
            </div>'
        sno = document.createElement ("th")
        sno.innerText = "S. No"
        thead.appendChild (sa)
        thead.appendChild (sno)
        for (c of columns) {
            th = document.createElement ("th")
            field = c
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
            
            th.innerText = field
            thead.appendChild (th)
        }

        st = document.createElement ("th")
        st.innerText = "Admission Status"
        thead.appendChild (st)
        cbst = document.createElement ("th")
        cbst.innerText = "Callback Status"
        thead.appendChild (cbst)

        i = 0 ;
        querySnapshot.forEach(function(doc) {
            // skip if we are not on page 1

            if (i < ((page - 1) * items_per_page)) {
                i = i + 1 ;
                // console.log ('skipping user', doc.id)
                return ;
            }
            
            counter = counter + 1
            if (counter > items_per_page * page) {
                // console.log ("per page limit reached")
                return
            }
            // console.log(doc.id, " => ", doc.data());
            data = doc.data ()
            uid = doc.id
            // console.log ('processing user', uid)
            tr = document.createElement ('tr')
            tbody.appendChild (tr)
            sa = document.createElement ("td")
            sa.innerHTML = 
                '\
                <div class="form-inline">\
                    <input class="form-check-input" type="checkbox" value="" id="' + uid + '">\
                </div>'
            sno = document.createElement ("td")
            sno.innerText = counter
            tr.appendChild (sa)
            tr.appendChild (sno)

            for (c of columns) {
                td = document.createElement ('td')
                // is it an image?
                is_image = false
                for (s of sems) {
                    if (data [c].startsWith (s + '/')) 
                        is_image = true
                }

                if (is_image) {
                    let img = document.createElement ('img')
                    img.setAttribute ("width", "64px")
                    td.appendChild (img)
                    img.src = "assets/img/spinner.gif"
                    storage.ref (data [c]).getDownloadURL()
                      .then(function(url) {
                        // console.log (img.id, url)
                        img.src = url
                      }).catch(function(error) {
                        // Handle any errors
                        // alert ("Unable to get image")
                        console.error (error)
                      })
          
                } else
                    td.innerText = data [c]

                tr.appendChild (td)
  
            }
            st = document.createElement ("td")
            switch (data ["status"]) {
                case null:
                default:
                  st.innerHTML = '<span class="btn btn-warning">Pending</span>' ;
                  break
                case "approved":
                  st.innerHTML = '<span class="btn btn-success">Approved</span>' ;
                  break
                case "rejected":
                  st.innerHTML = '<span class="btn btn-danger">Rejected</span>' ;
                  break
              }
                    
            cb_status = document.createElement ("td")
            tr.appendChild (st)
            tr.appendChild (cb_status)
            callback = data ["callback"]
            callback_date = data ["callback-date"]
            callback_status = document.createElement ("span")
            if (callback != null && callback_date != null) {
                callback_status.innerHTML = 
                  "<div>" + callback + ' on ' + callback_date + '</div>'
                cb_status.appendChild (callback_status)
              }
              
        });

        $("#spinner").modal ("hide")
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });

}

function page_next (increment = true) {
    page = parseInt (document.getElementById ("page").value)
    pages = parseInt (document.getElementById ("total-pages").innerText    )

    if (increment)
        page = page + 1
    
    if (page < (pages + 1)) {
        document.getElementById ("page").value = page
        document.getElementById ("go-btn").click ()
    } else
        alert ("You are already at the last page")

}

function page_prev () {
    page = parseInt (document.getElementById ("page").value)

    page = page - 1
    if (page > 0) {
        document.getElementById ("page").value = page
        document.getElementById ("go-btn").click ()
    }  else
        alert ("You are already at the first page")
}

function select_all () {
    checked = document.getElementById ("select-all").checked
    document.getElementById ('tbody').querySelectorAll ("input").forEach (function (id) {
        if (id.type == 'checkbox') {
            id.checked = checked
        }
    })

}

function set_admission_status () {
    ids = []
    document.getElementById ('tbody').querySelectorAll ("input").forEach (function (input) {
        if (input.type == 'checkbox' && input.checked)
            ids.push (input.id)
    })

    status = document.getElementById ("admission-status").value
    if (status == '0') {
        alert ("Select an admission status to set")
        document.getElementById ("admission-status").focus ()
        return
    }

    semester = document.getElementById ("semester").value
    stream = document.getElementById ("stream").value

    if (stream == 'stream' || semester == 'semester') {
        alert ("Select a stream and semester to set admission status")
        return
    }

    var db = firebase.firestore();
    var batch = db.batch();

    for (id of ids) {
        let ref = db.collection ("users").doc (semester).collection (stream).doc (id)
        batch.set (ref, {status: status}, {merge: true})
    }


    spinner_show ("Saving...")
    batch.commit ().then (function (){
        spinner_hide ()
        alert ("Admission Status set successfully")
        get_data ()
    }).catch (function (error){
        spinner_hide ()
        alert ("An error occurred\n\n" + error)
        console.error (error)
    })
}

function spinner_show (status = null) {
    $("#spinner").modal ("show")
    if (status)
        document.getElementById ("spinner-status").innerText = status
    else
        document.getElementById ("spinner-status").innerText = "Loading..."
}

function spinner_hide () {
    $("#spinner").modal ("show")
    document.getElementById ("spinner-status").innerText = "Loading..."

}

function set_callback_date () {
    ids = []
    document.getElementById ('tbody').querySelectorAll ("input").forEach (function (input) {
        if (input.type == 'checkbox' && input.checked)
            ids.push (input.id)
    })

    callback = document.getElementById ("date-for").value
    date = document.getElementById ("datetimepicker4").value

    if (callback == "0" || date == '') {
        alert ("Select a Date and Event")
        return
    }

    data = {
        callback: callback,
        'callback-date': date
    }

    var db = firebase.firestore();
    var batch = db.batch();

    for (id of ids) {
        let ref = db.collection ("users").doc (semester).collection (stream).doc (id)
        batch.set (ref, data, {merge: true})
    }


    spinner_show ("Saving...")
    batch.commit ().then (function (){
        spinner_hide ()
        alert ("Admission Status set successfully")
        get_data ()
    }).catch (function (error){
        spinner_hide ()
        alert ("An error occurred\n\n" + error)
        console.error (error)
    })

}

function goto_page (page) {
    document.getElementById ("page").value = page
    page_next (false)
}