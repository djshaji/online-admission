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
        pages.value = Math.ceil (snapshot.docs.length / items_per_page)
        counter = 0 ;

        //build columns
        thead = document.getElementById ("thead")
        tbody = document.getElementById ("tbody")
        thead.innerHTML = ''
        tbody.innerHTML = ''
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

        querySnapshot.forEach(function(doc) {
            // skip if we are not on page 1
            for (i = 0 ; i < ((page - 1)/items_per_page) ; i ++)
                continue ;
            
            counter = counter + 1
            if (counter >= items_per_page) {
                // console.log ("per page limit reached")
                return
            }
            // console.log(doc.id, " => ", doc.data());
            data = doc.data ()
            uid = doc.id
            tr = document.createElement ('tr')
            tbody.appendChild (tr)
            for (c of columns) {
                td = document.createElement ('td')
                // is it an image?
                is_image = false
                for (s of sems) {
                    if (data [c].startsWith (s + '/')) 
                        is_image = true
                }

                if (is_image) {
                    img = document.createElement ('img')
                    img.setAttribute ("width", "64px")
                    td.appendChild (img)
                    img.src = "assets/img/spinner.gif"
                    storage.ref (data [c]).getDownloadURL()
                      .then(function(url) {
                        console.log (img.id, url)
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

        });

        $("#spinner").modal ("hide")
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });

}