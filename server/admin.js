var admin = require("firebase-admin");

var serviceAccount = require("/home/djshaji/Desktop/Projects/gdc-online-admission/server/gdc-online-admissions-firebase-adminsdk-hyxij-159d22f098.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gdc-online-admissions.firebaseio.com"
});

async function set_admin (uid) {
    console.log (uid)
    await admin.auth().getUser(uid).then(async function (userRecord) {
        claims = userRecord.customClaims
        console.log('uid:', uid, 'current claims:', claims);
        
        if (typeof (userRecord.customClaims) == 'undefined') {
          console.log('no existing claims for',  uid);
          claims = {}
        }

    })

    claims ["admin"] = true
    await admin.auth().setCustomUserClaims(uid, claims)
    .then(async function (cl) {
      console.log('claims set to', cl, 'by', claims);
      // await admin.auth().getUser(context.params.uid).then((userRecord) => {
      //   console.log('new claims are', userRecord.customClaims);
        
      // })
      return
    })
    return
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// console.log(uuidv4());


async function set_test_data (number, semester, stream) {
  const db = admin.firestore();
  for (i = 0 ; i < number ; i ++) {
    uid = uuidv4 ()

    console.log (uid, ':', i, 'of ', number)
    ref = db.collection ('users').doc (semester).collection (stream).doc (uid)
    data = {
      "08-Admission-for-Semester" : semester,
      "07-Admission-for-Stream" : stream,
      "13-ba-1-subject-4" : "",
      "final-submit" : "true",
      "09-Admission-Subject-2" : "science",
      "photo" : "1/BA/tHZqu1ZUb8NItXPcC6DMTrxzxH73/photo",
      "10-10th-Subject-3" : "English",
      "01-Fathers-Name" : "amitabh",
      "09-Admission-Subject-1" : "math",
      "12-12th-Marks-Obtained" : "66",
      "i-agree" : "on",
      "15-ba-3-subject-3" : "",
      "12-12th-Subject-6" : "",
      "00-Name-Of-Student" : "abhishek",
      "15-ba-3-subject-4" : "",
      "12-12th-Subject-1" : "h",
      "10-10th-Subject-2" : "Hindi",
      "15-ba-3-Total-Marks" : "88",
      "12-12th-Name-of-School" : "ah",
      "12-12th-Percentage" : "66",
      "10-10th-Marksheet" : "1/BA/tHZqu1ZUb8NItXPcC6DMTrxzxH73/10-10th-Marksheet",
      "13-ba-1-Total-Marks" : "88",
      "15-ba-3-subject-2" : "",
      "13-ba-1-subject-3" : "",
      "13-ba-1-subject-6" : "",
      "09-Admission-Subject-5" : " ",
      "15-ba-3-subject-6" : "",
      "10-10th-Total-Marks" : "100",
      "10-10th-Percentage" : "77",
      "15-ba-3-subject-1" : "",
      "09-Admission-Subject-3" : "hindi",
      "15-ba-3-Percentage" : "87.5",
      "13-ba-1-subject-5" : "",
      "09-Admission-Subject-6" : "",
      "13-ba-1-Marks-Obtained" : "77",
      "15-ba-3-Marks-Obtained" : "77",
      "10-10th-Subject-5" : "",
      "05-Address" : "jammu",
      "13-ba-1-Percentage" : "87.5",
      "12-12th-Marksheet" : "1/BA/tHZqu1ZUb8NItXPcC6DMTrxzxH73/12-marksheet",
      "03-Date-of-Birth-Day" : "11",
      "12-12th-Subject-4" : "h",
      "15-ba-3-completed" : "",
      "15-ba-3-subject-5" : "",
      "12-12th-Total-Marks" : "100",
      "05-Date-of-Birth-Year" : "1987",
      "10-10th-Marks-Obtained" : "77",
      "12-12th-Subject-5" : "",
      "12-12th-Subject-2" : "h",
      "12-12th-Subject-3" : "h",
      "13-ba-1-subject-1" : "",
      "13-ba-1-subject-2" : "",
      "10-10th-Subject-4" : "Science",
      "09-Admission-Subject-4" : "english",
      "02-Mothers-Name" : "jaya",
      "13-ba-1-completed" : "",
      "12-marksheet" : "1/BA/tHZqu1ZUb8NItXPcC6DMTrxzxH73/12-marksheet",
      "06-Blood-Group" : "B+",
      "10-10th-Subject-6" : "",
      "10-10th-Name-of-School" : "Air Force",
      "04-Date-of-Birth-Month" : "03",
      "10-10th-Subject-1" : "Math"      
    }

    await ref.set (data).then (function (doc) {
      console.log ("set data successfully")
    })
  }
}

set_admin (process.argv [2])
// set_test_data (15, '6', 'BSc')