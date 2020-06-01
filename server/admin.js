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

        
set_admin (process.argv [2])
